'use strict';

const databaseManager = require('../adapters/db/mongoClient');

/**
 * Add exit aliases to a room
 * Usage: node src/scripts/add-exit-aliases.js <room-id> <exit-name> <destination-room-id> [additional-aliases...]
 */

async function addExitAliases(roomId, exitName, destinationRoomId, ...aliases) {
  const db = await databaseManager.initialize();
  
  try {
    const room = await db.collection('rooms').findOne({ id: roomId });
    
    if (!room) {
      console.error(`Room ${roomId} not found`);
      return;
    }
    
    const exits = room.exits || [];
    const allExitNames = [exitName, ...aliases];
    
    // Find destination room to get fullRoomId
    const destRoom = await db.collection('rooms').findOne({ id: destinationRoomId });
    if (!destRoom) {
      console.error(`Destination room ${destinationRoomId} not found`);
      return;
    }
    
    const fullRoomId = `${destRoom.areaId}:${destinationRoomId}`;
    
    // Add each exit alias if it doesn't exist
    let added = 0;
    for (const exitName of allExitNames) {
      const exists = exits.some(e => e.direction === exitName);
      if (!exists) {
        exits.push({
          direction: exitName,
          roomId: destinationRoomId,
          fullRoomId: fullRoomId,
          hidden: true // Non-ordinal exits are hidden
        });
        added++;
        console.log(`Added exit: ${exitName} -> ${destinationRoomId}`);
      } else {
        console.log(`Exit ${exitName} already exists`);
      }
    }
    
    if (added > 0) {
      await db.collection('rooms').updateOne(
        { id: roomId },
        { $set: { exits: exits } }
      );
      console.log(`\n✅ Updated room ${roomId} with ${added} new exit(s)`);
    } else {
      console.log(`\n✅ All exits already exist`);
    }
    
    console.log(`\nCurrent exits in ${roomId}:`);
    exits.forEach(e => {
      console.log(`  - ${e.direction} -> ${e.roomId} (hidden: ${e.hidden})`);
    });
    
  } catch (error) {
    console.error('Error:', error);
    throw error;
  } finally {
    await databaseManager.close();
  }
}

// Command line usage
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length < 3) {
    console.error('Usage: node src/scripts/add-exit-aliases.js <room-id> <destination-room-id> <exit-name> [additional-aliases...]');
    console.error('Example: node src/scripts/add-exit-aliases.js u5036 u5037 furrier shop');
    process.exit(1);
  }
  
  const [roomId, destinationRoomId, ...exitNames] = args;
  
  addExitAliases(roomId, exitNames[0], destinationRoomId, ...exitNames.slice(1))
    .then(() => {
      console.log('\n✅ Done!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Error:', error.message);
      process.exit(1);
    });
}

module.exports = { addExitAliases };

