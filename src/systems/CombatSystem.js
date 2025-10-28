'use strict';

/**
 * Combat System
 * Manages combat state, combatants, and roundtime/lag
 */
class CombatSystem {
  constructor() {
    this.activeCombatants = new Map(); // Track active combat states
  }

  /**
   * Initialize combat for a character
   * @param {Object} character - The attacking character
   * @param {Object} target - The target being attacked
   * @param {number} initialLag - Initial lag in milliseconds (default 0)
   */
  initiateCombat(character, target, initialLag = 0) {
    // Initialize combat data if not present
    if (!character.combatData) {
      character.combatData = {
        lag: 0,
        roundStarted: Date.now()
      };
    }

    // If starting new combat, set initial lag
    if (!this.isInCombat(character)) {
      character.combatData.lag = initialLag;
      character.combatData.roundStarted = Date.now();
    }

    // If already in combat with this target, return
    if (this.isInCombat(character, target)) {
      return;
    }

    // Add combatant relationship (bidirectional)
    this.addCombatant(character, target);

    // Initiate combat for target if not already in combat
    if (!this.isInCombat(target)) {
      // Target gets initial lag (typically 5 seconds for first combat)
      target.combatData = {
        lag: 5000,
        roundStarted: Date.now()
      };
      target.addCombatant(character);
    }
  }

  /**
   * Check if character is in combat
   * @param {Object} character - The character to check
   * @param {Object} specificTarget - Optional: check for specific target
   * @returns {boolean}
   */
  isInCombat(character, specificTarget = null) {
    if (!character.combatants) {
      return false;
    }
    
    if (specificTarget) {
      return character.combatants.has(specificTarget);
    }
    
    return character.combatants.size > 0;
  }

  /**
   * Add a combatant relationship (bidirectional)
   * @param {Object} attacker - The attacker
   * @param {Object} target - The target
   */
  addCombatant(attacker, target) {
    if (!attacker.combatants) {
      attacker.combatants = new Set();
    }
    
    if (!target.combatants) {
      target.combatants = new Set();
    }

    attacker.combatants.add(target);
    target.combatants.add(attacker);
  }

  /**
   * Remove a combatant relationship (bidirectional)
   * @param {Object} attacker - The attacker
   * @param {Object} target - The target
   */
  removeCombatant(attacker, target) {
    if (!attacker.combatants || !target.combatants) {
      return;
    }

    if (attacker.combatants.has(target)) {
      attacker.combatants.delete(target);
    }

    if (target.combatants.has(attacker)) {
      target.combatants.delete(attacker);
    }

    // If no more combatants, end combat
    if (attacker.combatants.size === 0) {
      this.removeFromCombat(attacker);
    }

    if (target.combatants.size === 0) {
      this.removeFromCombat(target);
    }
  }

  /**
   * Remove character from all combat
   * @param {Object} character - The character to remove
   */
  removeFromCombat(character) {
    if (!this.isInCombat(character)) {
      return;
    }

    // Remove from all combatants
    for (const combatant of character.combatants) {
      this.removeCombatant(character, combatant);
    }

    // Clear combat data
    if (character.combatData) {
      character.combatData.lag = 0;
    }
  }

  /**
   * Get all combatants for a character
   * @param {Object} character - The character
   * @returns {Set}
   */
  getCombatants(character) {
    return character.combatants || new Set();
  }

  /**
   * Add lag (roundtime) to a character
   * @param {Object} character - The character
   * @param {number} lagAmount - Lag amount in milliseconds
   */
  addLag(character, lagAmount) {
    if (!character.combatData) {
      character.combatData = { lag: 0, roundStarted: Date.now() };
    }
    
    character.combatData.lag = (character.combatData.lag || 0) + lagAmount;
  }

  /**
   * Get current lag for a character
   * @param {Object} character - The character
   * @returns {number}
   */
  getLag(character) {
    if (!character.combatData) {
      return 0;
    }
    return character.combatData.lag || 0;
  }

  /**
   * Check if character can act (no lag)
   * @param {Object} character - The character
   * @returns {boolean}
   */
  canAct(character) {
    return this.getLag(character) <= 0;
  }

  /**
   * Tick lag (decrement by deltaTime)
   * @param {Object} character - The character
   * @param {number} deltaTime - Time delta in milliseconds
   */
  tickLag(character, deltaTime) {
    if (!character.combatData || !character.combatData.lag) {
      return;
    }

    character.combatData.lag = Math.max(0, character.combatData.lag - deltaTime);
  }

  /**
   * Update combat state for a character (called each game tick)
   * @param {Object} character - The character
   * @param {number} deltaTime - Time delta in milliseconds
   */
  updateCombat(character, deltaTime) {
    if (!this.isInCombat(character)) {
      return;
    }

    // Tick lag
    this.tickLag(character, deltaTime);

    // Check if character can act now
    if (this.canAct(character) && character.combatData.lag > 0) {
      // Automatically set to 0 if lag expired
      character.combatData.lag = 0;
    }
  }
}

module.exports = CombatSystem;

