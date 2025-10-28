'use strict';

const { checkRoundtime } = require('../utils/roundtimeChecker');

module.exports = {
  name: 'drop',
  aliases: [],
  description: 'Drop an item to the ground or into a container',
  usage: 'drop <item> [in <container>]',

  async execute(player, args) {
    if (!args || args.length === 0) {
      return { success:false, message: 'Drop what?\r\n' };
    }

    const rt = checkRoundtime(player);
    if (rt) return rt;

    const db = player.gameEngine.roomSystem.db;
    const room = player.gameEngine.roomSystem.getRoom(player.room);
    if (!room) return { success:false, message: 'There is nowhere to drop that.\r\n' };

    // If "in" or "into" present, delegate to PUT
    const lower = args.map(a=>a.toLowerCase());
    const inIdx = lower.findIndex(a => a === 'in' || a === 'into');
    if (inIdx !== -1) {
      try {
        const put = require('./put');
        return await put.execute(player, args);
      } catch (_) {
        return { success:false, message: 'You fumble with where to put that.\r\n' };
      }
    }

    // Drop to the ground
    const term = args.join(' ').toLowerCase();
    let item = null;
    let handSlot = null;
    if (player.equipment?.rightHand && ((player.equipment.rightHand.name||'').toLowerCase().includes(term) || (player.equipment.rightHand.keywords||[]).some(k=>k.toLowerCase().includes(term)))) {
      item = player.equipment.rightHand; handSlot='rightHand';
    } else if (player.equipment?.leftHand && ((player.equipment.leftHand.name||'').toLowerCase().includes(term) || (player.equipment.leftHand.keywords||[]).some(k=>k.toLowerCase().includes(term)))) {
      item = player.equipment.leftHand; handSlot='leftHand';
    } else if (Array.isArray(player.inventory)) {
      item = player.inventory.find(it => (it.name||'').toLowerCase().includes(term) || (it.keywords||[]).some(k=>k.toLowerCase().includes(term)));
    }

    if (!item) return { success:false, message: "You aren't holding that.\r\n" };

    // Ensure item has a persistent id in DB
    let itemId = item.id;
    if (!itemId) {
      itemId = `drop-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
      const doc = {
        id: itemId,
        type: item.type || 'ITEM',
        name: item.name || 'an item',
        roomDesc: item.roomDesc || item.name || 'an item',
        keywords: item.keywords || [],
        description: item.description || (item.name ? `You see ${item.name}.` : 'It looks ordinary.'),
        location: String(room._id),
        metadata: item.metadata || {},
        createdAt: new Date()
      };
      try { await db.collection('items').insertOne(doc); } catch(_) {}
    }

    // Place into room items
    const items = Array.isArray(room.items) ? room.items.slice() : [];
    items.push(itemId);
    await db.collection('rooms').updateOne({ _id: room._id }, { $set: { items } });

    // Remove from player
    if (handSlot) {
      player.equipment[handSlot] = null;
    } else {
      const idx = player.inventory.indexOf(item);
      if (idx >= 0) player.inventory.splice(idx, 1);
    }

    const itemName = item.name || 'an item';
    return { success:true, message: `You drop ${itemName}.\r\n` };
  }
};

'use strict';

/**
 * Drop Command
 * Drop items from your hands onto the ground
 */
module.exports = {
  name: 'drop',
  aliases: ['release', 'let'],
  description: 'Drop an item you are holding',
  usage: 'drop <item>',
  
  execute(player, args) {
    const room = player.gameEngine.roomSystem.getRoom(player.room);
    if (!room) {
      return { 
        success: false, 
        message: 'You are in a void.\r\n' 
      };
    }

    if (args.length === 0) {
      // Drop from right hand first
      if (player.equipment && player.equipment.rightHand) {
        const item = player.equipment.rightHand;
        player.equipment.rightHand = null;
        
        // Add to room
        if (!room.items) {
          room.items = [];
        }
        room.items.push(item);

        const itemName = typeof item === 'string' ? item : (item.name || 'an item');
        return { 
          success: true, 
          message: `You drop ${itemName}.\r\n` 
        };
      }
      
      // Try left hand
      if (player.equipment && player.equipment.leftHand) {
        const item = player.equipment.leftHand;
        player.equipment.leftHand = null;
        
        // Add to room
        if (!room.items) {
          room.items = [];
        }
        room.items.push(item);

        const itemName = typeof item === 'string' ? item : (item.name || 'an item');
        return { 
          success: true, 
          message: `You drop ${itemName}.\r\n` 
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
      const item = player.equipment.rightHand;
      const itemName = typeof item === 'string' ? item : (item.name || '');
      
      if (itemName.toLowerCase().includes(searchTerm)) {
        player.equipment.rightHand = null;
        
        // Add to room
        if (!room.items) {
          room.items = [];
        }
        room.items.push(item);

        return { 
          success: true, 
          message: `You drop ${itemName}.\r\n` 
        };
      }
    }

    // Check left hand
    if (player.equipment && player.equipment.leftHand) {
      const item = player.equipment.leftHand;
      const itemName = typeof item === 'string' ? item : (item.name || '');
      
      if (itemName.toLowerCase().includes(searchTerm)) {
        player.equipment.leftHand = null;
        
        // Add to room
        if (!room.items) {
          room.items = [];
        }
        room.items.push(item);

        return { 
          success: true, 
          message: `You drop ${itemName}.\r\n` 
        };
      }
    }

    return { 
      success: false, 
      message: `You don't have that in your hands.\r\n` 
    };
  }
};

