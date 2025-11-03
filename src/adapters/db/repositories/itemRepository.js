'use strict';

/**
 * Item Repository
 * Handles all item-related database operations
 */

const BaseRepository = require('../baseRepository');
const itemModel = require('../../../models/itemModel');

class ItemRepository extends BaseRepository {
  constructor(db) {
    super(db, 'items', itemModel);
  }

  /**
   * Find items by location
   * @param {string} locationType - Location type (room, player, container)
   * @param {string} locationId - Location ID
   * @returns {Promise<Array>} Items at location
   */
  async findByLocation(locationType, locationId) {
    return await this.find({
      'location.type': locationType,
      'location.id': locationId
    });
  }

  /**
   * Find items in a room
   * @param {string} roomId - Room ID
   * @returns {Promise<Array>} Items in room
   */
  async findInRoom(roomId) {
    return await this.findByLocation('room', roomId);
  }

  /**
   * Find items owned by a player
   * @param {string} playerId - Player ID
   * @returns {Promise<Array>} Player's items
   */
  async findByPlayer(playerId) {
    return await this.findByLocation('player', playerId);
  }

  /**
   * Find equipped items for a player
   * @param {string} playerId - Player ID
   * @returns {Promise<Array>} Equipped items
   */
  async findEquipped(playerId) {
    return await this.find({
      'location.type': 'player',
      'location.id': playerId,
      'location.slot': { $exists: true, $ne: null }
    });
  }

  /**
   * Find items in a container
   * @param {string} containerId - Container item ID
   * @returns {Promise<Array>} Items in container
   */
  async findInContainer(containerId) {
    return await this.findByLocation('container', containerId);
  }

  /**
   * Find items by type
   * @param {string} type - Item type
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Items of type
   */
  async findByType(type, options = {}) {
    return await this.find({ type }, options);
  }

  /**
   * Move item to new location
   * @param {string} itemId - Item ID
   * @param {Object} newLocation - New location {type, id, slot}
   * @returns {Promise<Object>} Updated item
   */
  async moveItem(itemId, newLocation) {
    return await this.updateById(itemId, {
      $set: { location: newLocation }
    });
  }

  /**
   * Update item metadata
   * @param {string} itemId - Item ID
   * @param {Object} metadata - Metadata updates
   * @returns {Promise<Object>} Updated item
   */
  async updateMetadata(itemId, metadata) {
    const update = {};
    for (const [key, value] of Object.entries(metadata)) {
      update[`metadata.${key}`] = value;
    }
    return await this.updateById(itemId, { $set: update });
  }

  /**
   * Update item condition
   * @param {string} itemId - Item ID
   * @param {number} condition - New condition value
   * @returns {Promise<Object>} Updated item
   */
  async updateCondition(itemId, condition) {
    return await this.updateById(itemId, {
      $set: { 'metadata.condition': condition }
    });
  }

  /**
   * Add item to container
   * @param {string} containerId - Container item ID
   * @param {string} itemId - Item ID to add
   * @returns {Promise<Object>} Updated container
   */
  async addToContainer(containerId, itemId) {
    return await this.updateById(containerId, {
      $addToSet: { 'metadata.container.items': itemId }
    });
  }

  /**
   * Remove item from container
   * @param {string} containerId - Container item ID
   * @param {string} itemId - Item ID to remove
   * @returns {Promise<Object>} Updated container
   */
  async removeFromContainer(containerId, itemId) {
    return await this.updateById(containerId, {
      $pull: { 'metadata.container.items': itemId }
    });
  }

  /**
   * Find expired items (for cleanup)
   * @returns {Promise<Array>} Expired items
   */
  async findExpired() {
    return await this.find({
      expiresAt: { $lte: new Date() }
    });
  }

  /**
   * Delete expired items
   * @returns {Promise<number>} Number deleted
   */
  async deleteExpired() {
    return await this.deleteMany({
      expiresAt: { $lte: new Date() }
    });
  }

  /**
   * Get inventory weight for a player
   * @param {string} playerId - Player ID
   * @returns {Promise<number>} Total weight
   */
  async getPlayerInventoryWeight(playerId) {
    const result = await this.aggregate([
      {
        $match: {
          'location.type': 'player',
          'location.id': playerId
        }
      },
      {
        $group: {
          _id: null,
          totalWeight: {
            $sum: {
              $ifNull: ['$metadata.weight', '$metadata.baseWeight', 0]
            }
          }
        }
      }
    ]);
    
    return result[0]?.totalWeight || 0;
  }

  /**
   * Bulk spawn items in a room
   * @param {string} roomId - Room ID
   * @param {Array} items - Items to spawn
   * @returns {Promise<Array>} Spawned items
   */
  async bulkSpawn(roomId, items) {
    const enrichedItems = items.map(item => ({
      ...item,
      location: {
        type: 'room',
        id: roomId
      },
      createdAt: new Date()
    }));
    
    return await this.insertMany(enrichedItems);
  }

  /**
   * Transfer all items from one location to another
   * @param {Object} fromLocation - Source location
   * @param {Object} toLocation - Destination location
   * @returns {Promise<number>} Number of items moved
   */
  async transferAll(fromLocation, toLocation) {
    return await this.updateMany(
      { location: fromLocation },
      { $set: { location: toLocation } }
    );
  }
}

module.exports = ItemRepository;

