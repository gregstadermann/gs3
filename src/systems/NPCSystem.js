'use strict';

const databaseManager = require('../core/DatabaseManager');

/**
 * NPC System
 * Manages NPC spawning, behavior, and lifecycle
 */
class NPCSystem {
  constructor() {
    this.npcs = new Map(); // Active NPCs by ID
    this.db = null;
  }

  /**
   * Initialize the NPC system
   * Note: npcsSystem doesn't need its own DB connection, it will use the one from GameEngine
   */
  async initialize(dbConnection) {
    try {
      this.db = dbConnection;
      console.log('NPC system initialized');
    } catch (error) {
      console.error('Error initializing NPC system:', error);
      throw error;
    }
  }

  /**
   * Get NPC definition from database
   */
  async getNPC(npcId) {
    try {
      const collection = this.db.collection('npcs');
      return await collection.findOne({ id: npcId });
    } catch (error) {
      console.error(`Error getting NPC ${npcId}:`, error);
      return null;
    }
  }

  /**
   * Get all NPCs for an area
   */
  async getNPCsForArea(areaId) {
    try {
      const collection = this.db.collection('npcs');
      return await collection.find({ areaId }).toArray();
    } catch (error) {
      console.error(`Error getting NPCs for area ${areaId}:`, error);
      return [];
    }
  }

  /**
   * Spawn an NPC in a room
   */
  spawnNPC(npcData, roomId) {
    const npcId = `${npcData.id}_${Date.now()}`;
    
    const activeNPC = {
      id: npcId,
      definitionId: npcData.id,
      npcId: npcData.npcId,
      name: npcData.name,
      room: roomId,
      level: npcData.level,
      keywords: npcData.keywords || [],
      description: npcData.description,
      attributes: { ...npcData.attributes },
      behaviors: { ...npcData.behaviors },
      isAlive: true,
      spawnTime: Date.now()
    };

    this.npcs.set(npcId, activeNPC);
    return activeNPC;
  }

  /**
   * Get active NPC by ID
   */
  getActiveNPC(npcId) {
    return this.npcs.get(npcId);
  }

  /**
   * Get NPCs in a room
   */
  getNPCsInRoom(roomId) {
    return Array.from(this.npcs.values()).filter(npc => npc.room === roomId && npc.isAlive);
  }

  /**
   * Remove an NPC
   */
  removeNPC(npcId) {
    this.npcs.delete(npcId);
  }

  /**
   * Kill an NPC
   */
  killNPC(npcId) {
    const npc = this.npcs.get(npcId);
    if (npc) {
      npc.isAlive = false;
    }
  }

  /**
   * Get all active NPCs
   */
  getAllNPCs() {
    return Array.from(this.npcs.values());
  }

  /**
   * Clear all NPCs (used for hotfix/reload)
   */
  clearAllNPCs() {
    this.npcs.clear();
  }
}

module.exports = NPCSystem;

