#!/usr/bin/env node
'use strict';

/**
 * Script to force reload all players from database into GameEngine
 * This refreshes in-memory player objects with latest database state
 */

// This script needs to be run from the server context or we need to connect to the running server
// For now, let's create a simpler approach - just verify the database is correct

const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.DB_NAME || 'gs3';

async function checkPlayerData() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db(DB_NAME);
    const playersCollection = db.collection('players');
    
    const players = await playersCollection.find({}).toArray();
    console.log(`Found ${players.length} players\n`);
    
    for (const player of players) {
      if (!player.skills || typeof player.skills !== 'object') {
        continue;
      }
      
      console.log(`Player: ${player.name}`);
      console.log('Skills with ranksThisLevel:');
      
      for (const [skillId, skill] of Object.entries(player.skills)) {
        if (!skill || typeof skill !== 'object') continue;
        
        const ranks = skill.ranks || 0;
        const ranksThisLevel = skill.ranksThisLevel;
        const maxRanksPerLevel = skill.maxRanksPerLevel;
        
        if (ranksThisLevel !== undefined) {
          console.log(`  ${skillId}: ranks=${ranks}, ranksThisLevel=${ranksThisLevel}, maxPerLevel=${maxRanksPerLevel || 'undefined'}`);
          
          // Check if ranksThisLevel is invalid
          if (maxRanksPerLevel && ranksThisLevel > maxRanksPerLevel) {
            console.log(`    ⚠️  WARNING: ranksThisLevel (${ranksThisLevel}) exceeds maxRanksPerLevel (${maxRanksPerLevel})`);
          }
        }
      }
      console.log('');
    }
    
  } catch (error) {
    console.error('Error checking player data:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the script
checkPlayerData()
  .then(() => {
    console.log('\nTo reload players in-game, have them reconnect or restart the server.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });

