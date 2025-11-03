'use strict';

/**
 * Base Repository - Abstract CRUD operations
 * Provides common database operations with pagination and projection
 */

class BaseRepository {
  /**
   * @param {Object} db - MongoDB database instance
   * @param {string} collectionName - Name of the collection
   * @param {Object} model - Model definition with schema and indexes
   */
  constructor(db, collectionName, model) {
    this.db = db;
    this.collectionName = collectionName;
    this.model = model;
    this.collection = db.collection(collectionName);
  }

  /**
   * Ensure indexes are created
   */
  async ensureIndexes() {
    if (this.model && this.model.ensureIndexes) {
      await this.model.ensureIndexes(this.db);
    }
  }

  /**
   * Find a single document by ID
   * @param {string} id - Document ID
   * @param {Object} options - Query options
   * @returns {Promise<Object|null>} Document or null
   */
  async findById(id, options = {}) {
    const { projection } = options;
    const query = { id };
    
    const result = await this.collection.findOne(query, { projection });
    return this._sanitize(result);
  }

  /**
   * Find multiple documents by filter
   * @param {Object} filter - MongoDB filter
   * @param {Object} options - Query options (projection, sort, limit, skip)
   * @returns {Promise<Array>} Array of documents
   */
  async find(filter = {}, options = {}) {
    const { projection, sort, limit, skip } = options;
    
    const cursor = this.collection.find(filter);
    
    if (projection) cursor.project(projection);
    if (sort) cursor.sort(sort);
    if (skip) cursor.skip(skip);
    if (limit) cursor.limit(limit);
    
    const results = await cursor.toArray();
    return results.map(doc => this._sanitize(doc));
  }

  /**
   * Find with pagination
   * @param {Object} filter - MongoDB filter
   * @param {Object} options - Pagination options (page, pageSize, sort, projection)
   * @returns {Promise<Object>} Paginated results with metadata
   */
  async findPaginated(filter = {}, options = {}) {
    const { page = 1, pageSize = 50, sort = {}, projection } = options;
    const skip = (page - 1) * pageSize;
    
    const [results, total] = await Promise.all([
      this.find(filter, { projection, sort, limit: pageSize, skip }),
      this.count(filter)
    ]);
    
    return {
      data: results,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
        hasNext: page * pageSize < total,
        hasPrev: page > 1
      }
    };
  }

  /**
   * Count documents matching filter
   * @param {Object} filter - MongoDB filter
   * @returns {Promise<number>} Count
   */
  async count(filter = {}) {
    return await this.collection.countDocuments(filter);
  }

  /**
   * Insert a single document
   * @param {Object} doc - Document to insert
   * @returns {Promise<Object>} Inserted document
   */
  async insertOne(doc) {
    // Validate if model has validation
    if (this.model && this.model.validate) {
      const validation = this.model.validate(doc);
      if (!validation.valid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }
    }
    
    const result = await this.collection.insertOne(doc);
    return this._sanitize({ ...doc, _id: result.insertedId });
  }

  /**
   * Insert multiple documents
   * @param {Array} docs - Documents to insert
   * @returns {Promise<Array>} Inserted documents
   */
  async insertMany(docs) {
    // Validate all documents
    if (this.model && this.model.validate) {
      for (const doc of docs) {
        const validation = this.model.validate(doc);
        if (!validation.valid) {
          throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
        }
      }
    }
    
    const result = await this.collection.insertMany(docs);
    return docs.map((doc, i) => this._sanitize({ ...doc, _id: result.insertedIds[i] }));
  }

  /**
   * Update a single document by ID
   * @param {string} id - Document ID
   * @param {Object} update - Update operations
   * @returns {Promise<Object|null>} Updated document or null
   */
  async updateById(id, update) {
    const result = await this.collection.findOneAndUpdate(
      { id },
      update,
      { returnDocument: 'after' }
    );
    return this._sanitize(result.value);
  }

  /**
   * Update multiple documents
   * @param {Object} filter - MongoDB filter
   * @param {Object} update - Update operations
   * @returns {Promise<number>} Number of documents modified
   */
  async updateMany(filter, update) {
    const result = await this.collection.updateMany(filter, update);
    return result.modifiedCount;
  }

  /**
   * Delete a single document by ID
   * @param {string} id - Document ID
   * @returns {Promise<boolean>} True if deleted
   */
  async deleteById(id) {
    const result = await this.collection.deleteOne({ id });
    return result.deletedCount > 0;
  }

  /**
   * Delete multiple documents
   * @param {Object} filter - MongoDB filter
   * @returns {Promise<number>} Number of documents deleted
   */
  async deleteMany(filter) {
    const result = await this.collection.deleteMany(filter);
    return result.deletedCount;
  }

  /**
   * Bulk write operations
   * @param {Array} operations - Array of bulk operations
   * @returns {Promise<Object>} Bulk write result
   */
  async bulkWrite(operations) {
    return await this.collection.bulkWrite(operations);
  }

  /**
   * Upsert (update or insert) a document
   * @param {Object} filter - Filter to find document
   * @param {Object} doc - Document to upsert
   * @returns {Promise<Object>} Upserted document
   */
  async upsert(filter, doc) {
    const result = await this.collection.findOneAndUpdate(
      filter,
      { $set: doc },
      { upsert: true, returnDocument: 'after' }
    );
    return this._sanitize(result.value);
  }

  /**
   * Aggregate query
   * @param {Array} pipeline - Aggregation pipeline
   * @returns {Promise<Array>} Aggregation results
   */
  async aggregate(pipeline) {
    const results = await this.collection.aggregate(pipeline).toArray();
    return results.map(doc => this._sanitize(doc));
  }

  /**
   * Sanitize document (remove MongoDB-specific fields)
   * @param {Object} doc - Document to sanitize
   * @returns {Object|null} Sanitized document
   * @private
   */
  _sanitize(doc) {
    if (!doc) return null;
    
    // Remove MongoDB _id to prevent ObjectId leaks
    const { _id, ...sanitized } = doc;
    return sanitized;
  }

  /**
   * Get collection statistics
   * @returns {Promise<Object>} Collection stats
   */
  async getStats() {
    return await this.collection.stats();
  }
}

module.exports = BaseRepository;

