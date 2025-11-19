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
const WoundSystem = require('../systems/WoundSystem');

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

    // Experience absorption pulse counter
    this._absorbCounter = 0; // seconds
    // Health regeneration pulse counter
    this._healthPulseCounter = 0; // seconds
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

      // Process bleed damage from wounds (rank 2+ bleed)
      this.processBleedDamage(player);

      // If in combat, update combat state (this handles lag decrementing)
      if (this.combatSystem.isInCombat(player)) {
        this.combatSystem.updateCombat(player, 1000);
      } else if (player.combatData && player.combatData.lag > 0) {
        // If not in combat but has lag, decrement it (cleanup)
        this.combatSystem.tickLag(player, 1000);
      }
    }

    // Health regeneration pulses (roughly every 60 seconds / 1 minute)
    this._healthPulseCounter = (this._healthPulseCounter || 0) + 1;
    if (this._healthPulseCounter >= 60) {
      this._healthPulseCounter = 0;
      try {
        const HealthCalculation = require('../services/healthCalculation');
        for (const [, player] of this.players) {
          if (!player.attributes?.health) continue;
          
          // Skip regeneration if player is in combat (health regen typically doesn't occur during combat)
          if (this.combatSystem && this.combatSystem.isInCombat(player)) {
            continue;
          }
          
          const currentHP = player.attributes.health.current || 0;
          const maxHP = player.attributes.health.max || 100;
          
          // Only regenerate if below max HP
          if (currentHP < maxHP) {
            const regenAmount = HealthCalculation.calculateHealthRegen(player);
            const newHP = Math.min(maxHP, currentHP + regenAmount);
            
            if (newHP > currentHP) {
              player.attributes.health.current = newHP;
              // Save player if health increased (but don't save every tick to reduce DB load)
              // We'll save periodically or on important events
              this.playerSystem.updatePlayer(player);
            }
          }
        }
      } catch (e) {
        console.error('Error during health regeneration pulse:', e);
      }
    }

    // Experience absorption pulses (roughly every 120 seconds)
    this._absorbCounter += 1;
    if (this._absorbCounter >= 120) {
      this._absorbCounter = 0;
      try {
        const ExperienceSystem = require('../systems/ExperienceSystem');
        const expSystem = new ExperienceSystem();
        for (const [, player] of this.players) {
          const room = this.roomSystem.getRoom(player.room);
          const beforeField = Math.trunc(player?.attributes?.experience?.field || 0);
          if (beforeField > 0) {
            const result = expSystem.applyAbsorptionPulse(player, room);
            // Persist player if anything moved
            if (result.moved > 0) {
              this.playerSystem.updatePlayer(player);
            }
          }
        }
      } catch (e) {
        console.error('Error during experience absorption pulse:', e);
      }
    }

    // Import NPC combat behavior if needed
    if (!this.npcCombatBehavior && this.combatSystem) {
      const NPCCombatBehavior = require('../systems/NPCCombatBehavior');
      this.npcCombatBehavior = new NPCCombatBehavior(this.combatSystem, this);
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
        // Perform combat action async (don't await to avoid blocking game loop)
        this.npcCombatBehavior?.performCombatAction(npc).catch(err => {
          console.error('Error in NPC combat action:', err);
        });
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
   * Process bleed damage from wounds
   * Rank 2+ wounds cause bleeding damage over time
   */
  processBleedDamage(player) {
    if (!player.wounds || !player.wounds.wounds) {
      return;
    }

    const wounds = WoundSystem.getAllWounds(player);
    let totalBleedDamage = 0;
    const bleedWounds = [];

    // Check all wounds for bleeding (rank 2+)
    for (const location in wounds) {
      const wound = wounds[location];
      if (wound.rank >= 2) {
        // Skip if fully bandaged
        if (wound.bandaged && wound.bandageReduction >= 1.0) {
          continue;
        }
        
        // Calculate bleed damage based on wound rank
        // Rank 2: 1-2 damage per tick
        // Rank 3: 2-4 damage per tick
        let bleedAmount = wound.rank === 2 
          ? Math.floor(Math.random() * 2) + 1  // 1-2 damage
          : Math.floor(Math.random() * 3) + 2;   // 2-4 damage
        
        // Apply bandage reduction if partially bandaged
        if (wound.bandaged && wound.bandageReduction < 1.0) {
          bleedAmount = Math.floor(bleedAmount * (1 - wound.bandageReduction));
        }
        
        if (bleedAmount > 0) {
          totalBleedDamage += bleedAmount;
          bleedWounds.push({ location, rank: wound.rank });
        }
      }
    }

    if (totalBleedDamage > 0) {
      // Apply bleed damage
      const currentHealth = player.attributes?.health?.base || 100;
      const delta = player.attributes?.health?.delta || 0;
      const totalHealth = currentHealth + delta;
      
      const newHealth = Math.max(0, totalHealth - totalBleedDamage);
      
      // Update health
      if (!player.attributes) {
        player.attributes = {};
      }
      if (!player.attributes.health) {
        player.attributes.health = { base: 100, delta: 0 };
      }
      
      player.attributes.health.base = Math.min(100, newHealth);
      player.attributes.health.delta = 0;
      
      // Check if player died from bleeding
      if (newHealth <= 0 && player.gameEngine) {
        // Send death message to player
        const connection = player.gameEngine.getPlayerConnection(player.id);
        if (connection && connection.send) {
          connection.send('\r\nYou have bled to death!\r\n');
        }
        
        // TODO: Handle player death
        console.log(`${player.name} has bled to death!`);
      }
    }
  }

  /**
   * Spawn NPCs in rooms
   */
  async spawnNPCs() {
    try {
      // Track NPC spawns by type for summary
      const npcCounts = new Map(); // npcId -> count
      const npcErrors = new Map(); // npcId -> error count
      let totalSpawned = 0;
      let totalErrors = 0;
      
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
                  totalErrors++;
                  continue;
                }
                
                // Get the full NPC definition
                const npcDefinition = await this.npcSystem.getNPC(npcId);
                
                if (npcDefinition) {
                  // Spawn the NPC in this room (pass gameEngine reference)
                  const spawnedNPC = this.npcSystem.spawnNPC(npcDefinition, room.id, this);
                  
                  // Track spawn count by NPC type
                  const currentCount = npcCounts.get(npcId) || 0;
                  npcCounts.set(npcId, currentCount + 1);
                  totalSpawned++;
                } else {
                  // Track missing NPC definitions
                  const errorCount = npcErrors.get(npcId) || 0;
                  npcErrors.set(npcId, errorCount + 1);
                  totalErrors++;
                }
              } catch (error) {
                totalErrors++;
                console.error(`Error spawning NPC in room ${room.id}:`, error.message);
              }
            }
          }
        }
      }
      
      // Log summary
      console.log(`\n=== NPC Spawn Summary ===`);
      console.log(`Total NPCs spawned: ${totalSpawned}`);
      
      // Group and display by NPC type
      if (npcCounts.size > 0) {
        console.log(`\nNPCs by type:`);
        // Sort by count (descending) for better readability
        const sortedNPCs = Array.from(npcCounts.entries()).sort((a, b) => b[1] - a[1]);
        for (const [npcId, count] of sortedNPCs) {
          console.log(`  ${npcId}: ${count}`);
        }
      }
      
      // Log errors if any
      if (npcErrors.size > 0) {
        console.log(`\nNPCs not found (${totalErrors} total):`);
        for (const [npcId, count] of npcErrors.entries()) {
          console.log(`  ${npcId}: ${count} rooms`);
        }
      }
      
      console.log(`========================\n`);
      
      const activeNPCs = this.npcSystem.getAllNPCs();
      if (activeNPCs.length !== totalSpawned) {
        console.warn(`Warning: Active NPCs (${activeNPCs.length}) doesn't match spawned count (${totalSpawned})`);
      }
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
