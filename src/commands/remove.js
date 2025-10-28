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
  
  async execute(player, args) {
    // Check roundtime/lag
    const roundtimeCheck = checkRoundtime(player);
    if (roundtimeCheck) {
      return roundtimeCheck;
    }

    if (args.length === 0) {
      // Remove from right hand first (main weapon slot)
      if (player.equipment && player.equipment.rightHand) {
        const weaponId = player.equipment.rightHand;
        delete player.equipment.rightHand;
        
        // Fetch weapon name from DB and drop in room
        let weaponName = typeof weaponId === 'string' ? weaponId : 'a weapon';
        const db = player.gameEngine.roomSystem.db;
        if (db && typeof weaponId === 'string') {
          try {
            const weapon = await db.collection('items').findOne({ id: weaponId });
            if (weapon) {
              weaponName = weapon.name || weaponId;
              // Update item location to current room
              await db.collection('items').updateOne(
                { id: weaponId },
                { $set: { location: player.gameEngine.roomSystem.getRoom(player.currentRoom)?._id || player.currentRoom } }
              );
              // Add to room's items array
              await db.collection('rooms').updateOne(
                { id: player.currentRoom },
                { $push: { items: weaponId } }
              );
            }
          } catch (_) {}
        }

        try { const Enc = require('../utils/encumbrance'); await Enc.recalcEncumbrance(player); } catch(_) {}
        return { 
          success: true, 
          message: `You release ${weaponName} from your right hand.\r\n` 
        };
      }
      
      // Try left hand if right is empty
      if (player.equipment && player.equipment.leftHand) {
        const weaponId = player.equipment.leftHand;
        delete player.equipment.leftHand;
        
        // Fetch weapon name from DB and drop in room
        let weaponName = typeof weaponId === 'string' ? weaponId : 'a weapon';
        const db = player.gameEngine.roomSystem.db;
        if (db && typeof weaponId === 'string') {
          try {
            const weapon = await db.collection('items').findOne({ id: weaponId });
            if (weapon) {
              weaponName = weapon.name || weaponId;
              // Update item location to current room
              await db.collection('items').updateOne(
                { id: weaponId },
                { $set: { location: player.gameEngine.roomSystem.getRoom(player.currentRoom)?._id || player.currentRoom } }
              );
              // Add to room's items array
              await db.collection('rooms').updateOne(
                { id: player.currentRoom },
                { $push: { items: weaponId } }
              );
            }
          } catch (_) {}
        }

        try { const Enc = require('../utils/encumbrance'); await Enc.recalcEncumbrance(player); } catch(_) {}
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
    if (player.equipment && player.equipment.rightHand && typeof player.equipment.rightHand === 'string') {
      const weaponId = player.equipment.rightHand;
      
      // Fetch weapon from DB to check name
      const db = player.gameEngine.roomSystem.db;
      let weaponName = weaponId;
      try {
        const weapon = await db.collection('items').findOne({ id: weaponId });
        if (weapon) weaponName = weapon.name || weaponId;
      } catch (_) {}
      
      if (weaponName.toLowerCase().includes(searchTerm)) {
        delete player.equipment.rightHand;
        
        // Drop item in room
        await db.collection('items').updateOne(
          { id: weaponId },
          { $set: { location: player.gameEngine.roomSystem.getRoom(player.currentRoom)?._id || player.currentRoom } }
        );
        await db.collection('rooms').updateOne(
          { id: player.currentRoom },
          { $push: { items: weaponId } }
        );

        try { const Enc = require('../utils/encumbrance'); await Enc.recalcEncumbrance(player); } catch(_) {}
        return { 
          success: true, 
          message: `You release ${weaponName} from your right hand.\r\n` 
        };
      }
    }

    // Check left hand
    if (player.equipment && player.equipment.leftHand && typeof player.equipment.leftHand === 'string') {
      const weaponId = player.equipment.leftHand;
      
      // Fetch weapon from DB to check name
      const db = player.gameEngine.roomSystem.db;
      let weaponName = weaponId;
      try {
        const weapon = await db.collection('items').findOne({ id: weaponId });
        if (weapon) weaponName = weapon.name || weaponId;
      } catch (_) {}
      
      if (weaponName.toLowerCase().includes(searchTerm)) {
        delete player.equipment.leftHand;
        
        // Drop item in room
        await db.collection('items').updateOne(
          { id: weaponId },
          { $set: { location: player.gameEngine.roomSystem.getRoom(player.currentRoom)?._id || player.currentRoom } }
        );
        await db.collection('rooms').updateOne(
          { id: player.currentRoom },
          { $push: { items: weaponId } }
        );

        try { const Enc = require('../utils/encumbrance'); await Enc.recalcEncumbrance(player); } catch(_) {}
        return { 
          success: true, 
          message: `You release ${weaponName} from your left hand.\r\n` 
        };
      }
    }

    // Check worn items (equipped on slots other than hands)
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
                message: `You remove ${itemName} from ${slot}.\r\n` 
              };
            } else if (!player.equipment.leftHand) {
              // Put in left hand (store the ID)
              delete player.equipment[slot];
              player.equipment.leftHand = itemId;
              try { const Enc = require('../utils/encumbrance'); await Enc.recalcEncumbrance(player); } catch(_) {}
              return { 
                success: true, 
                message: `You remove ${itemName} from ${slot}.\r\n` 
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
      message: `You don't have that in your hands.\r\n` 
    };
  }
};

