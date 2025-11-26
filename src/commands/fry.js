'use strict';

const ArgParser = require('../core/ArgParser');
const ExperienceSystem = require('../systems/ExperienceSystem');

/**
 * Fry Command (Admin Only)
 * Fills a target player's field experience pool to capacity
 * 
 * Usage: FRY <target>
 * Example: FRY Bulwark
 */
module.exports = {
  name: 'fry',
  aliases: [],
  description: 'Fill a player\'s field experience pool to capacity (Admin only)',
  usage: 'fry <target>',
  
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
        message: 'Usage: FRY <target>\r\nExample: FRY Bulwark\r\n' 
      };
    }

    const searchTerm = args.join(' ');
    
    // First try to find player in the same room
    const allPlayers = Array.from(player.gameEngine.players.values());
    const playersInRoom = allPlayers.filter(p => p.room === player.room && p.name !== player.name);
    let targetPlayer = ArgParser.findPartial(searchTerm, playersInRoom, (p) => p.name);
    
    // If not found in room, search all online players
    if (!targetPlayer) {
      const allOnlinePlayers = allPlayers.filter(p => p.name !== player.name);
      targetPlayer = ArgParser.findPartial(searchTerm, allOnlinePlayers, (p) => p.name);
    }
    
    // If still not found, try loading from database (player might be offline)
    if (!targetPlayer) {
      try {
        const dbPlayer = await db.collection('players').findOne({ 
          name: { $regex: `^${searchTerm}$`, $options: 'i' } 
        });
        
        if (dbPlayer) {
          // Load the player into memory
          targetPlayer = await player.gameEngine.playerSystem.loadPlayer(dbPlayer.name);
        }
      } catch (error) {
        console.error('[FRY] Error loading player from database:', error);
      }
    }
    
    if (!targetPlayer) {
      return { 
        success: false, 
        message: `You don't see anyone by that name.\r\n` 
      };
    }

    // Calculate field experience pool capacity
    const expSystem = new ExperienceSystem();
    const capacity = expSystem.getFieldPoolCapacity(targetPlayer);
    
    // Ensure experience structure exists
    if (!targetPlayer.attributes) {
      targetPlayer.attributes = {};
    }
    if (!targetPlayer.attributes.experience) {
      targetPlayer.attributes.experience = { total: 0, field: 0 };
    }
    
    const previousField = Math.trunc(targetPlayer.attributes.experience.field || 0);
    
    // Fill field experience to capacity
    targetPlayer.attributes.experience.field = capacity;
    
    // Save the player
    await player.gameEngine.playerSystem.updatePlayer(targetPlayer);
    
    // Update in-memory cache if player is online
    if (player.gameEngine.players.has(targetPlayer.name)) {
      const cachedPlayer = player.gameEngine.players.get(targetPlayer.name);
      if (cachedPlayer.attributes) {
        cachedPlayer.attributes.experience = { ...targetPlayer.attributes.experience };
      } else {
        cachedPlayer.attributes = { ...targetPlayer.attributes };
      }
    }
    
    // Send message to admin
    const adminMessage = `You fill ${targetPlayer.name}'s field experience pool to capacity (${capacity} exp).\r\n`;
    
    // Send message to target player if online
    if (targetPlayer.connection) {
      const targetMessage = `\r\nYour field experience pool has been filled to capacity (${capacity} exp).\r\n`;
      
      if (typeof targetPlayer.connection.send === 'function') {
        targetPlayer.connection.send(targetMessage);
      } else if (typeof targetPlayer.connection.write === 'function') {
        targetPlayer.connection.write(targetMessage);
      }
    }
    
    console.log(`[FRY] ${player.name} filled ${targetPlayer.name}'s field exp from ${previousField} to ${capacity}`);
    
    return { 
      success: true, 
      message: adminMessage 
    };
  }
};

