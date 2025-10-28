'use strict';

const { checkRoundtime } = require('../utils/roundtimeChecker');

/**
 * Wear Command
 * Equip items from hands to appropriate equipment slots
 */
module.exports = {
  name: 'wear',
  aliases: ['equip', 'don'],
  description: 'Wear an item from your hands',
  usage: 'wear <item>',
  
  async execute(player, args) {
    if (args.length === 0) {
      return { 
        success: false, 
        message: 'Wear what?\r\n' 
      };
    }

    // Check roundtime/lag
    const roundtimeCheck = checkRoundtime(player);
    if (roundtimeCheck) {
      return roundtimeCheck;
    }

    if (!player.equipment) {
      player.equipment = {};
    }

    // Strip "my" keyword if present (hands-only, so redundant)
    let searchTerm = args.join(' ').toLowerCase();
    if (searchTerm.startsWith('my ')) {
      searchTerm = searchTerm.replace(/^my\s+/, '');
    }

    // Find the item in player's hands (now stored as IDs)
    let foundItem = null;
    let hand = null;
    let handName = null;

    // Check right hand
    const rightHandId = player.equipment.rightHand;
    if (rightHandId && typeof rightHandId === 'string') {
      const db = player.gameEngine.roomSystem.db;
      const item = await db.collection('items').findOne({ id: rightHandId });
      
      if (item) {
        const name = item.name || '';
        const keywords = item.keywords || [];
        
        if (name.toLowerCase().includes(searchTerm) || 
            keywords.some(kw => kw.toLowerCase().includes(searchTerm))) {
          foundItem = item;
          hand = 'rightHand';
          handName = 'right';
        }
      }
    }

    // Check left hand if not found in right
    if (!foundItem) {
      const leftHandId = player.equipment.leftHand;
      if (leftHandId && typeof leftHandId === 'string') {
        const db = player.gameEngine.roomSystem.db;
        const item = await db.collection('items').findOne({ id: leftHandId });
        
        if (item) {
          const name = item.name || '';
          const keywords = item.keywords || [];
          
          if (name.toLowerCase().includes(searchTerm) || 
              keywords.some(kw => kw.toLowerCase().includes(searchTerm))) {
            foundItem = item;
            hand = 'leftHand';
            handName = 'left';
          }
        }
      }
    }

    if (!foundItem) {
      return { 
        success: false, 
        message: "You're not holding that.\r\n" 
      };
    }

    // Determine what slot this item should go in
    // Based on item type, metadata, keywords, etc.
    let targetSlot = null;
    const itemName = foundItem.name || '';
    const itemType = foundItem.type || '';
    const metadata = foundItem.metadata || {};

    // Check if item has explicit slot metadata
    if (metadata.slot || metadata.wearLocation) {
      targetSlot = metadata.slot || metadata.wearLocation;
    }
    // Determine slot based on item type and name
    else if (itemType === 'ARMOR' || itemType === 'CLOTHING') {
      // Use metadata to determine slot
      if (metadata.location === 'back' || itemName.toLowerCase().includes('backpack') || 
          itemName.toLowerCase().includes('cloak') || itemName.toLowerCase().includes('cape')) {
        targetSlot = 'back';
      } else if (metadata.location === 'chest' || itemName.toLowerCase().includes('tunic') ||
                 itemName.toLowerCase().includes('shirt') || itemName.toLowerCase().includes('jerkin')) {
        targetSlot = 'torso';
      } else if (metadata.location === 'head' || itemName.toLowerCase().includes('helmet') ||
                 itemName.toLowerCase().includes('hood') || itemName.toLowerCase().includes('cap')) {
        targetSlot = 'head';
      } else if (metadata.location === 'legs' || itemName.toLowerCase().includes('pants') ||
                 itemName.toLowerCase().includes('leggings')) {
        targetSlot = 'leggings';
      } else if (metadata.location === 'feet' || itemName.toLowerCase().includes('boots') ||
                 itemName.toLowerCase().includes('shoes')) {
        targetSlot = 'feetPutOn';
      } else if (metadata.location === 'hands' || itemName.toLowerCase().includes('gloves') ||
                 itemName.toLowerCase().includes('gauntlets')) {
        targetSlot = 'hands';
      } else if (metadata.location === 'wrist') {
        targetSlot = 'wrist';
      } else if (metadata.location === 'neck') {
        targetSlot = 'neck';
      } else if (metadata.location === 'belt') {
        targetSlot = 'belt';
      } else if (metadata.location === 'finger') {
        targetSlot = 'finger';
      } else {
        // Default to general slot for clothing
        targetSlot = 'general';
      }
    } else if (itemType === 'CONTAINER' || itemName.toLowerCase().includes('backpack') ||
               itemName.toLowerCase().includes('sack') || itemName.toLowerCase().includes('bag')) {
      targetSlot = 'back';
    } else {
      // For misc items without specific types, try to determine from name
      if (itemName.toLowerCase().includes('backpack') || itemName.toLowerCase().includes('pack')) {
        targetSlot = 'back';
      } else if (itemName.toLowerCase().includes('robe') || itemName.toLowerCase().includes('cloak')) {
        targetSlot = 'torso';
      } else {
        targetSlot = 'general';
      }
    }

    // Initialize inventory slots if not present
    if (!player.inventorySlots) {
      const InventorySlotSystem = require('../systems/InventorySlotSystem');
      player.inventorySlots = new InventorySlotSystem();
    }

    // Check if we can wear the item in this slot
    const slot = player.inventorySlots.getSlot(targetSlot);
    if (!slot) {
      return { 
        success: false, 
        message: `You cannot wear ${itemName} there.\r\n` 
      };
    }

    // Check if slot is available
    if (!player.inventorySlots.canWear(targetSlot, foundItem, true)) {
      return { 
        success: false, 
        message: `You already have something there.\r\n` 
      };
    }

    // Move item from hand to equipment slot (store ID, not full object)
    delete player.equipment[hand];
    
    // Add to inventory slot system
    const result = player.inventorySlots.wear(targetSlot, foundItem, true);
    
    // Store reference in player.equipment for quick lookup (store ID only)
    // Map inventory slot names to equipment property names
    let equipmentSlot = targetSlot;
    if (targetSlot === 'torso') {
      equipmentSlot = 'chest';
    } else if (targetSlot === 'feetPutOn') {
      equipmentSlot = 'feet';
    } else if (targetSlot === 'hands') {
      equipmentSlot = 'gloves';
    }
    
    // Set the item ID in the equipment slot (not the full object)
    player.equipment[equipmentSlot] = foundItem.id;

    try { const Enc = require('../utils/encumbrance'); Enc.recalcEncumbrance(player); } catch(_) {}
    return { 
      success: true, 
      message: `You equip ${itemName}.\r\n` 
    };
  }
};

