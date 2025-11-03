'use strict';

const databaseManager = require('../adapters/db/mongoClient');
const BASE_WEAPONS = require('../data/base-weapons');

/**
 * Weapon System
 * Manages weapon lookups, result messages, and properties
 */
class WeaponSystem {
  constructor() {
    this.db = null;
    this.initialized = false;
    this.baseWeapons = BASE_WEAPONS;
  }

  /**
   * Initialize the weapon system with database connection
   */
  async initialize() {
    if (this.initialized) return;

    this.db = await databaseManager.initialize();
    this.initialized = true;
  }

  /**
   * Get weapon type from weapon item
   * @param {Object} weapon - Weapon item
   * @returns {string} Weapon type (e.g., 'one_handed_edged', 'two_handed', 'brawling')
   */
  getWeaponType(weapon) {
    if (!weapon) {
      return 'brawling'; // Unarmed
    }

    // Check for explicit weapon type
    if (weapon.metadata?.weapon_type) {
      return weapon.metadata.weapon_type;
    }

    // Check base weapon type
    if (weapon.metadata?.baseWeapon) {
      const baseWeapon = this.baseWeapons[weapon.metadata.baseWeapon];
      if (baseWeapon && baseWeapon.type) {
        return baseWeapon.type;
      }
    }

    // Default to brawling
    return 'brawling';
  }

  /**
   * Get base weapon data
   * @param {Object} weapon - Weapon item
   * @returns {Object} Base weapon data
   */
  getBaseWeapon(weapon) {
    if (!weapon || !weapon.metadata?.baseWeapon) {
      return null;
    }

    return this.baseWeapons[weapon.metadata.baseWeapon] || null;
  }

  /**
   * Calculate base damage range from weapon
   * @param {Object} weapon - Weapon item
   * @returns {Object} Damage range {min, max}
   */
  getDamageRange(weapon) {
    if (!weapon) {
      return { min: 1, max: 5 }; // Unarmed damage
    }

    const min = weapon.metadata?.minDamage || weapon.minDamage || 5;
    const max = weapon.metadata?.maxDamage || weapon.maxDamage || 15;

    return { min, max };
  }

  /**
   * Roll damage from weapon
   * @param {Object} weapon - Weapon item
   * @returns {number} Random damage within weapon range
   */
  rollDamage(weapon) {
    const range = this.getDamageRange(weapon);
    return Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
  }

  /**
   * Get weapon speed (roundtime cost)
   * @param {Object} weapon - Weapon item
   * @returns {number} Roundtime in milliseconds
   */
  getWeaponSpeed(weapon) {
    if (!weapon) {
      return 2500; // 2.5s unarmed
    }

    const baseWeapon = this.getBaseWeapon(weapon);
    if (baseWeapon && baseWeapon.roundtime) {
      // RT is in seconds (5 = 5s, 3 = 3s, etc)
      return baseWeapon.roundtime * 1000;
    }

    return 2500; // Default 2.5s
  }

  /**
   * Lookup weapon result message from MongoDB
   * @param {number} rollValue - The roll value (typically 1-100)
   * @param {string} weaponType - Weapon type (e.g., 'one_handed_edged')
   * @param {Object} weapon - Optional weapon item for context
   * @returns {Promise<Object>} Weapon result message and data
   */
  async lookupWeaponResult(rollValue, weaponType, weapon = null) {
    await this.initialize();

    try {
      // For now, return generic results since we don't have weapon tables yet
      // This is a placeholder for future implementation
      
      const result = this.getGenericResult(rollValue, weaponType);
      
      return {
        message: result.message,
        damageBonus: result.damageBonus || 0,
        hitQuality: result.quality,
        weaponType: weaponType
      };
    } catch (error) {
      console.error('Error looking up weapon result:', error);
      
      // Return generic result on error
      return {
        message: 'You strike at your target!',
        damageBonus: 0,
        hitQuality: 'normal',
        weaponType: weaponType
      };
    }
  }

  /**
   * Get generic weapon result message based on roll
   * @param {number} rollValue - Roll value (1-100)
   * @param {string} weaponType - Weapon type
   * @returns {Object} Result message and quality
   */
  getGenericResult(rollValue, weaponType) {
    // Define weapon-specific messages
    const results = {
      one_handed_edged: {
        low: { message: 'Your blade glances off harmlessly.', quality: 'miss' },
        normal: { message: 'Your sword strikes true!', quality: 'hit' },
        high: { message: 'Your blade carves deep into the target!', quality: 'critical' }
      },
      two_handed: {
        low: { message: 'Your heavy swing misses its mark.', quality: 'miss' },
        normal: { message: 'Your powerful blow connects with crushing force!', quality: 'hit' },
        high: { message: 'Your devastating strike smashes the target!', quality: 'critical' }
      },
      one_handed_blunt: {
        low: { message: 'Your weapon swings wide.', quality: 'miss' },
        normal: { message: 'Your mace lands a solid blow!', quality: 'hit' },
        high: { message: 'Your crushing strike shatters defenses!', quality: 'critical' }
      },
      brawling: {
        low: { message: 'Your punch barely connects.', quality: 'miss' },
        normal: { message: 'Your fist strikes with force!', quality: 'hit' },
        high: { message: 'Your powerful blow hits like a hammer!', quality: 'critical' }
      }
    };

    const weaponResults = results[weaponType] || results.brawling;
    
    let result;
    if (rollValue < 30) {
      result = weaponResults.low;
    } else if (rollValue < 70) {
      result = weaponResults.normal;
    } else {
      result = weaponResults.high;
    }

    // Add damage bonus for high rolls
    const damageBonus = rollValue > 70 ? Math.floor((rollValue - 70) / 10) : 0;

    return {
      message: result.message,
      quality: result.quality,
      damageBonus
    };
  }

  /**
   * Check if weapon meets requirements
   * @param {Object} character - Character attempting to use weapon
   * @param {Object} weapon - Weapon item
   * @returns {Object} {valid, reason}
   */
  checkWeaponRequirements(character, weapon) {
    if (!weapon) {
      return { valid: true, reason: null }; // Unarmed is always valid
    }

    const baseWeapon = this.getBaseWeapon(weapon);
    if (!baseWeapon) {
      return { valid: true, reason: null }; // No requirements defined
    }

    const strength = this.getStat(character, 'strength');
    const discipline = this.getStat(character, 'discipline');

    const requirements = [];
    
    if (baseWeapon.strReq && strength < baseWeapon.strReq) {
      requirements.push(`STR ${baseWeapon.strReq} (you have ${strength})`);
    }

    if (baseWeapon.disReq && discipline < baseWeapon.disReq) {
      requirements.push(`DIS ${baseWeapon.disReq} (you have ${discipline})`);
    }

    if (requirements.length > 0) {
      return {
        valid: false,
        reason: `You lack the required stats to wield this weapon: ${requirements.join(', ')}.`
      };
    }

    return { valid: true, reason: null };
  }

  /**
   * Get a stat value from character
   * @param {Object} character - Character object
   * @param {string} statName - Stat name
   * @returns {number} Stat value
   */
  getStat(character, statName) {
    if (!character.attributes) {
      return 0;
    }

    const stat = character.attributes[statName];
    if (!stat) {
      return 0;
    }

    // Handle stat as object with base and delta
    if (typeof stat === 'object') {
      return (stat.base || 0) + (stat.delta || 0);
    }

    return stat;
  }

  /**
   * Get weapon bonus from stats
   * @param {Object} weapon - Weapon item
   * @param {Object} character - Character using weapon
   * @returns {Object} Damage and accuracy bonuses
   */
  getWeaponBonuses(weapon, character) {
    const strength = this.getStat(character, 'strength');
    const dexterity = this.getStat(character, 'dexterity');

    // Strength adds damage (10 STR = +1 damage)
    const damageBonus = Math.floor((strength - 50) / 10);

    // Dexterity adds accuracy
    const accuracyBonus = Math.floor((dexterity - 50) / 10);

    return {
      damageBonus,
      accuracyBonus
    };
  }
}

module.exports = WeaponSystem;

