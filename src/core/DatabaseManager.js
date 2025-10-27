'use strict';

const { MongoClient } = require('mongodb');

/**
 * MongoDB Database Manager
 * Manages database operations with MongoDB
 */
class DatabaseManager {
  constructor() {
    this.client = null;
    this.db = null;
    this.connectionString = process.env.MONGODB_URI || 'mongodb://localhost:27017';
    this.dbName = 'gs3';
  }

  /**
   * Initialize the database manager
   */
  async initialize() {
    // If already initialized, return existing connection
    if (this.db && this.client) {
      return this.db;
    }
    
    try {
      this.client = new MongoClient(this.connectionString);
      await this.client.connect();
      this.db = this.client.db(this.dbName);
      
      console.log('Connected to MongoDB successfully');
      console.log(`Using database: ${this.dbName}`);
      
      // Create indexes for better performance
      await this.createIndexes();
      
      return this.db;
    } catch (error) {
      console.error('Failed to connect to MongoDB:', error);
      throw error;
    }
  }

  /**
   * Create database indexes
   */
  async createIndexes() {
    try {
      // Players collection indexes
      await this.db.collection('players').createIndex({ name: 1 }, { unique: true });
      await this.db.collection('players').createIndex({ account: 1 });
      await this.db.collection('players').createIndex({ room: 1 });
      await this.db.collection('players').createIndex({ 'metadata.lastLogin': 1 });

      // Accounts collection indexes
      await this.db.collection('accounts').createIndex({ username: 1 }, { unique: true });
      await this.db.collection('accounts').createIndex({ email: 1 }, { unique: true });

      // Actions collection indexes
      await this.db.collection('actions').createIndex({ timestamp: 1 });
      await this.db.collection('actions').createIndex({ playerId: 1 });
      await this.db.collection('actions').createIndex({ action: 1 });
      await this.db.collection('actions').createIndex({ 'context.location': 1 });

      // Rooms collection indexes
      await this.db.collection('rooms').createIndex({ id: 1 }, { unique: true });
      await this.db.collection('rooms').createIndex({ area: 1 });

      // Areas collection indexes
      await this.db.collection('areas').createIndex({ id: 1 }, { unique: true });

      // Items collection indexes
      await this.db.collection('items').createIndex({ id: 1 }, { unique: true });
      await this.db.collection('items').createIndex({ areaId: 1 });

      // NPCs collection indexes
      await this.db.collection('npcs').createIndex({ id: 1 }, { unique: true });
      await this.db.collection('npcs').createIndex({ areaId: 1 });

      console.log('Database indexes created successfully');
    } catch (error) {
      console.error('Failed to create indexes:', error);
    }
  }

  /**
   * Get a collection
   */
  collection(name) {
    if (!this.db) {
      throw new Error('Database not connected. Call initialize() first.');
    }
    return this.db.collection(name);
  }

  /**
   * Close the database connection
   */
  async close() {
    if (this.client) {
      await this.client.close();
      console.log('MongoDB connection closed');
    }
  }

  /**
   * Get database statistics
   */
  async getStats() {
    if (!this.db) {
      throw new Error('Database not connected. Call initialize() first.');
    }

    const stats = await this.db.stats();
    return {
      database: stats.db,
      collections: stats.collections,
      dataSize: stats.dataSize,
      storageSize: stats.storageSize,
      indexes: stats.indexes,
      indexSize: stats.indexSize
    };
  }

  /**
   * Get collection statistics
   */
  async getCollectionStats(collectionName) {
    if (!this.db) {
      throw new Error('Database not connected. Call initialize() first.');
    }

    const stats = await this.db.collection(collectionName).stats();
    return {
      collection: stats.ns,
      count: stats.count,
      size: stats.size,
      avgObjSize: stats.avgObjSize,
      storageSize: stats.storageSize,
      totalIndexSize: stats.totalIndexSize,
      indexSizes: stats.indexSizes
    };
  }
}

// Create a singleton instance
const databaseManager = new DatabaseManager();

module.exports = databaseManager;