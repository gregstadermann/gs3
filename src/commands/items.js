'use strict';

/**
 * Items Command (Admin Only)
 * LIST: show items in the database with optional search filter
 * SPAWN: place an existing DB item into the admin's current room
 *
 * Usage:
 *  items list [filter]
 *  items spawn <itemId>
 */
module.exports = {
  name: 'items',
  aliases: ['item'],
  description: 'Admin: list and spawn items from the database',
  usage: 'items list [filter]\r\nitems spawn <itemId>',

  async execute(player, args) {
    if (!player.gameEngine || !player.gameEngine.roomSystem || !player.gameEngine.roomSystem.db) {
      return { success: false, message: 'Database not available.\r\n' };
    }

    const db = player.gameEngine.roomSystem.db;
    // Always refresh player from DB first so role changes take effect immediately
    try {
      let fresh = await db.collection('players').findOne({ name: player.name });
      if (!fresh) {
        // Try case-insensitive name match
        fresh = await db.collection('players').findOne({ name: { $regex: `^${player.name}$`, $options: 'i' } });
      }
      if (!fresh && player.id) {
        // Fallback to id lookup
        fresh = await db.collection('players').findOne({ id: player.id });
      }
      if (fresh && fresh.role) {
        player.role = fresh.role;
      }
    } catch (e) {
      // ignore reload errors; fall back to in-memory role
    }

    // Permission check after refresh
    if (player.role !== 'admin') {
      return { success: false, message: 'You are not authorized to use this command.\r\n' };
    }
    const sub = (args[0] || '').toLowerCase();

    if (sub === 'list' || sub === 'ls') {
      const filter = args.slice(1).join(' ').trim().toLowerCase();
      const query = {};

      if (filter) {
        // Basic OR search on name, description, and keywords
        query.$or = [
          { name: { $regex: filter, $options: 'i' } },
          { description: { $regex: filter, $options: 'i' } },
          { keywords: { $elemMatch: { $regex: filter, $options: 'i' } } },
          { id: { $regex: filter, $options: 'i' } },
          { type: { $regex: filter, $options: 'i' } }
        ];
      }

      try {
        const items = await db.collection('items')
          .find(query, { projection: { _id: 0 } })
          .limit(50)
          .toArray();

        if (items.length === 0) {
          return { success: true, message: 'No items found.\r\n' };
        }

        const lines = items.map((it, idx) => {
          const name = it.name || '(unnamed)';
          const type = it.type || 'UNKNOWN';
          const id = it.id || '(no-id)';
          return `${idx + 1}. ${name} [${type}] id=${id}`;
        });
        return { success: true, message: lines.join('\r\n') + '\r\n' };
      } catch (err) {
        console.error('Items list error:', err);
        return { success: false, message: 'Failed to list items.\r\n' };
      }
    }

    if (sub === 'spawn' || sub === 'add') {
      const itemId = args[1];
      if (!itemId) {
        return { success: false, message: 'Usage: items spawn <itemId>\r\n' };
      }

      try {
        // Fetch the room (cache) and DB copy to get _id
        const roomId = player.room;
        const roomCached = player.gameEngine.roomSystem.getRoom(roomId);
        if (!roomCached) {
          return { success: false, message: `Current room not found: ${roomId}\r\n` };
        }

        const roomDoc = await db.collection('rooms').findOne({ id: roomId });
        if (!roomDoc) {
          return { success: false, message: `Room ${roomId} not found in database.\r\n` };
        }

        const item = await db.collection('items').findOne({ id: itemId });
        if (!item) {
          return { success: false, message: `Item not found: ${itemId}\r\n` };
        }

        // Update item location to this room's Mongo _id (as used elsewhere)
        await db.collection('items').updateOne(
          { id: itemId },
          { $set: { location: roomDoc._id ? String(roomDoc._id) : roomId } }
        );

        // Ensure room has items array
        const updatedRoomItems = Array.isArray(roomDoc.items) ? [...roomDoc.items] : [];
        if (!updatedRoomItems.includes(itemId)) {
          updatedRoomItems.push(itemId);
        }

        const newRoomDoc = { ...roomDoc, items: updatedRoomItems };
        await db.collection('rooms').replaceOne({ id: roomId }, newRoomDoc);

        // Update in-memory cache copy as well
        const cachedWithItem = { ...roomCached, items: updatedRoomItems };
        player.gameEngine.roomSystem.rooms.set(roomId, cachedWithItem);

        return { success: true, message: `Spawned ${item.name || item.id} into ${roomDoc.title}.\r\n` };
      } catch (err) {
        console.error('Items spawn error:', err);
        return { success: false, message: 'Failed to spawn item.\r\n' };
      }
    }

    return { success: false, message: 'Usage:\r\nitems list [filter]\r\nitems spawn <itemId>\r\n' };
  }
};


