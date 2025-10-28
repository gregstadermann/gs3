'use strict';

const BASE_WEAPONS = require('../data/base-weapons');
const CriticalSystem = require('./CriticalSystem');
const WoundSystem = require('./WoundSystem');

/**
 * Damage System
 * Calculates weapon damage based on base weapon, attacker stats, and target armor
 */
class DamageSystem {
  constructor() {
    this.baseWeapons = BASE_WEAPONS;
    this.criticalSystem = null;
  }

  /**
   * Initialize critical system
   */
  async initializeCriticalSystem() {
    if (!this.criticalSystem) {
      this.criticalSystem = new CriticalSystem();
      await this.criticalSystem.initialize();
    }
  }

  /**
   * Get weapon combat values (AvD and damage factor)
   * Used to calculate damage using GS4 formula: (endroll - 100) * damageFactor
   * @param {Object} attacker - Attacking character
   * @param {Object} weapon - Weapon item being used
   * @param {Object} target - Target character
   * @returns {Object} Weapon combat values
   */
  calculateWeaponDamage(attacker, weapon, target) {
    if (!weapon) {
      // Unarmed combat
      return {
        finalDamage: 0, // Not used - calculated in attack.js
        damageFactor: 0.1,
        armorType: this.getArmorType(target),
        avd: 25,
        damageType: 'crush'
      };
    }

    // Get base weapon type
    const baseWeaponType = weapon.metadata?.baseWeapon;
    if (!baseWeaponType || !this.baseWeapons[baseWeaponType]) {
      // Default damage if weapon type unknown
      return {
        finalDamage: 0, // Not used - calculated in attack.js
        damageFactor: 0.45,
        armorType: this.getArmorType(target),
        avd: 30,
        damageType: 'crush'
      };
    }

    const baseWeapon = this.baseWeapons[baseWeaponType];
    const targetArmorType = this.getArmorType(target);

    // Get damage factor for this armor type (this is the weapon's damage capability)
    const damageFactor = this.getDamageFactor(baseWeapon, targetArmorType);
    
    // Get Attack vs Defense value
    const avd = this.getAttackVsDefense(baseWeapon, targetArmorType);
    const dex = this.getStat(attacker, 'dexterity') || 50;
    const dexterityBonus = Math.floor((dex - 50) / 10);

    return {
      finalDamage: 0, // Not used - calculated in attack.js using (endroll - 100) * damageFactor
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

  /**
   * Determine body part hit based on percentages
   * @returns {string} Body part
   */
  determineBodyPart() {
    const roll = Math.random() * 100;
    
    // arms (either) 19.7%
    if (roll < 19.7) return Math.random() < 0.5 ? 'RIGHT_ARM' : 'LEFT_ARM';
    // legs (either) 16.5%
    else if (roll < 36.2) return Math.random() < 0.5 ? 'RIGHT_LEG' : 'LEFT_LEG';
    // chest 14.7%
    else if (roll < 50.9) return 'CHEST';
    // abdomen 12.1%
    else if (roll < 63.0) return 'ABDOMEN';
    // back 10.1%
    else if (roll < 73.1) return 'BACK';
    // hands (either) 9.0%
    else if (roll < 82.1) return Math.random() < 0.5 ? 'RIGHT_HAND' : 'LEFT_HAND';
    // neck 7.4%
    else if (roll < 89.5) return 'NECK';
    // eyes (either) 5.3%
    else if (roll < 94.8) return Math.random() < 0.5 ? 'RIGHT_EYE' : 'LEFT_EYE';
    // head 5.2%
    else return 'HEAD';
  }

  /**
   * Calculate critical hit damage and message
   * EVERY hit gets a critical lookup
   * @param {Object} attacker - The attacker
   * @param {Object} target - The target
   * @param {number} baseDamage - Base damage before critical
   * @param {string} damageType - Type of damage (slash, crush, puncture, etc.)
   * @returns {Promise<Object>} Critical hit result
   */
  async calculateCriticalDamage(attacker, target, baseDamage, damageType = 'slash') {
    await this.initializeCriticalSystem();

    // Determine which body part was hit
    const bodyPart = this.determineBodyPart();
    
    // Determine crit rank using armor crit divisor formula
    // Raw damage was provided in baseDamage = (Endroll - 100) * DF
    // rank = Truncate( (Raw - armorPadding + weaponWeighting) / critDivisor )
    const armorGroup = this.getArmorGroupForTarget(target); // 1=cloth,5-8=leather,9-12=scale,13-16=chain,17-20=plate
    const critDivisor = this.getArmorCritDivisor(armorGroup); // Robes 5, Leather 6, Scale 7, Chain 9, Plate 11
    const armorPadding = this.getArmorPadding(target) || 0;
    const weaponWeighting = this.getWeaponWeighting(attacker) || 0;
    const adjustedRaw = Math.max(0, (baseDamage || 0) - armorPadding + weaponWeighting);
    let critRank = Math.trunc(adjustedRaw / critDivisor);
    if (critRank < 0) critRank = 0;
    if (critRank > 9) critRank = 9;

    // Look up the critical result for this body part and rank
    const critical = await this.criticalSystem.lookupCriticalByBodyPart(damageType, bodyPart, critRank);
    
    // Add critical damage to base damage
    const criticalDamage = critical.damage || 0;
    const totalDamage = baseDamage + criticalDamage;
    
    return {
      isCritical: true,  // Always true - every hit is looked up
      damage: criticalDamage,
      totalDamage: totalDamage,
      baseDamage: baseDamage,
      message: critical.message,
      effects: critical.effects || [],
      wounds: critical.wounds || [],
      rank: critRank,
      bodyPart: bodyPart,
      isFatal: critical.isFatal || false,
      isStun: critical.isStun || false,
      isKnockdown: critical.isKnockdown || false,
      isAmputation: critical.isAmputation || false
    };
  }

  // Map target's worn armor to a crit divisor armor group code
  getArmorGroupForTarget(target) {
    try {
      // Expect armor stored on equipment.chest with metadata.armorGroup or armor type id
      const armor = target.equipment?.chest || target.equipment?.body || null;
      const asg = armor?.metadata?.armorGroup;
      if (typeof asg === 'number') return asg;
      // Fallback: rough map by armor.type string
      const type = (armor?.type || armor?.metadata?.type || '').toString().toLowerCase();
      if (type.includes('robe') || type.includes('cloth')) return 1; // Robes
      if (type.includes('leather')) return 5; // Leather tier start
      if (type.includes('scale')) return 9; // Scale tier start
      if (type.includes('chain')) return 13; // Chain tier start
      if (type.includes('plate')) return 17; // Plate tier start
    } catch (_) {}
    // Unarmored default to cloth/robes
    return 1;
  }

  getArmorCritDivisor(armorGroup) {
    // Armor Group buckets per problem statement
    if (armorGroup >= 17) return 11; // Plate
    if (armorGroup >= 13) return 9;  // Chain
    if (armorGroup >= 9)  return 7;  // Scale
    if (armorGroup >= 5)  return 6;  // Leather
    return 5;                        // Robes/unarmored
  }

  getArmorPadding(target) {
    // Placeholder: read from worn armor metadata if present (phantom damage reduction)
    const armor = target.equipment?.chest || target.equipment?.body || null;
    return armor?.metadata?.padding || 0;
  }

  getWeaponWeighting(attacker) {
    // Placeholder: read from weapon weighting (phantom damage add)
    const weapon = attacker?.equipment?.rightHand || null;
    return weapon?.metadata?.weighting || 0;
  }

  /**
   * Apply damage with critical hit support
   * @param {Object} attacker - The attacker
   * @param {Object} target - The target
   * @param {number} damage - Amount of damage
   * @param {Object} weapon - Weapon used
   * @returns {Promise<Object>} Result of damage application including critical info
   */
  async applyDamageWithCritical(attacker, target, damage, weapon = null) {
    // Determine damage type from weapon
    // First check if weapon has baseWeapon defined
    let damageTypes = ['slash']; // default
    
    if (weapon?.metadata?.baseWeapon) {
      const baseWeapon = this.baseWeapons[weapon.metadata.baseWeapon];
      if (baseWeapon && baseWeapon.damageType) {
        damageTypes = Array.isArray(baseWeapon.damageType) ? baseWeapon.damageType : [baseWeapon.damageType];
      }
    } else if (weapon?.metadata?.damageType) {
      damageTypes = Array.isArray(weapon.metadata.damageType) ? weapon.metadata.damageType : [weapon.metadata.damageType];
    }
    
    // Pick random type if multiple (even distribution)
    // For now, prefer slash if available to test against DB
    let damageType = damageTypes[0];
    if (damageTypes.length > 1) {
      damageType = damageTypes[Math.floor(Math.random() * damageTypes.length)];
    }
    // Force to 'slash' to match DB critical type
    if (damageTypes.includes('slash')) {
      damageType = 'slash';
    }
    
    console.log(`[DAMAGE] Weapon: ${weapon?.name}, Available types: ${damageTypes.join('/')}, Selected: ${damageType}`);
    
    // Calculate critical hit
    const criticalResult = await this.calculateCriticalDamage(attacker, target, damage, damageType);

    // Determine instant-death based on damage type/body part/crit rank thresholds
    function simplifyBodyPart(bp) {
      if (!bp) return '';
      if (bp.includes('EYE')) return 'EYE';
      return bp;
    }
    function getFatalThreshold(type, part) {
      const t = (type || '').toLowerCase();
      const p = part;
      // Threshold maps per table (min crit rank for instant death)
      const common = {
        HEAD: 6, NECK: 6, EYE: 6, CHEST: 8, ABDOMEN: 8, BACK: 8
      };
      const tables = {
        cold: common,
        disintegration: common,
        disruption: { HEAD: 6, NECK: 6, EYE: 6, CHEST: 9, ABDOMEN: 8, BACK: 8 },
        electrical: { HEAD: 6, NECK: 6, EYE: 6, CHEST: 9, ABDOMEN: 8, BACK: 8 },
        fire: { HEAD: 6, NECK: 6, EYE: 7, CHEST: 8, ABDOMEN: 8, BACK: 8 },
        slash: { HEAD: 6, NECK: 6, EYE: 5, CHEST: 8, ABDOMEN: 8, BACK: 8 },
        puncture: { HEAD: 6, NECK: 6, EYE: 4, CHEST: 8, ABDOMEN: 8, BACK: 8 },
        crush: { HEAD: 5, NECK: 5, EYE: 7, CHEST: 9, ABDOMEN: 8, BACK: 8 },
        impact: { HEAD: 5, NECK: 5, EYE: 7, CHEST: 9, ABDOMEN: 8, BACK: 8 },
        vacuum: { HEAD: 6, NECK: 6, EYE: 7, CHEST: 8, ABDOMEN: 8, BACK: 8 },
        plasma: { HEAD: 6, NECK: 5, EYE: 7, CHEST: 7, ABDOMEN: 8, BACK: 8 }
      };
      const table = tables[t];
      if (!table) return Infinity;
      return table[p] ?? Infinity;
    }
    const simplePart = simplifyBodyPart(criticalResult.bodyPart);
    const fatalThreshold = getFatalThreshold(damageType, simplePart);
    const isInstantDeath = criticalResult.isCritical && fatalThreshold !== Infinity && criticalResult.rank >= fatalThreshold;
    
    // Apply critical damage if it occurred
    const finalDamage = criticalResult.isCritical ? criticalResult.totalDamage : damage;
    
    // Get current health
    const currentHealth = this.getStat(target, 'health');
    
    // Calculate damage with armor mitigation
    const mitigation = this.calculateArmorMitigation(target);
    const mitigatedDamage = Math.floor(finalDamage * (1 - mitigation));
    
    // Consider explicit fatal flag from critical effects as well
    const hasFatalEffect = Array.isArray(criticalResult.effects) && criticalResult.effects.includes('F');
    const willDie = isInstantDeath || hasFatalEffect;

    // Apply damage (or instant death)
    const newHealth = willDie ? 0 : (currentHealth - mitigatedDamage);
    
    // Update target health
    this.setStat(target, 'health', newHealth);
    
    // Apply wound if there was a critical hit with a wound
    if (criticalResult.isCritical && criticalResult.bodyPart) {
      // Map critical rank (0-9) to wound rank (1-3)
      let woundRank = 1;
      if (criticalResult.rank >= 7) woundRank = 3;
      else if (criticalResult.rank >= 3) woundRank = 2;
      
      // Apply the wound
      WoundSystem.addWound(target, criticalResult.bodyPart, woundRank);
    }
    
    // Apply stun roundtime if present (S# => # rounds, 5s each). Ignore 'K' and 'A' and 'x' for now.
    if (!willDie && Array.isArray(criticalResult.effects)) {
      const stunTag = criticalResult.effects.find(e => typeof e === 'string' && /^S\d+$/i.test(e));
      if (stunTag) {
        const rounds = parseInt(stunTag.slice(1), 10);
        if (!isNaN(rounds) && rounds > 0) {
          try {
            const lagMs = rounds * 5000;
            const combat = target.gameEngine?.combatSystem;
            if (combat && typeof combat.addLag === 'function') {
              combat.addLag(target, lagMs);
            }
          } catch (_) {
            // best-effort; ignore failures
          }
        }
      }
    }

    // If target died, create a corpse item in the room for SEARCH/SKIN
    if (newHealth <= 0 && target && target.room && target.gameEngine && target.gameEngine.roomSystem) {
      try {
        const db = target.gameEngine.roomSystem.db;
        if (db) {
          const roomDoc = await db.collection('rooms').findOne({ id: target.room });
          const corpseId = `corpse-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
          const npcName = target.name || 'creature';
          const corpseItem = {
            id: corpseId,
            type: 'CORPSE',
            name: `${npcName} which appears dead`,
            keywords: ['corpse', npcName.toLowerCase()],
            description: `The ${npcName} lies here motionless.`,
            location: roomDoc?._id ? String(roomDoc._id) : target.room,
            metadata: {
              corpse: true,
              npcName,
              searched: false,
              skinned: false,
              loot: {
                silver: (target.metadata?.wealth?.silver ?? (npcName.toLowerCase().includes('rat') ? 600 : Math.floor(Math.random() * 200))) || 0,
                items: []
              }
            },
            createdAt: new Date()
          };
          await db.collection('items').insertOne(corpseItem);
          // attach to room items and update cache
          const newItems = Array.isArray(roomDoc?.items) ? [...roomDoc.items, corpseId] : [corpseId];
          await db.collection('rooms').updateOne({ id: target.room }, { $set: { items: newItems } });
          const cachedRoom = target.gameEngine.roomSystem.getRoom(target.room);
          if (cachedRoom) {
            target.gameEngine.roomSystem.rooms.set(target.room, { ...cachedRoom, items: newItems });
          }
        }
      } catch (_) {
        // non-fatal if corpse creation fails
      }
    }

    return {
      damage: mitigatedDamage,
      originalDamage: finalDamage,
      baseDamage: damage,
      critical: { ...criticalResult, isFatal: willDie || criticalResult.isFatal },
      mitigation,
      targetHealth: newHealth,
      targetDead: newHealth <= 0
    };
  }
}

module.exports = DamageSystem;

