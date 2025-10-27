'use strict';

/**
 * Go Command
 * Allows players to move between rooms
 */
module.exports = {
  name: 'go',
  aliases: ['move', 'walk'],
  description: 'Move in a direction',
  usage: 'go <direction>',
  
  async execute(player, args) {
    if (args.length === 0) {
      return { success: false, message: 'Go where? Try: go north, go south, go east, go west' };
    }
    
    const direction = args[0].toLowerCase();
    const room = player.gameEngine.roomSystem.getRoom(player.room);
    
    if (!room) {
      return { success: false, message: 'You are nowhere.' };
    }
    
    // Check if the exit exists
    const exit = player.gameEngine.roomSystem.getExit(player.room, direction);
    if (!exit) {
      return { success: false, message: `You can't go ${direction} from here.` };
    }
    
    const destinationId = exit.roomId;
    const destination = player.gameEngine.roomSystem.getRoom(destinationId);
    
    if (!destination) {
      return { success: false, message: 'That exit leads nowhere.' };
    }
    
    // Move the player
    const oldRoom = player.room;
    player.room = destinationId;
    
    // Update player in database
    player.gameEngine.playerSystem.updatePlayer(player);
    
    // Get room description
    const roomDescription = await player.gameEngine.roomSystem.getRoomDescription(destinationId, player, player.gameEngine);
    
    return { 
      success: true, 
      message: roomDescription,
      roomChanged: true,
      newRoom: destinationId,
      oldRoom: oldRoom
    };
  }
};
