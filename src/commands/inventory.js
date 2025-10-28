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
    
    // Show held items (right and left hands)
    if (player.equipment) {
      const heldItems = [];
      
      if (player.equipment.rightHand) {
        const item = player.equipment.rightHand;
        const itemName = typeof item === 'string' ? item : (item.name || 'an item');
        heldItems.push(`right hand: ${itemName}`);
      }
      
      if (player.equipment.leftHand) {
        const item = player.equipment.leftHand;
        const itemName = typeof item === 'string' ? item : (item.name || 'an item');
        heldItems.push(`left hand: ${itemName}`);
      }
      
      if (heldItems.length > 0) {
        message += 'Held:\r\n';
        heldItems.forEach(item => message += `  ${item}\r\n`);
        message += '\r\n';
      }
    }
    
    // Show worn items (if any other equipment slots exist)
    const wornItems = [];
    if (player.equipment) {
      for (const [slot, item] of Object.entries(player.equipment)) {
        if (slot !== 'rightHand' && slot !== 'leftHand' && item) {
          const itemName = typeof item === 'string' ? item : (item.name || 'an item');
          wornItems.push(itemName);
        }
      }
    }
    
    if (wornItems.length > 0) {
      message += 'Wearing:\r\n';
      wornItems.forEach(item => message += `  ${item}\r\n`);
      message += '\r\n';
    }
    
    if (wornItems.length === 0 && (!player.equipment || (!player.equipment.rightHand && !player.equipment.leftHand))) {
      message += 'You are empty-handed.\r\n';
    }
    
    return { success: true, message: message };
  }
};

