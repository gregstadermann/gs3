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
      const itemName = args.slice(1).join(' ');
      if (!itemName) {
        return { 
          success: false, 
          message: 'Usage: inventory location <item>\r\n' 
        };
      }

    let message = '';
      const db = player.gameEngine.roomSystem.db;
      
      // Check held items
      const heldRightId = player.equipment?.rightHand;
      const heldLeftId = player.equipment?.leftHand;
      
      if (heldRightId) {
        try {
          const item = await db.collection('items').findOne({ id: heldRightId });
          if (item && (item.name.toLowerCase().includes(itemName.toLowerCase()) || 
              (item.keywords || []).some(k => k.toLowerCase().includes(itemName.toLowerCase())))) {
            return { 
              success: true, 
              message: `${item.name} is in your right hand.\r\n` 
            };
          }
        } catch (_) {}
      }
      
      if (heldLeftId) {
        try {
          const item = await db.collection('items').findOne({ id: heldLeftId });
          if (item && (item.name.toLowerCase().includes(itemName.toLowerCase()) || 
              (item.keywords || []).some(k => k.toLowerCase().includes(itemName.toLowerCase())))) {
            return { 
              success: true, 
              message: `${item.name} is in your left hand.\r\n` 
            };
          }
        } catch (_) {}
      }
      
      // Check worn items
      if (player.equipment) {
        for (const [slot, itemId] of Object.entries(player.equipment)) {
          if (slot !== 'rightHand' && slot !== 'leftHand' && itemId) {
            try {
              const item = await db.collection('items').findOne({ id: itemId });
              if (item && (item.name.toLowerCase().includes(itemName.toLowerCase()) || 
                  (item.keywords || []).some(k => k.toLowerCase().includes(itemName.toLowerCase())))) {
                return { 
                  success: true, 
                  message: `${item.name} is worn on your ${slot}.\r\n` 
                };
              }
            } catch (_) {}
          }
        }
      }
      
      // Search in containers
      if (player.equipment) {
        for (const [slot, itemId] of Object.entries(player.equipment)) {
          if (itemId) {
            try {
              const containerItem = await db.collection('items').findOne({ id: itemId });
              if (containerItem && containerItem.type === 'CONTAINER' && 
                  Array.isArray(containerItem.metadata?.items)) {
                for (const containedId of containerItem.metadata.items) {
                  const containedItem = await db.collection('items').findOne({ id: containedId });
                  if (containedItem && (containedItem.name.toLowerCase().includes(itemName.toLowerCase()) || 
                      (containedItem.keywords || []).some(k => k.toLowerCase().includes(itemName.toLowerCase())))) {
                    const containerName = containerItem.name || 'container';
                    return { 
                      success: true, 
                      message: `${containedItem.name} is inside ${containerName} (${slot}).\r\n` 
                    };
                  }
                }
              }
            } catch (_) {}
          }
        }
      }
      
      return { 
        success: false, 
        message: `You don't seem to have ${itemName}.\r\n` 
      };
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

