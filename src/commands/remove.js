'use strict';

const { checkRoundtime } = require('../utils/roundtimeChecker');

/**
 * Remove Command
 * Removes worn items and puts them in your hands
 */
module.exports = {
  name: 'remove',
  aliases: ['rem'],
  description: 'Remove a worn item and hold it',
  usage: 'remove <item>',
  
  async execute(player, args) {
    // Check roundtime/lag
    const roundtimeCheck = checkRoundtime(player);
    if (roundtimeCheck) {
      return roundtimeCheck;
    }

    if (args.length === 0) {
      return { 
        success: false, 
        message: 'Remove what?\r\n' 
      };
    }

    // Strip "my" keyword if present
    let searchTerm = args.join(' ').toLowerCase();
    if (searchTerm.startsWith('my ')) {
      searchTerm = searchTerm.replace(/^my\s+/, '');
    }

    // Only check worn items (equipped on slots other than hands)
    if (player.equipment) {
      for (const [slot, itemId] of Object.entries(player.equipment)) {
        if (slot !== 'rightHand' && slot !== 'leftHand' && itemId && typeof itemId === 'string') {
          // Fetch item from DB to get its name
          const db = player.gameEngine.roomSystem.db;
          let itemName = itemId;
          try {
            const item = await db.collection('items').findOne({ id: itemId });
            if (item) itemName = item.name || itemId;
          } catch (_) {}
          
          if (itemName.toLowerCase().includes(searchTerm)) {
            // Check if player has a free hand
            if (!player.equipment.rightHand) {
              // Put in right hand (store the ID)
              delete player.equipment[slot];
              player.equipment.rightHand = itemId;
              try { const Enc = require('../utils/encumbrance'); await Enc.recalcEncumbrance(player); } catch(_) {}
              return { 
                success: true, 
                message: `You remove ${itemName} from ${slot} and hold it in your right hand.\r\n` 
              };
            } else if (!player.equipment.leftHand) {
              // Put in left hand (store the ID)
              delete player.equipment[slot];
              player.equipment.leftHand = itemId;
              try { const Enc = require('../utils/encumbrance'); await Enc.recalcEncumbrance(player); } catch(_) {}
              return { 
                success: true, 
                message: `You remove ${itemName} from ${slot} and hold it in your left hand.\r\n` 
              };
            } else {
              return { 
                success: false, 
                message: 'Both your hands are full!\r\n' 
              };
            }
          }
        }
      }
    }

    return { 
      success: false, 
      message: `You don't have that equipped.\r\n` 
    };
  }
};
