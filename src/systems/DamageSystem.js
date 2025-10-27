'use strict';

const BASE_WEAPONS = require('../data/base-weapons');

/**
 * Damage System
 * Calculates weapon damage based on base weapon, attacker stats, and target armor
 */
class DamageSystem {
  constructor() {
    this.baseWeapons = BASE_WEAPONS;
  }

  /**
   * Calculate base weapon damage
   * @param {Object} attacker - Attacking character
   * @param {Object} weapon - Weapon item being used
   * @param {Object} target - Target character
   * @returns {Object} Damage calculation result
   */
  calculateWeaponDamage(attacker, weapon, target) {
    if (!weapon) {
      // Unarmed combat
      return this.calculateUnarmedDamage(attacker, target);
    }

    // Get base weapon type
    const baseWeaponType = weapon.metadata?.baseWeapon;
    if (!baseWeaponType || !this.baseWeapons[baseWeaponType]) {
      // Default damage if weapon type unknown
      return this.calculateSimpleDamage(weapon, attacker, target);
    }

    const baseWeapon = this.baseWeapons[baseWeaponType];
    const targetArmorType = this.getArmorType(target);

    // Get damage factor for this armor type
    const damageFactor = this.getDamageFactor(baseWeapon, targetArmorType);
    
    // Base damage from weapon (minDamage/maxDamage)
    const weaponMin = weapon.metadata?.minDamage || 5;
    const weaponMax = weapon.metadata?.maxDamage || 15;
    const baseDamage = Math.floor(Math.random() * (weaponMax - weaponMin + 1)) + weaponMin;

    // Apply damage factor
    let finalDamage = Math.floor(baseDamage * damageFactor);

    // Apply stat modifiers
    const str = this.getStat(attacker, 'strength') || 50;
    const dex = this.getStat(attacker, 'dexterity') || 50;
    
    // Strength adds damage (10 STR = +1 damage, roughly)
    finalDamage += Math.floor((str - 50) / 10);
    
    // Dexterity adds accuracy (affects hit chance via AvD)
    const avd = this.getAttackVsDefense(baseWeapon, targetArmorType);
    const dexterityBonus = Math.floor((dex - 50) / 10);

    // Ensure minimum damage
    finalDamage = Math.max(1, finalDamage);

    return {
      baseDamage,
      finalDamage,
      damageFactor,
      armorType: targetArmorType,
      avd: avd + dexterityBonus,
      damageType: baseWeapon.damageType[0] || 'crush'
    };
  }

  /**
   * Calculate unarmed damage
   */
  calculateUnarmedDamage(attacker, target) {
    const str = this.getStat(attacker, 'strength') || 50;
    const baseDamage = Math.floor(Math.random() * 5) + 1; // 1-5 damage unarmed
    const finalDamage = Math.max(1, baseDamage + Math.floor((str - 50) / 20));

    return {
      baseDamage,
      finalDamage,
      damageFactor: 0.1,
      armorType: this.getArmorType(target),
      avd: 25,
      damageType: 'crush'
    };
  }

  /**
   * Simple damage calculation for weapons without base weapon data
   */
  calculateSimpleDamage(weapon, attacker, target) {
    const minDamage = weapon.metadata?.minDamage || 5;
    const maxDamage = weapon.metadata?.maxDamage || 15;
    const baseDamage = Math.floor(Math.random() * (maxDamage - minDamage + 1)) + minDamage;
    
    const str = this.getStat(attacker, 'strength') || 50;
    const finalDamage = baseDamage + Math.floor((str - 50) / 10);

    return {
      baseDamage,
      finalDamage: Math.max(1, finalDamage),
      damageFactor: 1,
      armorType: this.getArmorType(target),
      avd: 30,
      damageType: 'crush'
    };
  }

  /**
   * Get armor type from target's equipped armor
   */
  getArmorType(target) {
    if (!target.equipment) {
      return 1; // No armor = cloth
    }

    // Check for chest armor
    const chestArmor = target.equipment.get?.('chest') || target.equipment.chest;
    if (chestArmor && chestArmor.metadata) {
      return chestArmor.metadata.armorType || chestArmor.metadata.armor_type || 1;
    }

    // Default to cloth
    return 1;
  }

  /**
   * Get damage factor for weapon vs armor type
   */
  getDamageFactor(baseWeapon, armorType) {
    if (!baseWeapon.damageFactors) {
      return 1.0;
    }

    // Find closest armor type match
    if (baseWeapon.damageFactors[armorType]) {
      return baseWeapon.damageFactors[armorType];
    }

    // Match to armor category
    if (armorType >= 17) {
      return baseWeapon.damageFactors[20] || baseWeapon.damageFactors[17] || 0.2;
    } else if (armorType >= 13) {
      return baseWeapon.damageFactors[16] || baseWeapon.damageFactors[13] || 0.2;
    } else if (armorType >= 9) {
      return baseWeapon.damageFactors[12] || baseWeapon.damageFactors[9] || 0.2;
    } else if (armorType >= 5) {
      return baseWeapon.damageFactors[8] || baseWeapon.damageFactors[5] || 0.25;
    }

    return baseWeapon.damageFactors[1] || 0.2;
  }

  /**
   * Get Attack vs Defense bonus
   */
  getAttackVsDefense(baseWeapon, armorType) {
    if (!baseWeapon.attackVsDefense) {
      return 30;
    }

    if (baseWeapon.attackVsDefense[armorType]) {
      return baseWeapon.attackVsDefense[armorType];
    }

    // Match to armor category
    if (armorType >= 17) {
      return baseWeapon.attackVsDefense[20] || baseWeapon.attackVsDefense[17] || 20;
    } else if (armorType >= 13) {
      return baseWeapon.attackVsDefense[16] || baseWeapon.attackVsDefense[13] || 25;
    } else if (armorType >= 9) {
      return baseWeapon.attackVsDefense[12] || baseWeapon.attackVsDefense[9] || 25;
    } else if (armorType >= 5) {
      return baseWeapon.attackVsDefense[8] || baseWeapon.attackVsDefense[5] || 25;
    }

    return baseWeapon.attackVsDefense[1] || 30;
  }

  /**
   * Get a stat value from character
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
   * Apply damage to a target
   * @param {Object} attacker - The attacker
   * @param {Object} target - The target
   * @param {number} damage - Amount of damage
   * @param {Object} weapon - Weapon used
   * @returns {Object} Result of damage application
   */
  applyDamage(attacker, target, damage, weapon = null) {
    // Get current health
    const currentHealth = this.getStat(target, 'health');
    
    // Calculate damage with armor mitigation
    const mitigation = this.calculateArmorMitigation(target);
    const finalDamage = Math.floor(damage * (1 - mitigation));
    
    // Apply damage
    const newHealth = currentHealth - finalDamage;
    
    // Update target health
    this.setStat(target, 'health', newHealth);
    
    return {
      damage: finalDamage,
      originalDamage: damage,
      mitigation,
      targetHealth: newHealth,
      targetDead: newHealth <= 0
    };
  }

  /**
   * Calculate armor mitigation from equipped armor
   */
  calculateArmorMitigation(target) {
    if (!target.equipment) {
      return 0;
    }

    let totalArmor = 0;

    // Check chest armor
    const chestArmor = target.equipment.get?.('chest') || target.equipment.chest;
    if (chestArmor && chestArmor.metadata) {
      totalArmor += chestArmor.metadata.stats?.armor || chestArmor.metadata.armor || 0;
    }

    // Armor mitigation formula: 100 armor = ~0.10 mitigation (10% reduction)
    const mitigation = Math.min(0.5, totalArmor / 1000);
    
    return mitigation;
  }

  /**
   * Set a stat value on character
   */
  setStat(character, statName, value) {
    if (!character.attributes) {
      character.attributes = {};
    }

    if (!character.attributes[statName]) {
      character.attributes[statName] = { base: 0, delta: 0 };
    }

    const stat = character.attributes[statName];
    if (typeof stat === 'object') {
      stat.delta = value - (stat.base || 0);
    } else {
      character.attributes[statName] = value;
    }
  }

  /**
   * Get weapon from attacker's equipment
   * Uses right hand (primary weapon hand)
   */
  getEquippedWeapon(attacker) {
    if (!attacker.equipment) {
      return null;
    }

    // Check right hand first (primary weapon slot)
    if (attacker.equipment.rightHand) {
      const item = attacker.equipment.rightHand;
      // Check if it's a weapon
      if (item && (item.type === 'WEAPON' || item.metadata?.weapon_type || item.metadata?.slot === 'wield')) {
        return item;
      }
    }

    // No weapon found
    return null;
  }
}

module.exports = DamageSystem;

