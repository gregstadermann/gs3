'use strict';

const fs = require('fs').promises;
const path = require('path');
const databaseManager = require('../core/DatabaseManager');

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
    coordinates: [0, 0, 0],
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

async function addExitIfMissing(db, fromRoomId, direction, toRoomId) {
  const coll = db.collection('rooms');
  const from = await coll.findOne({ id: fromRoomId });
  if (!from) return;
  const exits = Array.isArray(from.exits) ? from.exits : [];
  const exists = exits.some(e => e.direction === direction && e.roomId === toRoomId);
  if (exists) return;
  const updated = { ...from, exits: exits.concat([{ direction, roomId: toRoomId }]) };
  // add-only: replace with added exit, do not remove existing
  await coll.replaceOne({ id: fromRoomId }, updated);
}

async function importFromLog(filePath, areaId) {
  const db = await databaseManager.initialize();
  const text = await fs.readFile(filePath, 'utf8');
  const lines = text.split(/\r?\n/);

  let currentRoomId = null;
  let pendingDir = null;
  let collectingDesc = false;
  let currentTitle = '';
  let descBuffer = [];

  const titleRegex = /^\[(.+?)\]$/;
  const cmdRegex = /^>\s*([a-zA-Z]{1,3})\s*$/;

  for (const raw of lines) {
    const line = raw.trimEnd();

    // Movement command
    const cmdMatch = line.match(cmdRegex);
    if (cmdMatch) {
      const token = cmdMatch[1].toLowerCase();
      const dir = dirMap.get(token) || null;
      if (dir) pendingDir = dir;
      continue;
    }

    // Title of a room
    const t = line.match(titleRegex);
    if (t) {
      // Start new room collection
      currentTitle = t[1].trim();
      descBuffer = [];
      collectingDesc = true;
      continue;
    }

    // End of room block trigger: Obvious paths or blank line after description
    if (collectingDesc) {
      if (line.startsWith('Obvious paths:') || line === '') {
        // Create/ensure room now
        const roomId = await ensureRoom(db, areaId, currentTitle, descBuffer.join('\n'));
        // If we had a pending dir and an existing currentRoomId, connect
        if (pendingDir && currentRoomId) {
          await addExitIfMissing(db, currentRoomId, pendingDir, roomId);
          const rev = reverseDir[pendingDir];
          if (rev) await addExitIfMissing(db, roomId, rev, currentRoomId);
        }
        currentRoomId = roomId;
        pendingDir = null;
        collectingDesc = false;
        continue;
      } else {
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


