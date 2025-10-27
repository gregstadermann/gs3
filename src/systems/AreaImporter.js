'use strict';

const fs = require('fs').promises;
const path = require('path');
const yaml = require('js-yaml');
const databaseManager = require('../core/DatabaseManager');

/**
 * Area Importer
 * Imports areas from Gemstone3 reference format into GS3
 */
class AreaImporter {
  constructor() {
    this.db = null;
  }

  /**
   * Initialize the area importer
   */
  async initialize() {
    try {
      this.db = await databaseManager.initialize();
      console.log('Area importer initialized');
    } catch (error) {
      console.error('Error initializing area importer:', error);
      throw error;
    }
  }

  /**
   * Import an area from Gemstone3 format
   */
  async importArea(areaPath, areaName) {
    try {
      console.log(`Importing area: ${areaName} from ${areaPath}`);
      
      // Load manifest
      const manifestPath = path.join(areaPath, 'manifest.yml');
      const manifest = await this.loadYamlFile(manifestPath);
      
      // Load rooms
      const roomsPath = path.join(areaPath, 'rooms.yml');
      const rooms = await this.loadYamlFile(roomsPath);
      
      // Load items
      const itemsPath = path.join(areaPath, 'items.yml');
      const items = await this.loadYamlFile(itemsPath);
      
      // Load NPCs if they exist
      let npcs = [];
      try {
        const npcsPath = path.join(areaPath, 'npcs.yml');
        npcs = await this.loadYamlFile(npcsPath);
      } catch (error) {
        // NPCs file is optional
        console.log(`No NPCs file found for ${areaName}`);
      }
      
      // Process and save to database
      await this.saveArea(areaName, manifest, rooms, items, npcs);
      
      console.log(`Successfully imported area: ${areaName}`);
      return { rooms: rooms.length, items: items.length, npcs: npcs.length };
    } catch (error) {
      console.error(`Error importing area ${areaName}:`, error);
      throw error;
    }
  }

  /**
   * Load a YAML file
   */
  async loadYamlFile(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      return yaml.load(content);
    } catch (error) {
      console.error(`Error loading YAML file ${filePath}:`, error);
      throw error;
    }
  }

  /**
   * Save area data to database
   */
  async saveArea(areaName, manifest, rooms, items, npcs = []) {
    try {
      // Save area manifest
      const areaData = {
        id: areaName,
        name: manifest.title || areaName,
        respawnInterval: manifest.info?.respawnInterval || 60,
        instanced: manifest.instanced || false,
        rooms: rooms.length,
        items: items.length,
        npcs: npcs.length,
        importedAt: new Date().toISOString()
      };

      await this.db.collection('areas').replaceOne(
        { id: areaName },
        areaData,
        { upsert: true }
      );

      // Generate exits based on coordinates
      const roomsWithExits = this.generateExitsFromCoordinates(rooms, areaName);

      // Save rooms
      for (const room of roomsWithExits) {
        // Strip "mapped:" prefix from NPC IDs if present
        const npcs = (room.npcs || []).map(npc => {
          if (typeof npc === 'string' && npc.startsWith('mapped:')) {
            return npc.replace(/^mapped:/, '');
          }
          return npc;
        });

        const roomData = {
          id: `${areaName}:${room.id}`,
          areaId: areaName,
          roomId: room.id,
          title: room.title,
          description: room.description,
          coordinates: room.coordinates || [0, 0, 0],
          npcs: npcs,
          items: room.items || [],
          exits: room.exits || [],
          metadata: {
            importedAt: new Date().toISOString(),
            originalFormat: 'gemstone3'
          }
        };

        await this.db.collection('rooms').replaceOne(
          { id: roomData.id },
          roomData,
          { upsert: true }
        );
      }

      // Save items
      for (const item of items) {
        const itemData = {
          id: `${areaName}:${item.id}`,
          areaId: areaName,
          itemId: item.id,
          name: item.name,
          type: item.type || 'ITEM',
          roomDesc: item.roomDesc,
          keywords: item.keywords || [],
          description: item.description,
          maxItems: item.maxItems,
          metadata: {
            ...item.metadata,
            importedAt: new Date().toISOString(),
            originalFormat: 'gemstone3'
          }
        };

        await this.db.collection('items').replaceOne(
          { id: itemData.id },
          itemData,
          { upsert: true }
        );
      }

      // Save NPCs
      for (const npc of npcs) {
        const npcData = {
          id: `${areaName}:${npc.id}`,
          areaId: areaName,
          npcId: npc.id,
          name: npc.name,
          level: npc.level || 1,
          keywords: npc.keywords || [],
          description: npc.description,
          attributes: npc.attributes || {},
          behaviors: npc.behaviors || {},
          metadata: {
            importedAt: new Date().toISOString(),
            originalFormat: 'gemstone3'
          }
        };

        await this.db.collection('npcs').replaceOne(
          { id: npcData.id },
          npcData,
          { upsert: true }
        );
      }

      console.log(`Saved ${rooms.length} rooms, ${items.length} items, and ${npcs.length} NPCs for area ${areaName}`);
    } catch (error) {
      console.error(`Error saving area ${areaName}:`, error);
      throw error;
    }
  }

  /**
   * Import Wehnimer's Landing Town
   */
  async importWehnimersLanding() {
    const areaPath = '/home/greg/gemstone3/bundles/areas/wehnimers-landing-town';
    return this.importArea(areaPath, 'wehnimers-landing-town');
  }

  /**
   * Import Wehnimer's Landing Catacombs
   */
  async importWehnimersLandingCatacombs() {
    const areaPath = '/home/greg/gemstone3/bundles/areas/wehnimers-landing-catacombs';
    return this.importArea(areaPath, 'wehnimers-landing-catacombs');
  }

  /**
   * Get all imported areas
   */
  async getImportedAreas() {
    try {
      const areas = await this.db.collection('areas').find({}).toArray();
      return areas;
    } catch (error) {
      console.error('Error getting imported areas:', error);
      return [];
    }
  }

  /**
   * Get rooms for an area
   */
  async getAreaRooms(areaId) {
    try {
      const rooms = await this.db.collection('rooms').find({ areaId }).toArray();
      return rooms;
    } catch (error) {
      console.error(`Error getting rooms for area ${areaId}:`, error);
      return [];
    }
  }

  /**
   * Get items for an area
   */
  async getAreaItems(areaId) {
    try {
      const items = await this.db.collection('items').find({ areaId }).toArray();
      return items;
    } catch (error) {
      console.error(`Error getting items for area ${areaId}:`, error);
      return [];
    }
  }

  /**
   * Generate exits based on room coordinates
   * Connects rooms based on their relative positions
   */
  generateExitsFromCoordinates(rooms, areaName) {
    // Define standard directions that should be visible
    const standardDirections = new Set([
      'north', 'south', 'east', 'west',
      'northeast', 'northwest', 'southeast', 'southwest',
      'up', 'down', 'out'
    ]);

    const roomsWithExits = rooms.map(room => ({ ...room }));

    for (let i = 0; i < roomsWithExits.length; i++) {
      const room = roomsWithExits[i];
      if (!room.coordinates) continue;

      const [x, y, z] = room.coordinates;
      const exits = room.exits || [];

      // Mark existing exits as hidden if they're not standard directions
      for (const exit of exits) {
        if (!standardDirections.has(exit.direction)) {
          exit.hidden = true;
        }
      }

      // Check for adjacent rooms in each direction
      for (let j = 0; j < roomsWithExits.length; j++) {
        if (i === j) continue;

        const otherRoom = roomsWithExits[j];
        if (!otherRoom.coordinates) continue;

        const [otherX, otherY, otherZ] = otherRoom.coordinates;

        // Check if rooms are adjacent (within 1 unit in any direction)
        const dx = otherX - x;
        const dy = otherY - y;
        const dz = otherZ - z;

        let direction = null;

        // Cardinal directions
        if (dy === 1 && dx === 0 && dz === 0) direction = 'north';
        else if (dy === -1 && dx === 0 && dz === 0) direction = 'south';
        else if (dx === 1 && dy === 0 && dz === 0) direction = 'east';
        else if (dx === -1 && dy === 0 && dz === 0) direction = 'west';
        
        // Diagonal directions
        else if (dy === 1 && dx === 1 && dz === 0) direction = 'northeast';
        else if (dy === 1 && dx === -1 && dz === 0) direction = 'northwest';
        else if (dy === -1 && dx === 1 && dz === 0) direction = 'southeast';
        else if (dy === -1 && dx === -1 && dz === 0) direction = 'southwest';
        
        // Vertical
        else if (dz === 1 && dx === 0 && dy === 0) direction = 'up';
        else if (dz === -1 && dx === 0 && dy === 0) direction = 'down';

        // Add exit if direction found
        if (direction) {
          // Check if exit already exists
          const existingExit = exits.find(e => e.direction === direction);
          if (!existingExit) {
            exits.push({
              direction: direction,
              roomId: `${areaName}:${otherRoom.id}`
            });
          }
        }
      }

      room.exits = exits;
    }

    return roomsWithExits;
  }
}

module.exports = AreaImporter;
