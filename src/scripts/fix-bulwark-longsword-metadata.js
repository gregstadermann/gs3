/**
 * Script to fix Bulwark's longsword metadata
 * Sets the baseWeapon and weapon_type metadata so edged weapon skill is used correctly
 */

const databaseManager = require('../adapters/db/mongoClient');

async function fixLongswordMetadata() {
  const db = await databaseManager.initialize();
  
  try {
    console.log('='.repeat(70));
    console.log('Fixing Bulwark Longsword Metadata');
    console.log('='.repeat(70));
    console.log('');
    
    // Find the longsword
    const longsword = await db.collection('items').findOne({ id: 'bulkwark-longsword' });
    
    if (!longsword) {
      console.log('❌ Longsword not found in database.');
      return;
    }
    
    console.log('Found longsword:');
    console.log(`  Name: ${longsword.name}`);
    console.log(`  Current metadata:`, JSON.stringify(longsword.metadata || {}, null, 2));
    console.log('');
    
    // Update with correct metadata
    const updateResult = await db.collection('items').updateOne(
      { id: 'bulkwark-longsword' },
      {
        $set: {
          'metadata.baseWeapon': 'weapon_longsword',
          'metadata.weapon_type': 'one_handed_edged'
        }
      }
    );
    
    if (updateResult.modifiedCount > 0) {
      console.log('✅ Updated longsword metadata:');
      console.log('  baseWeapon: weapon_longsword');
      console.log('  weapon_type: one_handed_edged');
    } else {
      console.log('ℹ️  Longsword already has correct metadata');
    }
    
    // Verify the update
    const updated = await db.collection('items').findOne({ id: 'bulkwark-longsword' });
    console.log('');
    console.log('Updated metadata:');
    console.log(JSON.stringify(updated.metadata || {}, null, 2));
    console.log('');
    console.log('✅ Done! The longsword will now use Edged Weapons skill for AS calculation.');
    
  } catch (error) {
    console.error('Error fixing longsword metadata:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  fixLongswordMetadata()
    .then(() => {
      console.log('');
      process.exit(0);
    })
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = fixLongswordMetadata;

