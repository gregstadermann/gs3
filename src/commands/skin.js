'use strict';

const { checkRoundtime } = require('../utils/roundtimeChecker');

module.exports = {
  name: 'skin',
  aliases: [],
  description: 'Skin a dead creature for valuable parts',
  usage: 'skin <creature> [with <weapon>] | skin <creature> left|right',

  async execute(player, args) {
    const rt = checkRoundtime(player);
    if (rt) return rt;

    if (!args || args.length === 0) {
      return { success: false, message: 'Usage: SKIN {CREATURE} [WITH {WEAPON}]\r\n' };
    }

    const room = player.gameEngine.roomSystem.getRoom(player.room);
    if (!room) return { success: false, message: "You don't see that here.\r\n" };
    const db = player.gameEngine.roomSystem.db;
    if (!db) return { success: false, message: 'The world flickers strangely. Try again.\r\n' };

    // Parse optional hand/with
    let hand = 'right';
    let withName = null;
    const lowerArgs = args.map(a => a.toLowerCase());
    const withIdx = lowerArgs.indexOf('with');
    if (withIdx !== -1 && args[withIdx + 1]) {
      withName = args.slice(withIdx + 1).join(' ');
      args = args.slice(0, withIdx);
    } else if (lowerArgs[args.length - 1] === 'left' || lowerArgs[args.length - 1] === 'right') {
      hand = lowerArgs.pop();
      args = args.slice(0, -1);
    }

    const targetName = args.join(' ');
    try {
      const itemIds = Array.isArray(room.items) ? room.items.map(x => (typeof x === 'string' ? x : x.id)) : [];
      const items = await db.collection('items').find({ id: { $in: itemIds } }).toArray();
      const lower = targetName.toLowerCase();
      const corpse = items.find(it => it.type === 'CORPSE' && (it.name?.toLowerCase().includes(lower) || it.keywords?.some(k => lower.includes(k.toLowerCase()) || k.toLowerCase().includes(lower))));
      if (!corpse) return { success: false, message: "You don't see that here.\r\n" };

      // Choose tool: by hand or named weapon
      let tool = null;
      if (withName) {
        // Look in hands for named tool
        const left = player.equipment?.leftHand;
        const right = player.equipment?.rightHand;
        const matches = [left, right].filter(it => it && ((it.name || '').toLowerCase().includes(withName.toLowerCase())));
        tool = matches[0] || null;
      } else {
        tool = hand === 'left' ? player.equipment?.leftHand : player.equipment?.rightHand;
      }

      // Skill modifiers (very simplified placeholder)
      const firstAid = player.skills?.first_aid?.ranks || 0;
      const survival = player.skills?.survival?.ranks || 0;
      const dex = (player.attributes?.dexterity?.base || 50);
      const kneelingBonus = 0; // TODO: implement posture system
      const weaponBonus = (() => {
        if (!tool) return -10; // worse with bare hands
        const wt = (tool.metadata?.weapon_type || '').toString();
        if (wt.includes('one_handed_edged') || /dagger|knife/i.test(tool.name || '')) return 15; // preferred
        if (wt.includes('one_handed_crush') || /mace|war hammer|pick|mattock/i.test((tool.name || ''))) return 8; // blunt acceptable for some
        return 5;
      })();

      const difficulty = 15; // placeholder for rat; would be per-creature
      const score = firstAid + Math.floor(survival / 2) + Math.floor((dex - 50) / 5) + kneelingBonus + weaponBonus + (Math.random() * 20 - 10);

      let quality = 'crude';
      if (score > difficulty + 40) quality = 'magnificent';
      else if (score > difficulty + 30) quality = 'superb';
      else if (score > difficulty + 24) quality = 'outstanding';
      else if (score > difficulty + 18) quality = 'exceptional';
      else if (score > difficulty + 12) quality = 'fine';
      else if (score > difficulty + 6) quality = 'fair';
      else if (score > difficulty) quality = 'poor';

      // Create a skin item (simple generic until per-creature definitions are added)
      const skinId = `skin-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const npcName = corpse.metadata?.npcName || 'creature';
      const skinItem = {
        id: skinId,
        type: 'SKIN',
        name: `a ${quality} ${npcName} skin`,
        keywords: ['skin', npcName.toLowerCase()],
        description: `This ${quality} skin was expertly taken from a ${npcName}.`,
        location: player.gameEngine.roomSystem.getRoom(player.room)?._id || player.room,
        metadata: { quality, from: npcName },
        createdAt: new Date()
      };
      await db.collection('items').insertOne(skinItem);

      // Add to room items
      const freshRoom = await db.collection('rooms').findOne({ id: player.room });
      const newItems = Array.isArray(freshRoom?.items) ? [...freshRoom.items, skinId] : [skinId];
      await db.collection('rooms').updateOne({ id: player.room }, { $set: { items: newItems } });
      const cached = player.gameEngine.roomSystem.getRoom(player.room);
      if (cached) player.gameEngine.roomSystem.rooms.set(player.room, { ...cached, items: newItems });

      // Apply short RT for skinning
      player.gameEngine.combatSystem.addLag(player, 2000);

      try { const Enc = require('../utils/encumbrance'); Enc.recalcEncumbrance(player); } catch(_) {}
      return { success: true, message: `You begin to skin the ${npcName}... You manage to extract ${skinItem.name}.\r\n` };
    } catch (e) {
      return { success: false, message: 'You fail to skin anything useful.\r\n' };
    }
  }
};


