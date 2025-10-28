'use strict';

const dbm = require('../core/DatabaseManager');

async function addDisposalBarrels(){
  const db = await dbm.initialize();
  try{
    const tsc = await db.collection('rooms').findOne({ id: 'wehnimers-landing-town:tsc' })
             || await db.collection('rooms').findOne({ title: /Town Square.*Central/i });
    const forge = await db.collection('rooms').findOne({ id: 'zoso-tower:forge' });

    async function addBarrel(roomDoc){
      if(!roomDoc) return;
      const id = `${roomDoc.id.replace(/[:]/g,'-')}-disposal-barrel-${Date.now()}`;
      const item = {
        id,
        type: 'CONTAINER',
        name: 'a round silver-banded barrel',
        roomDesc: 'a round silver-banded barrel',
        keywords: ['barrel','round','silver-banded'],
        description: 'A stout barrel bound with gleaming silver bands. Anything placed inside is whisked away.',
        longDescription: 'You see a sturdy, round barrel reinforced with bright silver bands. A faint hum suggests anything placed within will be spirited out of existence.',
        location: String(roomDoc._id),
        metadata: { weight: 0, unpickupable: true, container: true, disposal: true, maxItems: 999, minWeight: 0, maxWeight: 1000 },
        createdAt: new Date()
      };
      await db.collection('items').insertOne(item);
      const items = Array.isArray(roomDoc.items)? roomDoc.items.slice() : [];
      items.push(id);
      await db.collection('rooms').updateOne({ _id: roomDoc._id }, { $set: { items } });
      console.log('Added disposal barrel to', roomDoc.id);
    }

    await addBarrel(tsc);
    await addBarrel(forge);
  }catch(e){ console.error(e); }
  finally{ await dbm.client.close(); }
}

if(require.main===module) addDisposalBarrels();

module.exports = addDisposalBarrels;


