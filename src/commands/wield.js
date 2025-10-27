'use strict';

/**
 * Hold Command
 * Allows players to hold items in their hands
 */
module.exports = {
  name: 'hold',
  aliases: ['wield'],
  description: 'Hold an item in your hand',
  usage: 'hold <item>',
  
  execute(player, args) {
    if (args.length === 0) {
      return { 
        success: false, 
        message: 'Wield what?\r\n' 
      };
    }

    const searchTerm = args.join(' ').toLowerCase();

    // Search inventory for weapon
    let weapon = null;
    if (player.inventory && Array.isArray(player.inventory)) {
      weapon = player.inventory.find(item => {
        if (!item || typeof item === 'string') return false;
        
        const name = item.name || item.id || '';
        const keywords = item.keywords || [];
        
        return name.toLowerCase().includes(searchTerm) || 
               keywords.some(kw => kw.toLowerCase().includes(searchTerm));
      });
    }

    if (!weapon) {
      return { 
        success: false, 
        message: `You don't have a '${args.join(' ')}' to hold.\r\n` 
      };
    }

    // Initialize equipment if needed
    if (!player.equipment) {
      player.equipment = {};
    }

    // Determine which hand to use (default right, but let player specify)
    const handPreference = args.find(arg => arg.toLowerCase() === 'right' || arg.toLowerCase() === 'left');
    const useRight = !handPreference || handPreference.toLowerCase() === 'right';
    const hand = useRight ? 'rightHand' : 'leftHand';
    const handName = useRight ? 'right' : 'left';

    // Check if hand is already occupied
    if (player.equipment[hand]) {
      const currentItem = player.equipment[hand];
      return { 
        success: false, 
        message: `Your ${handName} hand is already holding ${typeof currentItem === 'string' ? currentItem : currentItem.name}. You must remove it first.\r\n` 
      };
    }

    // Put item in hand
    player.equipment[hand] = weapon;

    // Remove from inventory
    if (player.inventory && Array.isArray(player.inventory)) {
      const index = player.inventory.indexOf(weapon);
      if (index > -1) {
        player.inventory.splice(index, 1);
      }
    }

    const itemName = weapon.name || 'an item';
    return { 
      success: true, 
      message: `You hold ${itemName} in your ${handName} hand.\r\n` 
    };
  }
};

