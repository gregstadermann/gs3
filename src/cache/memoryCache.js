'use strict';

/**
 * Memory Cache - LRU Cache Implementation
 * Provides fast in-memory caching for hot entities (players, rooms, NPCs)
 */

class MemoryCache {
  /**
   * @param {Object} options - Cache configuration
   * @param {number} options.maxSize - Maximum number of entries (default: 1000)
   * @param {number} options.ttl - Time to live in milliseconds (default: 5 minutes)
   */
  constructor(options = {}) {
    this.maxSize = options.maxSize || 1000;
    this.ttl = options.ttl || 5 * 60 * 1000; // 5 minutes default
    this.cache = new Map();
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      evictions: 0
    };
  }

  /**
   * Get value from cache
   * @param {string} key - Cache key
   * @returns {*} Cached value or null
   */
  get(key) {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.stats.misses++;
      return null;
    }
    
    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.stats.misses++;
      return null;
    }
    
    // Update access time (LRU)
    entry.accessedAt = Date.now();
    
    // Move to end (most recently used)
    this.cache.delete(key);
    this.cache.set(key, entry);
    
    this.stats.hits++;
    return entry.value;
  }

  /**
   * Set value in cache
   * @param {string} key - Cache key
   * @param {*} value - Value to cache
   * @param {number} ttl - Optional TTL override
   */
  set(key, value, ttl = null) {
    const effectiveTtl = ttl || this.ttl;
    
    // If at max size, evict oldest entry
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
      this.stats.evictions++;
    }
    
    this.cache.set(key, {
      value,
      createdAt: Date.now(),
      accessedAt: Date.now(),
      expiresAt: Date.now() + effectiveTtl
    });
    
    this.stats.sets++;
  }

  /**
   * Delete value from cache
   * @param {string} key - Cache key
   * @returns {boolean} True if deleted
   */
  delete(key) {
    return this.cache.delete(key);
  }

  /**
   * Check if key exists in cache
   * @param {string} key - Cache key
   * @returns {boolean} True if exists and not expired
   */
  has(key) {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  /**
   * Clear all entries from cache
   */
  clear() {
    this.cache.clear();
  }

  /**
   * Get or fetch value (cache-aside pattern)
   * @param {string} key - Cache key
   * @param {Function} fetchFn - Async function to fetch value if not cached
   * @param {number} ttl - Optional TTL override
   * @returns {Promise<*>} Cached or fetched value
   */
  async getOrFetch(key, fetchFn, ttl = null) {
    // Try cache first
    const cached = this.get(key);
    if (cached !== null) {
      return cached;
    }
    
    // Fetch from source
    const value = await fetchFn();
    
    // Cache the result (if not null/undefined)
    if (value != null) {
      this.set(key, value, ttl);
    }
    
    return value;
  }

  /**
   * Invalidate cache entries by key prefix
   * @param {string} prefix - Key prefix to match
   * @returns {number} Number of entries invalidated
   */
  invalidateByPrefix(prefix) {
    let count = 0;
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
        count++;
      }
    }
    return count;
  }

  /**
   * Clean up expired entries
   * @returns {number} Number of entries cleaned
   */
  cleanup() {
    const now = Date.now();
    let count = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        count++;
      }
    }
    
    return count;
  }

  /**
   * Get cache statistics
   * @returns {Object} Cache stats
   */
  getStats() {
    const hitRate = this.stats.hits + this.stats.misses > 0
      ? (this.stats.hits / (this.stats.hits + this.stats.misses) * 100).toFixed(2)
      : 0;
    
    return {
      ...this.stats,
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: `${hitRate}%`,
      memoryUsage: this._estimateMemoryUsage()
    };
  }

  /**
   * Reset statistics
   */
  resetStats() {
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      evictions: 0
    };
  }

  /**
   * Estimate memory usage (rough approximation)
   * @returns {string} Memory usage estimate
   * @private
   */
  _estimateMemoryUsage() {
    const bytesPerEntry = 1024; // Rough estimate
    const bytes = this.cache.size * bytesPerEntry;
    
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }

  /**
   * Get cache size
   * @returns {number} Number of entries
   */
  size() {
    return this.cache.size;
  }
}

module.exports = MemoryCache;

