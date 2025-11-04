'use strict';

const fs = require('fs').promises;
const databaseManager = require('../db/mongoClient');
const { createRoom, validateRoom } = require('../../schemas/room');

/**
 * Import rooms from multiple areas in a single JSON file
 * Usage: node src/adapters/importers/import-all-rooms.js <json-file-path> [--replace]
 * 
 * This importer handles rooms from different areas in the same file.
 * Rooms are automatically grouped by their areaId field.
 */
async function importAllRooms(jsonFilePath, options = {}) {
  const forceReplace = options.replace || false;
  const db = await databaseManager.initialize();
  
  try {
    console.log(`Reading rooms from ${jsonFilePath}...`);
    const content = await fs.readFile(jsonFilePath, 'utf8');
    const allRooms = JSON.parse(content);
    
    console.log(`Found ${allRooms.length} total rooms`);
    
    // Group rooms by area
    const roomsByArea = {};
    for (const room of allRooms) {
      const areaId = room.areaId || 'global';
      if (!roomsByArea[areaId]) {
        roomsByArea[areaId] = [];
      }
      roomsByArea[areaId].push(room);
    }
    
    const areaCount = Object.keys(roomsByArea).length;
    console.log(`Grouped into ${areaCount} areas\n`);
    
    // Load areas to validate
    const areasJson = require('../../data/areas.json');
    
    // Track overall stats
    let totalImported = 0;
    let totalUpdated = 0;
    let totalMerged = 0;
    let totalSkipped = 0;
    
    // Process each area
    for (const [areaId, rooms] of Object.entries(roomsByArea)) {
      console.log(`\n${'='.repeat(70)}`);
      console.log(`Processing area: ${areaId} (${rooms.length} rooms)`);
      console.log('='.repeat(70));
      
      // Validate area exists
      if (!areasJson[areaId]) {
        console.warn(`⚠️  Warning: Area '${areaId}' not found in areas.json - skipping`);
        totalSkipped += rooms.length;
        continue;
      }
      
      const areaName = areasJson[areaId];
      
      // Create or update area document
      const areaDoc = {
        id: areaId,
        name: areaName,
        rooms: rooms.length,
        items: 0,
        npcs: 0,
        respawnInterval: 0,
        instanced: false,
        importedAt: new Date().toISOString()
      };
      
      await db.collection('areas').replaceOne(
        { id: areaId },
        areaDoc,
        { upsert: true }
      );
      
      // Auto-detect merge mode
      const existingRoomCount = await db.collection('rooms').countDocuments({ areaId });
      const autoMergeMode = existingRoomCount > 0 && !forceReplace;
      
      if (autoMergeMode) {
        console.log(`🔄 Merge mode: Found ${existingRoomCount} existing rooms`);
      } else if (forceReplace && existingRoomCount > 0) {
        console.log(`⚠️  Replace mode: Will overwrite ${existingRoomCount} existing rooms`);
      } else {
        console.log(`✨ New area: Inserting rooms`);
      }
      
      // Import rooms for this area
      let imported = 0;
      let updated = 0;
      let skipped = 0;
      let merged = 0;
      
      for (let i = 0; i < rooms.length; i++) {
        const room = rooms[i];
        
        try {
          // Validate room
          const validation = validateRoom(room);
          if (validation && !validation.valid) {
            console.error(`\n  ⚠️  Validation error for room ${room.id}:`, validation.errors);
            skipped++;
            continue;
          }
          
          // Create room document
          const roomDoc = createRoom({
            id: room.id || room.canonical_id,
            areaId: room.areaId,
            title: room.title,
            description: room.description,
            exits: room.exits || [],
            items: room.items || [],
            features: room.features || [],
            metadata: {
              ...room.metadata,
              importedAt: new Date().toISOString()
            }
          });
          
          // Check if room exists
          const existingRoom = await db.collection('rooms').findOne({ id: roomDoc.id });
          
          if (existingRoom && autoMergeMode) {
            // Merge mode: preserve existing exits, add new ones
            const existingExitDirs = existingRoom.exits.map(e => e.direction);
            const newExits = roomDoc.exits.filter(e => !existingExitDirs.includes(e.direction));
            
            if (newExits.length > 0) {
              // Add new exits
              const mergedExits = [...existingRoom.exits, ...newExits];
              await db.collection('rooms').updateOne(
                { id: roomDoc.id },
                { 
                  $set: { 
                    exits: mergedExits,
                    'metadata.lastMerge': new Date().toISOString()
                  } 
                }
              );
              merged++;
              console.log(`\n  🔄 Merged ${roomDoc.id}: ${existingRoom.exits.length} → ${mergedExits.length} exits (+${newExits.length})`);
            } else {
              updated++;
            }
          } else {
            // Insert or replace mode
            await db.collection('rooms').replaceOne(
              { id: roomDoc.id },
              roomDoc,
              { upsert: true }
            );
            
            if (existingRoom) {
              updated++;
            } else {
              imported++;
            }
          }
          
          // Progress indicator
          if ((i + 1) % 50 === 0) {
            process.stdout.write(`\r  Progress: ${i + 1}/${rooms.length} rooms...`);
          }
        } catch (error) {
          console.error(`\n  ⚠️  Error importing room ${room.id}:`, error.message);
          skipped++;
        }
      }
      
      console.log(`\n\n  ✅ ${areaId} complete:`);
      console.log(`     New: ${imported}, Merged: ${merged}, Unchanged: ${updated - merged}, Skipped: ${skipped}`);
      
      totalImported += imported;
      totalUpdated += updated;
      totalMerged += merged;
      totalSkipped += skipped;
    }
    
    // Final summary
    console.log(`\n${'='.repeat(70)}`);
    console.log(`✅ Import complete!`);
    console.log(`${'='.repeat(70)}`);
    console.log(`   Total rooms processed: ${allRooms.length}`);
    console.log(`   New rooms: ${totalImported}`);
    console.log(`   Merged (exits added): ${totalMerged}`);
    console.log(`   Unchanged: ${totalUpdated - totalMerged}`);
    if (totalSkipped > 0) {
      console.log(`   Skipped: ${totalSkipped}`);
    }
    console.log(`   Areas updated: ${areaCount}`);
    
    // Verify totals per area
    console.log(`\n Area summary:`);
    for (const areaId of Object.keys(roomsByArea)) {
      const count = await db.collection('rooms').countDocuments({ areaId });
      console.log(`   ${areaId}: ${count} rooms`);
    }
    
  } catch (error) {
    console.error('Import failed:', error);
    throw error;
  } finally {
    await db.client.close();
  }
}

// Command line usage
if (require.main === module) {
  const args = process.argv.slice(2);
  
  // Parse flags
  const forceReplace = args.includes('--replace');
  const nonFlagArgs = args.filter(arg => !arg.startsWith('--'));
  
  if (nonFlagArgs.length < 1) {
    console.error('Usage: node src/adapters/importers/import-all-rooms.js <json-file-path> [--replace]');
    console.error('');
    console.error('Modes:');
    console.error('  Auto (default): Merge if area has rooms, insert if new area');
    console.error('  --replace:      Force replace mode (overwrites existing rooms)');
    console.error('');
    console.error('This importer handles rooms from multiple areas in the same JSON file.');
    console.error('Rooms are automatically grouped by their areaId field.');
    console.error('');
    console.error('Example: node src/adapters/importers/import-all-rooms.js mapping/output/all-rooms.json');
    console.error('Example: node src/adapters/importers/import-all-rooms.js mapping/output/all-rooms.json --replace');
    process.exit(1);
  }
  
  const jsonFile = nonFlagArgs[0];
  
  if (forceReplace) {
    console.log('⚠️  Replace mode forced - will overwrite existing rooms\n');
  }
  
  importAllRooms(jsonFile, { replace: forceReplace })
    .then(() => {
      console.log('\n✅ Done!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Error:', error);
      process.exit(1);
    });
}

module.exports = { importAllRooms };

