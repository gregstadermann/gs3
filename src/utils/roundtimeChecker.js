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
  // Check if player has combat data with lag directly (more reliable)
  if (player.combatData && player.combatData.lag > 0) {
    const lag = player.combatData.lag;
    // Display integer seconds (no decimals); ceil to avoid showing 0 when time remains
    const remainingSeconds = Math.ceil(lag / 1000);
    
    return {
      success: false,
      message: `You must wait ${remainingSeconds} more second(s).\r\n`
    };
  }

  // Also check via combat system if available
  if (player.gameEngine?.combatSystem) {
  const combatSystem = player.gameEngine.combatSystem;
  
  if (!combatSystem.canAct(player)) {
    const lag = combatSystem.getLag(player);
    // Display integer seconds (no decimals); ceil to avoid showing 0 when time remains
    const remainingSeconds = Math.ceil(lag / 1000);
    
    return {
      success: false,
        message: `You must wait ${remainingSeconds} more second(s).\r\n`
    };
    }
  }

  return null; // Can act
}

module.exports = {
  checkRoundtime
};

