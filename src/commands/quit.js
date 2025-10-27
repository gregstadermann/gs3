'use strict';

/**
 * Quit Command
 * Allows players to disconnect from the game
 */
module.exports = {
  name: 'quit',
  aliases: ['exit', 'disconnect', 'bye'],
  description: 'Disconnect from the game',
  usage: 'quit',

  execute(player, args) {
    if (!player || !player.connection) {
      return { success: false, message: 'No connection found.' };
    }

    // Send goodbye message
    const goodbyeMessage = `\nFarewell, ${player.name}! Thanks for playing GS3.\n`;
    
    // Send message to player
    if (player.connection.write) {
      // Telnet connection
      player.connection.write(goodbyeMessage);
      player.connection.end();
    } else if (player.connection.send) {
      // WebSocket connection
      player.connection.send(goodbyeMessage);
      player.connection.close();
    }

    // Log the disconnect
    console.log(`Player ${player.name} quit the game`);

    return { 
      success: true, 
      message: 'Disconnecting...', 
      disconnect: true 
    };
  }
};
