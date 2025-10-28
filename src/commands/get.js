'use strict';

const { checkRoundtime } = require('../utils/roundtimeChecker');

/**
 * Get Command
 * Pick up items from the ground and hold them
 */
module.exports = {
  name: 'get',
  aliases: ['take', 'grab'],
  description: 'Pick up an item from the ground',
  usage: 'get <item>',
  
  async execute(player, args) {
    if (args.length === 0) {
      return { 
        success: false, 
        message: 'Get what?\r\n' 
      };
    }

    // Check roundtime/lag
    const roundtimeCheck = checkRoundtime(player);
    if (roundtimeCheck) {
      return roundtimeCheck;
    }

    const room = player.gameEngine.roomSystem.getRoom(player.room);
    if (!room || !room.items || room.items.length === 0) {
      return { 
        success: false, 
        message: 'There is nothing here to get.\r\n' 
      };
    }

    const raw = args.join(' ').toLowerCase();
    // Support: GET <item> FROM <container>
    let searchTerm = raw;
    let fromIdx = args.findIndex(a => a.toLowerCase() === 'from');
    let containerTerm = null;
    if (fromIdx !== -1) {
      searchTerm = args.slice(0, fromIdx).join(' ').toLowerCase();
      containerTerm = args.slice(fromIdx + 1).join(' ').toLowerCase();
    }
    
    // If getting FROM container, locate container first (room first, then belongings)
    let container = null;
    if (containerTerm) {
      // Search room first
      const itemIds = Array.isArray(room.items)? room.items.map(x=> typeof x==='string'? x : (x.id||x)) : [];
      if (itemIds.length) {
        const candidates = await player.gameEngine.roomSystem.db.collection('items').find({ id: { $in: itemIds } }).toArray();
        container = candidates.find(it => ((it.name||'').toLowerCase().includes(containerTerm)) || (it.keywords||[]).some(k=>k.toLowerCase().includes(containerTerm)));
      }
      // Fallback to belongings
      if (!container) {
        const belongings = [];
        if (player.equipment?.rightHand) belongings.push(player.equipment.rightHand);
        if (player.equipment?.leftHand) belongings.push(player.equipment.leftHand);
        if (player.equipment) {
          for (const [slot, it] of Object.entries(player.equipment)) {
            if (slot !== 'rightHand' && slot !== 'leftHand' && it) belongings.push(it);
          }
        }
        if (Array.isArray(player.inventory)) belongings.push(...player.inventory);
        container = belongings.find(it => ((it.name||'').toLowerCase().includes(containerTerm)) || (it.keywords||[]).some(k=>k.toLowerCase().includes(containerTerm)));
      }

      if (!container || !container.metadata?.container) {
        return { success:false, message: "You don't see that here.\r\n" };
      }
    }

    // Try to find item by name/keywords
    let foundItem = null;
    const searchSources = container && Array.isArray(container.metadata?.items)
      ? container.metadata.items
      : room.items;

    for (const itemRef of searchSources) {
      const itemId = typeof itemRef === 'string' ? itemRef : (itemRef.id || itemRef.name);
      
      // Try to fetch item from database
      let item = null;
      if (player.gameEngine.roomSystem.db) {
        try {
          item = await player.gameEngine.roomSystem.db.collection('items')
            .findOne({ id: itemId });
        } catch (error) {
          console.error('Error fetching item:', error);
        }
      }

      if (!item) {
        continue;
      }

      const name = item.name || '';
      const keywords = item.keywords || [];
      
      if (name.toLowerCase().includes(searchTerm) || 
          keywords.some(kw => kw.toLowerCase().includes(searchTerm))) {
        foundItem = item;
        break;
      }
    }

    if (!foundItem) {
      return { 
        success: false, 
        message: `You don't see that here.\r\n` 
      };
    }

    // Prevent picking up unpickupable/DECOR items
    if ((foundItem.type === 'DECOR') || (foundItem.metadata && foundItem.metadata.unpickupable)) {
      return {
        success: false,
        message: 'You cannot pick that up.\r\n'
      };
    }

    // Check if player has a free hand
    if (!player.equipment) {
      player.equipment = {};
    }

    let hand = null;
    let handName = null;
    
    // Prefer right hand, but can use left if right is full
    if (!player.equipment.rightHand) {
      hand = 'rightHand';
      handName = 'right';
    } else if (!player.equipment.leftHand) {
      hand = 'leftHand';
      handName = 'left';
    } else {
      return { 
        success: false, 
        message: 'Your hands are full.\r\n' 
      };
    }

    // Add item to player's hand
    player.equipment[hand] = foundItem;

    // Remove from room or from container
    if (container) {
      // Update container metadata.items in DB
      const newList = (container.metadata.items || []).filter(id => id !== foundItem.id);
      container.metadata.items = newList;
      try { await player.gameEngine.roomSystem.db.collection('items').updateOne({ id: container.id }, { $set: { 'metadata.items': newList } }); } catch(_) {}
    } else {
      const itemIndex = room.items.findIndex(itemRef => {
        const itemId = typeof itemRef === 'string' ? itemRef : (itemRef.id || itemRef.name);
        return itemId === foundItem.id;
      });
      if (itemIndex > -1) {
        room.items.splice(itemIndex, 1);
      }
    }

    const itemName = foundItem.name || 'an item';
    
    // Recalculate encumbrance
    try { const Enc = require('../utils/encumbrance'); Enc.recalcEncumbrance(player); } catch(_) {}

    // Show appropriate message based on source
    if (container) {
      const contName = container.name || 'a container';
      return { 
        success: true, 
        message: `You remove ${itemName} from ${contName} with your ${handName} hand.\r\n` 
      };
    } else {
      // Always show which hand picked up the item
      return { 
        success: true, 
        message: `You pick up ${itemName} with your ${handName} hand.\r\n` 
      };
    }
  }
};

