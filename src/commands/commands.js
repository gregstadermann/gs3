'use strict';

/**
 * Commands Command (COMMANDS)
 * Lists all available commands for the player
 * Admin players see all commands, regular players see only non-admin commands
 */
module.exports = {
  name: 'commands',
  aliases: ['help', 'cmds'],
  description: 'List all available commands',
  usage: 'commands',
  
  execute(player, args) {
    // Refresh role from database
    if (player.gameEngine && player.gameEngine.playerSystem) {
      try {
        const fresh = player.gameEngine.playerSystem.getPlayerByName(player.name);
        if (fresh && fresh.role) {
          player.role = fresh.role;
        }
      } catch (e) {
        // Ignore errors
      }
    }
    
    const isAdmin = player && (player.role === 'admin');
    const commandManager = player.gameEngine.commandManager;
    
    if (!commandManager) {
      return { success: false, message: 'Command system not available.\r\n' };
    }
    
    // Get all commands
    const allCommands = [];
    for (const [name, command] of commandManager.commands) {
      // Check if command is admin-only
      // Look for patterns: "Admin only", "(Admin only)", or starts with "Admin:"
      const descLower = command.description ? command.description.toLowerCase() : '';
      const isAdminOnly = descLower.includes('admin only') || 
                         descLower.includes('(admin only)') ||
                         descLower.startsWith('admin:');
      
      // Include command if:
      // - Player is admin (show all), OR
      // - Command is not admin-only (show to everyone)
      if (isAdmin || !isAdminOnly) {
        allCommands.push({
          name: name,
          description: command.description || 'No description',
          aliases: command.aliases || [],
          usage: command.usage || ''
        });
      }
    }
    
    // Sort commands alphabetically
    allCommands.sort((a, b) => a.name.localeCompare(b.name));
    
    // Format output
    let message = '\r\n';
    
    if (isAdmin) {
      message += '═══════════════════════════════════════════════════════════════\r\n';
      message += '  Available Commands (Admin)\r\n';
      message += '═══════════════════════════════════════════════════════════════\r\n';
    } else {
      message += '═══════════════════════════════════════════════════════════════\r\n';
      message += '  Available Commands\r\n';
      message += '═══════════════════════════════════════════════════════════════\r\n';
    }
    
    message += '\r\n';
    
    // Group commands by category (optional, but helpful)
    const adminCommands = [];
    const regularCommands = [];
    
    for (const cmd of allCommands) {
      const descLower = cmd.description.toLowerCase();
      const isAdminOnly = descLower.includes('admin only') || 
                         descLower.includes('(admin only)') ||
                         descLower.startsWith('admin:');
      if (isAdminOnly) {
        adminCommands.push(cmd);
      } else {
        regularCommands.push(cmd);
      }
    }
    
    // Display regular commands first
    if (regularCommands.length > 0) {
      message += 'General Commands:\r\n';
      message += '───────────────────────────────────────────────────────────────\r\n';
      
      for (const cmd of regularCommands) {
        message += `  ${cmd.name.padEnd(20)} - ${cmd.description}\r\n`;
        if (cmd.aliases && cmd.aliases.length > 0) {
          message += `    ${' '.repeat(20)} Aliases: ${cmd.aliases.join(', ')}\r\n`;
        }
      }
      message += '\r\n';
    }
    
    // Display admin commands if player is admin
    if (isAdmin && adminCommands.length > 0) {
      message += 'Admin Commands:\r\n';
      message += '───────────────────────────────────────────────────────────────\r\n';
      
      for (const cmd of adminCommands) {
        message += `  ${cmd.name.padEnd(20)} - ${cmd.description}\r\n`;
        if (cmd.aliases && cmd.aliases.length > 0) {
          message += `    ${' '.repeat(20)} Aliases: ${cmd.aliases.join(', ')}\r\n`;
        }
      }
      message += '\r\n';
    }
    
    message += `Total: ${allCommands.length} command${allCommands.length !== 1 ? 's' : ''} available\r\n`;
    message += '\r\n';
    message += 'Type "COMMANDS <command>" or "<command> help" for detailed usage.\r\n';
    message += '═══════════════════════════════════════════════════════════════\r\n';
    
    return { success: true, message };
  }
};

