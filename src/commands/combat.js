'use strict';

const CombatSystem = require('../systems/CombatSystem');
const WoundSystem = require('../systems/WoundSystem');

let combatSystem = null;

/**
 * Combat Status Command
 * Shows current combat status, combatants, and health
 */
module.exports = {
  name: 'combat',
  aliases: ['fight', 'status'],
  description: 'Show combat status',
  usage: 'combat or fight',
  
  execute(player, args) {
    // Initialize systems if needed
    if (!combatSystem) {
      combatSystem = new CombatSystem();
    }

    // Get combat system from game engine
    const gameCombat = player.gameEngine?.combatSystem || combatSystem;
    
    let message = '';
    
    // Check if in combat
    if (!gameCombat.isInCombat(player)) {
      message = "You are not in combat.\r\n";
      return { success: true, message };
    }

    // Get combatants
    const combatants = gameCombat.getCombatants(player);
    
    message += "--- Combat Status ---\r\n";
    message += `You are engaged in combat with:\r\n`;
    
    for (const combatant of combatants) {
      const name = combatant.name || 'Unknown';
      const health = combatant.attributes?.health || 0;
      const maxHealth = combatant.attributes?.health?.base || 
                       (combatant.attributes?.health?.base + combatant.attributes?.health?.delta) ||
                       100;
      
      message += `  ${name}: ${health}/${maxHealth} HP\r\n`;
    }
    
    // Show lag/roundtime
    const lag = gameCombat.getLag(player);
    if (lag > 0) {
      const lagSeconds = (lag / 1000).toFixed(1);
      message += `\r\nRoundtime: ${lagSeconds}s remaining\r\n`;
    } else {
      message += `\r\nReady to act!\r\n`;
    }

    // Show combat data
    if (player.combatData) {
      message += `\r\nCombat Data:\r\n`;
      message += `  Round Started: ${new Date(player.combatData.roundStarted).toLocaleTimeString()}\r\n`;
    }

    // Show wounds
    const wounds = WoundSystem.getAllWounds(player);
    const woundCount = Object.keys(wounds).length;
    
    if (woundCount > 0) {
      message += `\r\nWounds:\r\n`;
      for (const location in wounds) {
        const wound = wounds[location];
        const description = WoundSystem.getWoundDescription(player, location);
        if (description) {
          const bleeding = wound.rank >= 2 ? ' [BLEEDING]' : '';
          message += `  ${location}: ${description}${bleeding}\r\n`;
        }
      }
    }

    message += "--- End Combat Status ---\r\n";
    
    return { 
      success: true, 
      message: message 
    };
  }
};

