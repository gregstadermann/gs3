'use strict';

const { checkRoundtime } = require('../utils/roundtimeChecker');

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
      return { success: false, message: 'Go where? Try: go north, go south, go east, go west, go gate, go door' };
    }
    
    // Check roundtime/lag
    const roundtimeCheck = checkRoundtime(player);
    if (roundtimeCheck) {
      return roundtimeCheck;
    }
    
    // Join args to support special exits like "go gate", "go door"
    // Special exits are stored as just "gate" or "door" (hidden, not in obvious paths)
    // But players type "go gate", so we need to match "go gate" -> "gate" exit
    const input = args.join(' ').toLowerCase();
    const direction = input;
    
    // For special exits, try matching without "go" prefix
    // e.g., "go gate" should match an exit named "gate"
    const specialExitName = input.startsWith('go ') ? input.substring(3).trim() : null;
    
    const room = player.gameEngine.roomSystem.getRoom(player.room);
    
    if (!room) {
      return { success: false, message: 'You are nowhere.' };
    }
    
    // Check for special exit first (e.g., "gate", "door") if input starts with "go "
    let exit = null;
    if (specialExitName) {
      exit = player.gameEngine.roomSystem.getExit(player.room, specialExitName);
    }
    
    // If no special exit found, try as regular direction
    if (!exit) {
      exit = player.gameEngine.roomSystem.getExit(player.room, direction);
    }
    
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
