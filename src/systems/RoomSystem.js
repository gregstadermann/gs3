'use strict';

const fs = require('fs').promises;
const path = require('path');
const yaml = require('yaml');

/**
 * Room System
 * Manages rooms, areas, and room-related functionality
 */
class RoomSystem {
  constructor() {
    this.rooms = new Map();
    this.areas = new Map();
  }

  /**
   * Load rooms from data files
   */
  async loadRooms() {
    try {
      const roomsDir = path.join(__dirname, '../../data/rooms');
      
      // Check if rooms directory exists
      try {
        await fs.access(roomsDir);
      } catch (error) {
        // Create default rooms if directory doesn't exist
        await this.createDefaultRooms();
        return;
      }
      
      const files = await fs.readdir(roomsDir);
      
      for (const file of files) {
        if (file.endsWith('.yml') || file.endsWith('.yaml')) {
          const filePath = path.join(roomsDir, file);
          const content = await fs.readFile(filePath, 'utf8');
          const roomData = yaml.parse(content);
          
          this.loadRoomData(roomData);
        }
      }
      
      console.log(`Loaded ${this.rooms.size} rooms`);
    } catch (error) {
      console.error('Error loading rooms:', error);
      // Create default rooms as fallback
      await this.createDefaultRooms();
    }
  }

  /**
   * Create default rooms if none exist
   */
  async createDefaultRooms() {
    const defaultRooms = [
      {
        id: 'start',
        title: 'Town Square',
        description: 'You are standing in the bustling town square. The cobblestone streets are worn smooth by countless feet.',
        area: 'town',
        exits: {
          north: 'tavern',
          south: 'market'
        },
        items: ['stone fountain', 'worn bench'],
        npcs: ['town guard'],
        level: 1
      },
      {
        id: 'tavern',
        title: 'The Prancing Pony Tavern',
        description: 'The warm glow of oil lamps illuminates this cozy tavern. The smell of ale and roasted meat fills the air.',
        area: 'town',
        exits: {
          south: 'start'
        },
        items: ['wooden tables', 'fireplace'],
        npcs: ['barkeep'],
        level: 1
      },
      {
        id: 'market',
        title: 'Market District',
        description: 'This bustling marketplace is filled with colorful stalls selling everything from fresh produce to exotic spices.',
        area: 'town',
        exits: {
          north: 'start'
        },
        items: ['fruit stalls', 'spice cart'],
        npcs: ['fruit vendor'],
        level: 1
      }
    ];

    for (const room of defaultRooms) {
      this.addRoom(room);
    }

    console.log(`Created ${defaultRooms.length} default rooms`);
  }

  /**
   * Load room data from parsed YAML
   */
  loadRoomData(roomData) {
    if (Array.isArray(roomData)) {
      // Multiple rooms in one file
      roomData.forEach(room => this.addRoom(room));
    } else if (roomData.id) {
      // Single room
      this.addRoom(roomData);
    }
  }

  /**
   * Add a room to the system
   */
  addRoom(roomData) {
    const room = {
      id: roomData.id,
      title: roomData.title || 'A room',
      description: roomData.description || 'You are in a room.',
      area: roomData.area || 'default',
      exits: roomData.exits || {},
      items: roomData.items || [],
      npcs: roomData.npcs || [],
      flags: roomData.flags || {},
      level: roomData.level || 1
    };
    
    this.rooms.set(room.id, room);
    
    // Track area
    if (!this.areas.has(room.area)) {
      this.areas.set(room.area, []);
    }
    this.areas.get(room.area).push(room.id);
  }

  /**
   * Get a room by ID
   */
  getRoom(roomId) {
    return this.rooms.get(roomId);
  }

  /**
   * Get all rooms
   */
  getRooms() {
    return this.rooms;
  }

  /**
   * Get rooms in an area
   */
  getRoomsInArea(areaName) {
    return this.areas.get(areaName) || [];
  }

  /**
   * Get all areas
   */
  getAreas() {
    return this.areas;
  }

  /**
   * Move a player to a room
   */
  movePlayer(player, roomId) {
    const room = this.getRoom(roomId);
    if (!room) {
      return { success: false, message: 'That room does not exist.' };
    }

    // Remove player from current room
    if (player.currentRoom) {
      this.removePlayerFromRoom(player, player.currentRoom);
    }

    // Add player to new room
    player.currentRoom = roomId;
    this.addPlayerToRoom(player, roomId);

    return { 
      success: true, 
      room: room,
      message: `You move to ${room.title}.`
    };
  }

  /**
   * Add a player to a room
   */
  addPlayerToRoom(player, roomId) {
    const room = this.getRoom(roomId);
    if (room) {
      if (!room.players) {
        room.players = [];
      }
      room.players.push(player.id);
    }
  }

  /**
   * Remove a player from a room
   */
  removePlayerFromRoom(player, roomId) {
    const room = this.getRoom(roomId);
    if (room && room.players) {
      const index = room.players.indexOf(player.id);
      if (index > -1) {
        room.players.splice(index, 1);
      }
    }
  }

  /**
   * Get players in a room
   */
  getPlayersInRoom(roomId) {
    const room = this.getRoom(roomId);
    return room ? room.players || [] : [];
  }

  /**
   * Get room description for a player
   */
  getRoomDescription(player, roomId) {
    const room = this.getRoom(roomId);
    if (!room) {
      return 'You are nowhere.';
    }

    let description = `${room.title}\n${room.description}\n`;
    
    // Add exits
    const exits = Object.keys(room.exits);
    if (exits.length > 0) {
      description += `\nExits: ${exits.join(', ')}`;
    }
    
    // Add items
    if (room.items && room.items.length > 0) {
      description += `\n\nItems: ${room.items.join(', ')}`;
    }
    
    // Add NPCs
    if (room.npcs && room.npcs.length > 0) {
      description += `\n\nNPCs: ${room.npcs.join(', ')}`;
    }
    
    return description;
  }
}

module.exports = RoomSystem;
