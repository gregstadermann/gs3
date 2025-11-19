'use strict';

const databaseManager = require('../adapters/db/mongoClient');

/**
 * Update Exit Visibility
 * 
 * Rules:
 * 1. All non-ordinal directions (e.g., "old well", "tree", "protrusion") must be hidden
 * 2. Non-ordinal exits should not appear in "Obvious paths:"
 * 3. If exit is "climb protrusion", normalize to "protrusion", mark as hidden
 * 4. Action verbs (climb, go, enter, etc.) should be stripped from exit names
 * 
 * Ordinal directions (always visible):
 * - north, south, east, west, northeast, northwest, southeast, southwest
 * - up, down, in, out
 * - n, s, e, w, ne, nw, se, sw, u, d
 */

// Ordinal directions that should always be visible
const ORDINAL_DIRECTIONS = new Set([
  'north', 'south', 'east', 'west',
  'northeast', 'northwest', 'southeast', 'southwest',
  'up', 'down', 'in', 'out',
  'n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw', 'u', 'd'
]);

// Action verbs that should be stripped from exit names
const ACTION_VERBS = [
  'climb', 'go', 'enter', 'exit', 'walk', 'run', 'move',
  'crawl', 'squeeze', 'push', 'pull', 'open', 'close',
  'step', 'jump', 'leap', 'crouch', 'duck', 'sneak'
];

/**
 * Normalize exit direction name
 * - Remove action verbs (e.g., "climb protrusion" -> "protrusion")
 * - Trim whitespace
 * - Convert to lowercase for comparison
 */
function normalizeExitName(direction) {
  if (!direction || typeof direction !== 'string') {
    return direction;
  }
  
  let normalized = direction.trim().toLowerCase();
  
  // Remove action verbs at the start
  for (const verb of ACTION_VERBS) {
    const verbPattern = new RegExp(`^${verb}\\s+`, 'i');
    if (verbPattern.test(normalized)) {
      normalized = normalized.replace(verbPattern, '').trim();
      break;
    }
  }
  
  return normalized;
}

/**
 * Check if a direction is ordinal (should be visible)
 */
function isOrdinalDirection(direction) {
  if (!direction || typeof direction !== 'string') {
    return false;
  }
  
  const normalized = direction.trim().toLowerCase();
  return ORDINAL_DIRECTIONS.has(normalized);
}

/**
 * Process exits for a room
 * Returns updated exits array
 */
function processExits(exits) {
  if (!Array.isArray(exits)) {
    return [];
  }
  
  return exits.map(exit => {
    if (!exit || typeof exit !== 'object') {
      return exit;
    }
    
    const originalDirection = exit.direction || '';
    const normalizedDirection = normalizeExitName(originalDirection);
    const isOrdinal = isOrdinalDirection(normalizedDirection);
    
    // Create updated exit
    const updatedExit = {
      ...exit,
      direction: normalizedDirection || originalDirection, // Use normalized if available, fallback to original
      hidden: !isOrdinal // Hidden if not ordinal
    };
    
    // Preserve fullRoomId if it exists
    if (exit.fullRoomId) {
      updatedExit.fullRoomId = exit.fullRoomId;
    } else if (exit.roomId) {
      // Try to construct fullRoomId if we have roomId and areaId context
      // This will be handled at room level if needed
    }
    
    return updatedExit;
  });
}

/**
 * Update all rooms in the database
 */
async function updateAllRooms() {
  const db = await databaseManager.initialize();
  
  try {
    console.log('='.repeat(70));
    console.log('Updating Exit Visibility for All Rooms');
    console.log('='.repeat(70));
    console.log('');
    
    // Get all rooms
    const rooms = await db.collection('rooms').find({}).toArray();
    console.log(`Found ${rooms.length} rooms to process\n`);
    
    let updated = 0;
    let skipped = 0;
    let totalExitsProcessed = 0;
    let totalExitsHidden = 0;
    let totalExitsNormalized = 0;
    
    // Process in batches
    const batchSize = 100;
    for (let i = 0; i < rooms.length; i += batchSize) {
      const batch = rooms.slice(i, i + batchSize);
      const operations = [];
      
      for (const room of batch) {
        try {
          const originalExits = room.exits || [];
          const processedExits = processExits(originalExits);
          
          // Check if any changes were made
          let hasChanges = false;
          let exitsHidden = 0;
          let exitsNormalized = 0;
          
          for (let j = 0; j < processedExits.length; j++) {
            const original = originalExits[j];
            const processed = processedExits[j];
            
            // Check if hidden status changed
            const wasHidden = original.hidden === true;
            const isHidden = processed.hidden === true;
            if (wasHidden !== isHidden) {
              hasChanges = true;
              if (isHidden) exitsHidden++;
            }
            
            // Check if direction was normalized
            const originalDir = (original.direction || '').trim().toLowerCase();
            const processedDir = (processed.direction || '').trim().toLowerCase();
            if (originalDir !== processedDir) {
              hasChanges = true;
              exitsNormalized++;
            }
          }
          
          if (hasChanges || processedExits.length !== originalExits.length) {
            // Update room with processed exits
            operations.push({
              updateOne: {
                filter: { id: room.id, areaId: room.areaId },
                update: {
                  $set: {
                    exits: processedExits
                  }
                }
              }
            });
            
            updated++;
            totalExitsProcessed += processedExits.length;
            totalExitsHidden += exitsHidden;
            totalExitsNormalized += exitsNormalized;
          } else {
            skipped++;
          }
        } catch (error) {
          console.error(`Error processing room ${room.id}:`, error.message);
          skipped++;
        }
      }
      
      // Execute batch update
      if (operations.length > 0) {
        await db.collection('rooms').bulkWrite(operations, { ordered: false });
      }
      
      // Progress indicator
      const processed = Math.min(i + batchSize, rooms.length);
      process.stdout.write(`\rProgress: ${processed}/${rooms.length} rooms (${updated} updated, ${skipped} unchanged)`);
    }
    
    console.log('\n');
    console.log('='.repeat(70));
    console.log('Update Complete!');
    console.log('='.repeat(70));
    console.log(`Total rooms processed: ${rooms.length}`);
    console.log(`Rooms updated: ${updated}`);
    console.log(`Rooms unchanged: ${skipped}`);
    console.log(`Total exits processed: ${totalExitsProcessed}`);
    console.log(`Exits marked as hidden: ${totalExitsHidden}`);
    console.log(`Exits normalized (action verbs removed): ${totalExitsNormalized}`);
    console.log('');
    
    // Sample some updated rooms to show examples
    console.log('Sample of updated rooms:');
    const sampleRooms = await db.collection('rooms')
      .find({ 'exits.hidden': true })
      .limit(5)
      .toArray();
    
    for (const room of sampleRooms) {
      const hiddenExits = room.exits.filter(e => e.hidden);
      const visibleExits = room.exits.filter(e => !e.hidden);
      console.log(`  ${room.id}:`);
      if (visibleExits.length > 0) {
        console.log(`    Visible: ${visibleExits.map(e => e.direction).join(', ')}`);
      }
      if (hiddenExits.length > 0) {
        console.log(`    Hidden: ${hiddenExits.map(e => e.direction).join(', ')}`);
      }
    }
    
  } catch (error) {
    console.error('\n❌ Update failed:', error);
    console.error(error.stack);
    throw error;
  } finally {
    await databaseManager.close();
  }
}

// Command line usage
if (require.main === module) {
  updateAllRooms()
    .then(() => {
      console.log('\n✅ Done!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Error:', error.message);
      process.exit(1);
    });
}

module.exports = { updateAllRooms, processExits, normalizeExitName, isOrdinalDirection };

