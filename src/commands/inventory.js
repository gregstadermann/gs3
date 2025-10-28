'use strict';

const { checkRoundtime } = require('../utils/roundtimeChecker');

/**
 * Inventory Command
 * Display player's inventory and equipment
 */
module.exports = {
  name: 'inventory',
  aliases: ['i', 'inv'],
  description: 'View your inventory and equipment',
  usage: 'inventory',
  
  execute(player, args) {
    // Check roundtime/lag
    const roundtimeCheck = checkRoundtime(player);
    if (roundtimeCheck) {
      return roundtimeCheck;
    }

    let message = '';
    
    // Collect held items
    const heldRight = player.equipment?.rightHand;
    const heldLeft = player.equipment?.leftHand;
    
    if (heldRight || heldLeft) {
      const parts = [];
      if (heldRight) {
        const rName = typeof heldRight === 'string' ? heldRight : (heldRight.name || 'an item');
        parts.push(rName + ' in your right hand');
      }
      if (heldLeft) {
        const lName = typeof heldLeft === 'string' ? heldLeft : (heldLeft.name || 'an item');
        parts.push(lName + ' in your left hand');
      }
      message += 'You are holding ' + parts.join(' and ') + '.\r\n';
    }
    
    // Show worn items
    const wornItems = [];
    if (player.equipment) {
      for (const [slot, item] of Object.entries(player.equipment)) {
        if (slot !== 'rightHand' && slot !== 'leftHand' && item) {
          wornItems.push(typeof item === 'string' ? item : item.name || 'an item');
        }
      }
    }
    
    if (wornItems.length > 0) {
      message += 'You are wearing ' + wornItems.join(', ') + '.\r\n';
    }
    
    if (!heldRight && !heldLeft && wornItems.length === 0) {
      message += 'You are empty-handed.\r\n';
    }
    
    return { success: true, message: message };
  }
};

