'use strict';

const databaseManager = require('../adapters/db/mongoClient');

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
  spawnNPC(npcData, roomId, gameEngine = null) {
    const npcId = `${npcData.id}_${Date.now()}`;
    
    // Get health from definition - ensure it's properly structured
    let npcHealth = npcData.attributes?.health || npcData.health;
    if (!npcHealth || typeof npcHealth !== 'object') {
      // Fallback: create health object from max value if only a number is provided
      const maxHP = typeof npcHealth === 'number' ? npcHealth : (npcData.attributes?.health?.max || npcData.health?.max || 100);
      npcHealth = { current: maxHP, max: maxHP };
      console.log(`[NPC SPAWN] ${npcData.name}: Health was missing/invalid, initialized to ${maxHP} HP`);
    } else {
      // Get max HP - prefer max, then current, then default to 20 for giant rats or 100 for others
      let maxHP = npcHealth.max;
      if (!maxHP || maxHP <= 0) {
        maxHP = npcHealth.current;
      }
      if (!maxHP || maxHP <= 0) {
        // Default based on NPC type (giant rats should have 20 HP)
        maxHP = (npcData.id === 'giant-rat' || npcData.name?.toLowerCase().includes('giant rat')) ? 20 : 100;
      }
      
      // Get current HP - prefer current, but default to max if missing, null, undefined, or 0
      let currentHP = npcHealth.current;
      if (currentHP === undefined || currentHP === null || currentHP <= 0) {
        currentHP = maxHP; // Default current to max if not specified, invalid, or zero
      }
      
      // Ensure both are positive
      maxHP = Math.max(1, maxHP);
      currentHP = Math.max(1, Math.min(currentHP, maxHP)); // Current can't exceed max, and must be at least 1
      
      npcHealth = { 
        current: currentHP,
        max: maxHP
      };
      
      // Final safety check: ensure currentHP is never 0
      if (npcHealth.current <= 0) {
        console.log(`[NPC SPAWN WARNING] ${npcData.name}: Current HP was ${npcHealth.current}, forcing to max (${npcHealth.max})`);
        npcHealth.current = npcHealth.max;
        currentHP = npcHealth.max;
      }
      
      // Warn if health was corrected
      const originalHealth = npcData.attributes?.health || npcData.health;
      if (originalHealth && (originalHealth.current !== currentHP || originalHealth.max !== maxHP)) {
        console.log(`[NPC SPAWN] ${npcData.name}: Corrected health from ${originalHealth.current}/${originalHealth.max} to ${currentHP}/${maxHP}`);
      }
    }
    
    // Final validation before creating NPC
    if (npcHealth.current <= 0 || npcHealth.max <= 0) {
      console.error(`[NPC SPAWN ERROR] ${npcData.name}: Invalid health after processing: current=${npcHealth.current}, max=${npcHealth.max}. Forcing to defaults.`);
      const defaultHP = (npcData.id === 'giant-rat' || npcData.name?.toLowerCase().includes('giant rat')) ? 20 : 100;
      npcHealth = { current: defaultHP, max: defaultHP };
    }
    
    // Build attributes object, ensuring health is correctly set (not overwritten by spread)
    const baseAttributes = { ...(npcData.attributes || {}) };
    // Remove any existing health from baseAttributes to ensure our corrected health is used
    delete baseAttributes.health;
    
    const activeNPC = {
      id: npcId,
      definitionId: npcData.id,
      npcId: npcData.npcId || npcData.id,
      name: npcData.name,
      room: roomId,
      level: npcData.level || npcData.attributes?.level || 1,
      keywords: npcData.keywords || [],
      description: npcData.description,
      attributes: { 
        ...baseAttributes,
        health: { ...npcHealth } // Ensure health is properly set in attributes (overrides any incorrect values)
      },
      behaviors: { ...(npcData.behaviors || {}) },
      // Combat-related fields
      aggressive: npcData.aggressive || npcData.behaviors?.aggressive || false,
      roundtime: npcData.roundtime || 2500, // Default 2.5 seconds
      stats: npcData.stats || {},
      combat: npcData.combat || {},
      equipment: npcData.equipment || {},
      // Health/status (also at top level for compatibility)
      health: { ...npcHealth },
      isAlive: true,
      spawnTime: Date.now(),
      // Reference to gameEngine for room system access
      gameEngine: gameEngine
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

