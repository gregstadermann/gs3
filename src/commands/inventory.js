'use strict';

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
    let message = '';
    
    // Show equipment
    if (player.equipment && Object.keys(player.equipment).length > 0) {
      message += 'You are wearing:\r\n';
      for (const [slot, item] of Object.entries(player.equipment)) {
        if (item) {
          const itemName = typeof item === 'string' ? item : (item.name || item.id || 'unknown item');
          message += `  ${slot}: ${itemName}\r\n`;
        }
      }
    } else {
      message += 'You are wearing nothing.\r\n';
    }
    
    message += '\r\n';
    
    // Show inventory
    if (player.inventory && player.inventory.length > 0) {
      message += 'You are carrying:\r\n';
      player.inventory.forEach(item => {
        const itemName = typeof item === 'string' ? item : (item.name || item.id || 'an item');
        message += `  ${itemName}\r\n`;
      });
    } else {
      message += 'You are carrying nothing.\r\n';
    }
    
    return { success: true, message: message };
  }
};

