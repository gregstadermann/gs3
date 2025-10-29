'use strict';

const { MongoClient } = require('mongodb');
const GEMS = require('../data/gems');

async function seedGems() {
  const client = await MongoClient.connect('mongodb://localhost:27017');
  const db = client.db('gs3');

  const coll = db.collection('gems');

  let upserted = 0;
  for (const gem of GEMS) {
    await coll.updateOne(
      { key: gem.key },
      { $set: { name: gem.name, varieties: gem.varieties } },
      { upsert: true }
    );
    upserted++;
  }

  console.log(`Upserted ${upserted} gem families.`);
  await client.close();
}

seedGems().catch(err => { console.error(err); process.exit(1); });


