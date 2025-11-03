'use strict';

/**
 * Room Model - MongoDB Schema Definition
 * Defines structure, validation, and indexes for room documents
 */

const ROOM_SCHEMA = {
  // Unique identifier (slug within area)
  id: {
    type: String,
    required: true,
    description: 'Room slug (e.g., town_square_central)'
  },

  // Composite unique ID
  fullId: {
    type: String,
    required: true,
    unique: true,
    index: true,
    description: 'Full room reference: areaId:id'
  },

  // Area reference
  areaId: {
    type: String,
    required: true,
    index: true,
    description: 'Area identifier'
  },

  // Display information
  title: {
    type: String,
    required: true,
    description: 'Room title shown to players'
  },

  description: {
    type: String,
    required: true,
    description: 'Room description'
  },

  // Navigation
  exits: {
    type: Array,
    required: true,
    default: [],
    description: 'Array of exit objects',
    itemSchema: {
      direction: String,
      roomId: String,
      fullRoomId: String,  // Computed: areaId:roomId
      hidden: Boolean
    }
  },

  // Static content
  items: {
    type: Array,
    default: [],
    description: 'Static items visible in room'
  },

  features: {
    type: Array,
    default: [],
    description: 'Interactive features (doors, windows, etc.)'
  },

  // Deduplication
  canonical_id: {
    type: String,
    index: true,
    description: 'SHA1 hash for deduplication'
  },

  // Metadata
  metadata: {
    type: Object,
    default: {},
    schema: {
      importedAt: Date,
      source: String,
      originalFormat: String,
      tags: Array
    }
  }
};

/**
 * Index definitions
 */
const ROOM_INDEXES = [
  { keys: { fullId: 1 }, options: { unique: true } },
  { keys: { areaId: 1, id: 1 }, options: {} },
  { keys: { canonical_id: 1 }, options: { sparse: true } },
  { keys: { title: 'text', description: 'text' }, options: {} }
];

/**
 * Create indexes on collection
 */
async function ensureIndexes(db) {
  const collection = db.collection('rooms');
  for (const indexDef of ROOM_INDEXES) {
    await collection.createIndex(indexDef.keys, indexDef.options);
  }
}

/**
 * Validate room document
 */
function validate(room) {
  const errors = [];

  if (!room.id || typeof room.id !== 'string') {
    errors.push('Missing required field: id');
  }

  if (!room.areaId || typeof room.areaId !== 'string') {
    errors.push('Missing required field: areaId');
  }

  if (!room.title || typeof room.title !== 'string') {
    errors.push('Missing required field: title');
  }

  if (!room.description || typeof room.description !== 'string') {
    errors.push('Missing required field: description');
  }

  if (!Array.isArray(room.exits)) {
    errors.push('Field exits must be an array');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

module.exports = {
  ROOM_SCHEMA,
  ROOM_INDEXES,
  ensureIndexes,
  validate
};

