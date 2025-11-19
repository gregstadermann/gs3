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

    const db = player.gameEngine.roomSystem.db;

    // Special handling for "REMOVE SHIELD" command
    if (searchTerm === 'shield' || searchTerm === 'shields') {
      // Check shoulder slot for shield
      if (!player.equipment.shoulder) {
        return { 
          success: false, 
          message: "You don't have a shield slung over your shoulder.\r\n" 
        };
      }
      
      // Handle shoulder as array or string
      let shoulderItems = player.equipment.shoulder;
      if (typeof shoulderItems === 'string') {
        shoulderItems = [shoulderItems];
      }
      if (!Array.isArray(shoulderItems) || shoulderItems.length === 0) {
        return { 
          success: false, 
          message: "You don't have a shield slung over your shoulder.\r\n" 
        };
      }
      
      // Find shield in shoulder items
      let foundShield = null;
      let shieldIndex = -1;
      for (let i = 0; i < shoulderItems.length; i++) {
        const itemId = shoulderItems[i];
        if (typeof itemId === 'string') {
          const item = await db.collection('items').findOne({ id: itemId });
          if (item && item.type === 'SHIELD') {
            foundShield = item;
            shieldIndex = i;
            break;
          }
        }
      }
      
      if (!foundShield) {
        return { 
          success: false, 
          message: "You don't have a shield slung over your shoulder.\r\n" 
        };
      }
      
      // Check if player has a free hand (prefer left hand for shields)
      if (!player.equipment.leftHand) {
        // Remove shield from shoulder array
        shoulderItems.splice(shieldIndex, 1);
        // Update equipment (empty array becomes empty, single item becomes that item, multiple stays array)
        if (shoulderItems.length === 0) {
          delete player.equipment.shoulder;
        } else if (shoulderItems.length === 1) {
          player.equipment.shoulder = shoulderItems[0];
        } else {
          player.equipment.shoulder = shoulderItems;
        }
        
        // Put shield in left hand
        player.equipment.leftHand = foundShield.id;
        try { const Enc = require('../utils/encumbrance'); await Enc.recalcEncumbrance(player); } catch(_) {}
        return { 
          success: true, 
          message: `You remove ${foundShield.name || 'your shield'} from your shoulder and hold it in your left hand.\r\n` 
        };
      } else if (!player.equipment.rightHand) {
        // Remove shield from shoulder array
        shoulderItems.splice(shieldIndex, 1);
        // Update equipment
        if (shoulderItems.length === 0) {
          delete player.equipment.shoulder;
        } else if (shoulderItems.length === 1) {
          player.equipment.shoulder = shoulderItems[0];
        } else {
          player.equipment.shoulder = shoulderItems;
        }
        
        // Put shield in right hand (fallback)
        player.equipment.rightHand = foundShield.id;
        try { const Enc = require('../utils/encumbrance'); await Enc.recalcEncumbrance(player); } catch(_) {}
        return { 
          success: true, 
          message: `You remove ${foundShield.name || 'your shield'} from your shoulder and hold it in your right hand.\r\n` 
        };
      } else {
        return { 
          success: false, 
          message: 'Both your hands are full!\r\n' 
        };
      }
    }

    // Only check worn items (equipped on slots other than hands)
    if (player.equipment) {
      for (const [slot, itemId] of Object.entries(player.equipment)) {
        // Skip hands and shoulder (handled separately above)
        if (slot === 'rightHand' || slot === 'leftHand' || slot === 'shoulder') {
          continue;
        }
        
        if (itemId && typeof itemId === 'string') {
          // Fetch item from DB to get its name
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
      
      // Also check shoulder slot for non-shield items
      if (player.equipment.shoulder) {
        let shoulderItems = player.equipment.shoulder;
        if (typeof shoulderItems === 'string') {
          shoulderItems = [shoulderItems];
        }
        if (Array.isArray(shoulderItems)) {
          for (let i = 0; i < shoulderItems.length; i++) {
            const itemId = shoulderItems[i];
            if (typeof itemId === 'string') {
              const item = await db.collection('items').findOne({ id: itemId });
              if (item && item.type !== 'SHIELD') { // Only non-shields here (shields handled above)
                const itemName = item.name || itemId;
                if (itemName.toLowerCase().includes(searchTerm)) {
                  // Check if player has a free hand
                  if (!player.equipment.rightHand) {
                    // Remove from shoulder array
                    shoulderItems.splice(i, 1);
                    // Update equipment
                    if (shoulderItems.length === 0) {
                      delete player.equipment.shoulder;
                    } else if (shoulderItems.length === 1) {
                      player.equipment.shoulder = shoulderItems[0];
                    } else {
                      player.equipment.shoulder = shoulderItems;
                    }
                    
                    // Put in right hand
                    player.equipment.rightHand = itemId;
                    try { const Enc = require('../utils/encumbrance'); await Enc.recalcEncumbrance(player); } catch(_) {}
                    return { 
                      success: true, 
                      message: `You remove ${itemName} from your shoulder and hold it in your right hand.\r\n` 
                    };
                  } else if (!player.equipment.leftHand) {
                    // Remove from shoulder array
                    shoulderItems.splice(i, 1);
                    // Update equipment
                    if (shoulderItems.length === 0) {
                      delete player.equipment.shoulder;
                    } else if (shoulderItems.length === 1) {
                      player.equipment.shoulder = shoulderItems[0];
                    } else {
                      player.equipment.shoulder = shoulderItems;
                    }
                    
                    // Put in left hand
                    player.equipment.leftHand = itemId;
                    try { const Enc = require('../utils/encumbrance'); await Enc.recalcEncumbrance(player); } catch(_) {}
                    return { 
                      success: true, 
                      message: `You remove ${itemName} from your shoulder and hold it in your left hand.\r\n` 
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
        }
      }
    }

    return { 
      success: false, 
      message: `You don't have that equipped.\r\n` 
    };
  }
};
