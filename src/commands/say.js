'use strict';

/**
 * Say Command
 * Allows players to speak in their current room
 */
module.exports = {
  name: 'say',
  aliases: ['"', "'"],
  description: 'Say something to everyone in the room',
  usage: 'say <message>',
  
  execute(player, args) {
    if (args.length === 0) {
      return { success: false, message: 'Say what?' };
    }
    
    const message = args.join(' ');
    const room = player.gameEngine.getRoom(player.currentRoom);
    
    if (!room) {
      return { success: false, message: 'You are nowhere.' };
    }
    
    // Get all players in the room
    const playersInRoom = player.gameEngine.roomSystem.getPlayersInRoom(player.currentRoom);
    
    // Send message to all players in the room
    playersInRoom.forEach(playerId => {
      const targetPlayer = player.gameEngine.getPlayer(playerId);
      if (targetPlayer && targetPlayer.connection) {
        if (playerId === player.id) {
          targetPlayer.connection.send(`You say, "${message}"`);
        } else {
          targetPlayer.connection.send(`${player.name} says, "${message}"`);
        }
      }
    });
    
    return { success: true };
  }
};
