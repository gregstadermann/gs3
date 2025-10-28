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
  
  async execute(player, args) {
    // Check roundtime/lag
    const roundtimeCheck = checkRoundtime(player);
    if (roundtimeCheck) {
      return roundtimeCheck;
    }

    let message = '';
    
    // Collect held items
    const heldRightId = player.equipment?.rightHand;
    const heldLeftId = player.equipment?.leftHand;
    
    // Fetch item data for held items
    const db = player.gameEngine.roomSystem.db;
    let heldRight = null;
    let heldLeft = null;
    
    if (heldRightId && db) {
      try {
        heldRight = await db.collection('items').findOne({ id: heldRightId });
      } catch (_) {}
    }
    if (heldLeftId && db) {
      try {
        heldLeft = await db.collection('items').findOne({ id: heldLeftId });
      } catch (_) {}
    }
    
    if (heldRight || heldLeft) {
      const parts = [];
      if (heldRight) {
        parts.push((heldRight.name || 'an item') + ' in your right hand');
      }
      if (heldLeft) {
        parts.push((heldLeft.name || 'an item') + ' in your left hand');
      }
      message += 'You are holding ' + parts.join(' and ') + '.\r\n';
    }
    
    // Show worn items
    const wornItems = [];
    if (player.equipment) {
      for (const [slot, itemId] of Object.entries(player.equipment)) {
        if (slot !== 'rightHand' && slot !== 'leftHand' && itemId) {
          // Try to fetch item name
          let itemName = itemId;
          if (typeof itemId === 'string' && db) {
            try {
              const item = await db.collection('items').findOne({ id: itemId });
              if (item) itemName = item.name || itemId;
            } catch (_) {}
          }
          wornItems.push(itemName);
        }
      }
    }
    
    if (wornItems.length > 0) {
      message += 'You are wearing ' + wornItems.join(', ') + '.\r\n';
    }
    
    if (!heldRight && !heldLeft && wornItems.length === 0) {
      message += 'You are empty-handed.\r\n';
    }
    
    return { success: true, message: message };
  }
};

