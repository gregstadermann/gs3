'use strict';

/**
 * Recalculate Zoso's HP using proper HP formula
 */

const mongoClient = require('../adapters/db/mongoClient');
const HealthCalculation = require('../services/healthCalculation');

async function recalculateZosoHP() {
  try {
    const db = await mongoClient.initialize();
    
    // Load Zoso
    const player = await db.collection('players').findOne({ name: 'Zoso' });
    
    if (!player) {
      console.log('Player Zoso not found in database');
      await mongoClient.close();
      return;
    }
    
    console.log('=== Zoso Current Stats ===');
    console.log('Race:', player.race);
    console.log('STR:', player.attributes?.strength?.base || 'N/A');
    console.log('CON:', player.attributes?.constitution?.base || 'N/A');
    console.log('Physical Fitness ranks:', player.skills?.physical_fitness?.ranks || 0);
    console.log('Current HP:', JSON.stringify(player.attributes?.health));
    console.log('');
    
    // Recalculate health
    const oldHP = player.attributes?.health?.max || player.attributes?.health?.base || 100;
    HealthCalculation.recalculateHealth(player);
    const newHP = player.attributes.health.max;
    
    console.log('=== Recalculated HP ===');
    console.log('Old Max HP:', oldHP);
    console.log('New Max HP:', newHP);
    console.log('Current HP:', player.attributes.health.current);
    console.log('');
    
    // Save to database
    await db.collection('players').updateOne(
      { name: 'Zoso' },
      { $set: { 'attributes.health': player.attributes.health } }
    );
    
    console.log('✓ Zoso HP updated in database!');
    console.log('');
    console.log('Breakdown:');
    const baseHP = HealthCalculation.calculateBaseHP(player);
    const conBonus = require('../services/statBonus').statBonus(
      player.race || 'human',
      'constitution',
      require('../services/statBonus').getRawStat(player, 'constitution')
    );
    const pfRanks = player.skills?.physical_fitness?.ranks || 0;
    const hpPerRank = HealthCalculation.calculateHPPerPFRank(player.race || 'human', player);
    console.log(`  Base HP (from STR+CON): ${baseHP}`);
    console.log(`  CON bonus: +${conBonus}`);
    console.log(`  Physical Fitness: ${pfRanks} ranks × ${hpPerRank} HP/rank = +${pfRanks * hpPerRank}`);
    console.log(`  Total Max HP: ${baseHP} + ${conBonus} + ${pfRanks * hpPerRank} = ${newHP}`);
    
    await mongoClient.close();
  } catch (error) {
    console.error('Error recalculating Zoso HP:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  recalculateZosoHP().then(() => {
    console.log('Done!');
    process.exit(0);
  }).catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = recalculateZosoHP;

