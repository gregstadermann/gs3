'use strict';

const databaseManager = require('../core/DatabaseManager');

const reverseDir = {
  north: 'south', south: 'north',
  east: 'west', west: 'east',
  northeast: 'southwest', southwest: 'northeast',
  northwest: 'southeast', southeast: 'northwest',
  up: 'down', down: 'up', out: 'out'
};

async function addExitIfMissing(db, fromRoomId, direction, toRoomId) {
  const from = await db.collection('rooms').findOne({ id: fromRoomId });
  if (!from) return false;
  
  const exits = Array.isArray(from.exits) ? from.exits : [];
  const exists = exits.some(e => e.direction === direction && e.roomId === toRoomId);
  if (exists) return false;
  
  exits.push({ direction, roomId: toRoomId });
  await db.collection('rooms').replaceOne({ id: fromRoomId }, { ...from, exits });
  return true;
}

async function linkObviousPairs(areaId) {
  const db = await databaseManager.initialize();
  
  // Get all rooms in the area
  const rooms = await db.collection('rooms')
    .find({ areaId, 'metadata.originalFormat': 'movement-log' })
    .toArray();
  
  const roomMap = new Map(rooms.map(r => [r.id, r]));
  const titleToRooms = new Map();
  
  // Index rooms by normalized title
  for (const room of rooms) {
    const key = room.title.toLowerCase().trim();
    if (!titleToRooms.has(key)) {
      titleToRooms.set(key, []);
    }
    titleToRooms.get(key).push(room);
  }
  
  let linksAdded = 0;
  
  // Link obvious pairs based on title patterns
  const patterns = [
    // Gate connections
    {
      fromPattern: /outside gate/i,
      toPattern: /land's end/i,
      direction: { from: 'north', to: 'south' }
    },
    {
      fromPattern: /outside gate/i,
      toPattern: /land's end/i,
      direction: { from: 'go gate', to: 'go gate' }
    },
    // Courtyard connections
    {
      fromPattern: /quiet path/i,
      toPattern: /courtyard/i,
      direction: { from: 'north', to: 'south' }
    },
    {
      fromPattern: /hearthstone/i,
      toPattern: /courtyard/i,
      direction: { from: 'same', to: 'same' }
    },
  ];
  
  // Manual known connections from the logs
  const knownPairs = [
    // From Bakardi(3).txt
    {
      fromTitle: "Wehnimer's, Outside Gate",
      toTitle: "Wehnimer's, Land's End Rd.",
      fromDir: 'north',
      toDir: 'south'
    },
    {
      fromTitle: "A Quiet Path",
      toTitle: "Hearthstone, Courtyard",
      fromDir: 'north',
      toDir: 'south'
    },
    {
      fromTitle: "Wehnimer's, Outside Gate",
      toTitle: "A Quiet Path",
      fromDir: 'north',
      toDir: 'south'
    },
    {
      fromTitle: "Wehnimer's, Exterior",
      toTitle: "Wehnimer's, Outside Gate",
      fromDir: 'west',
      toDir: 'east'
    },
    {
      fromTitle: "Wehnimer's, Outside Gate",
      toTitle: "Wehnimer's, Exterior",
      fromDir: 'east',
      toDir: 'west'
    },
    {
      fromTitle: "Wehnimer's, Exterior",
      toTitle: "Wehnimer's, Outside Gate",
      fromDir: 'northeast',
      toDir: 'southwest'
    },
    {
      fromTitle: "Wehnimer's, Outside Gate",
      toTitle: "Wehnimer's, Exterior",
      fromDir: 'southwest',
      toDir: 'northeast'
    },
    {
      fromTitle: "Lower Dragonsclaw, Forest",
      toTitle: "Wehnimer's, Exterior",
      fromDir: 'east',
      toDir: 'west'
    },
    {
      fromTitle: "Wehnimer's, Exterior",
      toTitle: "Lower Dragonsclaw, Forest",
      fromDir: 'west',
      toDir: 'east'
    },
    {
      fromTitle: "Lower Dragonsclaw, Forest",
      toTitle: "Wehnimer's, Exterior",
      fromDir: 'north',
      toDir: 'south'
    },
    {
      fromTitle: "Wehnimer's, Exterior",
      toTitle: "Lower Dragonsclaw, Forest",
      fromDir: 'south',
      toDir: 'north'
    },
  ];
  
  // Process known pairs
  for (const pair of knownPairs) {
    const fromRooms = titleToRooms.get(pair.fromTitle.toLowerCase()) || [];
    const toRooms = titleToRooms.get(pair.toTitle.toLowerCase()) || [];
    
    for (const fromRoom of fromRooms) {
      for (const toRoom of toRooms) {
        if (fromRoom.id === toRoom.id) continue;
        
        // Add forward exit
        if (await addExitIfMissing(db, fromRoom.id, pair.fromDir, toRoom.id)) {
          linksAdded++;
        }
        
        // Add reverse exit
        const revDir = reverseDir[pair.toDir];
        if (revDir && await addExitIfMissing(db, toRoom.id, revDir, fromRoom.id)) {
          linksAdded++;
        }
      }
    }
  }
  
  // Try to link rooms that mention each other in descriptions
  for (const room of rooms) {
    if (!room.description) continue;
    
    const desc = room.description.toLowerCase();
    
    // Look for mentions of gate, door, entrance, etc.
    if (desc.includes('gate') || desc.includes('entrance') || desc.includes('doorway')) {
      // Try to find related rooms
      for (const other of rooms) {
        if (other.id === room.id) continue;
        
        const otherTitle = other.title.toLowerCase();
        const otherDesc = (other.description || '').toLowerCase();
        
        // If rooms mention similar locations or have related names
        if (room.title.includes('Gate') && otherTitle.includes('Gate') && room.id !== other.id) {
          // Check if they're close by looking for direction hints in description
          const roomDesc = room.description.toLowerCase();
          if (roomDesc.includes('west') && otherDesc.includes('east')) {
            if (await addExitIfMissing(db, room.id, 'west', other.id)) linksAdded++;
            if (await addExitIfMissing(db, other.id, 'east', room.id)) linksAdded++;
          }
        }
      }
    }
  }
  
  console.log(`Linked ${linksAdded} obvious connections`);
  await databaseManager.client.close();
}

async function main() {
  const argv = process.argv.slice(2);
  const areaIdx = argv.indexOf('--area');
  
  if (areaIdx === -1 || !argv[areaIdx + 1]) {
    console.error('Usage: node src/scripts/link-obvious-rooms.js --area <area-id>');
    process.exit(1);
  }
  
  const areaId = argv[areaIdx + 1];
  await linkObviousPairs(areaId);
  console.log(`Done linking obvious pairs for area ${areaId}`);
}

if (require.main === module) {
  main().catch(err => { console.error(err); process.exit(1); });
}

module.exports = { linkObviousPairs };

