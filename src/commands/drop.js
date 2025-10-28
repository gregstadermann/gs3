'use strict';

const { checkRoundtime } = require('../utils/roundtimeChecker');

/**
 * Drop Command
 * Drop items from your hands onto the ground
 */
module.exports = {
  name: 'drop',
  aliases: ['release', 'let'],
  description: 'Drop an item you are holding',
  usage: 'drop <item>',
  
  async execute(player, args) {
    const roundtimeCheck = checkRoundtime(player);
    if (roundtimeCheck) {
      return roundtimeCheck;
    }

    const room = player.gameEngine.roomSystem.getRoom(player.room);
    if (!room) {
      return { 
        success: false, 
        message: 'You are in a void.\r\n' 
      };
    }

    const db = player.gameEngine.roomSystem.db;

    if (args.length === 0) {
      // Drop from right hand first
      if (player.equipment && player.equipment.rightHand && typeof player.equipment.rightHand === 'string') {
        const itemId = player.equipment.rightHand;
        const item = await db.collection('items').findOne({ id: itemId });
        
        player.equipment.rightHand = null;
        
        // Add to room
        if (!room.items) {
          room.items = [];
        }
        room.items.push(itemId);

        const itemName = item?.name || itemId;
        return { 
          success: true, 
          message: `You drop ${itemName}.\r\n` 
        };
      }
      
      // Try left hand
      if (player.equipment && player.equipment.leftHand && typeof player.equipment.leftHand === 'string') {
        const itemId = player.equipment.leftHand;
        const item = await db.collection('items').findOne({ id: itemId });
        
        player.equipment.leftHand = null;
        
        // Add to room
        if (!room.items) {
          room.items = [];
        }
        room.items.push(itemId);

        const itemName = item?.name || itemId;
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
    if (player.equipment && player.equipment.rightHand && typeof player.equipment.rightHand === 'string') {
      const itemId = player.equipment.rightHand;
      const item = await db.collection('items').findOne({ id: itemId });
      
      if (item) {
        const name = item.name || '';
        const keywords = item.keywords || [];
        
        if (name.toLowerCase().includes(searchTerm) || keywords.some(k => k.toLowerCase().includes(searchTerm))) {
          player.equipment.rightHand = null;
          
          // Add to room
          if (!room.items) {
            room.items = [];
          }
          room.items.push(itemId);

          return { 
            success: true, 
            message: `You drop ${name}.\r\n` 
          };
        }
      }
    }

    // Check left hand
    if (player.equipment && player.equipment.leftHand && typeof player.equipment.leftHand === 'string') {
      const itemId = player.equipment.leftHand;
      const item = await db.collection('items').findOne({ id: itemId });
      
      if (item) {
        const name = item.name || '';
        const keywords = item.keywords || [];
        
        if (name.toLowerCase().includes(searchTerm) || keywords.some(k => k.toLowerCase().includes(searchTerm))) {
          player.equipment.leftHand = null;
          
          // Add to room
          if (!room.items) {
            room.items = [];
          }
          room.items.push(itemId);

          return { 
            success: true, 
            message: `You drop ${name}.\r\n` 
          };
        }
      }
    }

    return { 
      success: false, 
      message: `You don't have that in your hands.\r\n` 
    };
  }
};
