'use strict';

/**
 * Room Repository
 * Handles all room-related database operations
 */

const BaseRepository = require('../baseRepository');
const roomModel = require('../../../models/roomModel');

class RoomRepository extends BaseRepository {
  constructor(db) {
    super(db, 'rooms', roomModel);
  }

  /**
   * Find room by full ID (area:roomId)
   * @param {string} fullId - Full room reference (areaId:roomId)
   * @returns {Promise<Object|null>} Room document
   */
  async findByFullId(fullId) {
    const [areaId, roomId] = fullId.split(':');
    if (!areaId || !roomId) {
      throw new Error(`Invalid fullId format: ${fullId}. Expected "areaId:roomId"`);
    }
    const result = await this.collection.findOne({ areaId, id: roomId });
    return this._sanitize(result);
  }

  /**
   * Find room by area and room ID
   * @param {string} areaId - Area ID
   * @param {string} roomId - Room ID
   * @returns {Promise<Object|null>} Room document
   */
  async findByAreaAndId(areaId, roomId) {
    const result = await this.collection.findOne({ areaId, id: roomId });
    return this._sanitize(result);
  }

  /**
   * Find all rooms in an area
   * @param {string} areaId - Area ID
   * @returns {Promise<Array>} Array of room documents
   */
  async findByArea(areaId) {
    return await this.find({ areaId });
  }

  /**
   * Search rooms by text (title or description)
   * @param {string} searchText - Search query
   * @param {number} limit - Max results
   * @returns {Promise<Array>} Matching rooms
   */
  async searchByText(searchText, limit = 20) {
    return await this.find(
      { $text: { $search: searchText } },
      {
        projection: { score: { $meta: 'textScore' } },
        sort: { score: { $meta: 'textScore' } },
        limit
      }
    );
  }

  /**
   * Find rooms with specific exits
   * @param {string} direction - Exit direction
   * @returns {Promise<Array>} Rooms with that exit
   */
  async findWithExit(direction) {
    return await this.find({
      'exits.direction': direction
    });
  }

  /**
   * Find duplicate rooms by canonical ID
   * @param {string} canonicalId - SHA1 hash
   * @returns {Promise<Array>} Duplicate rooms
   */
  async findDuplicates(canonicalId) {
    return await this.find({ canonical_id: canonicalId });
  }

  /**
   * Get all rooms with their neighbor count
   * @param {string} areaId - Area ID
   * @returns {Promise<Array>} Rooms with exit counts
   */
  async getRoomsWithExitCounts(areaId) {
    return await this.aggregate([
      { $match: { areaId } },
      {
        $project: {
          id: 1,
          fullId: 1,
          title: 1,
          exitCount: { $size: '$exits' }
        }
      },
      { $sort: { exitCount: -1 } }
    ]);
  }

  /**
   * Get room statistics for an area
   * @param {string} areaId - Area ID
   * @returns {Promise<Object>} Area statistics
   */
  async getAreaStats(areaId) {
    const stats = await this.aggregate([
      { $match: { areaId } },
      {
        $group: {
          _id: null,
          totalRooms: { $sum: 1 },
          avgExits: { $avg: { $size: '$exits' } },
          maxExits: { $max: { $size: '$exits' } },
          minExits: { $min: { $size: '$exits' } }
        }
      }
    ]);
    
    return stats[0] || {
      totalRooms: 0,
      avgExits: 0,
      maxExits: 0,
      minExits: 0
    };
  }

  /**
   * Bulk import rooms
   * @param {Array} rooms - Array of room documents
   * @param {string} areaId - Area ID
   * @returns {Promise<Array>} Imported rooms
   */
  async bulkImport(rooms, areaId) {
    // Add fullId and areaId if not present
    const enrichedRooms = rooms.map(room => ({
      ...room,
      areaId,
      fullId: `${areaId}:${room.id}`,
      metadata: {
        ...room.metadata,
        importedAt: new Date()
      }
    }));
    
    return await this.insertMany(enrichedRooms);
  }

  /**
   * Update room exits
   * @param {string} fullId - Full room ID (areaId:roomId)
   * @param {Array} exits - New exits array
   * @returns {Promise<Object>} Updated room
   */
  async updateExits(fullId, exits) {
    const [areaId, roomId] = fullId.split(':');
    if (!areaId || !roomId) {
      throw new Error(`Invalid fullId format: ${fullId}. Expected "areaId:roomId"`);
    }
    return await this.collection.findOneAndUpdate(
      { areaId, id: roomId },
      { $set: { exits } },
      { returnDocument: 'after' }
    ).then(result => this._sanitize(result.value));
  }
}

module.exports = RoomRepository;

