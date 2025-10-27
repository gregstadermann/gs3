'use strict';

/**
 * NPC Combat Behavior System
 * Handles NPC combat actions, aggressive behavior, and AI
 */
class NPCCombatBehavior {
  constructor(combatSystem) {
    this.combatSystem = combatSystem;
  }

  /**
   * Check if an aggressive NPC should initiate combat
   * Called every game tick for non-combat NPCs that are aggressive
   */
  checkAggressiveAttack(npc) {
    if (!npc.aggressive) {
      return false;
    }

    if (npc.isInCombat && npc.combatants && npc.combatants.size > 0) {
      return false; // Already in combat
    }

    // Check for players in the same room
    const room = npc.room;
    if (!room) {
      return false;
    }

    const playersInRoom = npc.gameEngine.roomSystem.getPlayersInRoom(room);
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
  performCombatAction(npc) {
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
    this.npcAttack(npc, target);

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
  npcAttack(npc, target) {
    // Get weapon from NPC
    const weapon = this.getNPCWeapon(npc);

    // Calculate damage
    const DamageSystem = require('./DamageSystem');
    const damageSystem = new DamageSystem();
    const damageResult = damageSystem.calculateWeaponDamage(npc, weapon, target);

    // Apply damage
    const damageApplied = damageSystem.applyDamage(npc, target, damageResult.finalDamage, weapon);

    // Send combat messages
    const npcName = npc.name || 'creature';
    const targetName = target.name || 'target';
    const weaponName = weapon ? weapon.name : 'its attack';
    
    this.sendCombatMessage(npc, target, `The ${npcName} strikes you with ${weaponName} for ${damageApplied.damage} points of damage.\r\n`);
    
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
}

module.exports = NPCCombatBehavior;

