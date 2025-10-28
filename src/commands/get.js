'use strict';

const { checkRoundtime } = require('../utils/roundtimeChecker');

/**
 * Get Command
 * Pick up items from the ground and hold them
 */
module.exports = {
  name: 'get',
  aliases: ['take', 'grab'],
  description: 'Pick up an item from the ground',
  usage: 'get <item>',
  
  async execute(player, args) {
    if (args.length === 0) {
      return { 
        success: false, 
        message: 'Get what?\r\n' 
      };
    }

    // Check roundtime/lag
    const roundtimeCheck = checkRoundtime(player);
    if (roundtimeCheck) {
      return roundtimeCheck;
    }

    const room = player.gameEngine.roomSystem.getRoom(player.room);
    if (!room || !room.items || room.items.length === 0) {
      return { 
        success: false, 
        message: 'There is nothing here to get.\r\n' 
      };
    }

    const searchTerm = args.join(' ').toLowerCase();
    
    // Try to find item by name/keywords
    let foundItem = null;
    for (const itemRef of room.items) {
      const itemId = typeof itemRef === 'string' ? itemRef : (itemRef.id || itemRef.name);
      
      // Try to fetch item from database
      let item = null;
      if (player.gameEngine.roomSystem.db) {
        try {
          item = await player.gameEngine.roomSystem.db.collection('items')
            .findOne({ id: itemId });
        } catch (error) {
          console.error('Error fetching item:', error);
        }
      }

      if (!item) {
        continue;
      }

      const name = item.name || '';
      const keywords = item.keywords || [];
      
      if (name.toLowerCase().includes(searchTerm) || 
          keywords.some(kw => kw.toLowerCase().includes(searchTerm))) {
        foundItem = item;
        break;
      }
    }

    if (!foundItem) {
      return { 
        success: false, 
        message: `You don't see that here.\r\n` 
      };
    }

    // Check if player has a free hand
    if (!player.equipment) {
      player.equipment = {};
    }

    let hand = null;
    let handName = null;
    
    // Prefer right hand, but can use left if right is full
    if (!player.equipment.rightHand) {
      hand = 'rightHand';
      handName = 'right';
    } else if (!player.equipment.leftHand) {
      hand = 'leftHand';
      handName = 'left';
    } else {
      return { 
        success: false, 
        message: 'Your hands are full.\r\n' 
      };
    }

    // Add item to player's hand
    player.equipment[hand] = foundItem;

    // Remove from room
    const itemIndex = room.items.findIndex(itemRef => {
      const itemId = typeof itemRef === 'string' ? itemRef : (itemRef.id || itemRef.name);
      return itemId === foundItem.id;
    });
    
    if (itemIndex > -1) {
      room.items.splice(itemIndex, 1);
    }

    const itemName = foundItem.name || 'an item';
    
    // Recalculate encumbrance
    try { const Enc = require('../utils/encumbrance'); Enc.recalcEncumbrance(player); } catch(_) {}

    // Always show which hand picked up the item
    return { 
      success: true, 
      message: `You pick up ${itemName} with your ${handName} hand.\r\n` 
    };
  }
};

