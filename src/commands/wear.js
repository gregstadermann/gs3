'use strict';

const { checkRoundtime } = require('../utils/roundtimeChecker');
const { findItemWithOther } = require('../utils/keywordMatcher');

/**
 * Wear Command
 * Move items from hands to appropriate equipment slots
 */
module.exports = {
  name: 'wear',
  aliases: ['don'],
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

    const db = player.gameEngine.roomSystem.db;

    // Special handling for "WEAR SHIELD" command
    if (searchTerm === 'shield' || searchTerm === 'shields') {
      // Find shield in hands
      let foundShield = null;
      let hand = null;
      
      // Check right hand
      const rightHandId = player.equipment.rightHand;
      if (rightHandId && typeof rightHandId === 'string') {
        const item = await db.collection('items').findOne({ id: rightHandId });
        if (item && item.type === 'SHIELD') {
          foundShield = item;
          hand = 'rightHand';
        }
      }
      
      // Check left hand if not found in right
      if (!foundShield) {
        const leftHandId = player.equipment.leftHand;
        if (leftHandId && typeof leftHandId === 'string') {
          const item = await db.collection('items').findOne({ id: leftHandId });
          if (item && item.type === 'SHIELD') {
            foundShield = item;
            hand = 'leftHand';
          }
        }
      }
      
      if (!foundShield) {
        return { 
          success: false, 
          message: "You're not holding a shield.\r\n" 
        };
      }
      
      // Check if shoulder slot is available (shoulder can hold 2 items, but check if full)
      // For simplicity, we'll just check if shoulder exists and has space
      // If shoulder slot doesn't exist in equipment, create it as an array
      if (!player.equipment.shoulder) {
        player.equipment.shoulder = [];
      }
      
      // If it's a string, convert to array (backwards compatibility)
      if (typeof player.equipment.shoulder === 'string') {
        player.equipment.shoulder = [player.equipment.shoulder];
      }
      
      // Check if shoulder is full (max 2 items)
      if (player.equipment.shoulder.length >= 2) {
        return { 
          success: false, 
          message: "Your shoulder is already full.\r\n" 
        };
      }
      
      // Move shield from hand to shoulder
      delete player.equipment[hand];
      player.equipment.shoulder.push(foundShield.id);
      
      try { const Enc = require('../utils/encumbrance'); await Enc.recalcEncumbrance(player); } catch(_) {}
      return { 
        success: true, 
        message: `You sling ${foundShield.name || 'your shield'} over your shoulder.\r\n` 
      };
    }

    // Find the item in player's hands (now stored as IDs)
    let foundItem = null;
    let hand = null;
    let handName = null;

    // Collect all items in hands for keyword matching
    const hands = [];
    
    // Check right hand
    const rightHandId = player.equipment.rightHand;
    if (rightHandId && typeof rightHandId === 'string') {
      const item = await db.collection('items').findOne({ id: rightHandId });
      if (item) {
        hands.push({ item, hand: 'rightHand', handName: 'right' });
      }
    }

    // Check left hand
    const leftHandId = player.equipment.leftHand;
    if (leftHandId && typeof leftHandId === 'string') {
      const item = await db.collection('items').findOne({ id: leftHandId });
      if (item) {
        hands.push({ item, hand: 'leftHand', handName: 'left' });
      }
    }

    // Use keyword matcher to find item
    const match = findItemWithOther(searchTerm, hands.map(h => h.item));
    if (match) {
      const handInfo = hands.find(h => h.item.id === match.id);
      if (handInfo) {
        foundItem = match;
        hand = handInfo.hand;
        handName = handInfo.handName;
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
    // Shields go to shoulder slot (unless explicitly handled above)
    else if (itemType === 'SHIELD') {
      targetSlot = 'shoulder';
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

    // Handle shoulder slot specially (it's an array that can hold multiple items)
    if (targetSlot === 'shoulder') {
      // Initialize shoulder as array if it doesn't exist
      if (!player.equipment.shoulder) {
        player.equipment.shoulder = [];
      }
      // Convert string to array if needed (backwards compatibility)
      if (typeof player.equipment.shoulder === 'string') {
        player.equipment.shoulder = [player.equipment.shoulder];
      }
      
      // Check if shoulder is full (max 2 items)
      if (player.equipment.shoulder.length >= 2) {
        return { 
          success: false, 
          message: "Your shoulder is already full.\r\n" 
        };
      }
      
      // Move item from hand to shoulder
      delete player.equipment[hand];
      player.equipment.shoulder.push(foundItem.id);
      
      try { const Enc = require('../utils/encumbrance'); await Enc.recalcEncumbrance(player); } catch(_) {}
      return { 
        success: true, 
        message: `You sling ${itemName} over your shoulder.\r\n` 
      };
    }

    // Check if slot is already occupied
    const mappedSlot = targetSlot === 'torso' ? 'chest' : targetSlot === 'feetPutOn' ? 'feet' : targetSlot === 'hands' ? 'gloves' : targetSlot;
    if (player.equipment[mappedSlot]) {
      // Try to get name of existing item
      let existingItemName = 'something';
      try {
        const existingId = player.equipment[mappedSlot];
        if (typeof existingId === 'string') {
          const existingItem = await player.gameEngine.roomSystem.db.collection('items').findOne({ id: existingId });
          if (existingItem) existingItemName = existingItem.name || 'something';
        }
      } catch (_) {}
      
      return { 
        success: false, 
        message: `You already have ${existingItemName} there.\r\n` 
      };
    }

    // Move item from hand to equipment slot (store ID, not full object)
    delete player.equipment[hand];
    
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

    try { const Enc = require('../utils/encumbrance'); await Enc.recalcEncumbrance(player); } catch(_) {}
      return { 
        success: true, 
        message: `You wear ${itemName}.\r\n` 
      };
  }
};

