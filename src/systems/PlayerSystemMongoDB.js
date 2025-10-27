'use strict';

const databaseManager = require('../core/DatabaseManager');

/**
 * Player System (Database Version)
 * Manages player data, stats, and player-related functionality
 * Uses database for persistence (JSON files with MongoDB-like interface)
 */
class PlayerSystem {
  constructor() {
    this.players = new Map(); // In-memory cache
    this.db = null;
  }

  /**
   * Initialize the player system
   */
  async initialize() {
    try {
      this.db = await databaseManager.initialize();
      console.log('Player system initialized with MongoDB');
    } catch (error) {
      console.error('Error initializing player system:', error);
      throw error;
    }
  }

  /**
   * Save a character created by CharacterCreationManager
   */
  async saveCharacter(character) {
    // Add to memory cache
    this.players.set(character.name, character);
    
    // Save to MongoDB
    await this.savePlayer(character.name, character);
    
    return character;
  } // EOF

  /**
   * Save player to MongoDB
   */
  async savePlayer(username, player) {
    try {
      // Create a sanitized copy without circular references
      const playerData = {
        name: player.name,
        race: player.race,
        class: player.class,
        level: player.level,
        experience: player.experience,
        attributes: player.attributes,
        skills: player.skills,
        tps: player.tps,
        room: player.room,
        account: player.account,
        metadata: player.metadata,
        equipment: player.equipment || {},
        inventory: player.inventory || [],
        gender: player.gender
      };
      
      const collection = this.db.collection('players');
      await collection.replaceOne(
        { name: username },
        playerData,
        { upsert: true }
      );
    } catch (error) {
      console.error(`Error saving player ${username}:`, error);
      throw error;
    }
  }

  /**
   * Load player from MongoDB
   */
  async loadPlayer(username) {
    try {
      // Check memory cache first
      if (this.players.has(username)) {
        const player = this.players.get(username);
        if (!player.id) player.id = player.name;
        return player;
      }

      const collection = this.db.collection('players');
      const player = await collection.findOne({ name: username });
      
      if (player) {
        // Set id if not present
        if (!player.id) player.id = player.name;
        
        // Add to memory cache
        this.players.set(username, player);
        return player;
      }
      
      return null;
    } catch (error) {
      console.error(`Error loading player ${username}:`, error);
      return null;
    }
  }

  /**
   * Update player in MongoDB
   */
  async updatePlayer(player) {
    try {
      await this.savePlayer(player.name, player);
      this.players.set(player.name, player);
    } catch (error) {
      console.error(`Error updating player ${player.name}:`, error);
      throw error;
    }
  }

  /**
   * Delete player from MongoDB
   */
  async deletePlayer(username) {
    try {
      const collection = this.db.collection('players');
      await collection.deleteOne({ name: username });
      this.players.delete(username);
    } catch (error) {
      console.error(`Error deleting player ${username}:`, error);
      throw error;
    }
  }

  /**
   * Get player by ID (for compatibility)
   */
  getPlayer(playerId) {
    return this.players.get(playerId);
  }

  /**
   * Get player by name
   */
  getPlayerByName(name) {
    return this.players.get(name);
  }

  /**
   * Get all players
   */
  getAllPlayers() {
    return Array.from(this.players.values());
  }

  /**
   * Get players in a specific room
   */
  getPlayersInRoom(roomId) {
    return Array.from(this.players.values()).filter(player => player.room === roomId);
  }

  /**
   * Get online players
   */
  getOnlinePlayers() {
    return Array.from(this.players.values()).filter(player => player.metadata.isOnline);
  }

  /**
   * Set player online status
   */
  async setPlayerOnlineStatus(username, isOnline) {
    const player = await this.loadPlayer(username);
    if (player) {
      player.metadata.isOnline = isOnline;
      player.metadata.lastLogin = new Date().toISOString();
      await this.updatePlayer(player);
    }
  }

  /**
   * Get player statistics
   */
  async getPlayerStats() {
    try {
      const collection = this.db.collection('players');
      const totalPlayers = await collection.countDocuments();
      const onlinePlayers = await collection.countDocuments({ 'metadata.isOnline': true });
      
      return {
        totalPlayers,
        onlinePlayers,
        offlinePlayers: totalPlayers - onlinePlayers
      };
    } catch (error) {
      console.error('Error getting player stats:', error);
      return { totalPlayers: 0, onlinePlayers: 0, offlinePlayers: 0 };
    }
  }

  /**
   * Search players by criteria
   */
  async searchPlayers(criteria) {
    try {
      const collection = this.db.collection('players');
      const players = await collection.find(criteria).toArray();
      return players;
    } catch (error) {
      console.error('Error searching players:', error);
      return [];
    }
  }

  /**
   * Get players by level range
   */
  async getPlayersByLevel(minLevel, maxLevel) {
    return this.searchPlayers({
      'metadata.level': { $gte: minLevel, $lte: maxLevel }
    });
  }

  /**
   * Get players by class
   */
  async getPlayersByClass(playerClass) {
    return this.searchPlayers({
      'metadata.class': playerClass
    });
  }

  /**
   * Get recent players (logged in within last X days)
   */
  async getRecentPlayers(days = 7) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return this.searchPlayers({
      'metadata.lastLogin': { $gte: cutoffDate.toISOString() }
    });
  }
}

module.exports = PlayerSystem;
