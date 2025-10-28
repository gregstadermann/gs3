'use strict';

const dbm = require('../core/DatabaseManager');

async function addBedroomChest(){
  const db = await dbm.initialize();
  try{
    const room = await db.collection('rooms').findOne({ id: 'zoso-tower:bedroom' });
    if(!room){ console.log('Bedroom not found'); return; }

    const id = `zoso-bedroom-chest-${Date.now()}`;
    const item = {
      id,
      type: 'CONTAINER',
      name: 'a glowing wooden chest',
      roomDesc: 'a glowing wooden chest',
      keywords: ['chest','wooden','glowing'],
      description: 'A sturdy wooden chest etched with faint runes. A soft glow seeps from its seams.',
      longDescription: 'You see a sturdy wooden chest etched with flowing runes. The wood is warm to the touch and a gentle radiance spills from within, hinting at the space inside.',
      location: String(room._id),
      metadata: {
        weight: 0,
        unpickupable: true,
        container: true,
        // Unique capacity for this chest
        maxItems: 1000,
        minWeight: 0,
        maxWeight: 1000000,
        noWeightLimit: true,
        material: 'wood'
      },
      createdAt: new Date()
    };
    await db.collection('items').insertOne(item);

    const items = Array.isArray(room.items)? room.items.slice() : [];
    items.push(id);
    await db.collection('rooms').updateOne({ _id: room._id }, { $set: { items } });
    console.log('Added bedroom chest:', id);
  }catch(e){ console.error(e); }
  finally{ await dbm.client.close(); }
}

if(require.main===module) addBedroomChest();

module.exports = addBedroomChest;


