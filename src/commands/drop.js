'use strict';

/**
 * Drop Command
 * Drop items from your hands onto the ground
 */
module.exports = {
  name: 'drop',
  aliases: ['release', 'let'],
  description: 'Drop an item you are holding',
  usage: 'drop <item>',
  
  execute(player, args) {
    const room = player.gameEngine.roomSystem.getRoom(player.room);
    if (!room) {
      return { 
        success: false, 
        message: 'You are in a void.\r\n' 
      };
    }

    if (args.length === 0) {
      // Drop from right hand first
      if (player.equipment && player.equipment.rightHand) {
        const item = player.equipment.rightHand;
        player.equipment.rightHand = null;
        
        // Add to room
        if (!room.items) {
          room.items = [];
        }
        room.items.push(item);

        const itemName = typeof item === 'string' ? item : (item.name || 'an item');
        return { 
          success: true, 
          message: `You drop ${itemName}.\r\n` 
        };
      }
      
      // Try left hand
      if (player.equipment && player.equipment.leftHand) {
        const item = player.equipment.leftHand;
        player.equipment.leftHand = null;
        
        // Add to room
        if (!room.items) {
          room.items = [];
        }
        room.items.push(item);

        const itemName = typeof item === 'string' ? item : (item.name || 'an item');
        return { 
          success: true, 
          message: `You drop ${itemName}.\r\n` 
        };
      }
      
      return { 
        success: false, 
        message: 'Your hands are empty.\r\n' 
      };
    }

    const searchTerm = args.join(' ').toLowerCase();

    // Check right hand first
    if (player.equipment && player.equipment.rightHand) {
      const item = player.equipment.rightHand;
      const itemName = typeof item === 'string' ? item : (item.name || '');
      
      if (itemName.toLowerCase().includes(searchTerm)) {
        player.equipment.rightHand = null;
        
        // Add to room
        if (!room.items) {
          room.items = [];
        }
        room.items.push(item);

        return { 
          success: true, 
          message: `You drop ${itemName}.\r\n` 
        };
      }
    }

    // Check left hand
    if (player.equipment && player.equipment.leftHand) {
      const item = player.equipment.leftHand;
      const itemName = typeof item === 'string' ? item : (item.name || '');
      
      if (itemName.toLowerCase().includes(searchTerm)) {
        player.equipment.leftHand = null;
        
        // Add to room
        if (!room.items) {
          room.items = [];
        }
        room.items.push(item);

        return { 
          success: true, 
          message: `You drop ${itemName}.\r\n` 
        };
      }
    }

    return { 
      success: false, 
      message: `You don't have that in your hands.\r\n` 
    };
  }
};

