'use strict';

/**
 * Player Model - MongoDB Schema Definition
 * Defines structure, validation, and indexes for player documents
 */

const PLAYER_SCHEMA = {
  // Core identity
  name: {
    type: String,
    required: true,
    unique: true,
    index: true,
    description: 'Unique player name'
  },

  account: {
    type: String,
    required: true,
    index: true,
    description: 'Account username this character belongs to'
  },

  // Demographics
  race: {
    type: String,
    required: true,
    description: 'Race key (e.g., human, elf, dwarf)'
  },

  profession: {
    type: String,
    required: false,
    description: 'Class/profession key'
  },

  gender: {
    type: String,
    enum: ['male', 'female', 'non-binary'],
    default: 'male'
  },

  // Location
  room: {
    type: String,
    required: true,
    index: true,
    description: 'Current room ID (area:roomId format)'
  },

  // Attributes (10 core stats)
  attributes: {
    type: Object,
    required: true,
    schema: {
      strength: { base: Number, delta: Number, bonus: Number },
      intelligence: { base: Number, delta: Number, bonus: Number },
      wisdom: { base: Number, delta: Number, bonus: Number },
      constitution: { base: Number, delta: Number, bonus: Number },
      dexterity: { base: Number, delta: Number, bonus: Number },
      charisma: { base: Number, delta: Number, bonus: Number },
      agility: { base: Number, delta: Number, bonus: Number },
      logic: { base: Number, delta: Number, bonus: Number },
      discipline: { base: Number, delta: Number, bonus: Number },
      aura: { base: Number, delta: Number, bonus: Number },
      
      // Derived/transient attributes
      health: { current: Number, max: Number },
      mana: { current: Number, max: Number },
      stamina: { current: Number, max: Number },
      spirit: { current: Number, max: Number },
      
      currency: {
        silver: { type: Number, default: 0 },
        bounty: { type: Number, default: 0 }
      },
      
      experience: {
        total: { type: Number, default: 0 },
        level: { type: Number, default: 0 },
        tnl: { type: Number, default: 0 }
      },
      
      encumbrance: {
        bodyWeight: Number,
        capacity: Number,
        carried: Number,
        percent: Number
      }
    }
  },

  // Skills
  skills: {
    type: Object,
    default: {},
    description: 'Skill ranks keyed by skill name'
  },

  // Equipment (item IDs)
  equipment: {
    type: Object,
    default: {},
    schema: {
      rightHand: String,
      leftHand: String,
      head: String,
      neck: String,
      chest: String,
      back: String,
      rightFinger: String,
      leftFinger: String,
      rightWrist: String,
      leftWrist: String,
      waist: String,
      legs: String,
      feet: String
    }
  },

  // Inventory (array of item IDs)
  inventory: {
    type: Array,
    default: [],
    description: 'Array of item IDs in inventory'
  },

  // Combat state
  combat: {
    type: Object,
    default: {},
    schema: {
      stance: { type: String, default: 'offensive' },
      target: String,
      roundtime: Number,
      roundtimeEnd: Number
    }
  },

  // Wounds
  wounds: {
    type: Object,
    default: {},
    description: 'Wound levels by body part'
  },

  // Metadata
  metadata: {
    type: Object,
    default: {},
    schema: {
      createdAt: Date,
      lastLogin: Date,
      lastSave: Date,
      totalPlaytime: Number,
      isOnline: Boolean
    }
  }
};

/**
 * Index definitions for optimal query performance
 */
const PLAYER_INDEXES = [
  { keys: { name: 1 }, options: { unique: true } },
  { keys: { account: 1 }, options: {} },
  { keys: { room: 1 }, options: {} },
  { keys: { 'metadata.lastLogin': -1 }, options: {} },
  { keys: { 'metadata.isOnline': 1 }, options: {} },
  { keys: { 'attributes.experience.level': -1 }, options: {} }
];

/**
 * Create indexes on collection
 */
async function ensureIndexes(db) {
  const collection = db.collection('players');
  for (const indexDef of PLAYER_INDEXES) {
    await collection.createIndex(indexDef.keys, indexDef.options);
  }
}

/**
 * Validate player document against schema
 */
function validate(player) {
  const errors = [];

  if (!player.name || typeof player.name !== 'string') {
    errors.push('Missing required field: name');
  }

  if (!player.account || typeof player.account !== 'string') {
    errors.push('Missing required field: account');
  }

  if (!player.race || typeof player.race !== 'string') {
    errors.push('Missing required field: race');
  }

  if (!player.room || typeof player.room !== 'string') {
    errors.push('Missing required field: room');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

module.exports = {
  PLAYER_SCHEMA,
  PLAYER_INDEXES,
  ensureIndexes,
  validate
};

