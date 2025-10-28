'use strict';

const databaseManager = require('../core/DatabaseManager');
const { getAllHerbs } = require('../data/wehnimers-landing-herbs');

async function addHerbsToWehnimersLanding() {
  try {
    const db = await databaseManager.initialize();
    const herbs = getAllHerbs();
    
    console.log(`Adding herbs to Wehnimer's Landing area...`);
    
    // Get all rooms in Wehnimer's Landing Town
    const rooms = await db.collection('rooms').find({ 
      areaId: 'wehnimers-landing-town'
    }).toArray();
    
    console.log(`Found ${rooms.length} rooms in Wehnimer's Landing`);
    
    // Create herb items
    const herbItems = [];
    for (const [key, herb] of Object.entries(herbs)) {
      const randomRoom = rooms[Math.floor(Math.random() * rooms.length)];
      const herbId = `herb-${key.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}`;
      
      herbItems.push({
        id: herbId,
        name: herb.name,
        type: 'HERB',
        description: `A ${herb.name} that can be used for healing.`,
        baseItem: key,
        location: randomRoom._id.toString(),
        metadata: {
          baseItem: key,
          heals: herb.heals,
          amount: herb.amount || 0,
          woundRank: herb.woundRank || 0,
          scarRank: herb.scarRank || 0,
          herbType: herb.type,
          weight: herb.weight,
          quantity: herb.quantity
        },
        createdAt: new Date()
      });
    }
    
    // Insert herb items into items collection
    if (herbItems.length > 0) {
      const result = await db.collection('items').insertMany(herbItems);
      console.log(`Added ${result.insertedCount} herb items to Wehnimer's Landing`);
      
      for (const [key, herb] of Object.entries(herbs)) {
        console.log(`  - ${herb.name}`);
      }
    }
    
    await db.client.close();
    console.log('Done!');
    
  } catch (error) {
    console.error('Error adding herbs:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  addHerbsToWehnimersLanding();
}

module.exports = addHerbsToWehnimersLanding;

