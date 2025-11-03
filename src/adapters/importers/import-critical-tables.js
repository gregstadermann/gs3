'use strict';

const databaseManager = require('../db/mongoClient');

/**
 * Import Critical Hit Tables into MongoDB
 * Creates the crits collection with all critical hit definitions
 */

async function importCriticalTables() {
  try {
    const db = await databaseManager.initialize();

    // Get or create crits collection
    const critsCollection = db.collection('crits');

    // Clear existing data (optional - comment out if you want to preserve)
    await critsCollection.deleteMany({});

    const slashCriticals = require('../../data/crit_tables/slash-criticals-json');
    const crushCriticals = require('../../data/crit_tables/crush-criticals-json');
    const punctureCriticals = require('../../data/crit_tables/puncture-criticals-json');
    const lightningCriticals = require('../../data/crit_tables/lightning-criticals-json');
    const impactCriticals = require('../../data/crit_tables/impact-criticals-json');
    const fireCriticals = require('../../data/crit_tables/fire-criticals-json');
    const noncorporealCriticals = require('../../data/crit_tables/noncorporeal-criticals-json');
    const coldCriticals = require('../../data/crit_tables/cold-criticals-json');
    const grappleCriticals = require('../../data/crit_tables/grapple-criticals-json');

    console.log('Importing slash criticals...');
    
    // Import all slash critical entries
    for (const bodyPart of Object.keys(slashCriticals)) {
      for (const entry of slashCriticals[bodyPart]) {
        await critsCollection.insertOne({
          damageType: 'slash',
          bodyPart: bodyPart,
          rank: entry.rank,
          damage: entry.damage,
          message: entry.message,
          effects: entry.effects,
          wounds: entry.wounds,
          // Create range for lookup (rank-based)
          RollRangeStart: entry.rank * 10,
          RollRangeEnd: (entry.rank * 10) + 9
        });
      }
    }

    console.log('Importing crush criticals...');
    
    // Import all crush critical entries
    for (const bodyPart of Object.keys(crushCriticals)) {
      for (const entry of crushCriticals[bodyPart]) {
        await critsCollection.insertOne({
          damageType: 'crush',
          bodyPart: bodyPart,
          rank: entry.rank,
          damage: entry.damage,
          message: entry.message,
          effects: entry.effects,
          wounds: entry.wounds,
          // Create range for lookup (rank-based)
          RollRangeStart: entry.rank * 10,
          RollRangeEnd: (entry.rank * 10) + 9
        });
      }
    }

    console.log('Importing puncture criticals...');
    
    // Import all puncture critical entries
    for (const bodyPart of Object.keys(punctureCriticals)) {
      for (const entry of punctureCriticals[bodyPart]) {
        await critsCollection.insertOne({
          damageType: 'puncture',
          bodyPart: bodyPart,
          rank: entry.rank,
          damage: entry.damage,
          message: entry.message,
          effects: entry.effects,
          wounds: entry.wounds,
          // Create range for lookup (rank-based)
          RollRangeStart: entry.rank * 10,
          RollRangeEnd: (entry.rank * 10) + 9
        });
      }
    }

    console.log('Importing lightning criticals...');
    
    // Import all lightning critical entries
    for (const bodyPart of Object.keys(lightningCriticals)) {
      for (const entry of lightningCriticals[bodyPart]) {
        await critsCollection.insertOne({
          damageType: 'lightning',
          bodyPart: bodyPart,
          rank: entry.rank,
          damage: entry.damage,
          message: entry.message,
          effects: entry.effects,
          wounds: entry.wounds,
          // Create range for lookup (rank-based)
          RollRangeStart: entry.rank * 10,
          RollRangeEnd: (entry.rank * 10) + 9
        });
      }
    }

    console.log('Importing impact criticals...');
    
    // Import all impact critical entries
    for (const bodyPart of Object.keys(impactCriticals)) {
      for (const entry of impactCriticals[bodyPart]) {
        await critsCollection.insertOne({
          damageType: 'impact',
          bodyPart: bodyPart,
          rank: entry.rank,
          damage: entry.damage,
          message: entry.message,
          effects: entry.effects,
          wounds: entry.wounds,
          // Create range for lookup (rank-based)
          RollRangeStart: entry.rank * 10,
          RollRangeEnd: (entry.rank * 10) + 9
        });
      }
    }

    console.log('Importing fire criticals...');
    
    // Import all fire critical entries
    for (const bodyPart of Object.keys(fireCriticals)) {
      for (const entry of fireCriticals[bodyPart]) {
        await critsCollection.insertOne({
          damageType: 'fire',
          bodyPart: bodyPart,
          rank: entry.rank,
          damage: entry.damage,
          message: entry.message,
          effects: entry.effects,
          wounds: entry.wounds,
          // Create range for lookup (rank-based)
          RollRangeStart: entry.rank * 10,
          RollRangeEnd: (entry.rank * 10) + 9
        });
      }
    }

    console.log('Importing non-corporeal criticals...');
    
    // Import all non-corporeal critical entries (damage is variable)
    for (const bodyPart of Object.keys(noncorporealCriticals)) {
      for (const entry of noncorporealCriticals[bodyPart]) {
        await critsCollection.insertOne({
          damageType: 'non-corporeal',
          bodyPart: bodyPart,
          rank: entry.rank,
          damage: 0, // Variable - depends on attack type
          message: entry.message,
          effects: entry.effects,
          wounds: entry.wounds,
          // Create range for lookup (rank-based)
          RollRangeStart: entry.rank * 10,
          RollRangeEnd: (entry.rank * 10) + 9
        });
      }
    }

    console.log('Importing cold criticals...');
    for (const bodyPart of Object.keys(coldCriticals)) {
      for (const entry of coldCriticals[bodyPart]) {
        await critsCollection.insertOne({
          damageType: 'cold',
          bodyPart: bodyPart,
          rank: entry.rank,
          damage: entry.damage,
          message: entry.message,
          effects: entry.effects,
          wounds: entry.wounds,
          RollRangeStart: entry.rank * 10,
          RollRangeEnd: (entry.rank * 10) + 9
        });
      }
    }

    console.log('Importing grapple criticals...');
    
    // Import all grapple critical entries
    for (const bodyPart of Object.keys(grappleCriticals)) {
      for (const entry of grappleCriticals[bodyPart]) {
        await critsCollection.insertOne({
          damageType: 'grapple',
          bodyPart: bodyPart,
          rank: entry.rank,
          damage: entry.damage,
          message: entry.message,
          effects: entry.effects,
          wounds: entry.wounds,
          // Create range for lookup (rank-based)
          RollRangeStart: entry.rank * 10,
          RollRangeEnd: (entry.rank * 10) + 9
        });
      }
    }

    console.log('Critical tables imported successfully!');
    
    const count = await critsCollection.countDocuments();
    console.log(`Total critical entries: ${count}`);

    await databaseManager.client.close();
  } catch (error) {
    console.error('Error importing critical tables:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  importCriticalTables();
}

module.exports = importCriticalTables;

