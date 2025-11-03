'use strict';

const fs = require('fs').promises;
const databaseManager = require('../db/mongoClient');
const { createRoom, validateRoom } = require('../../schemas/room');

/**
 * Import rooms from a linked JSON file into MongoDB
 * Usage: node src/adapters/importers/import-rooms.js <json-file-path> <area-id>
 */
async function importRooms(jsonFilePath, areaId) {
  const db = await databaseManager.initialize();
  
  try {
    console.log(`Reading rooms from ${jsonFilePath}...`);
    const content = await fs.readFile(jsonFilePath, 'utf8');
    const rooms = JSON.parse(content);
    
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
    
    // Transform and import rooms
    let imported = 0;
    let updated = 0;
    let skipped = 0;
    
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
        
        // Upsert the room
        const result = await db.collection('rooms').replaceOne(
          { id: roomDoc.id, areaId: roomDoc.areaId },
          roomDoc,
          { upsert: true }
        );
        
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
    console.log(`   Updated: ${updated} existing rooms`);
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
  
  if (args.length < 2) {
    console.error('Usage: node src/scripts/import-rooms.js <json-file-path> <area-id>');
    console.error('Example: node src/scripts/import-rooms.js mapping/wl-gates.rooms_linked.json wl-gates');
    process.exit(1);
  }
  
  const [jsonFile, areaId] = args;
  
  importRooms(jsonFile, areaId)
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

