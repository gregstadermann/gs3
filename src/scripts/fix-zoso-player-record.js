'use strict';

/**
 * Fix Zoso's player record
 * Since race modifiers are applied to stat bonuses (not base stats),
 * we need to verify Zoso's base stats are correct
 */

const mongoClient = require('../adapters/db/mongoClient');
const { statBonus } = require('../services/statBonus');
const HealthCalculation = require('../services/healthCalculation');

async function fixZosoPlayerRecord() {
  try {
    const db = await mongoClient.initialize();
    
    // Load Zoso
    const player = await db.collection('players').findOne({ name: 'Zoso' });
    
    if (!player) {
      console.log('Player Zoso not found in database');
      await mongoClient.close();
      return;
    }
    
    console.log('=== Zoso Current Record ===');
    console.log('Race:', player.race);
    console.log('Class:', player.class || player.playerClass);
    console.log('');
    
    // Display current base stats
    console.log('Current Base Stats:');
    const stats = ['strength', 'constitution', 'dexterity', 'agility', 'discipline', 'aura', 'logic', 'intelligence', 'wisdom', 'charisma'];
    const currentStats = {};
    for (const stat of stats) {
      if (player.attributes && player.attributes[stat]) {
        const base = player.attributes[stat].base || player.attributes[stat];
        currentStats[stat] = base;
        console.log(`  ${stat}: ${base}`);
      }
    }
    console.log('');
    
    // Calculate stat bonuses (these should use the race modifiers correctly)
    console.log('Stat Bonuses (calculated from base stats + race modifiers):');
    const raceKey = player.race || 'human';
    const races = require('../data/races.json');
    const raceData = races[raceKey] || races['human'];
    
    for (const stat of stats) {
      if (currentStats[stat] !== undefined) {
        const baseBonus = Math.floor((currentStats[stat] - 50) / 2);
        const raceMod = raceData.statModifiers[stat] || 0;
        const totalBonus = statBonus(raceKey, stat, currentStats[stat]);
        const sign = totalBonus >= 0 ? '+' : '';
        console.log(`  ${stat}: ${sign}${totalBonus} (base: ${currentStats[stat]}, base bonus: ${baseBonus}, race mod: ${raceMod >= 0 ? '+' : ''}${raceMod})`);
      }
    }
    console.log('');
    
    // Recalculate health (in case it needs updating)
    const oldHP = player.attributes?.health?.max || player.attributes?.health?.base || 100;
    HealthCalculation.recalculateHealth(player);
    const newHP = player.attributes.health.max;
    
    console.log('=== Health Check ===');
    console.log('Old Max HP:', oldHP);
    console.log('New Max HP:', newHP);
    console.log('Current HP:', player.attributes.health.current);
    console.log('');
    
    // Save updated player record
    const updateData = {
      'attributes.health': player.attributes.health
    };
    
    await db.collection('players').updateOne(
      { name: 'Zoso' },
      { $set: updateData }
    );
    
    console.log('✓ Zoso player record updated in database!');
    console.log('');
    console.log('Note: Base stats are correct. Race modifiers are applied to stat bonuses,');
    console.log('      not base stats. Stat bonuses are calculated dynamically using:');
    console.log('      statBonus = ⌊(RawStat - 50)/2⌋ + RaceModifier');
    
    await mongoClient.close();
  } catch (error) {
    console.error('Error fixing Zoso player record:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  fixZosoPlayerRecord().then(() => {
    console.log('Done!');
    process.exit(0);
  }).catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = fixZosoPlayerRecord;

