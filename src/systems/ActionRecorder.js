'use strict';

const databaseManager = require('../core/DatabaseManager');

/**
 * Player Action Recording System (Database Version)
 * Records all player actions for later analysis and content generation
 */
class ActionRecorder {
  constructor() {
    this.db = null;
    this.buffer = [];
    this.bufferSize = 100; // Flush buffer when it reaches this size
    this.flushInterval = 30000; // Flush every 30 seconds
  }

  /**
   * Initialize the action recorder
   */
  async initialize() {
    try {
      this.db = await databaseManager.initialize();
      console.log('Action recorder initialized with MongoDB');
      
      // Start periodic flush
      setInterval(() => this.flushBuffer(), this.flushInterval);
    } catch (error) {
      console.error('Failed to initialize action recorder:', error);
    }
  }

  /**
   * Record a player action
   */
  recordAction(playerId, action, context = {}) {
    const record = {
      timestamp: Date.now(),
      playerId,
      action,
      context: {
        ...context,
        location: context.location || 'unknown',
        result: context.result || 'unknown'
      }
    };

    this.buffer.push(record);

    // Flush buffer if it's full
    if (this.buffer.length >= this.bufferSize) {
      this.flushBuffer();
    }
  }

  /**
   * Flush the buffer to database
   */
  async flushBuffer() {
    if (this.buffer.length === 0) return;

    try {
      const collection = this.db.collection('actions');
      await collection.insertMany(this.buffer);
      
      console.log(`Flushed ${this.buffer.length} actions to database`);
      this.buffer = [];
    } catch (error) {
      console.error('Failed to flush action buffer:', error);
    }
  }

  /**
   * Get actions from a specific time period
   */
  async getActionsFromPeriod(startTime, endTime) {
    try {
      const collection = this.db.collection('actions');
      const actions = await collection.find({
        timestamp: { $gte: startTime, $lte: endTime }
      }).toArray();
      
      return actions;
    } catch (error) {
      console.error('Failed to get actions from period:', error);
      return [];
    }
  }

  /**
   * Get actions from the last 24 hours
   */
  async getActionsFromLast24Hours() {
    const endTime = Date.now();
    const startTime = endTime - (24 * 60 * 60 * 1000); // 24 hours ago
    return this.getActionsFromPeriod(startTime, endTime);
  }

  /**
   * Analyze patterns in actions
   */
  analyzePatterns(actions) {
    const patterns = {
      popularLocations: {},
      playerConflicts: [],
      economicTrends: {},
      socialDynamics: {},
      contentGaps: []
    };

    // Analyze location popularity
    actions.forEach(action => {
      const location = action.context.location;
      if (location && location !== 'unknown') {
        patterns.popularLocations[location] = (patterns.popularLocations[location] || 0) + 1;
      }
    });

    // Analyze economic trends
    actions.forEach(action => {
      if (action.action === 'trade' || action.action === 'buy' || action.action === 'sell') {
        const item = action.context.item;
        if (item) {
          patterns.economicTrends[item] = (patterns.economicTrends[item] || 0) + 1;
        }
      }
    });

    // Analyze social dynamics
    actions.forEach(action => {
      if (action.action === 'say' || action.action === 'tell' || action.action === 'group') {
        const target = action.context.target;
        if (target) {
          patterns.socialDynamics[target] = (patterns.socialDynamics[target] || 0) + 1;
        }
      }
    });

    return patterns;
  }
}

module.exports = ActionRecorder;
