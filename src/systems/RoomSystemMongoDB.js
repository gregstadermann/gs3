'use strict';

const databaseManager = require('../adapters/db/mongoClient');

/**
 * Room System (Database Version)
 * Manages rooms, areas, and room-related functionality
 */
class RoomSystem {
  constructor() {
    this.rooms = new Map(); // In-memory cache
    this.areas = new Map(); // In-memory cache
    this.db = null;
  }

  /**
   * Initialize the room system
   */
  async initialize() {
    try {
      this.db = await databaseManager.initialize();
      await this.loadRoomsFromDatabase();
      console.log('Room system initialized with database');
    } catch (error) {
      console.error('Error initializing room system:', error);
      throw error;
    }
  }

  /**
   * Load rooms from database
   */
  async loadRoomsFromDatabase() {
    try {
      // Load areas
      const areas = await this.db.collection('areas').find({}).toArray();
      for (const area of areas) {
        this.areas.set(area.id, area);
      }

      // Load rooms
      const rooms = await this.db.collection('rooms').find({}).toArray();
      for (const room of rooms) {
        this.rooms.set(room.id, room);
      }

      console.log(`Loaded ${this.areas.size} areas and ${this.rooms.size} rooms from database`);
    } catch (error) {
      console.error('Error loading rooms from database:', error);
      // Create default rooms as fallback
      await this.createDefaultRooms();
    }
  }

  /**
   * Create default rooms if none exist
   */
  async createDefaultRooms() {
    try {
      // Create default area
      const defaultArea = {
        id: 'default',
        name: 'Default Area',
        respawnInterval: 60,
        instanced: false,
        rooms: 1,
        items: 0,
        importedAt: new Date().toISOString()
      };

      await this.db.collection('areas').replaceOne(
        { id: 'default' },
        defaultArea,
        { upsert: true }
      );

      // Create default start room
      const startRoom = {
        id: 'default:start',
        areaId: 'default',
        roomId: 'start',
        title: 'Starting Room',
        description: 'You find yourself in a small, dimly lit room. This appears to be the beginning of your adventure. There are exits to the north, south, east, and west.',
        npcs: [],
        items: [],
        exits: [
          { direction: 'north', roomId: 'default:north' },
          { direction: 'south', roomId: 'default:south' },
          { direction: 'east', roomId: 'default:east' },
          { direction: 'west', roomId: 'default:west' }
        ],
        metadata: {
          importedAt: new Date().toISOString(),
          originalFormat: 'default'
        }
      };

      await this.db.collection('rooms').replaceOne(
        { id: 'default:start' },
        startRoom,
        { upsert: true }
      );

      // Add to cache
      this.areas.set('default', defaultArea);
      this.rooms.set('default:start', startRoom);

      console.log('Created default rooms');
    } catch (error) {
      console.error('Error creating default rooms:', error);
    }
  }

  /**
   * Get a room by ID
   */
  getRoom(roomId) {
    return this.rooms.get(roomId);
  }

  /**
   * Get an area by ID
   */
  getArea(areaId) {
    return this.areas.get(areaId);
  }

  /**
   * Get all rooms in an area
   */
  getRoomsInArea(areaId) {
    return Array.from(this.rooms.values()).filter(room => room.areaId === areaId);
  }

  /**
   * Get all areas
   */
  getAllAreas() {
    return Array.from(this.areas.values());
  }

  /**
   * Get all rooms
   */
  getAllRooms() {
    return Array.from(this.rooms.values());
  }

  /**
   * Get players in a specific room
   */
  getPlayersInRoom(roomId) {
    // This would need to be implemented with the player system
    // For now, return empty array
    return [];
  }

  /**
   * Get room description with players and items
   */
  async getRoomDescription(roomId, player = null, gameEngine = null) {
    const room = this.getRoom(roomId);
    if (!room) {
      return 'You are in a void. There is nothing here.';
    }

    // For admins, display the room id next to the title for easier mapping/debugging
    const isAdmin = player && (player.role === 'admin');
    const titleLine = isAdmin
      ? `[${room.title}] [ ${room.id} ]`
      : `[${room.title}]`;
    let description = `${titleLine}\r\n${room.description}`;
    
    // Suppress inline item listing to keep room descriptions concise

    // Get NPCs from NPC system if available
    let npcNames = [];
    if (gameEngine && gameEngine.npcSystem) {
      const npcsInRoom = gameEngine.npcSystem.getNPCsInRoom(roomId);
      npcNames = npcsInRoom.map(npc => npc.name || npc.npcId);
    }

    // Suppress dynamic "Also here" listing to avoid clutter in room descriptions

    // Add exits
    if (room.exits && room.exits.length > 0) {
      const visibleExits = room.exits.filter(exit => !exit.hidden);
      if (visibleExits.length > 0) {
        description += '\r\nObvious paths: ';
        description += visibleExits.map(exit => exit.direction).join(', ');
      }
    }

    return description;
  }

  /**
   * Check if a room exists
   */
  roomExists(roomId) {
    return this.rooms.has(roomId);
  }

  /**
   * Get exit information
   */
  getExit(roomId, direction) {
    const room = this.getRoom(roomId);
    if (!room || !room.exits) {
      return null;
    }

    return room.exits.find(exit => exit.direction === direction);
  }

  /**
   * Get all exits from a room
   */
  getExits(roomId) {
    const room = this.getRoom(roomId);
    return room ? room.exits || [] : [];
  }

  /**
   * Add a room to the system
   */
  async addRoom(roomData) {
    try {
      // Normalize exits: remove self-loops and duplicate directions
      if (Array.isArray(roomData.exits)) {
        const seen = new Set();
        roomData.exits = roomData.exits.filter(exit => {
          if (!exit || !exit.direction || !exit.roomId) return false;
          if (exit.roomId === roomData.id) return false; // no self-loop
          if (seen.has(exit.direction)) return false; // unique by direction
          seen.add(exit.direction);
          return true;
        });
      }
      await this.db.collection('rooms').replaceOne(
        { id: roomData.id },
        roomData,
        { upsert: true }
      );
      
      this.rooms.set(roomData.id, roomData);
      console.log(`Added room: ${roomData.id}`);
    } catch (error) {
      console.error(`Error adding room ${roomData.id}:`, error);
      throw error;
    }
  }

  /**
   * Update a room
   */
  async updateRoom(roomId, updates) {
    try {
      const room = this.getRoom(roomId);
      if (!room) {
        throw new Error(`Room ${roomId} not found`);
      }

      const updatedRoom = { ...room, ...updates };
      // Normalize exits on update as well
      if (Array.isArray(updatedRoom.exits)) {
        const seen = new Set();
        updatedRoom.exits = updatedRoom.exits.filter(exit => {
          if (!exit || !exit.direction || !exit.roomId) return false;
          if (exit.roomId === roomId) return false; // no self-loop
          if (seen.has(exit.direction)) return false; // unique by direction
          seen.add(exit.direction);
          return true;
        });
      }
      await this.db.collection('rooms').replaceOne(
        { id: roomId },
        updatedRoom
      );
      
      this.rooms.set(roomId, updatedRoom);
      console.log(`Updated room: ${roomId}`);
    } catch (error) {
      console.error(`Error updating room ${roomId}:`, error);
      throw error;
    }
  }

  /**
   * Get room statistics
   */
  async getRoomStats() {
    try {
      const totalRooms = await this.db.collection('rooms').countDocuments();
      const totalAreas = await this.db.collection('areas').countDocuments();
      
      return {
        totalRooms,
        totalAreas,
        cachedRooms: this.rooms.size,
        cachedAreas: this.areas.size
      };
    } catch (error) {
      console.error('Error getting room stats:', error);
      return { totalRooms: 0, totalAreas: 0, cachedRooms: 0, cachedAreas: 0 };
    }
  }
}

module.exports = RoomSystem;
