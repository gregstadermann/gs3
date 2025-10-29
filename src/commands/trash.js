'use strict';

/**
 * Trash Command (Admin Only)
 * Destroys an item from the current room
 * 
 * Usage: TRASH <item>
 */
module.exports = {
  name: 'trash',
  aliases: ['destroy', 'delete'],
  description: 'Destroy an item from the room (Admin only)',
  usage: 'trash <item>',

  async execute(player, args) {
    // Check database connection
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
      if (fresh && fresh.role) {
        player.role = fresh.role;
      }
    } catch (_) {}

    // Check admin access
    if (player.role !== 'admin') {
      return { 
        success: false, 
        message: 'You are not authorized to use this command.\r\n' 
      };
    }

    if (!args || args.length === 0) {
      return { 
        success: false, 
        message: 'What do you want to trash? Usage: TRASH <item>\r\n' 
      };
    }

    const searchTerm = args.join(' ').toLowerCase();
    const room = player.gameEngine.roomSystem.getRoom(player.room);
    
    if (!room || !room.items || room.items.length === 0) {
      return { success: false, message: 'There are no items in this room.\r\n' };
    }

    try {
      // Fetch all items from room
      const itemIds = room.items.map(x => (typeof x === 'string' ? x : (x.id || x))).filter(Boolean);
      const items = await db.collection('items').find({ id: { $in: itemIds } }).toArray();
      
      // Find matching item by name or keywords
      const item = items.find(it => {
        const name = (it.name || '').toLowerCase();
        const kws = (it.keywords || []).map(k => k.toLowerCase());
        return name.includes(searchTerm) || 
               kws.some(k => searchTerm.includes(k) || k.includes(searchTerm));
      });

      if (!item) {
        return { success: false, message: "You don't see that item here.\r\n" };
      }

      // Delete item from database
      await db.collection('items').deleteOne({ id: item.id });

      // Remove from room items array
      const newItems = room.items.filter(x => {
        const id = typeof x === 'string' ? x : (x.id || x);
        return id !== item.id;
      });
      
      await db.collection('rooms').updateOne(
        { id: player.room },
        { $set: { items: newItems } }
      );

      // Update room cache
      const cached = player.gameEngine.roomSystem.getRoom(player.room);
      if (cached) {
        player.gameEngine.roomSystem.rooms.set(player.room, { ...cached, items: newItems });
      }

      return { 
        success: true, 
        message: `You destroy ${item.name || 'the item'}.\r\n` 
      };
    } catch (error) {
      console.error('Trash command error:', error);
      return { 
        success: false, 
        message: `Failed to trash item: ${error.message}\r\n` 
      };
    }
  }
};

