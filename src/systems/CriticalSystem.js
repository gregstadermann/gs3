'use strict';

const databaseManager = require('../adapters/db/mongoClient');

/**
 * Critical Hit System
 * Looks up critical hit results from MongoDB based on damage rolls
 */
class CriticalSystem {
  constructor() {
    this.db = null;
    this.initialized = false;
  }

  /**
   * Initialize the critical system with database connection
   */
  async initialize() {
    if (this.initialized) return;

    this.db = await databaseManager.initialize();
    this.initialized = true;
  }

  /**
   * Get critical hit based on damage roll
   * @param {number} rollValue - The random roll value (typically 0-100 or 0-200)
   * @param {string} damageType - 'slash', 'crush', 'puncture'
   * @returns {Promise<Object>} Critical hit result
   */
  async lookupCritical(rollValue, damageType = 'slash') {
    if (!this.db) {
      await this.initialize();
    }

    // Determine rank from roll (0-9 based on roll value)
    let rank = 0;
    if (rollValue >= 90) rank = 9;
    else if (rollValue >= 80) rank = 8;
    else if (rollValue >= 70) rank = 7;
    else if (rollValue >= 60) rank = 6;
    else if (rollValue >= 50) rank = 5;
    else if (rollValue >= 40) rank = 4;
    else if (rollValue >= 30) rank = 3;
    else if (rollValue >= 20) rank = 2;
    else if (rollValue >= 10) rank = 1;
    else rank = 0;

    try {
      const critsCollection = this.db.collection('crits');
      
      // Query for critical by damage type and rank
      const criticals = await critsCollection.find({
        damageType: damageType,
        rank: rank
      }).toArray();

      if (criticals.length === 0) {
        // Return default critical
        return {
          rank: 1,
          damage: 5,
          message: 'Critical hit!',
          effects: [],
          wounds: [],
          isFatal: false,
          isStun: false,
          isKnockdown: false,
          isAmputation: false
        };
      }

      // Pick random body part from available criticals
      const randomCrit = criticals[Math.floor(Math.random() * criticals.length)];

      return {
        rank: randomCrit.rank,
        damage: randomCrit.damage,
        message: randomCrit.message,
        effects: randomCrit.effects || [],
        wounds: randomCrit.wounds || [],
        bodyPart: randomCrit.bodyPart,
        isFatal: (randomCrit.effects || []).includes('F'),
        isStun: (randomCrit.effects || []).some(e => e.startsWith('S')),
        isKnockdown: (randomCrit.effects || []).includes('K'),
        isAmputation: (randomCrit.effects || []).includes('A')
      };
    } catch (error) {
      console.error('Error looking up critical:', error);
      
      // Return default on error
      return {
        rank: 1,
        damage: Math.floor(rollValue / 5),
        message: 'Critical hit!',
        effects: [],
        wounds: [],
        isFatal: false,
        isStun: false,
        isKnockdown: false,
        isAmputation: false
      };
    }
  }

  /**
   * Lookup critical by body part and rank
   * @param {string} damageType - Damage type (slash, crush, puncture, etc.)
   * @param {string} bodyPart - Body part (HEAD, CHEST, RIGHT_ARM, etc.)
   * @param {number} rank - Critical rank (0-9)
   * @returns {Promise<Object>} Critical hit result
   */
  async lookupCriticalByBodyPart(damageType, bodyPart, rank) {
    if (!this.db) {
      await this.initialize();
    }

    try {
      const critsCollection = this.db.collection('crits');
      
      // Query for critical by damage type, body part, and rank
      const critical = await critsCollection.findOne({
        damageType: damageType,
        bodyPart: bodyPart,
        rank: rank
      });

      if (!critical) {
        console.log(`[CRITICAL] No critical found in DB for damageType="${damageType}", bodyPart="${bodyPart}", rank=${rank}`);
        // Return default critical for this rank
        return {
          rank: rank,
          damage: Math.floor(rank * 5),
          message: `You strike the ${bodyPart.toLowerCase()}!`,
          effects: [],
          wounds: [],
          bodyPart: bodyPart,
          isFatal: false,
          isStun: false,
          isKnockdown: false,
          isAmputation: false
        };
      }
      
      console.log(`[CRITICAL] Found critical in DB:`, JSON.stringify(critical.message));

      return {
        rank: critical.rank,
        damage: critical.damage || 0,
        message: critical.message,
        effects: critical.effects || [],
        wounds: critical.wounds || [],
        bodyPart: critical.bodyPart,
        isFatal: (critical.effects || []).includes('F'),
        isStun: (critical.effects || []).some(e => e.startsWith('S')),
        isKnockdown: (critical.effects || []).includes('K'),
        isAmputation: (critical.effects || []).includes('A')
      };
    } catch (error) {
      console.error('Error looking up critical by body part:', error);
      
      return {
        rank: rank,
        damage: Math.floor(rank * 5),
        message: `You strike the ${bodyPart.toLowerCase()}!`,
        effects: [],
        wounds: [],
        bodyPart: bodyPart,
        isFatal: false,
        isStun: false,
        isKnockdown: false,
        isAmputation: false
      };
    }
  }

  /**
   * Replace [target] placeholder in critical message
   */
  formatCriticalMessage(message, target) {
    if (!target) return message;
    
    const targetName = target.name || 'target';
    return message.replace(/\[target\]/gi, targetName)
                  .replace(/target's/gi, `${targetName}'s`);
  }

  /**
   * Parse stun duration from effect string (e.g., 'S3' = 3 rounds)
   */
  getStunDuration(effects) {
    if (!effects) return 0;
    
    const stunEffect = effects.find(e => e.startsWith('S') && e.length > 1);
    if (!stunEffect) return 0;
    
    const duration = parseInt(stunEffect.substring(1));
    return isNaN(duration) ? 0 : duration;
  }
}

module.exports = CriticalSystem;

