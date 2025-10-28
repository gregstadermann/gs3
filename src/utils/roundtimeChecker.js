'use strict';

/**
 * Roundtime Checker Utility
 * Centralized roundtime checking for commands
 */

/**
 * Check if player can act and return appropriate message if not
 * @param {Object} player - The player trying to act
 * @returns {Object|null} - Returns error message object if blocked, null if can act
 */
function checkRoundtime(player) {
  if (!player.gameEngine?.combatSystem) {
    return null; // No combat system, can act
  }

  const combatSystem = player.gameEngine.combatSystem;
  
  if (!combatSystem.canAct(player)) {
    const lag = combatSystem.getLag(player);
    const remainingSeconds = (lag / 1000).toFixed(1);
    
    return {
      success: false,
      message: `You must wait ${remainingSeconds} more seconds.\r\n`
    };
  }

  return null; // Can act
}

module.exports = {
  checkRoundtime
};

