'use strict';

const ArgParser = require('../core/ArgParser');

/**
 * Wave Command
 * Allows players to wave at other players in the room
 * 
 * Usage:
 *   wave           - Wave to everyone in the room
 *   wave <target>  - Wave at a specific player
 */
module.exports = {
  name: 'wave',
  aliases: [],
  description: 'Wave to other players in the room',
  usage: 'wave [target]',
  
  execute(player, args) {
    // Get all players in the room from GameEngine.players Map
    const allPlayers = Array.from(player.gameEngine.players.values());
    const playersInRoom = allPlayers.filter(p => p.room === player.room);
    const otherPlayers = playersInRoom.filter(p => p.name !== player.name);
    
    if (otherPlayers.length === 0) {
      return { success: false, message: 'There is no one here to wave at.\r\n' };
    }
    
    // Helper function to send message to a player's connection
    const sendToPlayer = (targetPlayer, message) => {
      if (!targetPlayer.connection) {
        return;
      }
      
      if (typeof targetPlayer.connection.send === 'function') {
        // WebSocket
        targetPlayer.connection.send(message);
      } else if (typeof targetPlayer.connection.write === 'function') {
        // Telnet
        targetPlayer.connection.write(message);
      }
    };
    
    // If no target specified, wave to everyone
    if (args.length === 0) {
      // Send message to other players
      otherPlayers.forEach(targetPlayer => {
        sendToPlayer(targetPlayer, `${player.name} waves.\r\n`);
      });
      
      // Send confirmation to the player
      return { success: true, message: 'You wave.\r\n' };
    }
    
    // Wave at specific target
    const searchTerm = args.join(' ');
    const targetPlayer = ArgParser.findPartial(searchTerm, otherPlayers, (p) => p.name);
    
    if (!targetPlayer) {
      return { success: false, message: `You don't see anyone here by that name.\r\n` };
    }
    
    // Send message to the target
    sendToPlayer(targetPlayer, `${player.name} waves at you.\r\n`);
    
    // Send message to other players in the room (not the target)
    otherPlayers.forEach(otherPlayer => {
      if (otherPlayer.name !== targetPlayer.name) {
        sendToPlayer(otherPlayer, `${player.name} waves at ${targetPlayer.name}.\r\n`);
      }
    });
    
    // Send confirmation to the player
    return { success: true, message: `You wave at ${targetPlayer.name}.\r\n` };
  }
};

