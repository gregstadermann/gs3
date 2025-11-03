'use strict';

/**
 * Room Schema - Single Source of Truth
 * 
 * This defines the canonical structure for room documents in the database.
 * All room imports, queries, and validations should reference this schema.
 */

const ROOM_SCHEMA = {
  // Unique identifier for the room (slug only, e.g. "town_square_central")
  // Full reference can be derived as: areaId:id
  id: {
    type: 'string',
    required: true,
    description: 'Unique room slug within the area',
    example: 'town_square_central'
  },

  // SHA1 hash of title+description for deduplication
  canonical_id: {
    type: 'string',
    required: false,
    description: 'SHA1 hash of title+description for deduplication',
    example: 'wehnimers_town_square_central_a1b2c3d4'
  },

  // Area this room belongs to
  areaId: {
    type: 'string',
    required: true,
    description: 'ID of the area (must exist in areas.json)',
    example: 'wl-town'
  },

  // Room title shown to players
  title: {
    type: 'string',
    required: true,
    description: 'Display title of the room',
    example: "[Wehnimer's Landing, Town Square Central]"
  },

  // Room description shown to players
  description: {
    type: 'string',
    required: true,
    description: 'Full description of the room',
    example: 'The town square is a bustling center of activity...'
  },

  // Exits to other rooms
  exits: {
    type: 'array',
    required: true,
    description: 'Array of exit objects',
    schema: {
      direction: {
        type: 'string',
        required: true,
        description: 'Direction name (e.g. north, south, gate, door)',
        example: 'north'
      },
      roomId: {
        type: 'string',
        required: true,
        description: 'Target room ID (slug only, within same area)',
        example: 'town_square_northeast'
      },
      hidden: {
        type: 'boolean',
        required: false,
        description: 'Whether the exit is hidden from obvious paths',
        default: false
      }
    },
    example: [
      { direction: 'north', roomId: 'town_square_north' },
      { direction: 'gate', roomId: 'outside_gate_01', hidden: true }
    ]
  },

  // Static items in the room (not pickupable)
  items: {
    type: 'array',
    required: false,
    default: [],
    description: 'Array of static item names visible in the room',
    example: ['well', 'bench', 'fountain']
  },

  // Features visible in the room (searchable, interactive)
  features: {
    type: 'array',
    required: false,
    default: [],
    description: 'Array of feature names (doors, windows, etc.)',
    example: ['door', 'window', 'sign']
  },

  // Metadata about the room
  metadata: {
    type: 'object',
    required: false,
    default: {},
    description: 'Additional metadata about the room',
    schema: {
      importedAt: {
        type: 'string',
        description: 'ISO timestamp of when room was imported'
      },
      originalFormat: {
        type: 'string',
        description: 'Format of original source (e.g. movement-log, yaml)'
      },
      source: {
        type: 'string',
        description: 'Source file name'
      }
    }
  }
};

/**
 * Validate a room object against the schema
 * @param {Object} room - Room object to validate
 * @returns {Object} { valid: boolean, errors: string[] }
 */
function validateRoom(room) {
  const errors = [];

  // Check required fields
  if (!room.id || typeof room.id !== 'string') {
    errors.push('Missing or invalid required field: id');
  }

  if (!room.areaId || typeof room.areaId !== 'string') {
    errors.push('Missing or invalid required field: areaId');
  }

  if (!room.title || typeof room.title !== 'string') {
    errors.push('Missing or invalid required field: title');
  }

  if (!room.description || typeof room.description !== 'string') {
    errors.push('Missing or invalid required field: description');
  }

  if (!Array.isArray(room.exits)) {
    errors.push('Missing or invalid required field: exits (must be array)');
  } else {
    // Validate each exit
    room.exits.forEach((exit, idx) => {
      if (!exit.direction || typeof exit.direction !== 'string') {
        errors.push(`Exit ${idx}: missing or invalid direction`);
      }
      if (!exit.roomId || typeof exit.roomId !== 'string') {
        errors.push(`Exit ${idx}: missing or invalid roomId`);
      }
      if (exit.hidden !== undefined && typeof exit.hidden !== 'boolean') {
        errors.push(`Exit ${idx}: hidden must be boolean`);
      }
    });
  }

  // Check optional array fields
  if (room.items !== undefined && !Array.isArray(room.items)) {
    errors.push('Invalid field: items (must be array)');
  }

  if (room.features !== undefined && !Array.isArray(room.features)) {
    errors.push('Invalid field: features (must be array)');
  }

  // Check metadata
  if (room.metadata !== undefined && typeof room.metadata !== 'object') {
    errors.push('Invalid field: metadata (must be object)');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Create a minimal valid room object with defaults
 * @param {Object} params - Room parameters
 * @returns {Object} Valid room object
 */
function createRoom({ id, areaId, title, description, exits = [], items = [], features = [], metadata = {} }) {
  if (!id || !areaId || !title || !description) {
    throw new Error('Missing required room fields: id, areaId, title, description');
  }

  return {
    id,
    areaId,
    title,
    description,
    exits,
    items,
    features,
    metadata: {
      importedAt: new Date().toISOString(),
      ...metadata
    }
  };
}

/**
 * Get full room reference (area:id)
 * @param {Object} room - Room object or {areaId, id}
 * @returns {string} Full room reference
 */
function getFullRoomId(room) {
  if (!room.areaId || !room.id) {
    throw new Error('Room must have areaId and id');
  }
  return `${room.areaId}:${room.id}`;
}

/**
 * Parse full room reference into components
 * @param {string} fullId - Full room reference (area:id)
 * @returns {Object} { areaId, roomId }
 */
function parseFullRoomId(fullId) {
  const parts = fullId.split(':');
  if (parts.length !== 2) {
    throw new Error(`Invalid room reference format: ${fullId}. Expected "areaId:roomId"`);
  }
  return {
    areaId: parts[0],
    roomId: parts[1]
  };
}

module.exports = {
  ROOM_SCHEMA,
  validateRoom,
  createRoom,
  getFullRoomId,
  parseFullRoomId
};


