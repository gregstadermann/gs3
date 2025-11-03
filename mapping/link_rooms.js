#!/usr/bin/env node
'use strict';

/**
 * link_rooms.js
 * Links parsed room JSONs by analyzing movement commands in the original log file
 * 
 * Usage: node link_rooms.js <log_file> <rooms_json_file>
 */

const fs = require('fs');
const crypto = require('crypto');

// Direction mappings
const ORDINALS = ['north', 'south', 'east', 'west', 'northeast', 'southeast', 'northwest', 'southwest', 'up', 'down', 'out'];
const ABBREVIATIONS = {
  n: 'north', s: 'south', e: 'east', w: 'west',
  ne: 'northeast', se: 'southeast', nw: 'northwest', sw: 'southwest',
  u: 'up', d: 'down'
};
const REVERSE = {
  north: 'south', south: 'north',
  east: 'west', west: 'east',
  northeast: 'southwest', southwest: 'northeast',
  northwest: 'southeast', southeast: 'northwest',
  up: 'down', down: 'up',
  out: 'out'
};

// Regex patterns
const HEADER_RE = /^\[(.+?)\]\s*$/;
const MOVEMENT_RE = /^>\s*([a-z]+)/i;

/**
 * Compute canonical_id for a room (must match parser's logic)
 */
function computeCanonicalId(title, description) {
  // Strip "You also see..." from description to match parser
  let desc = description.replace(/\.\s+You also see\s+.+?\.?\s*$/i, '.');
  
  // Normalize whitespace
  desc = desc.replace(/\s+/g, ' ').trim();
  
  // SHA1 hash of "title|description"
  const hash = crypto.createHash('sha1');
  hash.update(title.trim());
  hash.update('|');
  hash.update(desc);
  const canonicalHash = hash.digest('hex').substring(0, 16);
  
  // Create slug from title
  const slug = title.toLowerCase()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .substring(0, 80);
  
  return `${slug}_${canonicalHash}`;
}

/**
 * Main linking function
 */
function linkRooms(logPath, roomsJsonPath) {
  console.log(`Reading rooms from ${roomsJsonPath}...`);
  const rooms = JSON.parse(fs.readFileSync(roomsJsonPath, 'utf8'));
  
  // Index rooms by canonical_id and by id
  const roomsByCanonical = {};
  const roomsById = {};
  for (const room of rooms) {
    roomsByCanonical[room.canonical_id] = room;
    roomsById[room.id] = room;
  }
  
  console.log(`Processing log file ${logPath}...`);
  const logContent = fs.readFileSync(logPath, 'utf8');
  const lines = logContent.split('\n');
  
  // State tracking
  let currentTitle = null;
  let currentDesc = [];
  let currentMove = null;  // Movement FROM current room
  let lastRoomId = null;   // ID of the last finalized room
  let lastMove = null;     // Movement FROM the last room
  let linkedCount = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Check for room header [Room Title]
    const headerMatch = line.match(HEADER_RE);
    if (headerMatch) {
      // Finalize the previous room if we have one
      if (currentTitle) {
        const canonicalId = computeCanonicalId(currentTitle, currentDesc.join(' '));
        const room = roomsByCanonical[canonicalId];
        
        if (room) {
          // If we have a previous room and it had a movement, link them
          if (lastRoomId && lastMove) {
            const prevRoom = roomsById[lastRoomId];
            if (prevRoom) {
              const reverse = REVERSE[lastMove];
              
              // Forward link: prevRoom --[direction]--> currentRoom
              prevRoom.exits[lastMove] = room.id;
              
              // Backward link: currentRoom --[reverse]--> prevRoom
              if (reverse) {
                room.exits[reverse] = prevRoom.id;
              }
              
              linkedCount++;
              console.log(`  Linked: ${prevRoom.id} --[${lastMove}]--> ${room.id}`);
            }
          }
          
          // This room becomes the "last room" with its movement for next iteration
          lastRoomId = room.id;
          lastMove = currentMove;
        }
      }
      
      // Start new room
      currentTitle = headerMatch[1];
      currentDesc = [];
      currentMove = null;
      continue;
    }
    
    // Check for movement command >direction
    const moveMatch = line.match(MOVEMENT_RE);
    if (moveMatch) {
      let direction = moveMatch[1].toLowerCase();
      
      // Normalize abbreviations
      direction = ABBREVIATIONS[direction] || direction;
      
      // Only record valid ordinal directions
      if (ORDINALS.includes(direction)) {
        currentMove = direction;
        console.log(`  Movement: >${direction}`);
      }
      continue;
    }
    
    // Collect description lines (skip "Obvious" and "Also here:")
    if (currentTitle && !line.startsWith('Obvious') && !line.startsWith('Also here:') && !line.startsWith('>')) {
      currentDesc.push(line);
    }
  }
  
  // Finalize the last room
  if (currentTitle) {
    const canonicalId = computeCanonicalId(currentTitle, currentDesc.join(' '));
    const room = roomsByCanonical[canonicalId];
    
    if (room && lastRoomId && lastMove) {
      const prevRoom = roomsById[lastRoomId];
      if (prevRoom) {
        const reverse = REVERSE[lastMove];
        prevRoom.exits[lastMove] = room.id;
        if (reverse) {
          room.exits[reverse] = prevRoom.id;
        }
        linkedCount++;
        console.log(`  Linked: ${prevRoom.id} --[${lastMove}]--> ${room.id}`);
      }
    }
  }
  
  // Write output
  const outputPath = roomsJsonPath.replace('.json', '_linked.json');
  fs.writeFileSync(outputPath, JSON.stringify(rooms, null, 2), 'utf8');
  
  console.log(`\nLinked ${linkedCount} room transitions → ${outputPath}`);
  
  // Calculate exit statistics
  let totalExits = 0;
  let unknownExits = 0;
  let linkedExits = 0;
  let roomsWithAllUnknown = 0;
  let fullyConnectedRooms = 0;
  
  for (const room of rooms) {
    const exitCount = Object.keys(room.exits).length;
    const unknownCount = Object.values(room.exits).filter(target => {
      if (typeof target === 'string' && target === 'unknown') return true;
      if (typeof target === 'object' && (!target.roomId || target.roomId === 'unknown')) return true;
      return false;
    }).length;
    const linkedCount = exitCount - unknownCount;
    
    totalExits += exitCount;
    unknownExits += unknownCount;
    linkedExits += linkedCount;
    
    if (exitCount > 0 && unknownCount === exitCount) {
      roomsWithAllUnknown++;
    }
    if (exitCount > 0 && unknownCount === 0) {
      fullyConnectedRooms++;
    }
  }
  
  console.log(`\n📊 Exit Statistics:`);
  console.log(`   Total rooms: ${rooms.length}`);
  console.log(`   Total exits: ${totalExits}`);
  console.log(`     Linked: ${linkedExits} (${((linkedExits/totalExits)*100).toFixed(1)}%)`);
  console.log(`     Unknown: ${unknownExits} (${((unknownExits/totalExits)*100).toFixed(1)}%)`);
  console.log(`   Rooms with all exits unknown: ${roomsWithAllUnknown}`);
  console.log(`   Fully connected rooms: ${fullyConnectedRooms}`);
}

// CLI handling
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.error('Usage: node link_rooms.js <log_file> <rooms_json_file>');
    console.error('Example: node link_rooms.js small-wl-gates-log.txt small-wl-gates-log.rooms.json');
    process.exit(1);
  }
  
  const [logFile, roomsFile] = args;
  
  try {
    linkRooms(logFile, roomsFile);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

module.exports = { linkRooms };

