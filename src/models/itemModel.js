'use strict';

/**
 * Item Model - MongoDB Schema Definition
 * Defines structure, validation, and indexes for item instances
 */

const ITEM_SCHEMA = {
  // Unique instance identifier
  id: {
    type: String,
    required: true,
    unique: true,
    index: true,
    description: 'Unique item instance ID'
  },

  // Type classification
  type: {
    type: String,
    required: true,
    index: true,
    enum: ['WEAPON', 'ARMOR', 'SHIELD', 'CONTAINER', 'CONSUMABLE', 'MISC', 'TREASURE'],
    description: 'Item type category'
  },

  // Base template reference
  baseId: {
    type: String,
    required: false,
    index: true,
    description: 'Reference to base item definition'
  },

  // Display
  name: {
    type: String,
    required: true,
    description: 'Item display name'
  },

  description: {
    type: String,
    required: false,
    description: 'Item description'
  },

  // Location tracking
  location: {
    type: Object,
    required: true,
    schema: {
      type: { type: String, enum: ['room', 'player', 'container', 'shop'] },
      id: String,  // roomId, playerId, containerId, or shopId
      slot: String // For equipped items
    }
  },

  // Item properties
  metadata: {
    type: Object,
    default: {},
    schema: {
      // Weapon properties
      weaponType: String,
      damageType: String,
      attackStrength: Number,
      defenseStrength: Number,
      
      // Armor properties
      armorGroup: Number,
      armorType: String,
      defenseValue: Number,
      
      // Physical properties
      weight: Number,
      baseWeight: Number,
      value: Number,
      
      // Container properties
      container: {
        capacity: Number,
        items: Array  // Item IDs
      },
      
      // Consumable properties
      consumable: {
        charges: Number,
        maxCharges: Number,
        effect: String
      },
      
      // Enchantments
      enchantment: Number,
      bonus: Number,
      
      // State
      condition: Number,
      isCursed: Boolean,
      isBlessed: Boolean
    }
  },

  // Area reference (for spawned items)
  areaId: {
    type: String,
    index: true,
    description: 'Area where item spawned'
  },

  // Metadata
  createdAt: {
    type: Date,
    default: Date.now
  },

  expiresAt: {
    type: Date,
    description: 'TTL for temporary items'
  }
};

/**
 * Index definitions
 */
const ITEM_INDEXES = [
  { keys: { id: 1 }, options: { unique: true } },
  { keys: { type: 1 }, options: {} },
  { keys: { baseId: 1 }, options: { sparse: true } },
  { keys: { 'location.type': 1, 'location.id': 1 }, options: {} },
  { keys: { areaId: 1 }, options: { sparse: true } },
  { keys: { expiresAt: 1 }, options: { expireAfterSeconds: 0, sparse: true } }
];

/**
 * Create indexes on collection
 */
async function ensureIndexes(db) {
  const collection = db.collection('items');
  for (const indexDef of ITEM_INDEXES) {
    await collection.createIndex(indexDef.keys, indexDef.options);
  }
}

/**
 * Validate item document
 */
function validate(item) {
  const errors = [];

  if (!item.id || typeof item.id !== 'string') {
    errors.push('Missing required field: id');
  }

  if (!item.type || typeof item.type !== 'string') {
    errors.push('Missing required field: type');
  }

  if (!item.name || typeof item.name !== 'string') {
    errors.push('Missing required field: name');
  }

  if (!item.location || typeof item.location !== 'object') {
    errors.push('Missing required field: location');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

module.exports = {
  ITEM_SCHEMA,
  ITEM_INDEXES,
  ensureIndexes,
  validate
};

