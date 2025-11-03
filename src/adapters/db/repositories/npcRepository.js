'use strict';

/**
 * NPC Repository
 * Handles all NPC-related database operations
 */

const BaseRepository = require('../baseRepository');
const npcModel = require('../../../models/npcModel');

class NPCRepository extends BaseRepository {
  constructor(db) {
    super(db, 'npcs', npcModel);
  }

  /**
   * Find NPCs in a specific room
   * @param {string} roomId - Room ID
   * @param {string} status - NPC status filter (default: 'alive')
   * @returns {Promise<Array>} NPCs in room
   */
  async findInRoom(roomId, status = 'alive') {
    return await this.find({
      room: roomId,
      status
    });
  }

  /**
   * Find all alive NPCs in an area
   * @param {string} areaId - Area ID
   * @returns {Promise<Array>} Alive NPCs in area
   */
  async findAliveInArea(areaId) {
    return await this.find({
      areaId,
      status: 'alive'
    });
  }

  /**
   * Find NPCs by template
   * @param {string} templateId - Template ID
   * @param {string} status - Status filter
   * @returns {Promise<Array>} NPCs of template
   */
  async findByTemplate(templateId, status = null) {
    const filter = { templateId };
    if (status) filter.status = status;
    return await this.find(filter);
  }

  /**
   * Find NPCs in combat
   * @returns {Promise<Array>} NPCs currently in combat
   */
  async findInCombat() {
    return await this.find({
      status: 'alive',
      'combat.target': { $exists: true, $ne: null }
    });
  }

  /**
   * Update NPC location
   * @param {string} npcId - NPC ID
   * @param {string} roomId - New room ID
   * @returns {Promise<Object>} Updated NPC
   */
  async updateLocation(npcId, roomId) {
    return await this.updateById(npcId, {
      $set: {
        room: roomId,
        lastAction: new Date()
      }
    });
  }

  /**
   * Update NPC health
   * @param {string} npcId - NPC ID
   * @param {number} current - Current health
   * @param {number} max - Max health (optional)
   * @returns {Promise<Object>} Updated NPC
   */
  async updateHealth(npcId, current, max = null) {
    const update = { 'attributes.health.current': current };
    if (max !== null) update['attributes.health.max'] = max;
    return await this.updateById(npcId, { $set: update });
  }

  /**
   * Update NPC combat state
   * @param {string} npcId - NPC ID
   * @param {Object} combatState - Combat state updates
   * @returns {Promise<Object>} Updated NPC
   */
  async updateCombatState(npcId, combatState) {
    const update = { lastAction: new Date() };
    for (const [key, value] of Object.entries(combatState)) {
      update[`combat.${key}`] = value;
    }
    return await this.updateById(npcId, { $set: update });
  }

  /**
   * Update NPC wounds
   * @param {string} npcId - NPC ID
   * @param {Object} wounds - Wound levels
   * @returns {Promise<Object>} Updated NPC
   */
  async updateWounds(npcId, wounds) {
    return await this.updateById(npcId, {
      $set: { wounds }
    });
  }

  /**
   * Set NPC status
   * @param {string} npcId - NPC ID
   * @param {string} status - New status
   * @returns {Promise<Object>} Updated NPC
   */
  async setStatus(npcId, status) {
    const update = { status };
    
    // If marking as dead, set expiration
    if (status === 'dead') {
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 10); // 10 minute decay
      update.expiresAt = expiresAt;
    }
    
    return await this.updateById(npcId, { $set: update });
  }

  /**
   * Find expired NPCs (for cleanup)
   * @returns {Promise<Array>} Expired NPCs
   */
  async findExpired() {
    return await this.find({
      expiresAt: { $lte: new Date() }
    });
  }

  /**
   * Delete expired NPCs
   * @returns {Promise<number>} Number deleted
   */
  async deleteExpired() {
    return await this.deleteMany({
      expiresAt: { $lte: new Date() }
    });
  }

  /**
   * Spawn NPC from template
   * @param {string} templateId - Template ID
   * @param {string} roomId - Room to spawn in
   * @param {Object} overrides - Template overrides
   * @returns {Promise<Object>} Spawned NPC
   */
  async spawn(templateId, roomId, overrides = {}) {
    const npc = {
      id: `npc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      templateId,
      room: roomId,
      areaId: roomId.split(':')[0],
      status: 'alive',
      spawnedAt: new Date(),
      lastAction: new Date(),
      ...overrides
    };
    
    return await this.insertOne(npc);
  }

  /**
   * Bulk update NPC roundtimes (for tick processing)
   * @param {Array} updates - Array of {npcId, roundtime, roundtimeEnd}
   * @returns {Promise<Object>} Bulk write result
   */
  async bulkUpdateRoundtimes(updates) {
    const operations = updates.map(update => ({
      updateOne: {
        filter: { id: update.npcId },
        update: {
          $set: {
            'combat.roundtime': update.roundtime,
            'combat.roundtimeEnd': update.roundtimeEnd,
            lastAction: new Date()
          }
        }
      }
    }));
    
    return await this.bulkWrite(operations);
  }

  /**
   * Get NPC statistics for an area
   * @param {string} areaId - Area ID
   * @returns {Promise<Object>} Area NPC statistics
   */
  async getAreaStats(areaId) {
    const stats = await this.aggregate([
      { $match: { areaId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const result = {
      total: 0,
      alive: 0,
      dead: 0,
      despawned: 0
    };
    
    stats.forEach(stat => {
      result.total += stat.count;
      result[stat._id] = stat.count;
    });
    
    return result;
  }

  /**
   * Reset NPC to home room
   * @param {string} npcId - NPC ID
   * @returns {Promise<Object>} Updated NPC
   */
  async resetToHome(npcId) {
    const npc = await this.findById(npcId);
    if (!npc || !npc.behavior?.homeRoom) return null;
    
    return await this.updateById(npcId, {
      $set: {
        room: npc.behavior.homeRoom,
        'combat.target': null,
        lastAction: new Date()
      }
    });
  }
}

module.exports = NPCRepository;

