/**
 * Script to fix giant rat NPC to not drop coins
 * Sets metadata.dropsSilver to false for giant rats
 */

const databaseManager = require('../adapters/db/mongoClient');

async function fixGiantRatNoCoins() {
  const db = await databaseManager.initialize();
  
  try {
    console.log('='.repeat(70));
    console.log('Fixing Giant Rat NPC - No Coin Drops');
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
    console.log(`  Current dropsSilver: ${giantRat.metadata?.dropsSilver}`);
    console.log(`  Current wealth.silver: ${giantRat.metadata?.wealth?.silver}`);
    console.log('');
    
    // Update to not drop silver
    const updateResult = await db.collection('npcs').updateOne(
      { id: 'giant-rat' },
      {
        $set: {
          'metadata.dropsSilver': false,
          'metadata.wealth.silver': 0
        }
      }
    );
    
    if (updateResult.modifiedCount > 0) {
      console.log('✅ Updated giant rat NPC definition to not drop coins');
    } else {
      console.log('ℹ️  Giant rat NPC definition already configured correctly (no coins)');
    }
    
    // Verify the update
    const updated = await db.collection('npcs').findOne({ id: 'giant-rat' });
    console.log('');
    console.log('Updated metadata:');
    console.log(`  dropsSilver: ${updated.metadata?.dropsSilver}`);
    console.log(`  wealth.silver: ${updated.metadata?.wealth?.silver || 0}`);
    console.log('');
    console.log('✅ Done! Giant rat NPCs will no longer drop coins.');
    console.log('   Note: Existing corpses may still have coins. New kills will not drop coins.');
    
  } catch (error) {
    console.error('Error fixing giant rat coin drops:', error);
    throw error;
  } finally {
    await databaseManager.close();
  }
}

// Run if called directly
if (require.main === module) {
  fixGiantRatNoCoins()
    .then(() => {
      console.log('');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { fixGiantRatNoCoins };

