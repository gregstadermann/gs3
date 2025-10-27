'use strict';

const EventEmitter = require('events');
const path = require('path');
const CommandManager = require('./CommandManager');
const RoomSystem = require('../systems/RoomSystemMongoDB');
const PlayerSystem = require('../systems/PlayerSystemMongoDB');
const CharacterCreation = require('../systems/CharacterCreation');
const { AccountManager } = require('../systems/AccountManager');
const ActionRecorder = require('../systems/ActionRecorder');
const DailyProcessor = require('../systems/DailyProcessor');
const NPCSystem = require('../systems/NPCSystem');

/**
 * Core Game Engine
 * Manages the game loop, systems, and overall game state
 */
class GameEngine extends EventEmitter {
  constructor() {
    super();
    this.isRunning = false;
    this.tickRate = 1000; // 1 second ticks
    this.tickCount = 0;
    
    // Set data directory
    this.dataDir = path.join(__dirname, '../../data');
    
    // Initialize systems
    this.commandManager = new CommandManager();
    this.roomSystem = new RoomSystem();
    this.playerSystem = new PlayerSystem();
    this.npcSystem = new NPCSystem();
    this.characterCreation = new CharacterCreation();
    this.accountManager = new AccountManager(this.dataDir);
    this.actionRecorder = new ActionRecorder();
    this.dailyProcessor = new DailyProcessor(this.actionRecorder);
    this.combatSystem = null; // Lazy loaded when needed
    this.npcCombatBehavior = null; // Lazy loaded when needed
    
    // Game state
    this.players = new Map();
    this.rooms = new Map();
    
    this.setupEventHandlers();
  }

  /**
   * Start the game engine
   */
  async start() {
    console.log('Starting GS3 Game Engine...');
    
    try {
      // Initialize systems
      await this.playerSystem.initialize();
      await this.accountManager.initialize();
      await this.actionRecorder.initialize();
      await this.roomSystem.initialize();
      await this.npcSystem.initialize(this.roomSystem.db); // Use existing DB connection
      
      // Start daily processing schedule
      this.dailyProcessor.startDailySchedule();
      
      // Load game data
      await this.loadGameData();
      
      // Spawn NPCs in rooms
      await this.spawnNPCs();
      
      // Start the game loop
      this.isRunning = true;
      this.gameLoop();
      
      console.log('Game Engine started successfully');
      this.emit('started');
    } catch (error) {
      console.error('Failed to start game engine:', error);
      throw error;
    }
  }

  /**
   * Stop the game engine
   */
  stop() {
    console.log('Stopping GS3 Game Engine...');
    this.isRunning = false;
    this.emit('stopped');
  }

  /**
   * Main game loop
   */
  gameLoop() {
    if (!this.isRunning) return;
    
    this.tickCount++;
    
    // Process game tick
    this.processTick();
    
    // Schedule next tick
    setTimeout(() => this.gameLoop(), this.tickRate);
  }

  /**
   * Process a single game tick
   */
  processTick() {
    // Import combat system lazily
    if (!this.combatSystem) {
      const CombatSystem = require('../systems/CombatSystem');
      this.combatSystem = new CombatSystem();
    }

    // Process roundtime for all players in combat
    for (const [playerId, player] of this.players) {
      // Update player
      this.playerSystem.updatePlayer(player);

      // Process roundtime/lag
      if (player.combatData && player.combatData.lag > 0) {
        player.combatData.lag = Math.max(0, player.combatData.lag - 1000);
      }

      // If in combat, update combat state
      if (this.combatSystem.isInCombat(player)) {
        this.combatSystem.updateCombat(player, 1000);
      }
    }

    // Import NPC combat behavior if needed
    if (!this.npcCombatBehavior && this.combatSystem) {
      const NPCCombatBehavior = require('../systems/NPCCombatBehavior');
      this.npcCombatBehavior = new NPCCombatBehavior(this.combatSystem);
    }

    // Process roundtime for NPCs in combat
    const allNPCs = this.npcSystem.getAllNPCs();
    for (const npc of allNPCs) {
      if (npc.combatData && npc.combatData.lag > 0) {
        npc.combatData.lag = Math.max(0, npc.combatData.lag - 1000);
      }

      // Check aggressive NPCs (non-combat NPCs that should attack)
      if (!this.combatSystem.isInCombat(npc) && npc.aggressive && npc.room) {
        this.npcCombatBehavior?.checkAggressiveAttack(npc);
      }

      // If NPC can act (lag expired) and is in combat, perform action
      if (npc.combatData && npc.combatData.lag === 0 && this.combatSystem.isInCombat(npc)) {
        this.npcCombatBehavior?.performCombatAction(npc);
      }
    }
    
    // Emit tick event for other systems
    this.emit('tick', this.tickCount);
  }

  /**
   * Load game data from files
   */
  async loadGameData() {
    console.log('Loading game data...');
    
    // Load rooms
    await this.roomSystem.loadRoomsFromDatabase();
    this.rooms = this.roomSystem.getAllRooms();
    
    console.log(`Loaded ${this.rooms.length} rooms`);
  }

  /**
   * Add a player to the game
   */
  addPlayer(player) {
    // Use name as id if id doesn't exist
    const playerId = player.id || player.name;
    player.id = playerId;
    this.players.set(playerId, player);
    console.log(`GameEngine: Added player ${player.name} with ID ${playerId}`);
    this.emit('playerAdded', player);
  }

  /**
   * Remove a player from the game
   */
  removePlayer(playerId) {
    const player = this.players.get(playerId);
    if (player) {
      this.players.delete(playerId);
      this.emit('playerRemoved', player);
    }
  }

  /**
   * Get a player by ID
   */
  getPlayer(playerId) {
    return this.players.get(playerId);
  }

  /**
   * Get a room by ID
   */
  getRoom(roomId) {
    return this.roomSystem.getRoom(roomId);
  }

  /**
   * Record a player action
   */
  recordAction(playerId, action, context = {}) {
    this.actionRecorder.recordAction(playerId, action, context);
  }

  /**
   * Process a command from a player
   */
  processCommand(player, command, args) {
    console.log(`GameEngine: Processing command "${command}" for player ${player.name}`);
    
    // Record the command action
    this.recordAction(player.name, 'command', {
      command: command,
      args: args,
      location: player.room
    });

    return this.commandManager.execute(player, command, args);
  }

  /**
   * Spawn NPCs in rooms
   */
  async spawnNPCs() {
    try {
      // Get all areas that have been imported
      const areas = await this.roomSystem.db.collection('areas').find({}).toArray();
      
      for (const area of areas) {
        // Get all rooms in this area
        const rooms = await this.roomSystem.db.collection('rooms').find({ areaId: area.id }).toArray();
        
        for (const room of rooms) {
          // Check if room has NPCs defined
          if (room.npcs && room.npcs.length > 0) {
            for (const npcRef of room.npcs) {
              try {
                // Extract NPC ID from object or string
                let npcId;
                if (typeof npcRef === 'string') {
                  npcId = npcRef;
                } else if (npcRef && npcRef.id) {
                  npcId = npcRef.id;
                } else {
                  console.log(`Invalid NPC reference:`, npcRef);
                  continue;
                }
                
                // Get the full NPC definition
                const npcDefinition = await this.npcSystem.getNPC(npcId);
                
                if (npcDefinition) {
                  // Spawn the NPC in this room
                  const spawnedNPC = this.npcSystem.spawnNPC(npcDefinition, room.id);
                  console.log(`Spawned ${spawnedNPC.name} (${spawnedNPC.npcId}) in room ${room.id}`);
                } else {
                  console.log(`NPC definition not found: ${npcId}`);
                }
              } catch (error) {
                console.error(`Error spawning NPC in room ${room.id}:`, error);
              }
            }
          }
        }
      }
      
      const activeNPCs = this.npcSystem.getAllNPCs();
      console.log(`Spawned ${activeNPCs.length} NPCs`);
    } catch (error) {
      console.error('Error spawning NPCs:', error);
    }
  }

  /**
   * Setup event handlers
   */
  setupEventHandlers() {
    this.on('playerAdded', (player) => {
      console.log(`Player ${player.name} joined the game`);
    });
    
    this.on('playerRemoved', (player) => {
      console.log(`Player ${player.name} left the game`);
    });
  }
}

module.exports = GameEngine;
