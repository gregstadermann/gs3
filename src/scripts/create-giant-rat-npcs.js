'use strict';

const databaseManager = require('../adapters/db/mongoClient');

/**
 * Create Giant Rat NPC Definition and Spawn in wl-catacombs
 * 
 * Based on Gemstone3 giant rat stats:
 * - Level: 1
 * - HP: 28
 * - AS: 34 (bite attack)
 * - DS: 4 (melee), 2 (ranged/bolt)
 * - Armor: ASG 1N (natural)
 * - UDF: 32
 * - Aggressive: Yes
 * - Skin: rat pelt
 */

async function createGiantRatNPCs() {
  const db = await databaseManager.initialize();
  
  try {
    console.log('='.repeat(70));
    console.log('Creating Giant Rat NPC Definition');
    console.log('='.repeat(70));
    console.log('');
    
    // Create giant rat NPC definition
    const giantRatDefinition = {
      id: 'giant-rat',
      npcId: 'giant-rat',
      name: 'a giant rat',
      description: 'Larger than a domestic cat, the giant rat stands over a foot high. Dark brown in color, shading off to white on the belly, with naked pink ears and narrow glinting eyes, the rat glares with unrestrained bloodlust. Known to exist in great packs, the rat has brought more than one over-eager adventurer to an early grave.',
      keywords: ['rat', 'giant rat', 'giant', 'rodent'],
      level: 1,
      
      // Attributes
      attributes: {
        level: 1,
        health: {
          current: 28,
          max: 28
        },
        mana: {
          current: 0,
          max: 0
        },
        // Combat stats
        attackStrength: 34, // AS for bite attack
        defenseStrength: 4, // DS for melee
        armor: 1, // ASG 1N (natural armor)
        // Core stats (estimated for level 1)
        strength: 45,
        constitution: 40,
        agility: 50,
        dexterity: 55
      },
      
      // Combat configuration
      aggressive: true,
      roundtime: 5000, // 5 seconds (RT 5 from GS3 bite attack table)
      
      // Stats for combat system
      stats: {
        as: 34, // Attack Strength for bite
        ds: 4,  // Defense Strength (melee)
        dsRanged: 2,
        dsBolt: 2,
        udf: 32, // Unarmed Defense Factor
        armor: 1 // Natural armor (ASG 1N)
      },
      
      // Combat behavior
      combat: {
        as: 34,
        ds: 4,
        attackType: 'bite', // Natural bite attack
        damageType: ['puncture', 'crush', 'slash'], // Bite can use any of these critical tables
        attackName: 'bite', // Attack verb
        // Custom attack damage factors by armor type (from GS3 table)
        damageFactors: {
          1: 0.400,   // Cloth (ASG 1)
          5: 0.375,   // Leather grade 5
          6: 0.375,   // Leather grade 6
          7: 0.375,   // Leather grade 7
          8: 0.375,   // Leather grade 8
          9: 0.375,   // Scale grade 9
          10: 0.375,  // Scale grade 10
          11: 0.375,  // Scale grade 11
          12: 0.375,  // Scale grade 12
          13: 0.325,  // Chain grade 13
          14: 0.325,  // Chain grade 14
          15: 0.325,  // Chain grade 15
          16: 0.325,  // Chain grade 16
          17: 0.300,  // Plate grade 17
          18: 0.300,  // Plate grade 18
          19: 0.300,  // Plate grade 19
          20: 0.300   // Plate grade 20
        },
        // Custom attack AvD by armor type (from GS3 table)
        avd: {
          1: 39,      // Cloth (ASG 1)
          5: 35,      // Leather grade 5
          6: 34,      // Leather grade 6
          7: 33,      // Leather grade 7
          8: 32,      // Leather grade 8
          9: 30,      // Scale grade 9
          10: 28,     // Scale grade 10
          11: 26,     // Scale grade 11
          12: 24,     // Scale grade 12
          13: 32,     // Chain grade 13
          14: 28,     // Chain grade 14
          15: 24,     // Chain grade 15
          16: 20,     // Chain grade 16
          17: 25,     // Plate grade 17
          18: 19,     // Plate grade 18
          19: 13,     // Plate grade 19
          20: 7       // Plate grade 20
        }
      },
      
      // Behavior
      behavior: {
        type: 'aggressive',
        aggression: 100, // Very aggressive
        wanderRange: 0, // Don't wander (stay in room)
        attackChance: 1.0 // Always attack when players present
      },
      
      // Equipment (none - uses natural bite)
      equipment: {},
      
      // Loot/Skin
      lootTable: 'giant-rat',
      skin: 'rat pelt',
      
      // Metadata
      areaId: 'wl-catacombs', // Primary area
      status: 'alive',
      createdAt: new Date().toISOString()
    };
    
    // Insert or update NPC definition
    const existing = await db.collection('npcs').findOne({ id: 'giant-rat' });
    if (existing) {
      await db.collection('npcs').replaceOne(
        { id: 'giant-rat' },
        giantRatDefinition
      );
      console.log('✅ Updated giant rat NPC definition');
    } else {
      await db.collection('npcs').insertOne(giantRatDefinition);
      console.log('✅ Created giant rat NPC definition');
    }
    
    console.log('');
    console.log('NPC Definition:');
    console.log(`  ID: ${giantRatDefinition.id}`);
    console.log(`  Name: ${giantRatDefinition.name}`);
    console.log(`  Level: ${giantRatDefinition.level}`);
    console.log(`  HP: ${giantRatDefinition.attributes.health.max}`);
    console.log(`  AS: ${giantRatDefinition.stats.as}`);
    console.log(`  DS: ${giantRatDefinition.stats.ds}`);
    console.log(`  Aggressive: ${giantRatDefinition.aggressive}`);
    console.log('');
    
    // Find all rooms in wl-catacombs and global area sewers/catacombs
    console.log('='.repeat(70));
    console.log('Adding Giant Rats to Sewer/Catacomb Rooms');
    console.log('='.repeat(70));
    console.log('');
    
    // Get rooms from wl-catacombs area
    const catacombsRooms = await db.collection('rooms').find({ areaId: 'wl-catacombs' }).toArray();
    console.log(`Found ${catacombsRooms.length} rooms in wl-catacombs area`);
    
    // Get sewer/catacomb rooms from global area
    const globalSewerRooms = await db.collection('rooms').find({
      areaId: 'global',
      $or: [
        { title: /sewer/i },
        { title: /catacomb/i }
      ]
    }).toArray();
    console.log(`Found ${globalSewerRooms.length} sewer/catacomb rooms in global area`);
    
    // Combine all rooms
    const allRooms = [...catacombsRooms, ...globalSewerRooms];
    console.log(`Total rooms to process: ${allRooms.length}`);
    
    if (allRooms.length === 0) {
      console.log('');
      console.log('⚠️  No rooms found in wl-catacombs or global sewers.');
      console.log('   The giant rat NPC definition has been created.');
      console.log('   Once rooms are imported, you can run this script again');
      console.log('   to add NPCs to those rooms, or add them manually.');
      console.log('');
      await databaseManager.close();
      return;
    }
    
    // Add NPC references to rooms
    let updated = 0;
    let skipped = 0;
    
    for (const room of allRooms) {
      try {
        // Initialize npcs array if it doesn't exist
        if (!room.npcs) {
          room.npcs = [];
        }
        
        // Check if giant rat is already referenced
        const hasGiantRat = room.npcs.some(npcRef => {
          if (typeof npcRef === 'string') {
            return npcRef === 'giant-rat';
          }
          return npcRef.id === 'giant-rat';
        });
        
        if (!hasGiantRat) {
          // Add giant rat reference (simple string format)
          room.npcs.push('giant-rat');
          
          // Update room in database
          await db.collection('rooms').updateOne(
            { id: room.id, areaId: room.areaId },
            { $set: { npcs: room.npcs } }
          );
          
          updated++;
        } else {
          skipped++;
        }
      } catch (error) {
        console.error(`Error updating room ${room.id}:`, error.message);
        skipped++;
      }
    }
    
    console.log('');
    console.log(`✅ Updated ${updated} rooms with giant rat NPCs`);
    console.log(`   Skipped ${skipped} rooms (already had giant rats)`);
    console.log('');
    
    // Summary
    console.log('='.repeat(70));
    console.log('Summary');
    console.log('='.repeat(70));
    console.log(`NPC Definition: giant-rat (created/updated)`);
    console.log(`Rooms processed: ${allRooms.length}`);
    console.log(`  - wl-catacombs: ${catacombsRooms.length}`);
    console.log(`  - global sewers/catacombs: ${globalSewerRooms.length}`);
    console.log(`Rooms with giant rats: ${updated + (allRooms.length - updated - skipped)}`);
    console.log('');
    console.log('Note: NPCs will spawn when the server starts or when you run the hotfix command.');
    console.log('      Make sure to restart the server for NPCs to appear in game.');
    console.log('');
    
  } catch (error) {
    console.error('\n❌ Error:', error);
    console.error(error.stack);
    throw error;
  } finally {
    await databaseManager.close();
  }
}

// Command line usage
if (require.main === module) {
  createGiantRatNPCs()
    .then(() => {
      console.log('✅ Done!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Error:', error.message);
      process.exit(1);
    });
}

module.exports = { createGiantRatNPCs };

