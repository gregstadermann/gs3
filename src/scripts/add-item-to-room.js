'use strict';

const databaseManager = require('../core/DatabaseManager');

/**
 * Add an item to a specific room
 */
async function addItemToRoom(roomId, itemId) {
  try {
    const db = await databaseManager.initialize();
    
    // Find the room
    const room = await db.collection('rooms').findOne({ id: roomId });
    
    if (!room) {
      console.log(`Room ${roomId} not found. Creating default room.`);
      // Create a default starting room if it doesn't exist
      await db.collection('rooms').insertOne({
        id: 'starting-room',
        title: 'A Starting Room',
        description: 'A simple room for testing.',
        areaId: 'test',
        exits: [],
        items: []
      });
      roomId = 'starting-room';
    }
    
    // Get the item
    const item = await db.collection('items').findOne({ id: itemId });
    
    if (!item) {
      console.log(`Item ${itemId} not found in database.`);
      await databaseManager.client.close();
      return;
    }
    
    // Add item to room
    await db.collection('rooms').updateOne(
      { id: roomId },
      { $push: { items: itemId } }
    );
    
    console.log(`Added ${item.name} to room ${roomId}`);
    
    await databaseManager.client.close();
  } catch (error) {
    console.error('Error adding item to room:', error);
    process.exit(1);
  }
}

// Run with arguments
if (require.main === module) {
  const roomId = process.argv[2] || 'starting-room';
  const itemId = process.argv[3] || 'test-broadsword';
  addItemToRoom(roomId, itemId);
}

module.exports = addItemToRoom;

