'use strict';

/**
 * Inspect Command
 * Shows container capacities and wear info
 */
module.exports = {
  name: 'inspect',
  aliases: ['insp'],
  description: 'Inspect an item to learn about its capacity and usage',
  usage: 'inspect <item>',

  async execute(player, args) {
    if (!args || args.length === 0) {
      return { success: false, message: 'Inspect what?\r\n' };
    }

    const searchTerm = args.join(' ').toLowerCase();
    const room = player.gameEngine.roomSystem.getRoom(player.room);
    const db = player.gameEngine.roomSystem.db;

    // Helper: find item by id in room items list
    async function fetchItemByRef(itemRef){
      const id = typeof itemRef === 'string' ? itemRef : (itemRef.id || itemRef.name);
      if(!id) return null;
      try{ return await db.collection('items').findOne({ id }); } catch { return null; }
    }

    // Search order: hands -> worn -> room
    const candidates = [];
    
    // Fetch hands items from DB
    if (player.equipment?.rightHand && typeof player.equipment.rightHand === 'string') {
      const item = await db.collection('items').findOne({ id: player.equipment.rightHand });
      if (item) candidates.push(item);
    }
    if (player.equipment?.leftHand && typeof player.equipment.leftHand === 'string') {
      const item = await db.collection('items').findOne({ id: player.equipment.leftHand });
      if (item) candidates.push(item);
    }
    
    // Search worn items
    if (player.equipment) {
      for (const [slot, itemId] of Object.entries(player.equipment)) {
        if (slot !== 'rightHand' && slot !== 'leftHand' && itemId && typeof itemId === 'string') {
          const item = await db.collection('items').findOne({ id: itemId });
          if (item) candidates.push(item);
        }
      }
    }
    
    // Search room items
    if (room?.items && Array.isArray(room.items)) {
      for (const ref of room.items) {
        const it = await fetchItemByRef(ref);
        if (it) candidates.push(it);
      }
    }

    // Find by name/keywords
    const item = candidates.find(it => {
      const name = (it.name||'').toLowerCase();
      const kws = (it.keywords||[]).map(k=>k.toLowerCase());
      return name.includes(searchTerm) || kws.some(k=> searchTerm.includes(k) || k.includes(searchTerm));
    });

    if (!item) {
      return { success:false, message: `You don't see that here.\r\n` };
    }

    // Messaging helpers
    function qtyDescriptor(q){
      if (q <= 0) return 'one item';
      if (q === 1) return 'one item';
      if (q === 2) return 'a couple of items';
      if (q === 3) return 'a few items';
      if (q <= 6) return 'several items';
      if (q <= 9) return 'a number of items';
      return 'any number of items';
    }
    function weightDescriptor(min,max){
      if (max < 4) return 'Very Small';
      if (max <= 7) return 'Small';
      if (max <= 11) return 'Fairly Small';
      if (max <= 15) return 'Somewhat Small';
      if (max <= 19) return 'Slightly Small';
      if (max <= 39) return 'Medium';
      if (max <= 49) return 'Slightly Large';
      if (max <= 59) return 'Fairly Large';
      if (max <= 69) return 'Large';
      if (max <= 79) return 'Particularly Large';
      if (max <= 99) return 'Very Large';
      if (max <= 119) return 'Significant';
      if (max <= 139) return 'Exceptional';
      if (max <= 159) return 'Huge';
      if (max <= 179) return 'Incredible';
      if (max <= 199) return 'Enormous';
      return 'Gigantic';
    }

    // Container metadata
    const meta = item.metadata || {};
    const isContainer = item.type === 'CONTAINER' || meta.container === true;

    let lines = [];
    lines.push(`You carefully inspect ${item.name || 'the item'}.`);
    lines.push('');

    if (isContainer) {
      const maxItems = Number(meta.maxItems ?? 10);
      const maxWeight = Number(meta.maxWeight ?? 100);
      const minWeight = Math.max(0, Number(meta.minWeight ?? Math.min(1, maxWeight-1)));
      const qtyDesc = qtyDescriptor(maxItems);
      const weightDesc = weightDescriptor(minWeight, maxWeight);
      lines.push(`You estimate that ${item.name} can store a ${qtyDesc} with enough space for ${maxItems >= 10 ? 'any' : 'a limited'} number of items.`);
      lines.push('');
      lines.push(`It appears to be a ${weightDesc.toLowerCase()} container (capacity ${minWeight}-${maxWeight} lbs).`);
    } else {
      lines.push(`You do not discover anything noteworthy about its capacity.`);
    }

    // Wear info
    if (item.slot || meta.slot) {
      const slot = item.slot || meta.slot;
      lines.push('');
      lines.push(`You determine that you could wear the ${item.keywords?.[0] || 'item'}, ${slot === 'back' ? 'slinging it across your shoulders and back' : `on your ${slot}`}.  The ${item.keywords?.[0] || 'item'} appears to serve some purpose.`);
    }

    // Material
    if (meta.material) {
      lines.push('');
      lines.push(`It looks like this item has been mainly crafted out of ${meta.material}.`);
    }

    // Skin/Pelt quality
    if (item.type === 'SKIN' && meta.quality) {
      lines.push('');
      const qualityName = meta.quality === 'magnificent' ? 'magnificent' :
                          meta.quality === 'superb' ? 'superb' :
                          meta.quality === 'outstanding' ? 'outstanding' :
                          meta.quality === 'exceptional' ? 'exceptional' :
                          meta.quality === 'fine' ? 'fine' :
                          meta.quality === 'fair' ? 'fair' :
                          meta.quality === 'poor' ? 'poor' : 'crude';
      lines.push(`The quality of this pelt is ${qualityName}.`);
    }

    return { success:true, message: lines.join('\r\n') + '\r\n' };
  }
};


