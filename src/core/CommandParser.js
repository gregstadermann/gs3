'use strict';

const ArgParser = require('./ArgParser');

/**
 * Command Parser
 * Parses player input into commands with fuzzy matching and shortcuts
 */
class CommandParser {
  /**
   * Parse player input into command structure
   * @param {GameEngine} gameEngine - Game engine instance
   * @param {string} input - Player input string
   * @param {Player} player - Player object
   * @return {Object|null} Parsed command structure or null
   */
  static parse(gameEngine, input, player) {
    if (!input) {
      return null;
    }

    input = input.trim();

    const parts = input.split(' ');
    const command = parts.shift().toLowerCase();
    const args = parts;

    if (!command.length) {
      return null;
    }

    // Special case: 'l' always means look
    if (command === 'l' || command === 'look') {
      return {
        type: 'command',
        command: 'look',
        args: args
      };
    }

    // Special case: 'i' always means inventory
    if (command === 'i' || command === 'inv') {
      return {
        type: 'command',
        command: 'inventory',
        args: args
      };
    }

    // Check for movement shortcuts
    const movement = this.checkMovement(player, command);
    if (movement) {
      return {
        type: 'movement',
        direction: movement,
        args: args
      };
    }

    // Try exact command match
    const exactCommand = gameEngine.commandManager.getCommand(command);
    if (exactCommand) {
      return {
        type: 'command',
        command: command,
        args: args
      };
    }

    // Try fuzzy match
    const fuzzyMatch = gameEngine.commandManager.findCommand(command);
    if (fuzzyMatch) {
      return {
        type: 'command',
        command: fuzzyMatch,
        args: args
      };
    }

    // No match found
    return null;
  }

  /**
   * Check if input is a movement command
   * @param {Player} player - Player object
   * @param {string} command - Command string
   * @return {string|null} Direction or null
   */
  static checkMovement(player, command) {
    if (!player || !player.room) {
      return null;
    }

    const canonicalDir = ArgParser.parseDirection(command);
    if (canonicalDir) {
      // Verify the direction exists as an exit
      const room = player.gameEngine.roomSystem.getRoom(player.room);
      if (room && room.exits) {
        const exit = room.exits.find(e => e.direction === canonicalDir);
        if (exit) {
          return canonicalDir;
        }
      }
    }

    return null;
  }

  /**
   * Parse command with multiple targets
   * e.g., "give sword bob" -> [action, target1, target2]
   * @param {string} input - Full input string
   * @return {Object} Parsed structure with action and targets
   */
  static parseMultiTarget(input) {
    if (!input) {
      return null;
    }

    const parts = input.split(' ');
    if (parts.length < 3) {
      return null;
    }

    return {
      action: parts[0],
      target1: parts[1],
      target2: parts.slice(2).join(' ')
    };
  }
}

module.exports = CommandParser;

