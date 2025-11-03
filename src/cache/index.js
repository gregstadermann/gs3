'use strict';

/**
 * Cache Manager - Unified cache interface with policy-based caching
 */

const MemoryCache = require('./memoryCache');
const { generateKey, getTTL, getPolicy } = require('./cachePolicy');

class CacheManager {
  constructor() {
    // Create separate caches for different entity types
    this.caches = {
      player: new MemoryCache({ maxSize: 500, ttl: 5 * 60 * 1000 }),
      room: new MemoryCache({ maxSize: 1000, ttl: 30 * 60 * 1000 }),
      npc: new MemoryCache({ maxSize: 300, ttl: 2 * 60 * 1000 }),
      item: new MemoryCache({ maxSize: 500, ttl: 10 * 60 * 1000 }),
      combat: new MemoryCache({ maxSize: 200, ttl: 30 * 1000 }),
      session: new MemoryCache({ maxSize: 100, ttl: 60 * 60 * 1000 })
    };
    
    // Start cleanup interval (every 5 minutes)
    this.cleanupInterval = setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  /**
   * Get value from appropriate cache
   * @param {string} entityType - Type of entity
   * @param {string} id - Entity ID
   * @returns {*} Cached value or null
   */
  get(entityType, id) {
    const cache = this.caches[entityType];
    if (!cache) return null;
    
    const key = generateKey(entityType, id);
    return cache.get(key);
  }

  /**
   * Set value in appropriate cache
   * @param {string} entityType - Type of entity
   * @param {string} id - Entity ID
   * @param {*} value - Value to cache
   * @param {number} ttl - Optional TTL override
   */
  set(entityType, id, value, ttl = null) {
    const cache = this.caches[entityType];
    if (!cache) return;
    
    const key = generateKey(entityType, id);
    const effectiveTtl = ttl || getTTL(entityType);
    cache.set(key, value, effectiveTtl);
  }

  /**
   * Delete value from cache
   * @param {string} entityType - Type of entity
   * @param {string} id - Entity ID
   * @returns {boolean} True if deleted
   */
  delete(entityType, id) {
    const cache = this.caches[entityType];
    if (!cache) return false;
    
    const key = generateKey(entityType, id);
    return cache.delete(key);
  }

  /**
   * Get or fetch value (cache-aside pattern)
   * @param {string} entityType - Type of entity
   * @param {string} id - Entity ID
   * @param {Function} fetchFn - Async function to fetch if not cached
   * @returns {Promise<*>} Cached or fetched value
   */
  async getOrFetch(entityType, id, fetchFn) {
    const cache = this.caches[entityType];
    if (!cache) return await fetchFn();
    
    const key = generateKey(entityType, id);
    return await cache.getOrFetch(key, fetchFn, getTTL(entityType));
  }

  /**
   * Invalidate all entries for an entity type
   * @param {string} entityType - Type of entity
   */
  invalidate(entityType) {
    const cache = this.caches[entityType];
    if (cache) cache.clear();
  }

  /**
   * Invalidate cache entries by ID prefix
   * @param {string} entityType - Type of entity
   * @param {string} idPrefix - ID prefix to match
   * @returns {number} Number of entries invalidated
   */
  invalidateByPrefix(entityType, idPrefix) {
    const cache = this.caches[entityType];
    if (!cache) return 0;
    
    const keyPrefix = generateKey(entityType, idPrefix);
    return cache.invalidateByPrefix(keyPrefix);
  }

  /**
   * Clean up expired entries in all caches
   * @returns {Object} Cleanup statistics by entity type
   */
  cleanup() {
    const stats = {};
    for (const [entityType, cache] of Object.entries(this.caches)) {
      stats[entityType] = cache.cleanup();
    }
    return stats;
  }

  /**
   * Get statistics for all caches
   * @returns {Object} Statistics by entity type
   */
  getStats() {
    const stats = {};
    for (const [entityType, cache] of Object.entries(this.caches)) {
      stats[entityType] = cache.getStats();
    }
    return stats;
  }

  /**
   * Reset statistics for all caches
   */
  resetStats() {
    for (const cache of Object.values(this.caches)) {
      cache.resetStats();
    }
  }

  /**
   * Clear all caches
   */
  clearAll() {
    for (const cache of Object.values(this.caches)) {
      cache.clear();
    }
  }

  /**
   * Shutdown cache manager
   */
  shutdown() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.clearAll();
  }
}

// Create singleton instance
const cacheManager = new CacheManager();

module.exports = cacheManager;

