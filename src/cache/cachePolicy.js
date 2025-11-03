'use strict';

/**
 * Cache Policy - Defines caching strategies for different entity types
 */

const CACHE_POLICIES = {
  // Player data - frequently accessed, moderate TTL
  player: {
    ttl: 5 * 60 * 1000,        // 5 minutes
    maxSize: 500,              // Max 500 players cached
    keyPrefix: 'player:',
    invalidateOn: ['logout', 'save']
  },

  // Room data - very frequently accessed, longer TTL (rarely changes)
  room: {
    ttl: 30 * 60 * 1000,       // 30 minutes
    maxSize: 1000,             // Max 1000 rooms cached
    keyPrefix: 'room:',
    invalidateOn: ['room_update']
  },

  // NPC data - frequently accessed during combat, short TTL
  npc: {
    ttl: 2 * 60 * 1000,        // 2 minutes
    maxSize: 300,              // Max 300 NPCs cached
    keyPrefix: 'npc:',
    invalidateOn: ['npc_death', 'npc_despawn']
  },

  // Item data - moderate access, moderate TTL
  item: {
    ttl: 10 * 60 * 1000,       // 10 minutes
    maxSize: 500,              // Max 500 items cached
    keyPrefix: 'item:',
    invalidateOn: ['item_move', 'item_delete']
  },

  // Combat state - very short TTL for real-time data
  combat: {
    ttl: 30 * 1000,            // 30 seconds
    maxSize: 200,
    keyPrefix: 'combat:',
    invalidateOn: ['combat_end', 'roundtime_change']
  },

  // Session data - user sessions
  session: {
    ttl: 60 * 60 * 1000,       // 1 hour
    maxSize: 100,
    keyPrefix: 'session:',
    invalidateOn: ['logout']
  }
};

/**
 * Get cache policy for entity type
 * @param {string} entityType - Type of entity (player, room, npc, etc.)
 * @returns {Object} Cache policy configuration
 */
function getPolicy(entityType) {
  return CACHE_POLICIES[entityType] || {
    ttl: 5 * 60 * 1000,
    maxSize: 100,
    keyPrefix: `${entityType}:`,
    invalidateOn: []
  };
}

/**
 * Generate cache key
 * @param {string} entityType - Type of entity
 * @param {string} id - Entity ID
 * @returns {string} Cache key
 */
function generateKey(entityType, id) {
  const policy = getPolicy(entityType);
  return `${policy.keyPrefix}${id}`;
}

/**
 * Parse cache key
 * @param {string} key - Cache key
 * @returns {Object} {entityType, id}
 */
function parseKey(key) {
  const [entityType, ...idParts] = key.split(':');
  return {
    entityType,
    id: idParts.join(':')
  };
}

/**
 * Get TTL for entity type
 * @param {string} entityType - Type of entity
 * @returns {number} TTL in milliseconds
 */
function getTTL(entityType) {
  const policy = getPolicy(entityType);
  return policy.ttl;
}

/**
 * Get max size for entity type
 * @param {string} entityType - Type of entity
 * @returns {number} Max cache size
 */
function getMaxSize(entityType) {
  const policy = getPolicy(entityType);
  return policy.maxSize;
}

/**
 * Should invalidate cache on event
 * @param {string} entityType - Type of entity
 * @param {string} event - Event name
 * @returns {boolean} True if should invalidate
 */
function shouldInvalidate(entityType, event) {
  const policy = getPolicy(entityType);
  return policy.invalidateOn.includes(event);
}

module.exports = {
  CACHE_POLICIES,
  getPolicy,
  generateKey,
  parseKey,
  getTTL,
  getMaxSize,
  shouldInvalidate
};

