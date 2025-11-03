'use strict';

/**
 * NPC Model - MongoDB Schema Definition
 * Defines structure, validation, and indexes for NPC instances
 */

const NPC_SCHEMA = {
  // Unique instance identifier
  id: {
    type: String,
    required: true,
    unique: true,
    index: true,
    description: 'Unique NPC instance ID'
  },

  // Base template reference
  templateId: {
    type: String,
    required: true,
    index: true,
    description: 'Reference to NPC template definition'
  },

  // Display
  name: {
    type: String,
    required: true,
    description: 'NPC display name'
  },

  description: {
    type: String,
    required: false,
    description: 'NPC description'
  },

  // Location
  room: {
    type: String,
    required: true,
    index: true,
    description: 'Current room ID (area:roomId format)'
  },

  areaId: {
    type: String,
    required: true,
    index: true,
    description: 'Area where NPC spawned'
  },

  // Stats
  attributes: {
    type: Object,
    required: true,
    schema: {
      level: Number,
      health: { current: Number, max: Number },
      mana: { current: Number, max: Number },
      
      // Combat stats
      attackStrength: Number,
      defenseStrength: Number,
      armor: Number,
      
      // Core stats (optional for NPCs)
      strength: Number,
      constitution: Number,
      agility: Number
    }
  },

  // Combat state
  combat: {
    type: Object,
    default: {},
    schema: {
      target: String,
      stance: String,
      roundtime: Number,
      roundtimeEnd: Number,
      isAggressive: Boolean
    }
  },

  // AI behavior
  behavior: {
    type: Object,
    default: {},
    schema: {
      type: String,  // aggressive, defensive, passive, guard
      wanderRange: Number,
      homeRoom: String,
      patrolRoute: Array,
      aggression: Number
    }
  },

  // Loot table reference
  lootTable: {
    type: String,
    description: 'Loot table ID for drops'
  },

  // Status
  status: {
    type: String,
    enum: ['alive', 'dead', 'despawned'],
    default: 'alive',
    index: true
  },

  // Wounds
  wounds: {
    type: Object,
    default: {},
    description: 'Wound levels by body part'
  },

  // Timestamps
  spawnedAt: {
    type: Date,
    default: Date.now
  },

  lastAction: {
    type: Date,
    default: Date.now
  },

  expiresAt: {
    type: Date,
    description: 'TTL for despawned NPCs'
  }
};

/**
 * Index definitions
 */
const NPC_INDEXES = [
  { keys: { id: 1 }, options: { unique: true } },
  { keys: { room: 1, status: 1 }, options: {} },
  { keys: { areaId: 1, status: 1 }, options: {} },
  { keys: { templateId: 1 }, options: {} },
  { keys: { status: 1 }, options: {} },
  { keys: { expiresAt: 1 }, options: { expireAfterSeconds: 0, sparse: true } }
];

/**
 * Create indexes on collection
 */
async function ensureIndexes(db) {
  const collection = db.collection('npcs');
  for (const indexDef of NPC_INDEXES) {
    await collection.createIndex(indexDef.keys, indexDef.options);
  }
}

/**
 * Validate NPC document
 */
function validate(npc) {
  const errors = [];

  if (!npc.id || typeof npc.id !== 'string') {
    errors.push('Missing required field: id');
  }

  if (!npc.templateId || typeof npc.templateId !== 'string') {
    errors.push('Missing required field: templateId');
  }

  if (!npc.name || typeof npc.name !== 'string') {
    errors.push('Missing required field: name');
  }

  if (!npc.room || typeof npc.room !== 'string') {
    errors.push('Missing required field: room');
  }

  if (!npc.areaId || typeof npc.areaId !== 'string') {
    errors.push('Missing required field: areaId');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

module.exports = {
  NPC_SCHEMA,
  NPC_INDEXES,
  ensureIndexes,
  validate
};

