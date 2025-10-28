'use strict';

const { checkRoundtime } = require('../utils/roundtimeChecker');

/**
 * Remove Command
 * Allows players to remove held items from their hands
 */
module.exports = {
  name: 'remove',
  aliases: ['drop', 'unwield'],
  description: 'Remove an item from your hand',
  usage: 'remove <item>',
  
  execute(player, args) {
    // Check roundtime/lag
    const roundtimeCheck = checkRoundtime(player);
    if (roundtimeCheck) {
      return roundtimeCheck;
    }

    if (args.length === 0) {
      // Remove from right hand first (main weapon slot)
      if (player.equipment && player.equipment.rightHand) {
        const weapon = player.equipment.rightHand;
        delete player.equipment.rightHand;
        
        // Add back to inventory
        if (!player.inventory) {
          player.inventory = [];
        }
        player.inventory.push(weapon);

        const weaponName = typeof weapon === 'string' ? weapon : (weapon.name || 'a weapon');
        try { const Enc = require('../utils/encumbrance'); Enc.recalcEncumbrance(player); } catch(_) {}
        return { 
          success: true, 
          message: `You release ${weaponName} from your right hand.\r\n` 
        };
      }
      
      // Try left hand if right is empty
      if (player.equipment && player.equipment.leftHand) {
        const weapon = player.equipment.leftHand;
        delete player.equipment.leftHand;
        
        // Add back to inventory
        if (!player.inventory) {
          player.inventory = [];
        }
        player.inventory.push(weapon);

        const weaponName = typeof weapon === 'string' ? weapon : (weapon.name || 'a weapon');
        try { const Enc = require('../utils/encumbrance'); Enc.recalcEncumbrance(player); } catch(_) {}
        return { 
          success: true, 
          message: `You release ${weaponName} from your left hand.\r\n` 
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
      const weapon = player.equipment.rightHand;
      const weaponName = typeof weapon === 'string' ? weapon : (weapon.name || '');
      
      if (weaponName.toLowerCase().includes(searchTerm)) {
        delete player.equipment.rightHand;
        
        // Add back to inventory
        if (!player.inventory) {
          player.inventory = [];
        }
        player.inventory.push(weapon);

        try { const Enc = require('../utils/encumbrance'); Enc.recalcEncumbrance(player); } catch(_) {}
        return { 
          success: true, 
          message: `You release ${weaponName} from your right hand.\r\n` 
        };
      }
    }

    // Check left hand
    if (player.equipment && player.equipment.leftHand) {
      const weapon = player.equipment.leftHand;
      const weaponName = typeof weapon === 'string' ? weapon : (weapon.name || '');
      
      if (weaponName.toLowerCase().includes(searchTerm)) {
        delete player.equipment.leftHand;
        
        // Add back to inventory
        if (!player.inventory) {
          player.inventory = [];
        }
        player.inventory.push(weapon);

        try { const Enc = require('../utils/encumbrance'); Enc.recalcEncumbrance(player); } catch(_) {}
        return { 
          success: true, 
          message: `You release ${weaponName} from your left hand.\r\n` 
        };
      }
    }

    return { 
      success: false, 
      message: `You don't have that in your hands.\r\n` 
    };
  }
};

