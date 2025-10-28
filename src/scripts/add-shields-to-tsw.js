'use strict';

const databaseManager = require('../core/DatabaseManager');
const BASE_SHIELDS = require('../data/base-shields');

async function addShieldsToTSW() {
  const db = await databaseManager.initialize();
  try {
    const room = await db.collection('rooms').findOne({ id: 'wehnimers-landing-town:tsw' });
    if (!room) {
      console.log('TSW room not found.');
      return;
    }
    const items = [];
    for (const key of Object.keys(BASE_SHIELDS)) {
      const base = BASE_SHIELDS[key];
      const id = `${key}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      items.push({
        id,
        type: 'SHIELD',
        name: `a ${base.name.toLowerCase()}`,
        keywords: [base.name.toLowerCase(), base.size, base.type],
        description: base.name,
        location: String(room._id),
        metadata: {
          size: base.size,
          baseType: base.type,
          weight: base.baseWeight,
          slot: 'shield'
        },
        createdAt: new Date()
      });
    }
    if (items.length) {
      await db.collection('items').insertMany(items);
      const newIds = items.map(i => i.id);
      const newRoomItems = Array.isArray(room.items) ? room.items.concat(newIds) : newIds;
      await db.collection('rooms').updateOne({ id: room.id }, { $set: { items: newRoomItems } });
      console.log(`Added ${items.length} shields to TSW.`);
    }
  } catch (e) {
    console.error('Error adding shields:', e);
  } finally {
    await databaseManager.client.close();
  }
}

if (require.main === module) addShieldsToTSW();

module.exports = addShieldsToTSW;


