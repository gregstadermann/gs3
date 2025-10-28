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

    // Handle LOCATION subcommand
    if (args.length > 0 && args[0].toLowerCase() === 'location') {
      let message = 'You are currently wearing:\r\n';
      const db = player.gameEngine.roomSystem.db;
      
      // Track all items by slot
      const slotGroups = {};
      
      // Map slot names to display names
      const slotDisplayNames = {
        'rightHand': 'In your right hand:',
        'leftHand': 'In your left hand:',
        'back': 'On your back:',
        'chest': 'Worn over your chest:',
        'head': 'Worn on your head:',
        'feet': 'Worn on your feet:',
        'gloves': 'Slipped over your hands:',
        'neck': 'Hung around your neck:',
        'finger': 'Worn on your finger:',
        'general': 'Carried on your person:',
        'waist': 'Attached to your belt:',
        'wrist': 'Attached to your wrist:',
        'shoulder': 'Slung over your shoulder:',
        'torso': 'Worn over your torso:',
        'legs': 'Worn on your legs:',
        'hands': 'In your hands:'
      };
      
      // Collect all items from equipment
      if (player.equipment) {
        for (const [slot, itemId] of Object.entries(player.equipment)) {
          if (!itemId) continue;
          
          try {
            const item = await db.collection('items').findOne({ id: itemId });
            if (item) {
              const displaySlot = slotDisplayNames[slot] || `On your ${slot}:`;
              if (!slotGroups[displaySlot]) {
                slotGroups[displaySlot] = [];
              }
              slotGroups[displaySlot].push(item.name || itemId);
            }
          } catch (_) {}
        }
      }
      
      // Output grouped items
      let itemCount = 0;
      for (const [slot, items] of Object.entries(slotGroups)) {
        if (items.length > 0) {
          message += `  ${slot}\r\n`;
          for (const itemName of items) {
            message += `    ${itemName} (functional)\r\n`;
            itemCount++;
          }
        }
      }
      
      if (itemCount === 0) {
        message = 'You are currently wearing nothing.\r\n';
      } else {
        message += `\r\n(${itemCount} ${itemCount === 1 ? 'item' : 'items'} displayed.)\r\n`;
      }
      
      return { success: true, message };
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

