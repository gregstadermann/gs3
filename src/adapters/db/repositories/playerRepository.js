'use strict';

/**
 * Player Repository
 * Handles all player-related database operations
 */

const BaseRepository = require('../baseRepository');
const playerModel = require('../../../models/playerModel');

class PlayerRepository extends BaseRepository {
  constructor(db) {
    super(db, 'players', playerModel);
  }

  /**
   * Find player by name (case-insensitive)
   * @param {string} name - Player name
   * @returns {Promise<Object|null>} Player document
   */
  async findByName(name) {
    const result = await this.collection.findOne({
      name: { $regex: new RegExp(`^${name}$`, 'i') }
    });
    return this._sanitize(result);
  }

  /**
   * Find all players in a specific room
   * @param {string} roomId - Room ID
   * @returns {Promise<Array>} Array of player documents
   */
  async findByRoom(roomId) {
    return await this.find({ room: roomId });
  }

  /**
   * Find all players for an account
   * @param {string} account - Account username
   * @returns {Promise<Array>} Array of player documents
   */
  async findByAccount(account) {
    return await this.find(
      { account },
      { sort: { 'metadata.lastLogin': -1 } }
    );
  }

  /**
   * Find all online players
   * @returns {Promise<Array>} Array of online player documents
   */
  async findOnline() {
    return await this.find(
      { 'metadata.isOnline': true },
      { projection: { name: 1, room: 1, 'attributes.experience.level': 1 } }
    );
  }

  /**
   * Update player location
   * @param {string} playerId - Player ID (name)
   * @param {string} roomId - New room ID
   * @returns {Promise<Object>} Updated player
   */
  async updateLocation(playerId, roomId) {
    return await this.updateById(playerId, {
      $set: { room: roomId }
    });
  }

  /**
   * Update player attributes (partial update)
   * @param {string} playerId - Player ID (name)
   * @param {Object} attributes - Attributes to update
   * @returns {Promise<Object>} Updated player
   */
  async updateAttributes(playerId, attributes) {
    const update = {};
    for (const [key, value] of Object.entries(attributes)) {
      update[`attributes.${key}`] = value;
    }
    return await this.updateById(playerId, { $set: update });
  }

  /**
   * Update player equipment slot
   * @param {string} playerId - Player ID (name)
   * @param {string} slot - Equipment slot
   * @param {string|null} itemId - Item ID or null to clear
   * @returns {Promise<Object>} Updated player
   */
  async updateEquipment(playerId, slot, itemId) {
    const update = itemId 
      ? { $set: { [`equipment.${slot}`]: itemId } }
      : { $unset: { [`equipment.${slot}`]: '' } };
    return await this.updateById(playerId, update);
  }

  /**
   * Add item to player inventory
   * @param {string} playerId - Player ID (name)
   * @param {string} itemId - Item ID to add
   * @returns {Promise<Object>} Updated player
   */
  async addToInventory(playerId, itemId) {
    return await this.updateById(playerId, {
      $addToSet: { inventory: itemId }
    });
  }

  /**
   * Remove item from player inventory
   * @param {string} playerId - Player ID (name)
   * @param {string} itemId - Item ID to remove
   * @returns {Promise<Object>} Updated player
   */
  async removeFromInventory(playerId, itemId) {
    return await this.updateById(playerId, {
      $pull: { inventory: itemId }
    });
  }

  /**
   * Update player combat state
   * @param {string} playerId - Player ID (name)
   * @param {Object} combatState - Combat state updates
   * @returns {Promise<Object>} Updated player
   */
  async updateCombatState(playerId, combatState) {
    const update = {};
    for (const [key, value] of Object.entries(combatState)) {
      update[`combat.${key}`] = value;
    }
    return await this.updateById(playerId, { $set: update });
  }

  /**
   * Update player wounds
   * @param {string} playerId - Player ID (name)
   * @param {Object} wounds - Wound levels by body part
   * @returns {Promise<Object>} Updated player
   */
  async updateWounds(playerId, wounds) {
    return await this.updateById(playerId, {
      $set: { wounds }
    });
  }

  /**
   * Set player online status
   * @param {string} playerId - Player ID (name)
   * @param {boolean} isOnline - Online status
   * @returns {Promise<Object>} Updated player
   */
  async setOnlineStatus(playerId, isOnline) {
    const update = {
      'metadata.isOnline': isOnline
    };
    if (isOnline) {
      update['metadata.lastLogin'] = new Date();
    }
    return await this.updateById(playerId, { $set: update });
  }

  /**
   * Get player leaderboard
   * @param {number} limit - Number of players to return
   * @returns {Promise<Array>} Top players by level
   */
  async getLeaderboard(limit = 10) {
    return await this.find(
      {},
      {
        sort: { 'attributes.experience.level': -1, 'attributes.experience.total': -1 },
        limit,
        projection: {
          name: 1,
          race: 1,
          profession: 1,
          'attributes.experience.level': 1,
          'attributes.experience.total': 1
        }
      }
    );
  }

  /**
   * Bulk update player roundtimes (for tick processing)
   * @param {Array} updates - Array of {playerId, roundtime, roundtimeEnd}
   * @returns {Promise<Object>} Bulk write result
   */
  async bulkUpdateRoundtimes(updates) {
    const operations = updates.map(update => ({
      updateOne: {
        filter: { name: update.playerId },
        update: {
          $set: {
            'combat.roundtime': update.roundtime,
            'combat.roundtimeEnd': update.roundtimeEnd
          }
        }
      }
    }));
    
    return await this.bulkWrite(operations);
  }
}

module.exports = PlayerRepository;

