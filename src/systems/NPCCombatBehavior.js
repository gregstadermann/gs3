'use strict';

/**
 * NPC Combat Behavior System
 * Handles NPC combat actions, aggressive behavior, and AI
 */
class NPCCombatBehavior {
  constructor(combatSystem, gameEngine = null) {
    this.combatSystem = combatSystem;
    this.gameEngine = gameEngine;
  }

  /**
   * Check if an aggressive NPC should initiate combat
   * Called every game tick for non-combat NPCs that are aggressive
   */
  checkAggressiveAttack(npc) {
    if (!npc.aggressive) {
      return false;
    }

    // Check if already in combat using combatSystem
    if (this.combatSystem.isInCombat(npc)) {
      return false; // Already in combat
    }

    // Check for players in the same room
    const room = npc.room;
    if (!room) {
      return false;
    }

    // Get gameEngine from this instance (passed from GameEngine)
    if (!this.gameEngine || !this.gameEngine.roomSystem) {
      console.error('NPCCombatBehavior: gameEngine not available');
      return false;
    }

    const playersInRoom = this.gameEngine.roomSystem.getPlayersInRoom(room);
    if (!playersInRoom || playersInRoom.length === 0) {
      return false;
    }

    // Select first player as target
    const target = playersInRoom[0];

    // Initiate combat against player
    this.initiateCombat(npc, target);

    return true;
  }

  /**
   * Initiate combat for an NPC
   */
  initiateCombat(npc, target) {
    if (!this.combatSystem) {
      console.error('NPCCombatBehavior: CombatSystem not initialized');
      return;
    }

    this.combatSystem.initiateCombat(npc, target, 0);
    
    // Send messages
    this.sendCombatMessage(npc, target, `The ${npc.name} attacks you!\r\n`);
    this.sendCombatMessage(npc, npc, `You attack ${target.name}!\r\n`);
  }

  /**
   * Perform combat action for an NPC in combat
   * Called when NPC's roundtime expires
   */
  async performCombatAction(npc) {
    if (!this.combatSystem.isInCombat(npc)) {
      return;
    }

    const combatants = npc.combatants || new Set();
    if (combatants.size === 0) {
      return;
    }

    // Select primary target (first combatant)
    const target = combatants.values().next().value;
    if (!target) {
      return;
    }

    // Perform attack
    await this.npcAttack(npc, target);

    // Reset roundtime
    if (npc.roundtime) {
      npc.combatData.lag = npc.roundtime;
    } else {
      npc.combatData.lag = 2500; // Default 2.5 seconds
    }
  }

  /**
   * NPC attacks a target
   */
  async npcAttack(npc, target) {
    // Get weapon from NPC (if any)
    const weapon = this.getNPCWeapon(npc);
    
    // Get attack configuration from NPC
    const attackType = npc.combat?.attackType || 'attack';
    const attackName = npc.combat?.attackName || attackType;
    
    // Damage type can be a string or array (e.g., bite can use puncture/crush/slash)
    const damageTypeConfig = npc.combat?.damageType || null;
    const damageType = damageTypeConfig
      ? (Array.isArray(damageTypeConfig) 
          ? damageTypeConfig[Math.floor(Math.random() * damageTypeConfig.length)]
          : damageTypeConfig)
      : null;

    // Calculate damage using GS4 formula
    const DamageSystem = require('./DamageSystem');
    const damageSystem = new DamageSystem();
    
    // Determine attack method: weapon > custom attack > unarmed
    let damageResult;
    if (weapon) {
      // NPC has a weapon - use weapon damage calculation
      damageResult = damageSystem.calculateWeaponDamage(npc, weapon, target);
    } else if (npc.combat?.damageFactors && npc.combat?.avd) {
      // NPC has custom attack configuration (damageFactors and AvD per armor type)
      const targetArmorType = damageSystem.getArmorType(target);
      const damageFactors = npc.combat.damageFactors;
      const avdTable = npc.combat.avd;
      
      // Get damage factor and AvD for target's armor type
      // Default to cloth (ASG 1) if armor type not found, or use first available value
      const damageFactor = damageFactors[targetArmorType] 
        || damageFactors[1] 
        || Object.values(damageFactors)[0] 
        || 0.400;
      const avd = avdTable[targetArmorType] 
        || avdTable[1] 
        || Object.values(avdTable)[0] 
        || 33;
      
      damageResult = {
        finalDamage: 0, // Calculated below using endroll formula
        damageFactor: damageFactor,
        armorType: targetArmorType,
        avd: avd,
        damageType: damageType || 'crush' // Use configured damage type or default
      };
    } else {
      // Default unarmed attack
      damageResult = damageSystem.calculateUnarmedDamage(npc, target);
      // Override damage type if NPC has one configured
      if (damageType) {
        damageResult.damageType = damageType;
      }
    }

    // Calculate hit result (AS - DS + AvD + d100)
    // Get AS directly from NPC definition, or use default
    const as = npc.stats?.as || npc.combat?.as || npc.attributes?.attackStrength || 25;
    // Get target's DS (use player's actual DS if available, otherwise base)
    const targetDS = target.attributes?.defenseStrength || target.combat?.ds || 25;
    const avd = damageResult.avd;
    const d100Roll = Math.floor(Math.random() * 100) + 1;
    const endRoll = as - targetDS + avd + d100Roll;
    
    // Calculate raw damage if hit using GS4 formula: (endroll - 100) * damageFactor
    let rawDamage = 0;
    if (endRoll > 100) {
      const damageFactor = damageResult.damageFactor || 0.45;
      const endrollSuccessMargin = endRoll - 100;
      rawDamage = Math.floor(endrollSuccessMargin * damageFactor);
    }

    // For custom attacks without weapons, create a pseudo-weapon object for critical system
    // This allows the critical system to use the correct damage type table
    const attackWeapon = weapon || {
      type: 'WEAPON',
      name: attackName,
      metadata: {
        damageType: damageResult.damageType || damageType || 'crush',
        weaponType: attackType || 'unarmed'
      }
    };

    // Apply damage with critical hits (using raw damage)
    const damageApplied = await damageSystem.applyDamageWithCritical(npc, target, rawDamage, attackWeapon);

    // Send combat messages
    const npcName = npc.name || 'creature';
    const targetName = target.name || 'target';
    const attackVerb = attackName || (weapon ? weapon.name : 'attack');
    
    this.sendCombatMessage(npc, target, `A ${npcName} tries to ${attackVerb} you!\r\n`);
    this.sendCombatMessage(npc, target, `  AS: +${as} vs DS: +${targetDS} with AvD: +${avd} + d100 roll: +${d100Roll} = +${endRoll}\r\n`);
    
    // Check if hit
    if (endRoll <= 100) {
      this.sendCombatMessage(npc, target, `  ... and misses!\r\n`);
      return;
    }
    
    // Hit successful
    this.sendCombatMessage(npc, target, `  ... and hits for ${damageApplied.damage} points of damage!\r\n`);
    
    // Critical hit message
    if (damageApplied.critical && damageApplied.critical.message) {
      const critMessage = damageApplied.critical.message.replace(/\[target\]/gi, targetName);
      this.sendCombatMessage(npc, target, `  ${critMessage}\r\n`);
    }
    // Show stun messaging if stunned by critical effects
    if (damageApplied.critical && Array.isArray(damageApplied.critical.effects)) {
      const hasStun = damageApplied.critical.effects.some(e => typeof e === 'string' && /^S\d+$/i.test(e));
      if (hasStun) {
        this.sendCombatMessage(npc, target, `${targetName} is stunned!\r\n`);
      }
    }
    
    // Check if target died
    if (damageApplied.targetDead) {
      this.sendCombatMessage(npc, target, `${targetName} collapses and dies!\r\n`);
      this.combatSystem.removeFromCombat(npc);
    }
  }

  /**
   * Get weapon from NPC (if any)
   */
  getNPCWeapon(npc) {
    if (!npc.equipment) {
      return null;
    }

    // Check right hand
    if (npc.equipment.rightHand) {
      const item = npc.equipment.rightHand;
      if (item && (item.type === 'WEAPON' || item.metadata?.weapon_type)) {
        return item;
      }
    }

    return null;
  }

  /**
   * Send combat message to target
   */
  sendCombatMessage(from, to, message) {
    if (!to.connection) {
      return;
    }

    if (typeof to.connection.send === 'function') {
      // WebSocket
      to.connection.send(message);
    } else if (typeof to.connection.write === 'function') {
      // Telnet
      to.connection.write(message);
    }
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
}

module.exports = NPCCombatBehavior;

