'use strict';

const WebSocket = require('ws');
const net = require('net');
const GameEngine = require('./core/GameEngine');
const CommandManager = require('./core/CommandManager');
const LoginFlow = require('./systems/LoginFlow');
const path = require('path');

class GameServer {
  constructor() {
    this.port = process.env.PORT || 4000;
    this.gameEngine = new GameEngine();
    this.loginFlow = new LoginFlow(this.gameEngine.accountManager, this.gameEngine.playerSystem, this.gameEngine);
    this.wss = null;
    this.connections = new Map(); // WebSocket -> player mapping
    this.telnetConnections = new Map(); // Telnet socket -> player mapping
  }

  /**
   * Start the game server
   */
  async start() {
    try {
      // Initialize the game engine
      await this.gameEngine.start();
      
      // Load commands
      await this.loadCommands();
      
      // Start WebSocket server
      this.startWebSocketServer();
      
      // Start Telnet server
      this.startTelnetServer();
      
      console.log(`GS3 Game Server started on port ${this.port} (WebSocket) and port 4001 (Telnet)`);
    } catch (error) {
      console.error('Failed to start game server:', error);
      process.exit(1);
    }
  }

  /**
   * Load all commands
   */
  async loadCommands() {
    const commandsDir = path.join(__dirname, 'commands');
    await this.gameEngine.commandManager.loadCommands(commandsDir);
  }

  /**
   * Start WebSocket server
   */
  startWebSocketServer() {
    this.wss = new WebSocket.Server({ port: this.port });
    
    this.wss.on('connection', (ws) => {
      console.log('New WebSocket connection established');
      
      ws.on('message', (data) => {
        this.handleMessage(ws, data);
      });
      
      ws.on('close', () => {
        this.handleDisconnect(ws);
      });
      
      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
      });
    });
  }

  /**
   * Start Telnet server
   */
  startTelnetServer() {
    this.telnetServer = net.createServer((socket) => {
      console.log('New Telnet connection established');
      
      // Start login process immediately for new telnet connections
      this.loginFlow.startLogin(socket);
      
      socket.on('data', (data) => {
        this.handleTelnetMessage(socket, data);
      });
      
      socket.on('close', () => {
        this.handleTelnetDisconnect(socket);
      });
      
      socket.on('error', (error) => {
        console.error('Telnet error:', error);
      });
    });

    this.telnetServer.listen(4001, () => {
      console.log('Telnet server started on port 4001');
    });
  }

  /**
   * Handle incoming messages
   */
  async handleMessage(ws, data) {
    try {
      const message = data.toString().trim();
      
      if (!message) return;
      
      // Check if player is in login process
      if (this.loginFlow.isInLogin(ws)) {
        const result = await this.loginFlow.processLoginInput(ws, message);
        
        if (result.success && result.player) {
          // Login successful, add player to game
          console.log(`WebSocket: Player logged in - ID: ${result.player.id || result.player.name}, Name: ${result.player.name}`);
          this.connections.set(ws, result.player.id || result.player.name);
          this.gameEngine.addPlayer(result.player);
          result.player.gameEngine = this.gameEngine;
          result.player.connection = ws;
          
          ws.send(result.message + '\n');
          const roomDescription = await this.gameEngine.roomSystem.getRoomDescription(result.player.room, result.player, this.gameEngine);
          ws.send(roomDescription + '\n');
        } else if (result.disconnect) {
          ws.close();
        }
        return;
      }
      
      // Check if player is in character creation mode
      if (this.gameEngine.characterCreationManager && this.gameEngine.characterCreationManager.isInCreation(ws)) {
        const result = await this.gameEngine.characterCreationManager.processInput(ws, message);
        if (result && result.message) {
          ws.send(result.message);
        }
        return;
      }
      
      // Get player
      let player = this.getPlayerByConnection(ws);
      if (!player) {
        // Start login process
        this.loginFlow.startLogin(ws);
        return;
      }
      
      // Parse command
      const parts = message.split(' ');
      const rawCommand = parts[0].toLowerCase();
      const args = parts.slice(1);
      
      // Try to find the command with fuzzy matching (requires 3+ characters)
      let command = rawCommand;
      if (rawCommand.length >= 3) {
        const fuzzyMatch = this.gameEngine.commandManager.findCommand(rawCommand);
        if (fuzzyMatch) {
          command = fuzzyMatch;
        }
      }
      
      console.log(`Player ${player.name} executing command: ${command} (from raw: ${rawCommand}) with args:`, args);
      
      // Check if it's a direction shortcut (n, s, e, w, ne, nw, se, sw, etc.)
      const direction = this.checkDirectionShortcut(player, command);
      if (direction === 'NO_EXIT') {
        ws.send('You can\'t go there.\n');
        return;
      } else if (direction) {
        // Treat as movement command
        const goCommand = this.gameEngine.commandManager.getCommand('go');
        if (goCommand) {
          const result = await goCommand.execute(player, [direction]);
          
          console.log(`Movement result:`, result);
          
          // Send response
          if (result && result.message) {
            ws.send(result.message + '\n');
          }
          
          return;
        }
      }
      
      // Execute command
      const result = await this.gameEngine.processCommand(player, command, args);
      
      console.log(`Command result:`, result);
      
      // Send response
      if (result && result.message) {
        ws.send(result.message);
      } else if (result && !result.message) {
        console.log(`Command ${command} returned result but no message`);
      }
      
      // Handle special cases
      if (result.respawn) {
        await this.handlePlayerRespawn(player);
      }
      
      if (result.disconnect) {
        this.handleDisconnect(ws);
      }
      
    } catch (error) {
      console.error('Error handling message:', error);
      ws.send('An error occurred. Please try again.');
    }
  }

  /**
   * Handle telnet messages
   */
  async handleTelnetMessage(socket, data) {
    try {
      const message = data.toString().trim();
      console.log(`Telnet: Received message: "${message}"`);
      
      if (!message) return;
      
      // Check if player is in login process
      if (this.loginFlow.isInLogin(socket)) {
        const result = await this.loginFlow.processLoginInput(socket, message);
        
        if (result.success && result.player) {
          // Login successful, add player to game
          console.log(`Telnet: Player logged in - ID: ${result.player.id}, Name: ${result.player.name}`);
          this.telnetConnections.set(socket, result.player.id);
          this.gameEngine.addPlayer(result.player);
          result.player.gameEngine = this.gameEngine;
          result.player.connection = socket;
          
          socket.write(result.message + '\r\n');
          const roomDescription = await this.gameEngine.roomSystem.getRoomDescription(result.player.room, result.player, this.gameEngine);
          socket.write(roomDescription + '\r\n');
        } else if (result.disconnect) {
          socket.end();
        }
        return;
      }
      
      // Get player
      let player = this.getPlayerByTelnetConnection(socket);
      console.log(`Telnet: Player lookup result:`, player ? player.name : 'null');
      
      if (!player) {
        console.log(`Telnet: No player found for socket, connection might have issues`);
        // Player should be in login process already
        return;
      }
      
      // Parse command
      const parts = message.split(' ');
      const rawCommand = parts[0].toLowerCase();
      const args = parts.slice(1);
      
      // Try to find the command with fuzzy matching (requires 3+ characters)
      let command = rawCommand;
      if (rawCommand.length >= 3) {
        const fuzzyMatch = this.gameEngine.commandManager.findCommand(rawCommand);
        if (fuzzyMatch) {
          command = fuzzyMatch;
        }
      }
      
      console.log(`Telnet: Player ${player.name} executing command: ${command} (from raw: ${rawCommand}) with args:`, args);
      
      // Check if it's a direction shortcut (n, s, e, w, ne, nw, se, sw, etc.)
      const direction = this.checkDirectionShortcut(player, command);
      if (direction === 'NO_EXIT') {
        socket.write('You can\'t go there.\r\n');
        return;
      } else if (direction) {
        // Treat as movement command
        const goCommand = this.gameEngine.commandManager.getCommand('go');
        if (goCommand) {
          const result = await goCommand.execute(player, [direction]);
          
          console.log(`Telnet: Movement result:`, result);
          
          // Send response
          if (result && result.message) {
            socket.write(result.message + '\r\n');
          }
          
          return;
        }
      }
      
      // Execute command
      const result = await this.gameEngine.processCommand(player, command, args);
      
      console.log(`Telnet: Command result:`, result);
      
      // Send response
      if (result && result.message) {
        socket.write(result.message + '\r\n');
      } else if (result && !result.message) {
        console.log(`Telnet: Command ${command} returned result but no message`);
      }
      
      // Handle special cases
      if (result.respawn) {
        await this.handlePlayerRespawn(player);
      }
      
      if (result.disconnect) {
        this.handleTelnetDisconnect(socket);
      }
      
    } catch (error) {
      console.error('Error handling telnet message:', error);
      socket.write('An error occurred. Please try again.\r\n');
    }
  }

  /**
   * Handle telnet disconnect
   */
  handleTelnetDisconnect(socket) {
    const player = this.getPlayerByTelnetConnection(socket);
    if (player) {
      console.log(`Player ${player.name} disconnected (telnet)`);
      this.gameEngine.removePlayer(player.id);
      this.telnetConnections.delete(socket);
    }
  }

  /**
   * Handle player disconnect
   */
  handleDisconnect(ws) {
    const player = this.getPlayerByConnection(ws);
    if (player) {
      console.log(`Player ${player.name} disconnected`);
      this.gameEngine.removePlayer(player.id);
      this.connections.delete(ws);
    }
  }

  /**
   * Get player by WebSocket connection
   */
  getPlayerByConnection(ws) {
    for (const [connection, playerId] of this.connections) {
      if (connection === ws) {
        return this.gameEngine.getPlayer(playerId);
      }
    }
    return null;
  }

  /**
   * Get player by Telnet connection
   */
  getPlayerByTelnetConnection(socket) {
    for (const [connection, playerId] of this.telnetConnections) {
      if (connection === socket) {
        return this.gameEngine.getPlayer(playerId);
      }
    }
    return null;
  }

  /**
   * Check if a command is a direction shortcut
   * Returns canonical direction if it exists, null otherwise
   */
  checkDirectionShortcut(player, command) {
    if (!player || !player.room || !player.gameEngine) {
      return null;
    }

    const room = player.gameEngine.roomSystem.getRoom(player.room);
    if (!room || !room.exits) {
      return null;
    }

    // Map common shortcuts to full directions
    const directionMap = {
      'n': 'north',
      's': 'south',
      'e': 'east',
      'w': 'west',
      'u': 'up',
      'd': 'down',
      'up': 'up',
      'down': 'down',
      'out': 'out',
      'ne': 'northeast',
      'nw': 'northwest',
      'se': 'southeast',
      'sw': 'southwest'
    };

    const canonicalDirection = directionMap[command] || command;

    // Check if this is a recognized direction shortcut
    const isDirectionShortcut = command in directionMap;

    // Check if this direction exists in the room
    const exit = room.exits.find(e => e.direction === canonicalDirection && !e.hidden);
    
    if (exit) {
      return canonicalDirection;
    }
    
    // If it's a recognized direction but no exit exists, return special marker
    if (isDirectionShortcut) {
      return 'NO_EXIT';
    }

    return null;
  }

  /**
   * Create a new telnet player
   */
  async createTelnetPlayer(socket) {
    // Create a temporary player for testing
    const player = await this.gameEngine.playerSystem.createPlayer({
      name: `Player_${Date.now()}`,
      currentRoom: 'start'
    });
    
    // Store connection
    this.telnetConnections.set(socket, player.name);
    
    // Add to game engine
    this.gameEngine.addPlayer(player);
    
    // Set up player reference to game engine and connection
    player.gameEngine = this.gameEngine;
    player.connection = socket;
    
    console.log(`New telnet player created: ${player.name}`);
    
    // Send welcome message
    socket.write('Welcome to GS3!\r\n');
    socket.write('Type "create <name> <race> <class>" to create a character\r\n');
    socket.write('Available races: human, elf, dwarf, halfling\r\n');
    socket.write('Available classes: warrior, rogue, wizard\r\n');
    socket.write('Type "look" to see your surroundings\r\n');
    
    // Send initial room description
    const roomDescription = await this.gameEngine.roomSystem.getRoomDescription(player.room, player, this.gameEngine);
    socket.write(roomDescription + '\r\n');
    
    return player;
  }

  /**
   * Handle player respawn
   */
  async handlePlayerRespawn(player) {
    const result = this.gameEngine.playerSystem.respawnPlayer(player);
    if (result.success) {
      player.connection.send(result.message);
      
      // Move player to starting room
      const roomDescription = await this.gameEngine.roomSystem.getRoomDescription(player.currentRoom, player, this.gameEngine);
      player.connection.send(roomDescription);
    }
  }

  /**
   * Stop the server
   */
  stop() {
    console.log('Stopping GS3 Game Server...');
    
    if (this.wss) {
      this.wss.close();
    }
    
    this.gameEngine.stop();
  }
}

// Start the server if this file is run directly
if (require.main === module) {
  const server = new GameServer();
  server.start();
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\nShutting down gracefully...');
    server.stop();
    process.exit(0);
  });
}

module.exports = GameServer;
