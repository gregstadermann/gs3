'use strict';

/**
 * Teleport Command (Admin Only)
 * Allows admins to instantly teleport to any room by room ID
 * 
 * Usage: TELEPORT <room-id>
 * Example: TELEPORT wehnimers-landing-town:zul-logoth-marcasite-tunnel
 */
module.exports = {
  name: 'teleport',
  aliases: ['tp', 'goto'],
  description: 'Teleport to any room by ID (Admin only)',
  usage: 'teleport <room-id>',
  
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
    } catch (_) {
      // Ignore reload errors; fall back to in-memory role
    }

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
        message: 'Usage: TELEPORT <room-id>\r\nExample: TELEPORT u7120 (TSC)\r\n' 
      };
    }

    // Join args in case room ID has spaces (unlikely but handle it)
    const roomId = args.join(' ').trim();
    
    if (!roomId) {
      return { 
        success: false, 
        message: 'You must specify a room ID.\r\nUsage: TELEPORT <room-id>\r\n' 
      };
    }

    // Validate room exists
    const destination = player.gameEngine.roomSystem.getRoom(roomId);
    
    if (!destination) {
      return { 
        success: false, 
        message: `Room "${roomId}" does not exist.\r\n` 
      };
    }

    // Move the player (no roundtime check for admin teleport)
    const oldRoom = player.room;
    player.room = roomId;
    
    // Update player in database
    await player.gameEngine.playerSystem.updatePlayer(player);
    
    // Get room description
    const roomDescription = await player.gameEngine.roomSystem.getRoomDescription(roomId, player, player.gameEngine);
    
    return { 
      success: true, 
      message: `\r\nYou teleport to ${destination.title}.\r\n\r\n${roomDescription}`,
      roomChanged: true,
      newRoom: roomId,
      oldRoom: oldRoom
    };
  }
};

