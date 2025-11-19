'use strict';

const fs = require('fs').promises;
const databaseManager = require('../adapters/db/mongoClient');
const { createRoom, validateRoom } = require('../schemas/room');

/**
 * Import rooms from a JSON file containing multiple areas
 * Usage: node src/scripts/import-all-rooms.js <json-file-path> [--replace]
 * 
 * This script handles rooms from different areas in the same file.
 * Rooms are automatically grouped by their areaId field.
 * 
 * Options:
 *   --replace: Force replace mode (overwrites existing rooms)
 */

async function importAllRooms(jsonFilePath, options = {}) {
  const forceReplace = options.replace || false;
  const db = await databaseManager.initialize();
  
  try {
    console.log('='.repeat(70));
    console.log('GS3 Multi-Area Room Importer');
    console.log('='.repeat(70));
    console.log(`Reading rooms from: ${jsonFilePath}`);
    
    const content = await fs.readFile(jsonFilePath, 'utf8');
    const allRooms = JSON.parse(content);
    
    console.log(`Found ${allRooms.length} total rooms\n`);
    
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
    console.log(`Grouped into ${areaCount} areas:`);
    for (const [areaId, rooms] of Object.entries(roomsByArea)) {
      console.log(`  ${areaId}: ${rooms.length} rooms`);
    }
    console.log('');
    
    // Load areas to validate
    const areasJson = require('../data/areas.json');
    
    // Track overall stats
    let totalImported = 0;
    let totalUpdated = 0;
    let totalSkipped = 0;
    const areaStats = {};
    
    // Process each area
    for (const [areaId, rooms] of Object.entries(roomsByArea)) {
      console.log('='.repeat(70));
      console.log(`Processing area: ${areaId} (${rooms.length} rooms)`);
      console.log('='.repeat(70));
      
      // Validate area exists
      if (!areasJson[areaId]) {
        console.warn(`⚠️  Warning: Area '${areaId}' not found in areas.json - skipping`);
        totalSkipped += rooms.length;
        areaStats[areaId] = { imported: 0, updated: 0, skipped: rooms.length };
        continue;
      }
      
      const areaName = areasJson[areaId];
      console.log(`Area: ${areaName}`);
      
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
      console.log('✓ Area document created/updated');
      
      // Check existing rooms
      const existingRoomCount = await db.collection('rooms').countDocuments({ areaId });
      
      if (existingRoomCount > 0 && !forceReplace) {
        console.log(`ℹ️  Found ${existingRoomCount} existing rooms - will update/replace`);
      } else if (forceReplace && existingRoomCount > 0) {
        console.log(`⚠️  Replace mode: Will overwrite ${existingRoomCount} existing rooms`);
      } else {
        console.log(`✨ New area: Inserting ${rooms.length} rooms`);
      }
      console.log('');
      
      // Import rooms for this area
      let imported = 0;
      let updated = 0;
      let skipped = 0;
      
      // Process rooms in batches for better performance
      const batchSize = 100;
      for (let i = 0; i < rooms.length; i += batchSize) {
        const batch = rooms.slice(i, i + batchSize);
        const operations = [];
        
        for (const room of batch) {
          try {
            // Validate room has required fields
            if (!room.id || !room.areaId || !room.title || !room.description) {
              console.error(`  ⚠️  Skipping room: missing required fields (id: ${room.id || 'missing'})`);
              skipped++;
              continue;
            }
            
            // Ensure exits is an array
            const exits = Array.isArray(room.exits) ? room.exits : [];
            
            // Build room document
            const roomDoc = {
              id: room.id,
              areaId: room.areaId,
              title: room.title,
              description: room.description,
              exits: exits.map(exit => ({
                direction: exit.direction,
                roomId: exit.roomId,
                fullRoomId: exit.fullRoomId || (exit.roomId ? `${room.areaId}:${exit.roomId}` : undefined),
                hidden: exit.hidden || false
              })),
              items: Array.isArray(room.items) ? room.items : [],
              features: Array.isArray(room.features) ? room.features : [],
              metadata: {
                importedAt: new Date().toISOString(),
                originalFormat: room.metadata?.originalFormat || 'map-json',
                source: room.metadata?.source || jsonFilePath,
                ...room.metadata
              }
            };
            
            // Add canonical_id if present
            if (room.canonical_id) {
              roomDoc.canonical_id = room.canonical_id;
            }
            
            // Validate room
            const validation = validateRoom(roomDoc);
            if (!validation.valid) {
              console.error(`  ⚠️  Validation error for room ${room.id}:`, validation.errors.join(', '));
              skipped++;
              continue;
            }
            
            // Prepare upsert operation
            operations.push({
              replaceOne: {
                filter: { id: roomDoc.id, areaId: roomDoc.areaId },
                replacement: roomDoc,
                upsert: true
              }
            });
            
          } catch (error) {
            console.error(`  ⚠️  Error processing room ${room.id}:`, error.message);
            skipped++;
          }
        }
        
        // Execute batch operations
        if (operations.length > 0) {
          try {
            const result = await db.collection('rooms').bulkWrite(operations, { ordered: false });
            imported += result.upsertedCount;
            updated += result.modifiedCount;
          } catch (error) {
            console.error(`  ⚠️  Batch write error:`, error.message);
            skipped += operations.length;
          }
        }
        
        // Progress indicator
        const processed = Math.min(i + batchSize, rooms.length);
        process.stdout.write(`\r  Progress: ${processed}/${rooms.length} rooms (${imported} new, ${updated} updated, ${skipped} skipped)`);
      }
      
      console.log('\n');
      console.log(`  ✅ ${areaId} complete:`);
      console.log(`     New: ${imported}, Updated: ${updated}, Skipped: ${skipped}`);
      
      totalImported += imported;
      totalUpdated += updated;
      totalSkipped += skipped;
      areaStats[areaId] = { imported, updated, skipped };
      
      // Verify import
      const finalCount = await db.collection('rooms').countDocuments({ areaId });
      console.log(`     Total rooms in database: ${finalCount}`);
      console.log('');
    }
    
    // Final summary
    console.log('='.repeat(70));
    console.log('✅ Import Complete!');
    console.log('='.repeat(70));
    console.log(`Total rooms processed: ${allRooms.length}`);
    console.log(`New rooms: ${totalImported}`);
    console.log(`Updated rooms: ${totalUpdated}`);
    if (totalSkipped > 0) {
      console.log(`Skipped rooms: ${totalSkipped}`);
    }
    console.log(`Areas processed: ${areaCount}`);
    console.log('');
    
    // Area summary
    console.log('Area Summary:');
    for (const [areaId, stats] of Object.entries(areaStats)) {
      const count = await db.collection('rooms').countDocuments({ areaId });
      console.log(`  ${areaId.padEnd(30)} : ${count.toString().padStart(6)} rooms (${stats.imported} new, ${stats.updated} updated, ${stats.skipped} skipped)`);
    }
    
  } catch (error) {
    console.error('\n❌ Import failed:', error);
    console.error(error.stack);
    throw error;
  } finally {
    await databaseManager.close();
  }
}

// Command line usage
if (require.main === module) {
  const args = process.argv.slice(2);
  
  // Parse flags
  const forceReplace = args.includes('--replace') || args.includes('-r');
  const nonFlagArgs = args.filter(arg => !arg.startsWith('--') && !arg.startsWith('-'));
  
  if (nonFlagArgs.length < 1) {
    console.error('Usage: node src/scripts/import-all-rooms.js <json-file-path> [--replace]');
    console.error('');
    console.error('Options:');
    console.error('  --replace, -r  Force replace mode (overwrites existing rooms)');
    console.error('');
    console.error('This script handles rooms from multiple areas in the same JSON file.');
    console.error('Rooms are automatically grouped by their areaId field.');
    console.error('');
    console.error('Example:');
    console.error('  node src/scripts/import-all-rooms.js mapping/output/all-rooms-fixed.json');
    console.error('  node src/scripts/import-all-rooms.js mapping/output/all-rooms-fixed.json --replace');
    process.exit(1);
  }
  
  const jsonFile = nonFlagArgs[0];
  
  if (forceReplace) {
    console.log('⚠️  Replace mode enabled - will overwrite existing rooms\n');
  }
  
  importAllRooms(jsonFile, { replace: forceReplace })
    .then(() => {
      console.log('\n✅ Done!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Error:', error.message);
      process.exit(1);
    });
}

module.exports = { importAllRooms };

