'use strict';

const fs = require('fs').promises;
const path = require('path');

/**
 * Command Manager
 * Handles command registration and execution
 */
class CommandManager {
  constructor() {
    this.commands = new Map();
    this.aliases = new Map();
  }

  /**
   * Register a command
   */
  register(commandName, commandHandler) {
    this.commands.set(commandName.toLowerCase(), commandHandler);
    
    // Register aliases if they exist
    if (commandHandler.aliases) {
      commandHandler.aliases.forEach(alias => {
        this.aliases.set(alias.toLowerCase(), commandName.toLowerCase());
      });
    }
  }

  /**
   * Execute a command
   */
  async execute(player, commandName, args = []) {
    const command = this.getCommand(commandName);
    
    if (!command) {
      console.error(`Command not found: ${commandName}`);
      return { success: false, message: `Unknown command: ${commandName}` };
    }

    try {
      // Check if player has permission to use this command
      if (command.permission && !this.hasPermission(player, command.permission)) {
        return { success: false, message: 'You do not have permission to use this command.' };
      }

      // Execute the command
      const result = await command.execute(player, args);
      
      if (!result) {
        console.error(`Command ${commandName} returned no result`);
        return { success: true };
      }
      
      return result;
    } catch (error) {
      console.error(`Error executing command ${commandName}:`, error);
      return { success: false, message: 'An error occurred while executing the command.' };
    }
  }

  /**
   * Get a command by name
   */
  getCommand(commandName) {
    const lowerName = commandName.toLowerCase();
    
    // Check direct command
    if (this.commands.has(lowerName)) {
      return this.commands.get(lowerName);
    }
    
    // Check aliases
    if (this.aliases.has(lowerName)) {
      const actualCommand = this.aliases.get(lowerName);
      return this.commands.get(actualCommand);
    }
    
    return null;
  }

  /**
   * Check if player has permission
   */
  hasPermission(player, requiredPermission) {
    // Simple permission system - can be expanded
    if (!requiredPermission) return true;
    
    const playerLevel = player.level || 1;
    const requiredLevel = requiredPermission.level || 1;
    
    return playerLevel >= requiredLevel;
  }

  /**
   * Load commands from directory
   */
  async loadCommands(commandsDir) {
    try {
      const files = await fs.readdir(commandsDir);
      
      for (const file of files) {
        if (file.endsWith('.js')) {
          const commandPath = path.join(commandsDir, file);
          const commandModule = require(commandPath);
          
          // Register the command
          if (commandModule.name && commandModule.execute) {
            this.register(commandModule.name, commandModule);
            console.log(`Loaded command: ${commandModule.name}`);
          }
        }
      }
    } catch (error) {
      console.error('Error loading commands:', error);
    }
  }

  /**
   * Find a command with fuzzy matching
   * Tries exact match first, then partial match
   * Requires at least 3 characters for abbreviation matching
   */
  findCommand(search) {
    if (!search) {
      return null;
    }

    const lowerSearch = search.toLowerCase();

    // Try exact match
    const exactMatch = this.getCommand(lowerSearch);
    if (exactMatch) {
      return lowerSearch;
    }

    // Fuzzy match requires at least 3 characters (to avoid ambiguous matches)
    if (lowerSearch.length >= 3) {
      // Try fuzzy match - starts with (commands)
      for (const [name] of this.commands) {
        if (name.startsWith(lowerSearch)) {
          return name;
        }
      }

      // Try fuzzy match - aliases
      for (const [alias, commandName] of this.aliases) {
        if (alias.startsWith(lowerSearch)) {
          return commandName;
        }
      }
    }

    return null;
  }

  /**
   * Get all available commands
   */
  getAvailableCommands(player) {
    const availableCommands = [];
    
    for (const [name, command] of this.commands) {
      if (!command.permission || this.hasPermission(player, command.permission)) {
        availableCommands.push({
          name,
          description: command.description || 'No description available',
          usage: command.usage || ''
        });
      }
    }
    
    return availableCommands;
  }
}

module.exports = CommandManager;
