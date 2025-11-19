'use strict';

/**
 * Script to update player gender in database
 * Updates Zoso and Bulwark to male
 */

const databaseManager = require('../adapters/db/mongoClient');

async function updatePlayerGenders() {
  try {
    const db = await databaseManager.initialize();
    const collection = db.collection('players');

    const playersToUpdate = ['Zoso', 'Bulwark'];
    
    console.log('Updating player genders to male...');
    
    for (const playerName of playersToUpdate) {
      const result = await collection.updateOne(
        { name: playerName },
        { $set: { gender: 'male' } }
      );
      
      if (result.matchedCount === 0) {
        console.log(`  ⚠ Warning: Player "${playerName}" not found in database`);
      } else if (result.modifiedCount === 0) {
        console.log(`  ✓ Player "${playerName}" already has gender set to male`);
      } else {
        console.log(`  ✓ Updated "${playerName}" gender to male`);
      }
    }
    
    // Verify the updates
    console.log('\nVerifying updates:');
    const players = await collection.find(
      { name: { $in: playersToUpdate } },
      { name: 1, gender: 1 }
    ).toArray();
    
    for (const p of players) {
      console.log(`  ${p.name}: gender = "${p.gender}"`);
    }
    
    console.log('\n✓ Gender update complete!');
    console.log('Note: Players who are currently online will need to reconnect');
    console.log('      or the server needs to reload their player data for the');
    console.log('      change to take effect in-game.');
    
    process.exit(0);
  } catch (error) {
    console.error('Error updating player genders:', error);
    process.exit(1);
  }
}

updatePlayerGenders();

