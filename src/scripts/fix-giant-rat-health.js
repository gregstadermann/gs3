/**
 * Script to fix giant rat NPC health in the database
 * Ensures all giant rat NPC definitions have 20 HP
 */

const databaseManager = require('../adapters/db/mongoClient');

async function fixGiantRatHealth() {
  const db = await databaseManager.initialize();
  
  try {
    console.log('='.repeat(70));
    console.log('Fixing Giant Rat NPC Health');
    console.log('='.repeat(70));
    console.log('');
    
    // Find the giant rat NPC definition
    const giantRat = await db.collection('npcs').findOne({ id: 'giant-rat' });
    
    if (!giantRat) {
      console.log('❌ Giant rat NPC definition not found in database.');
      console.log('   Run create-giant-rat-npcs.js first to create the definition.');
      return;
    }
    
    console.log('Found giant rat NPC definition:');
    console.log(`  Current health: ${JSON.stringify(giantRat.attributes?.health || giantRat.health || 'missing')}`);
    console.log('');
    
    // Ensure health is set to 20/20
    const updateResult = await db.collection('npcs').updateOne(
      { id: 'giant-rat' },
      {
        $set: {
          'attributes.health': {
            current: 20,
            max: 20
          }
        }
      }
    );
    
    if (updateResult.modifiedCount > 0) {
      console.log('✅ Updated giant rat NPC definition health to 20/20');
    } else {
      console.log('ℹ️  Giant rat NPC definition already has correct health (20/20)');
    }
    
    // Verify the update
    const updated = await db.collection('npcs').findOne({ id: 'giant-rat' });
    console.log('');
    console.log('Updated health:');
    console.log(`  Current: ${updated.attributes?.health?.current || 'missing'}`);
    console.log(`  Max: ${updated.attributes?.health?.max || 'missing'}`);
    console.log('');
    console.log('✅ Done! Giant rat NPCs spawned after server restart will have 20 HP.');
    console.log('   Note: Existing spawned NPCs will need to be respawned.');
    
  } catch (error) {
    console.error('Error fixing giant rat health:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  fixGiantRatHealth()
    .then(() => {
      console.log('');
      process.exit(0);
    })
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = fixGiantRatHealth;

