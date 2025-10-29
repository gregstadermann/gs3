'use strict';

/**
 * NPC Template / Schema Reference
 * 
 * This file documents all possible fields for NPC definitions in MongoDB.
 * Use this as a reference when creating or updating NPCs.
 * 
 * Fields are organized by category for clarity.
 */

module.exports = {
  /**
   * Required Fields
   */
  required: {
    id: 'unique-npc-id',           // Full ID: "area-name:npc-id" (e.g., "wehnimers-landing-town:giant-rat")
    npcId: 'npc-short-id',         // Short ID: "giant-rat" (used as reference)
    name: 'a giant rat',            // Display name (with article)
    level: 2,                       // NPC level (affects experience gain, loot scaling)
    areaId: 'wehnimers-landing-town' // Area this NPC belongs to
  },

  /**
   * Basic Information
   */
  basic: {
    keywords: ['giant', 'rat'],     // Array of keywords for targeting/inspection
    description: 'A large, aggressive rodent with beady eyes.' // Room description
  },

  /**
   * Attributes (Combat/Stats)
   */
  attributes: {
    // Health and Combat
    health: 28,                     // Hit points
    AS: 34,                         // Attack Strength (if null, calculated from stats/weapon)
    DS: 14,                         // Defense Strength
    
    // Core Stats (if using stat-based calculations)
    strength: { base: 50, delta: 0 },
    constitution: { base: 50, delta: 0 },
    dexterity: { base: 50, delta: 0 },
    agility: { base: 50, delta: 0 },
    intelligence: { base: 50, delta: 0 },
    wisdom: { base: 50, delta: 0 },
    charisma: { base: 50, delta: 0 },
    discipline: { base: 50, delta: 0 },
    logic: { base: 50, delta: 0 },
    aura: { base: 50, delta: 0 }
  },

  /**
   * Behaviors (Combat/AI)
   */
  behaviors: {
    aggressive: true,               // If true, NPC attacks players in same room without provocation
    roundtime: 2500,                // Hardcoded roundtime in milliseconds (2.5 seconds)
    attackChance: 0.8,              // Probability of attacking each round (0.0 to 1.0)
    skills: ['lunge', 'rend'],      // Array of combat skills NPC can use (optional)
    
    // Movement/Retreat behavior (future)
    retreatHealth: 0.2,             // Retreat when health below this % (future)
    wandering: false,               // Whether NPC wanders between rooms (future)
    respawnTime: 60000              // Respawn delay in milliseconds (future)
  },

  /**
   * Metadata - Loot and Rewards
   */
  metadata: {
    /**
     * Silver/Loot Configuration
     */
    dropsSilver: true,              // If false, NPC never drops silver
    
    silverTier: 'normal',          // Modifier for base silver amount:
                                    // 'poor' (-50%), 'low' (-25%), 'normal' (base),
                                    // 'high' (+50%), 'rich' (+100%)
    
    wealth: {
      silver: 0                    // Optional: Fixed silver amount (overrides tier calculation)
                                   // If not set or 0, uses tier-based calculation
    },

    /**
     * Gem Loot Configuration
     */
    gemTier: 'none',               // Gem drop tier:
                                    // 'none' (0% chance), 'low' (10%, ~1-100 value),
                                    // 'normal' (20%, ~50-500), 'high' (35%, ~250-1500),
                                    // 'rare' (50%, ~1000-5000)

    /**
     * Skinning Configuration
     */
    skin: {
      name: 'giant rat pelt',      // Base name for skin item (article will be auto-added)
      keyword: 'pelt',              // Keyword for skin item
      description: 'A pelt from a giant rat.' // Description for skin item
    },

    /**
     * Import/System Metadata (auto-populated)
     */
    importedAt: '2024-01-01T00:00:00.000Z', // ISO timestamp when imported
    originalFormat: 'gemstone3'             // Source format identifier
  },

  /**
   * Example: Complete NPC Definition
   */
  example: {
    id: 'wehnimers-landing-town:giant-rat',
    areaId: 'wehnimers-landing-town',
    npcId: 'giant-rat',
    name: 'a giant rat',
    level: 2,
    keywords: ['giant', 'rat', 'rodent'],
    description: 'A large, aggressive rodent with beady eyes and sharp teeth.',
    attributes: {
      health: 28,
      AS: 34,
      DS: 14
    },
    behaviors: {
      aggressive: true,
      roundtime: 2500,
      attackChance: 0.8
    },
    metadata: {
      dropsSilver: false,
      silverTier: 'poor',
      gemTier: 'none',
      skin: {
        name: 'giant rat pelt',
        keyword: 'pelt',
        description: 'A pelt from a giant rat.'
      },
      importedAt: new Date().toISOString(),
      originalFormat: 'gemstone3'
    }
  },

  /**
   * Example: Rich Loot NPC (Brigand)
   */
  exampleRich: {
    id: 'wilderness:brigand',
    areaId: 'wilderness',
    npcId: 'brigand',
    name: 'a brigand',
    level: 5,
    keywords: ['brigand', 'bandit', 'thief'],
    description: 'A scruffy human with a menacing look.',
    attributes: {
      health: 80,
      AS: 45,
      DS: 25
    },
    behaviors: {
      aggressive: true,
      roundtime: 3000,
      attackChance: 0.9,
      skills: ['lunge']
    },
    metadata: {
      dropsSilver: true,
      silverTier: 'high',          // +50% to base silver (level 5 = 10-40, tiered = 15-60)
      gemTier: 'normal',           // 20% chance, ~50-500 value gems
      skin: null,                  // Not skinnable
      importedAt: new Date().toISOString(),
      originalFormat: 'gemstone3'
    }
  },

  /**
   * Ephemeral Fields (not stored in DB, added at spawn time)
   * These are added by NPCSystem.spawnNPC()
   */
  ephemeral: {
    id: 'unique-spawn-id',         // Temporary spawn ID (definitionId_timestamp)
    definitionId: 'wehnimers-landing-town:giant-rat', // Reference to definition
    room: 'wehnimers-landing-town:tsc', // Current room location
    isAlive: true,                  // Life status
    spawnTime: 1234567890123,      // Timestamp when spawned
    combatData: {                   // Combat state (if in combat)
      lag: 0,
      combatants: [],
      roundStarted: null
    }
  },

  /**
   * Future/Planned Fields (not yet implemented)
   */
  future: {
    // Movement/Wandering
    wanderRooms: ['room1', 'room2'], // Rooms NPC can wander between
    wanderInterval: 30000,           // How often to check for wandering
    
    // Equipment (future)
    equipment: {                      // NPC's equipped items
      rightHand: 'weapon-id',
      chest: 'armor-id'
    },
    
    // Inventory (future)
    inventory: ['item-id-1'],        // Items NPC carries
    
    // Social/Interaction (future)
    faction: 'neutral',              // Faction alignment
    dialogue: {},                    // Dialogue trees
    merchant: false,                 // Is this NPC a shopkeeper?
    
    // Respawn (future)
    respawnInterval: 600000,         // How long before respawning (milliseconds)
    respawnRoom: 'spawn-room-id'     // Room to respawn in
  },

  /**
   * Usage Notes
   * 
   * 1. Required Fields: All NPCs must have id, npcId, name, level, areaId
   * 2. Loot Fields: Set dropsSilver, silverTier, gemTier in metadata for loot behavior
   * 3. Skinning: Add metadata.skin object if NPC is skinnable
   * 4. Combat: Use behaviors.aggressive and behaviors.roundtime for combat NPCs
   * 5. Experience: Experience gain is calculated automatically based on level difference
   * 6. Naming: Item names from skinning use metadata.skin.name without quality prefix
   * 
   * MongoDB Collection: 'npcs'
   * Use this template as reference when creating/updating NPC definitions.
   */
  notes: 'See comments in file for detailed usage'
};

