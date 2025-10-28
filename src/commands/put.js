'use strict';

const { checkRoundtime } = require('../utils/roundtimeChecker');

/**
 * Put Command
 * Usage: PUT <item> IN <container>
 */
module.exports = {
  name: 'put',
  aliases: [],
  description: 'Put an item into a container',
  usage: 'put <item> in <container>',

  async execute(player, args) {
    if (!args || args.length < 1) {
      return { success:false, message: 'Put what in what?\r\n' };
    }

    // Enforce roundtime
    const rt = checkRoundtime(player);
    if (rt) return rt;

    // Parse: find "in" splitter
    const inIdx = args.findIndex(a => a.toLowerCase() === 'in' || a.toLowerCase() === 'into');
    if (inIdx === -1) {
      // No container specified → act like DROP
      try { const drop = require('./drop'); return await drop.execute(player, args); } catch(_) {}
      return { success:false, message: 'Specify where to put it.\r\n' };
    }
    const itemTerm = args.slice(0, inIdx).join(' ').toLowerCase();
    const targetTerm = args.slice(inIdx + 1).join(' ').toLowerCase();

    // Determine item from hands or inventory
    let item = null;
    let handSlot = null;
    if (player.equipment?.rightHand && ((player.equipment.rightHand.name||'').toLowerCase().includes(itemTerm) || (player.equipment.rightHand.keywords||[]).some(k=>k.toLowerCase().includes(itemTerm)))) {
      item = player.equipment.rightHand;
      handSlot = 'rightHand';
    } else if (player.equipment?.leftHand && ((player.equipment.leftHand.name||'').toLowerCase().includes(itemTerm) || (player.equipment.leftHand.keywords||[]).some(k=>k.toLowerCase().includes(itemTerm)))) {
      item = player.equipment.leftHand;
      handSlot = 'leftHand';
    } else if (Array.isArray(player.inventory)) {
      item = player.inventory.find(it => (it.name||'').toLowerCase().includes(itemTerm) || (it.keywords||[]).some(k=>k.toLowerCase().includes(itemTerm)));
    }

    if (!item) {
      return { success:false, message: "You aren't holding that.\r\n" };
    }

    const db = player.gameEngine.roomSystem.db;
    const room = player.gameEngine.roomSystem.getRoom(player.room);
    if (!room) {
      return { success:false, message: 'There is nowhere to put that.\r\n' };
    }

    // Find target container in room
    let container = null;
    if (Array.isArray(room.items) && room.items.length) {
      const itemIds = room.items.map(r => typeof r === 'string' ? r : (r.id || r.name));
      const candidates = await db.collection('items').find({ id: { $in: itemIds } }).toArray();
      container = candidates.find(it => ((it.name||'').toLowerCase().includes(targetTerm)) || (it.keywords||[]).some(k=>k.toLowerCase().includes(targetTerm)));
    }

    if (!container) {
      return { success:false, message: "You don't see that here.\r\n" };
    }

    const meta = container.metadata || {};
    const isContainer = container.type === 'CONTAINER' || meta.container === true;
    if (!isContainer) {
      return { success:false, message: `You can't put anything in ${container.name}.\r\n` };
    }

    // Disposal container behavior
    const isDisposal = meta.disposal === true;
    const itemName = item.name || 'an item';
    const contName = container.name || 'a container';

    if (isDisposal) {
      // Remove item from player hands/inventory and delete from DB
      if (handSlot) {
        player.equipment[handSlot] = null;
      } else if (Array.isArray(player.inventory)) {
        const idx = player.inventory.indexOf(item);
        if (idx >= 0) player.inventory.splice(idx, 1);
      }
      // Items created from DB have id; remove if present
      if (item.id) {
        try { await db.collection('items').deleteOne({ id: item.id }); } catch(_) {}
      }

      return { success:true, message: `You place ${itemName} into ${contName}. It vanishes without a trace.\r\n` };
    }

    // Regular container: store item inside (for now, mark as contained)
    // TODO: Update container's items array in DB
    if (handSlot) {
      player.equipment[handSlot] = null;
    } else if (Array.isArray(player.inventory)) {
      const idx = player.inventory.indexOf(item);
      if (idx >= 0) player.inventory.splice(idx, 1);
    }

    return { success:true, message: `You put ${itemName} in ${contName}.\r\n` };
  }
};


