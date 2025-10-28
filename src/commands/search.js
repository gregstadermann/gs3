'use strict';

const { checkRoundtime } = require('../utils/roundtimeChecker');

module.exports = {
  name: 'search',
  aliases: [],
  description: 'Search a dead creature/corpse for valuables',
  usage: 'search <target>',

  async execute(player, args) {
    const rt = checkRoundtime(player);
    if (rt) return rt;

    const term = (args && args.join(' ')) || 'target';
    const room = player.gameEngine.roomSystem.getRoom(player.room);
    if (!room) return { success: false, message: "You don't see that here.\r\n" };

    const db = player.gameEngine.roomSystem.db;
    if (!db) return { success: false, message: 'The world flickers strangely. Try again.\r\n' };

    try {
      const itemIds = Array.isArray(room.items) ? room.items.map(x => (typeof x === 'string' ? x : x.id)) : [];
      const items = await db.collection('items').find({ id: { $in: itemIds } }).toArray();
      const lower = term.toLowerCase();
      const corpse = items.find(it => it.type === 'CORPSE' && (it.name?.toLowerCase().includes(lower) || it.keywords?.some(k => lower.includes(k.toLowerCase()) || k.toLowerCase().includes(lower))));

      if (!corpse) return { success: false, message: "You don't see that here.\r\n" };

      let msg = `You search the ${corpse.metadata?.npcName || 'corpse'}.\r\n`;
      const loot = corpse.metadata?.loot || { silver: 0, items: [] };
      const already = corpse.metadata?.searched;

      if (already) {
        msg += 'You find nothing else of value.\r\n';
        return { success: true, message: msg };
      }

      let foundSomething = false;
      // Silver
      const silver = loot.silver || 0;
      if (silver > 0) {
        // Give to player
        if (!player.attributes) player.attributes = {};
        if (!player.attributes.currency) player.attributes.currency = { silver: 0 };
        player.attributes.currency.silver = (player.attributes.currency.silver || 0) + silver;
        msg += `You gather the remaining ${silver} coins.\r\n`;
        foundSomething = true;
      }

      // Items (future)
      if (Array.isArray(loot.items) && loot.items.length > 0) {
        for (const it of loot.items) {
          msg += `You find ${it.name || 'an item'}.\r\n`;
          // Optional: move to room or inventory
        }
        foundSomething = true;
      }

      if (!foundSomething) {
        msg += 'She had nothing else of value.\r\n';
      }

      // Mark searched
      await db.collection('items').updateOne({ id: corpse.id }, { $set: { 'metadata.searched': true, 'metadata.loot.silver': 0 } });

      // Optional decay message
      msg += `A ${corpse.metadata?.npcName || 'corpse'} decays away, leaving nothing behind.\r\n`;

      // Remove corpse from room
      await db.collection('items').deleteOne({ id: corpse.id });
      const newItems = (room.items || []).filter(x => (typeof x === 'string' ? x !== corpse.id : x.id !== corpse.id));
      await db.collection('rooms').updateOne({ id: player.room }, { $set: { items: newItems } });
      const cached = player.gameEngine.roomSystem.getRoom(player.room);
      if (cached) player.gameEngine.roomSystem.rooms.set(player.room, { ...cached, items: newItems });

      try { const Enc = require('../utils/encumbrance'); Enc.recalcEncumbrance(player); } catch(_) {}
      return { success: true, message: msg };
    } catch (e) {
      return { success: false, message: 'You find nothing.\r\n' };
    }
  }
};


