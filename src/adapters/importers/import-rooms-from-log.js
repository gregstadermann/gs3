'use strict';

const fs = require('fs').promises;
const path = require('path');
const databaseManager = require('../db/mongoClient');

function slugify(text) {
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/--+/g, '-');
}

const dirMap = new Map([
  ['n', 'north'],
  ['s', 'south'],
  ['e', 'east'],
  ['w', 'west'],
  ['ne', 'northeast'],
  ['nw', 'northwest'],
  ['se', 'southeast'],
  ['sw', 'southwest'],
  ['u', 'up'],
  ['d', 'down'],
  ['up', 'up'],
  ['down', 'down'],
  ['out', 'out']
]);

const reverseDir = {
  north: 'south', south: 'north',
  east: 'west', west: 'east',
  northeast: 'southwest', southwest: 'northeast',
  northwest: 'southeast', southeast: 'northwest',
  up: 'down', down: 'up', out: 'out'
};

/**
 * Get reverse exit for special exits
 * Most special exits (gate, door, etc.) work both ways with the same name
 * ALWAYS returns a reverse exit direction (never null)
 */
function getReverseSpecialExit(specialExit) {
  // Gates and doors typically work both ways with the same name
  // The exit is stored as just "gate" or "door" (not "go gate"), so reverse is the same
  return specialExit;
}

async function ensureRoom(db, areaId, title, description, preferredId) {
  // Determine room identifiers
  const baseSlug = preferredId || slugify(title || 'room');
  let roomId = `${areaId}:${baseSlug}`;

  // If exists, return existing id (add-only)
  const existing = await db.collection('rooms').findOne({ id: roomId });
  if (existing) return roomId;

  // If collision on different title, append number
  let attempt = 1;
  while (await db.collection('rooms').findOne({ id: roomId })) {
    attempt += 1;
    roomId = `${areaId}:${baseSlug}-${attempt}`;
  }

  const doc = {
    id: roomId,
    areaId,
    roomId: roomId.split(':')[1],
    title: title || roomId,
    description: (description || '').trim(),
    npcs: [],
    items: [],
    exits: [],
    metadata: {
      importedAt: new Date().toISOString(),
      originalFormat: 'movement-log'
    }
  };

  await db.collection('rooms').insertOne(doc);
  return roomId;
}

async function addExitIfMissing(db, fromRoomId, direction, toRoomId, hidden = false) {
  const coll = db.collection('rooms');
  const from = await coll.findOne({ id: fromRoomId });
  if (!from) return;
  const exits = Array.isArray(from.exits) ? from.exits : [];
  // Enforce uniqueness by direction: never allow multiple exits with the same name
  const dirExists = exits.some(e => e.direction === direction);
  if (dirExists) return;
  // Avoid self-loops
  if (toRoomId === fromRoomId) return;
  
  const exitData = { direction, roomId: toRoomId };
  if (hidden) {
    exitData.hidden = true;
  }
  
  const updated = { ...from, exits: exits.concat([exitData]) };
  // add-only: replace with added exit, do not remove existing
  await coll.replaceOne({ id: fromRoomId }, updated);
}

async function importFromLog(filePath, areaId) {
  const db = await databaseManager.initialize();
  const text = await fs.readFile(filePath, 'utf8');
  const lines = text.split(/\r?\n/);

  let currentRoomId = null;
  let pendingDir = null;
  let pendingSpecialExit = null;
  let collectingDesc = false;
  let currentTitle = '';
  let descBuffer = [];
  let pendingItems = [];

  const titleRegex = /^\[(.+?)\]$/;
  // Match simple direction commands: > n, > s, etc. (with optional > prefix)
  const cmdRegex = /^>?\s*([a-zA-Z]{1,3})\s*$/;
  // Match LOOK commands with room on same line: >l[Room Title] or l[Room Title]
  const lookWithRoomRegex = /^>?\s*l\s*\[(.+?)\]$/i;
  // Match special GO commands with room on same line: go gate[Room Title] or >go gate[Room Title]
  const goCmdWithRoomRegex = /^>?\s*go\s+([a-z]+)\[(.+?)\]$/i;
  // Match special GO commands on separate line: > go gate, > go door, etc.
  const goCmdRegex = /^>?\s*go\s+([a-z]+)\s*$/i;

  for (const raw of lines) {
    const line = raw.trimEnd();

    // LOOK commands with room on same line: >l[Room Title] - just track current room, don't move
    const lookWithRoomMatch = line.match(lookWithRoomRegex);
    if (lookWithRoomMatch) {
      const roomTitle = lookWithRoomMatch[1].trim();
      // Ensure this room exists and set as current (but don't create movement)
      const roomId = await ensureRoom(db, areaId, roomTitle, '');
      currentRoomId = roomId;
      // Continue collecting description if already collecting, otherwise start fresh
      if (!collectingDesc) {
        currentTitle = roomTitle;
        descBuffer = [];
        collectingDesc = true;
      }
      continue;
    }

    // Special GO commands with room title on same line: go gate[Room Title]
    const goWithRoomMatch = line.match(goCmdWithRoomRegex);
    if (goWithRoomMatch) {
      const exitType = goWithRoomMatch[1].toLowerCase();
      const roomTitle = goWithRoomMatch[2].trim();
      // Store exit as just "gate" (not "go gate"), will be marked as hidden
      pendingSpecialExit = exitType;
      pendingDir = null;
      // Process the room immediately
      currentTitle = roomTitle;
      descBuffer = [];
      collectingDesc = true;
      continue;
    }

    // Special GO commands on separate line (go gate, go door, etc.)
    const goMatch = line.match(goCmdRegex);
    if (goMatch) {
      const exitType = goMatch[1].toLowerCase();
      // Store exit as just "gate" (not "go gate"), will be marked as hidden
      pendingSpecialExit = exitType;
      pendingDir = null; // Clear regular direction
      continue;
    }

    // Regular movement command
    const cmdMatch = line.match(cmdRegex);
    if (cmdMatch) {
      const token = cmdMatch[1].toLowerCase();
      const dir = dirMap.get(token) || null;
      if (dir) {
        pendingDir = dir;
        pendingSpecialExit = null; // Clear special exit
      }
      continue;
    }

    // Title of a room (standalone)
    const t = line.match(titleRegex);
    if (t) {
      // Start new room collection
      currentTitle = t[1].trim();
      descBuffer = [];
      collectingDesc = true;
      pendingItems = [];
      continue;
    }

    // End of room block trigger: Obvious paths or blank line after description
    if (collectingDesc) {
      if (line.startsWith('Obvious paths:') || line === '') {
        // Create/ensure room now
        const roomId = await ensureRoom(db, areaId, currentTitle, descBuffer.join('\n'));
        
        // Connect rooms if we have movement pending
        if (currentRoomId) {
          if (pendingSpecialExit) {
            // Special exit (gate, door, etc.) - store as just the name, mark as hidden
            // Hidden exits don't show in "Obvious paths:" but can be accessed via "go gate"
            await addExitIfMissing(db, currentRoomId, pendingSpecialExit, roomId, true);
            // ALWAYS create reverse exit for special exits (gates/doors work both ways)
            const reverseExit = getReverseSpecialExit(pendingSpecialExit);
            // For gates, doors, and most special exits, reverse is the same name, also hidden
            await addExitIfMissing(db, roomId, reverseExit, currentRoomId, true);
          } else if (pendingDir) {
            // Regular directional exit - ALWAYS create reverse
            await addExitIfMissing(db, currentRoomId, pendingDir, roomId);
            const rev = reverseDir[pendingDir];
            if (rev) {
              await addExitIfMissing(db, roomId, rev, currentRoomId);
            }
          }
        }
        
        // Create items found via "You also see" and attach to room
        if (pendingItems.length > 0) {
          const collRooms = db.collection('rooms');
          const collItems = db.collection('items');
          // Load current room to get existing items list
          const roomDoc = await collRooms.findOne({ id: roomId }) || { items: [] };
          const roomItems = Array.isArray(roomDoc.items) ? roomDoc.items.slice() : [];
          for (const rawName of pendingItems) {
            const name = rawName.trim();
            if (!name) continue;
            const baseSlug = slugify(name).slice(0, 60) || 'item';
            const itemId = `${roomId}:item:${baseSlug}-${Date.now()}-${Math.floor(Math.random()*1000)}`;
            await collItems.replaceOne(
              { id: itemId },
              {
                id: itemId,
                areaId,
                itemId: itemId.split(':').slice(-1)[0],
                name: name,
                type: 'ITEM',
                roomDesc: name,
                keywords: [],
                description: name,
                maxItems: 1,
                metadata: {
                  importedAt: new Date().toISOString(),
                  originalFormat: 'movement-log'
                }
              },
              { upsert: true }
            );
            roomItems.push(itemId);
          }
          await collRooms.updateOne({ id: roomId }, { $set: { items: roomItems } });
        }

        currentRoomId = roomId;
        pendingDir = null;
        pendingSpecialExit = null;
        collectingDesc = false;
        continue;
      } else {
        // Ignore dynamic player list lines
        if (/^Also here:/i.test(line)) {
          continue;
        }
        // Parse inline item listing and convert to items
        const youSee = line.match(/^You also see (.+?)[.\s]*$/i);
        if (youSee) {
          const list = youSee[1]
            .replace(/\band\b/gi, ',')
            .split(',')
            .map(s => s.trim())
            .filter(Boolean);
          pendingItems.push(...list);
          continue;
        }
        // Otherwise, treat as part of description
        descBuffer.push(line);
        continue;
      }
    }
  }

  await databaseManager.client.close();
}

async function main() {
  const argv = process.argv.slice(2);
  const areaIdx = argv.indexOf('--area');
  const fileIdx = argv.indexOf('--file');
  if (areaIdx === -1 || fileIdx === -1 || !argv[areaIdx + 1] || !argv[fileIdx + 1]) {
    console.error('Usage: node src/scripts/import-rooms-from-log.js --area <area-id> --file <path>');
    process.exit(1);
  }
  const areaId = argv[areaIdx + 1];
  const filePath = path.resolve(argv[fileIdx + 1]);
  await importFromLog(filePath, areaId);
  console.log(`Imported rooms/exits add-only from ${filePath} into area ${areaId}`);
}

if (require.main === module) {
  main().catch(err => { console.error(err); process.exit(1); });
}


