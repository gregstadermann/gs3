'use strict';

const fs = require('fs').promises;
const databaseManager = require('../db/mongoClient');
const { createRoom, validateRoom } = require('../../schemas/room');

/**
 * Import rooms from a linked JSON file into MongoDB
 * Usage: node src/adapters/importers/import-rooms.js <json-file-path> <area-id> [--replace]
 * 
 * Modes:
 *   - Auto (default): Merge if area has existing rooms, insert if new area
 *   - --replace: Force replace mode (overwrites existing rooms)
 */
async function importRooms(jsonFilePath, areaId, options = {}) {
  const forceReplace = options.replace || false;
  const db = await databaseManager.initialize();
  
  try {
    console.log(`Reading rooms from ${jsonFilePath}...`);
    const content = await fs.readFile(jsonFilePath, 'utf8');
    const rooms = JSON.parse(content);
    
    // Auto-detect area from JSON if not provided
    if (!areaId && rooms.length > 0) {
      areaId = rooms[0].areaId;
      console.log(`✨ Auto-detected area: ${areaId}`);
    }
    
    if (!areaId) {
      throw new Error('Could not determine area ID. Please provide as argument or ensure rooms have areaId field.');
    }
    
    // Validate all rooms belong to the same area
    const differentAreas = rooms.filter(r => r.areaId !== areaId);
    if (differentAreas.length > 0) {
      throw new Error(`Found ${differentAreas.length} rooms with different areaId. All rooms must be in area '${areaId}'`);
    }
    
    console.log(`Found ${rooms.length} rooms to import into area: ${areaId}`);
    
    // Load areas to validate and get display name
    const areasJson = require('../../data/areas.json');
    if (!areasJson[areaId]) {
      throw new Error(`Invalid area ID: ${areaId}. Check src/constants/areas.json`);
    }
    
    const areaName = areasJson[areaId];
    console.log(`Area: ${areaId} (${areaName})`);
    
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
    console.log(`✅ Area document created/updated`);
    
    // Auto-detect merge mode: if area has existing rooms, use merge
    const existingRoomCount = await db.collection('rooms').countDocuments({ areaId });
    const autoMergeMode = existingRoomCount > 0 && !forceReplace;
    
    if (autoMergeMode) {
      console.log(`🔄 Auto-merge mode: Found ${existingRoomCount} existing rooms in ${areaId}`);
      console.log(`   Will preserve existing exits and add new ones\n`);
    } else if (forceReplace && existingRoomCount > 0) {
      console.log(`⚠️  Replace mode: Will overwrite ${existingRoomCount} existing rooms\n`);
    } else {
      console.log(`✨ New area: Inserting rooms\n`);
    }
    
    // Transform and import rooms
    let imported = 0;
    let updated = 0;
    let skipped = 0;
    let merged = 0;
    
    for (const room of rooms) {
      try {
        // Transform exits: handle both object and array formats
        let exits = [];
        if (Array.isArray(room.exits)) {
          // Already in array format [{direction, roomId}] - use as-is
          exits = room.exits;
        } else if (typeof room.exits === 'object') {
          // Object format {"direction": "target_id"} - convert to array
        for (const [direction, target] of Object.entries(room.exits)) {
          if (typeof target === 'object' && target.hidden) {
            // Hidden exit without target
            exits.push({ direction, roomId: 'unknown', hidden: true });
          } else if (typeof target === 'string') {
            // Normal exit with target room ID (just the slug, or "unknown")
            exits.push({ direction, roomId: target });
            }
          }
        }
        
        // Build room document using canonical schema
        const roomDoc = createRoom({
          id: room.id,
          areaId: areaId,
          title: room.title,
          description: room.description,
          exits: exits,
          items: room.static_items || [],
          features: room.features || [],
          metadata: {
            originalFormat: 'movement-log',
            source: room.metadata?.source || 'unknown'
          }
        });
        
        // Add canonical_id if present
        if (room.canonical_id) {
          roomDoc.canonical_id = room.canonical_id;
        }
        
        // Validate room before inserting
        const validation = validateRoom(roomDoc);
        if (!validation.valid) {
          throw new Error(`Invalid room: ${validation.errors.join(', ')}`);
        }
        
        // Handle auto-merge vs replace mode
        let result;
        
        if (autoMergeMode) {
          // Auto-merge mode: Combine exits with existing room
          const existing = await db.collection('rooms').findOne({
            id: roomDoc.id,
            areaId: roomDoc.areaId
          });
          
          if (existing) {
            // Merge exits - add new directions, keep existing
            const existingExits = existing.exits || [];
            const existingDirections = new Set(existingExits.map(e => e.direction));
            const originalCount = existingExits.length;
            
            // Add new exits that don't already exist
            let newExitsAdded = 0;
            for (const newExit of roomDoc.exits) {
              if (!existingDirections.has(newExit.direction)) {
                existingExits.push(newExit);
                newExitsAdded++;
              }
            }
            
            if (newExitsAdded > 0) {
              console.log(`\n  🔄 Merged ${room.id}: ${originalCount} → ${existingExits.length} exits (+${newExitsAdded})`);
              merged++;
            }
            
            roomDoc.exits = existingExits;
            roomDoc.metadata.lastMerge = new Date().toISOString();
          }
          
          // Upsert with merged data
          result = await db.collection('rooms').replaceOne(
            { id: roomDoc.id, areaId: roomDoc.areaId },
            roomDoc,
            { upsert: true }
          );
        } else {
          // Replace mode: Completely replace existing room
          result = await db.collection('rooms').replaceOne(
          { id: roomDoc.id, areaId: roomDoc.areaId },
          roomDoc,
          { upsert: true }
        );
        }
        
        if (result.upsertedCount > 0) {
          imported++;
        } else if (result.modifiedCount > 0) {
          updated++;
        }
        
        if ((imported + updated) % 50 === 0) {
          process.stdout.write(`\r  Progress: ${imported + updated}/${rooms.length} rooms...`);
        }
      } catch (error) {
        console.error(`\nError importing room ${room.id}:`, error.message);
        skipped++;
      }
    }
    
    console.log(`\n\n✅ Import complete!`);
    console.log(`   Imported: ${imported} new rooms`);
    if (autoMergeMode) {
      console.log(`   Merged: ${merged} rooms (exits added)`);
      console.log(`   Unchanged: ${updated - merged} rooms (no new exits)`);
    } else {
      console.log(`   Replaced: ${updated} existing rooms`);
    }
    if (skipped > 0) {
      console.log(`   Skipped: ${skipped} rooms (errors)`);
    }
    
    // Verify import
    const count = await db.collection('rooms').countDocuments({ areaId: areaId });
    console.log(`\n   Total rooms in ${areaId}: ${count}`);
    
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
    console.error('Usage: node src/adapters/importers/import-rooms.js <json-file-path> [area-id] [--replace]');
    console.error('');
    console.error('Modes:');
    console.error('  Auto (default): Merge if area has rooms, insert if new area');
    console.error('  --replace:      Force replace mode (overwrites existing rooms)');
    console.error('');
    console.error('Note: area-id is optional - will auto-detect from JSON if not provided');
    console.error('');
    console.error('Example: node src/adapters/importers/import-rooms.js mapping/output/rooms.json');
    console.error('Example: node src/adapters/importers/import-rooms.js mapping/output/rooms.json wl-town');
    console.error('Example: node src/adapters/importers/import-rooms.js mapping/output/rooms.json wl-town --replace');
    process.exit(1);
  }
  
  const jsonFile = nonFlagArgs[0];
  let areaId = nonFlagArgs[1] || null;
  
  if (forceReplace) {
    console.log('⚠️  Replace mode forced - will overwrite existing rooms\n');
  }
  
  importRooms(jsonFile, areaId, { replace: forceReplace })
    .then(() => {
      console.log('\n✅ Done!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Error:', error);
      process.exit(1);
    });
}

module.exports = { importRooms };

