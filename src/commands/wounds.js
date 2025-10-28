'use strict';

const WoundSystem = require('../systems/WoundSystem');

/**
 * Wounds Command
 * Displays current wounds and scars
 */
module.exports = {
  name: 'wounds',
  aliases: ['wound'],
  description: 'View your wounds and scars',
  usage: 'wounds',
  
  async execute(player, args) {
    // Initialize wounds if needed
    WoundSystem.initializeWounds(player);
    
    // Get all wounds and scars
    const wounds = WoundSystem.getAllWounds(player);
    const scars = WoundSystem.getAllScars(player);
    
    // Check if player has any wounds or scars
    const woundCount = Object.keys(wounds).length;
    const scarCount = Object.keys(scars).length;
    
    if (woundCount === 0 && scarCount === 0) {
      return {
        success: true,
        message: 'You have no wounds or scars.\r\n'
      };
    }
    
    let message = '';
    
    // Display wounds
    if (woundCount > 0) {
      message += 'You have the following wounds:\r\n';
      
      for (const location in wounds) {
        const wound = wounds[location];
        const description = WoundSystem.getWoundDescription(player, location);
        if (description) {
          message += `  - ${location}: ${description} (Rank ${wound.rank})\r\n`;
        }
      }
      
      message += '\r\n';
    }
    
    // Display scars
    if (scarCount > 0) {
      message += 'You have the following scars:\r\n';
      
      for (const location in scars) {
        const scar = scars[location];
        const description = WoundSystem.getWoundDescription(player, location);
        if (description) {
          message += `  - ${location}: ${description} (Rank ${scar.rank})\r\n`;
        }
      }
    }
    
    return {
      success: true,
      message: message
    };
  }
};

