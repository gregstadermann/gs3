'use strict';

const { checkRoundtime } = require('../utils/roundtimeChecker');
const ArgParser = require('../core/ArgParser');

/**
 * Climb Command
 * Allows players to climb certain exits (like ropes, ladders, etc.)
 * Only works on exits marked with requiresClimb: true
 */
module.exports = {
  name: 'climb',
  aliases: ['scale'],
  description: 'Climb a rope, ladder, or other climbable exit',
  usage: 'climb <direction>',
  
  async execute(player, args) {
    if (args.length === 0) {
      return { success: false, message: 'Climb what? Try: climb rope, climb ladder, climb up' };
    }
    
    // Check roundtime/lag
    const roundtimeCheck = checkRoundtime(player);
    if (roundtimeCheck) {
      return roundtimeCheck;
    }
    
    // Join args to support multi-word exits like "climb old rope", "climb oak tree"
    const input = args.join(' ').trim();
    
    const room = player.gameEngine.roomSystem.getRoom(player.room);
    
    if (!room) {
      return { success: false, message: 'You are nowhere.' };
    }
    
    // Use ArgParser.findPartial to match exits (handles partial matches like "rope" -> "old rope")
    const exits = room.exits || [];
    const exit = ArgParser.findPartial(input, exits, (exit) => exit.direction);
    
    // Fallback to getExit for backwards compatibility and case-insensitive matching
    const fallbackExit = exit || player.gameEngine.roomSystem.getExit(player.room, input);
    
    if (!fallbackExit) {
      return { success: false, message: `You can't climb ${input} from here.` };
    }
    
    // Check if this exit requires climbing
    if (!fallbackExit.requiresClimb) {
      return { 
        success: false, 
        message: `You can't climb ${fallbackExit.direction}. Try using 'go ${fallbackExit.direction}' instead.` 
      };
    }
    
    const destinationId = fallbackExit.roomId;
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


