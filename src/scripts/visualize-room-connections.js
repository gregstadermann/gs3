'use strict';

const databaseManager = require('../core/DatabaseManager');

/**
 * Visualize room connections without coordinates - simple graph view
 */
async function visualizeRoomConnections() {
  const db = await databaseManager.initialize();
  
  const rooms = await db.collection('rooms')
    .find({})
    .project({ id: 1, title: 1, exits: 1, areaId: 1, _id: 0 })
    .toArray();

  const roomMap = new Map(rooms.map(r => [r.id, r]));
  
  console.log('\n=== ROOM CONNECTION ANALYSIS ===\n');
  console.log(`Total Rooms: ${rooms.length}`);
  
  // Group by area
  const roomsByArea = new Map();
  rooms.forEach(room => {
    const area = room.areaId;
    if (!roomsByArea.has(area)) {
      roomsByArea.set(area, []);
    }
    roomsByArea.get(area).push(room);
  });
  
  // Analyze each area
  for (const [areaId, areaRooms] of roomsByArea.entries()) {
    console.log(`\n--- ${areaId} (${areaRooms.length} rooms) ---`);
    
    // Count connected vs isolated rooms
    const connectedRooms = new Set();
    
    areaRooms.forEach(room => {
      if (room.exits && room.exits.length > 0) {
        room.exits.forEach(exit => {
          if (exit.roomId && exit.direction) {
            const targetRoom = roomMap.get(exit.roomId);
            if (targetRoom && targetRoom.areaId === areaId) {
              connectedRooms.add(room.id);
              connectedRooms.add(exit.roomId);
            }
          }
        });
      }
    });
    
    const isolatedRooms = areaRooms.filter(r => !connectedRooms.has(r.id));
    
    console.log(`  Connected rooms: ${connectedRooms.size}`);
    console.log(`  Isolated rooms: ${isolatedRooms.length}`);
    
    if (isolatedRooms.length > 0 && isolatedRooms.length <= 10) {
      console.log(`    Isolated: ${isolatedRooms.map(r => r.title).join(', ')}`);
    }
  }
  
  // Overall statistics
  console.log('\n=== OVERALL STATISTICS ===');
  
  let totalExits = 0;
  let validExits = 0;
  let bidirectionalExits = 0;
  let unidirectionalExits = 0;
  
  rooms.forEach(room => {
    if (room.exits && room.exits.length > 0) {
      room.exits.forEach(exit => {
        totalExits++;
        const targetRoom = roomMap.get(exit.roomId);
        if (targetRoom) {
          validExits++;
          // Check if bidirectionally connected
          if (targetRoom.exits) {
            const hasReturnExit = targetRoom.exits.some(e => 
              e.roomId === room.id &&
              reverseDirection(e.direction) === exit.direction
            );
            if (hasReturnExit) {
              bidirectionalExits++;
            } else {
              unidirectionalExits++;
            }
          }
        }
      });
    }
  });
  
  console.log(`Total Exits: ${totalExits}`);
  console.log(`Valid Exits: ${validExits}`);
  console.log(`Bidirectional: ${bidirectionalExits}`);
  console.log(`Unidirectional: ${unidirectionalExits}`);
  
  await databaseManager.client.close();
}

function reverseDirection(dir) {
  const reverseDir = {
    north: 'south', south: 'north',
    east: 'west', west: 'east',
    northeast: 'southwest', southwest: 'northeast',
    northwest: 'southeast', southeast: 'northwest',
    up: 'down', down: 'up', out: 'out'
  };
  return reverseDir[dir] || dir;
}

// Main execution
if (require.main === module) {
  visualizeRoomConnections().catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
}

module.exports = { visualizeRoomConnections };

