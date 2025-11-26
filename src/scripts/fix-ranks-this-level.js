#!/usr/bin/env node
'use strict';

/**
 * Script to fix invalid ranksThisLevel values in player skills
 * - Caps ranksThisLevel at maxRanksPerLevel if it exceeds it
 * - Initializes ranksThisLevel to 0 if undefined (legacy characters)
 */

const { MongoClient } = require('mongodb');
const CharacterCreation = require('../systems/CharacterCreation');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.DB_NAME || 'gs3';

async function fixRanksThisLevel() {
  const client = new MongoClient(MONGODB_URI);
  const characterCreation = new CharacterCreation();

  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db(DB_NAME);
    const playersCollection = db.collection('players');
    
    const players = await playersCollection.find({}).toArray();
    console.log(`Found ${players.length} players to check`);
    
    let totalFixed = 0;
    let totalPlayersUpdated = 0;
    
    for (const player of players) {
      if (!player.skills || typeof player.skills !== 'object') {
        continue;
      }
      
      let playerUpdated = false;
      const updates = {};
      
      for (const [skillId, skill] of Object.entries(player.skills)) {
        if (!skill || typeof skill !== 'object') {
          continue;
        }
        
        // Get maxRanksPerLevel from skill definition or default
        let maxRanksPerLevel = skill.maxRanksPerLevel;
        
        // If not defined, try to get from class definition
        if (maxRanksPerLevel === undefined) {
          const classKey = (player.class || player.playerClass || player.profession || '').toLowerCase();
          const classData = characterCreation.classes?.[classKey];
          const classSkill = classData?.skills?.[skillId];
          maxRanksPerLevel = classSkill?.maxRanksPerLevel;
        }
        
        // Fallback: All skills now have maxRanksPerLevel: 3 universally
        if (maxRanksPerLevel === undefined) {
          maxRanksPerLevel = 3;
        }
        
        // Initialize ranksThisLevel if undefined
        if (skill.ranksThisLevel === undefined) {
          // For legacy characters, calculate from total ranks using modulo
          skill.ranksThisLevel = maxRanksPerLevel > 0 ? (skill.ranks || 0) % maxRanksPerLevel : 0;
          updates[`skills.${skillId}.ranksThisLevel`] = skill.ranksThisLevel;
          playerUpdated = true;
          totalFixed++;
          console.log(`  ${player.name}: ${skillId} - Initialized ranksThisLevel to ${skill.ranksThisLevel} (ranks=${skill.ranks || 0}, maxPerLevel=${maxRanksPerLevel})`);
        }
        // Cap ranksThisLevel if it exceeds maxRanksPerLevel
        else if (skill.ranksThisLevel > maxRanksPerLevel) {
          const oldValue = skill.ranksThisLevel;
          skill.ranksThisLevel = maxRanksPerLevel;
          updates[`skills.${skillId}.ranksThisLevel`] = maxRanksPerLevel;
          playerUpdated = true;
          totalFixed++;
          console.log(`  ${player.name}: ${skillId} - Capped ranksThisLevel from ${oldValue} to ${maxRanksPerLevel} (ranks=${skill.ranks || 0}, maxPerLevel=${maxRanksPerLevel})`);
        }
      }
      
      // Apply updates if any were made
      if (playerUpdated && Object.keys(updates).length > 0) {
        await playersCollection.updateOne(
          { _id: player._id },
          { $set: updates }
        );
        totalPlayersUpdated++;
        console.log(`✓ Updated ${player.name}`);
      }
    }
    
    console.log(`\n=== Fix Summary ===`);
    console.log(`Total skills fixed: ${totalFixed}`);
    console.log(`Total players updated: ${totalPlayersUpdated}`);
    console.log(`===================\n`);
    
  } catch (error) {
    console.error('Error fixing ranksThisLevel:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the script
fixRanksThisLevel()
  .then(() => {
    console.log('Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });

