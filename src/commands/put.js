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
    let itemTerm = args.slice(0, inIdx).join(' ').toLowerCase();
    let targetTerm = args.slice(inIdx + 1).join(' ').toLowerCase();
    const itemIsMine = itemTerm.startsWith('my ');
    const containerIsMine = targetTerm.startsWith('my ');
    if (itemIsMine) itemTerm = itemTerm.replace(/^my\s+/, '');
    if (containerIsMine) targetTerm = targetTerm.replace(/^my\s+/, '');

    // Determine item from hands or inventory ("my" implies only belongings, but we already scope to belongings for item)
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

    // Find target container
    let container = null;
    // If "my" for container, search belongings first (needs DB lookup)
    if (containerIsMine) {
      const belongings = [];
      if (player.equipment?.rightHand) belongings.push(player.equipment.rightHand);
      if (player.equipment?.leftHand) belongings.push(player.equipment.leftHand);
      if (player.equipment) {
        for (const [slot, it] of Object.entries(player.equipment)) {
          if (slot !== 'rightHand' && slot !== 'leftHand' && it) belongings.push(it);
        }
      }
      if (Array.isArray(player.inventory)) belongings.push(...player.inventory);
      // Check belongings using their IDs to fetch fresh item docs
      for (const it of belongings) {
        if (!it.id) continue;
        const fetched = await db.collection('items').findOne({ id: it.id });
        console.log('[PUT] Checked belonging:', fetched?.name, '_id:', fetched?._id, 'id:', fetched?.id);
        if (fetched && (((fetched.name||'').toLowerCase().includes(targetTerm)) || (fetched.keywords||[]).some(k=>k.toLowerCase().includes(targetTerm)))) {
          container = fetched;
          console.log('[PUT] Container found:', container.name, '_id:', container._id);
          break;
        }
      }
    } else {
      if (Array.isArray(room.items) && room.items.length) {
        const itemIds = room.items.map(r => typeof r === 'string' ? r : (r.id || r.name));
        const candidates = await db.collection('items').find({ id: { $in: itemIds } }).toArray();
        container = candidates.find(it => ((it.name||'').toLowerCase().includes(targetTerm)) || (it.keywords||[]).some(k=>k.toLowerCase().includes(targetTerm)));
      }
      // Fallback to belongings if not found in room
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
        container = belongings.find(it => ((it.name||'').toLowerCase().includes(targetTerm)) || (it.keywords||[]).some(k=>k.toLowerCase().includes(targetTerm)));
      }
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

    // Regular container: store item inside and persist to DB
    if (handSlot) {
      player.equipment[handSlot] = null;
    } else if (Array.isArray(player.inventory)) {
      const idx = player.inventory.indexOf(item);
      if (idx >= 0) player.inventory.splice(idx, 1);
    }

    // Ensure item has an ID and exists in DB
    let itemId = item.id;
    if (!itemId) {
      itemId = `item-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
      const doc = {
        id: itemId,
        type: item.type || 'ITEM',
        name: item.name || 'an item',
        roomDesc: item.roomDesc || item.name || 'an item',
        keywords: item.keywords || [],
        description: item.description || `${itemName} looks ordinary.`,
        metadata: item.metadata || {},
        createdAt: new Date()
      };
      try {
        await db.collection('items').insertOne(doc);
      } catch (error) {
        console.error('Error creating item in DB:', error);
      }
    } else {
      // Update existing item to mark it as inside a container
      try {
        await db.collection('items').updateOne({ id: itemId }, { $set: { containedIn: container.id } });
      } catch (error) {
        console.error('Error updating item container reference:', error);
      }
    }

    // Update container's stored items array in room
    let containerItems = (container.metadata?.items || []).slice();
    console.log('[PUT] Container items before:', containerItems);
    containerItems.push(itemId);
    console.log('[PUT] Container items after:', containerItems);
    console.log('[PUT] Updating container with id:', container.id, '_id:', container._id);
    
    try {
      const result = await db.collection('items').updateOne(
        { id: container.id },
        { $set: { 'metadata.items': containerItems } }
      );
      console.log('[PUT] Update result:', result.modifiedCount, 'docs modified');
    } catch (error) {
      console.error('Error storing item in container:', error);
    }

    return { success:true, message: `You put ${itemName} in ${contName}.\r\n` };
  }
};


