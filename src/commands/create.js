'use strict';

/**
 * Create Command (Admin Only)
 * Creates items on the fly based on base templates
 * Usage:
 *   CREATE weapon broadsword          - Create a broadsword
 *   CREATE armor chain mail           - Create chain mail
 *   CREATE CONTAINER backpack         - Create a backpack
 *   CREATE weapon broadsword HERE     - Create item in current room
 *   CREATE weapon broadsword GROUND   - Create item on ground
 */
const BASE_WEAPONS = require('../data/base-weapons');
const BASE_ARMOR = require('../data/base-armor');
const BASE_SHIELDS = require('../data/base-shields');
const BASE_CONTAINERS = require('../data/base-containers');
const itemFactory = require('../utils/itemFactory');

module.exports = {
  name: 'create',
  aliases: ['spawn'],
  description: 'Create items from base templates (Admin only)',
  usage: 'create <type> <name> [location]',
  
  async execute(player, args) {
    // Check admin access
    if (player.role !== 'admin') {
      return { 
        success: false, 
        message: 'You are not authorized to use this command.\r\n' 
      };
    }
    
    const fullArgs = args.trim();
    const parts = fullArgs.toLowerCase().split(/\s+/);
    
    if (parts.length < 2) {
      return { 
        success: false, 
        message: 'Usage: CREATE <type> <name> [HERE|GROUND]\r\nType: weapon, armor, container, shield\r\n' 
      };
    }
    
    const itemType = parts[0];
    const itemName = parts.slice(1, parts.length).join(' ');
    
    // Get base template
    let baseKey, baseDef, item;
    
    try {
      if (itemType === 'weapon') {
        baseKey = `weapon_${parts.slice(1, parts.length).join('_')}`;
        baseDef = BASE_WEAPONS[baseKey];
        
        if (!baseDef) {
          // Try partial match
          const matching = Object.keys(BASE_WEAPONS).find(k => 
            k.includes(parts[1]) || BASE_WEAPONS[k].name.toLowerCase().includes(parts.slice(1, parts.length).join(' '))
          );
          if (matching) {
            baseKey = matching;
            baseDef = BASE_WEAPONS[matching];
          }
        }
        
        if (!baseDef) {
          return { 
            success: false, 
            message: `Weapon template '${parts.slice(1).join(' ')}' not found. Use LIST WEAPONS to see available.\r\n` 
          };
        }
        
        item = itemFactory.createWeaponInstance(baseKey, baseDef);
        
      } else if (itemType === 'armor') {
        const searchName = parts.slice(1, parts.length).join(' ');
        baseKey = `armor_${searchName.replace(/\s+/g, '_')}`;
        baseDef = BASE_ARMOR[baseKey];
        
        if (!baseDef) {
          // Try partial match
          const matching = Object.entries(BASE_ARMOR).find(([k, v]) => 
            k.includes(searchName.replace(/\s+/g, '_')) || 
            v.name.toLowerCase().includes(searchName)
          );
          if (matching) {
            baseKey = matching[0];
            baseDef = matching[1];
          }
        }
        
        if (!baseDef) {
          return { 
            success: false, 
            message: `Armor template '${searchName}' not found. Use LIST ARMOR to see available.\r\n` 
          };
        }
        
        item = itemFactory.createArmorInstance(baseDef);
        
      } else if (itemType === 'shield') {
        const searchName = parts.slice(1, parts.length).join(' ');
        baseKey = `shield_${searchName.replace(/\s+/g, '_').toLowerCase()}`;
        baseDef = BASE_SHIELDS[baseKey];
        
        if (!baseDef) {
          // Try partial match
          const matching = Object.entries(BASE_SHIELDS).find(([k, v]) => 
            k.includes(searchName.replace(/\s+/g, '_').toLowerCase()) || 
            v.name.toLowerCase().includes(searchName)
          );
          if (matching) {
            baseKey = matching[0];
            baseDef = matching[1];
          }
        }
        
        if (!baseDef) {
          return { 
            success: false, 
            message: `Shield template '${searchName}' not found.\r\n` 
          };
        }
        
        // Create shield item
        const rawName = baseDef.name.toLowerCase();
        const name = itemFactory.addArticle(rawName);
        
        item = {
          id: itemFactory.makeId('shield'),
          type: 'SHIELD',
          name,
          roomDesc: name,
          keywords: rawName.split(/\s+/).filter(Boolean),
          description: name,
          metadata: baseDef,
          createdAt: new Date()
        };
        
      } else if (itemType === 'container' || itemType === 'bag') {
        const searchName = parts.slice(1, parts.length).join(' ');
        baseKey = searchName.replace(/\s+/g, '_').toLowerCase();
        baseDef = BASE_CONTAINERS[baseKey];
        
        if (!baseDef) {
          return { 
            success: false, 
            message: `Container template '${searchName}' not found.\r\n` 
          };
        }
        
        // Create container item
        const rawName = baseDef.name.toLowerCase();
        const name = itemFactory.addArticle(rawName);
        
        item = {
          id: itemFactory.makeId('container'),
          type: 'CONTAINER',
          name,
          roomDesc: name,
          keywords: baseDef.keywords || rawName.split(/\s+/).filter(Boolean),
          description: name,
          metadata: {
            ...baseDef.metadata,
            container: true
          },
          createdAt: new Date()
        };
        
      } else {
        return { 
          success: false, 
          message: `Unknown item type: ${itemType}\r\nSupported types: weapon, armor, shield, container\r\n` 
        };
      }
      
      // Save item to database
      const db = player.gameEngine.roomSystem.db;
      await db.collection('items').insertOne(item);
      
      // Place item in room or inventory
      const locationTerm = parts[parts.length - 1];
      let location = player.currentRoom;
      
      if (locationTerm === 'here' || locationTerm === 'ground' || locationTerm === 'room') {
        // Place in current room
        location = player.currentRoom;
      } else {
        // Check if we should put in player inventory
        const hasLocation = !['here', 'ground', 'room'].includes(locationTerm.toLowerCase());
        if (!hasLocation) {
          location = player.currentRoom;
        }
      }
      
      // If location is a room, add to room's items
      if (location && location !== 'inventory') {
        await db.collection('rooms').updateOne(
          { id: location },
          { $push: { items: item.id } }
        );
      }
      
      return { 
        success: true, 
        message: `Created ${item.name} (ID: ${item.id}).${location && location !== 'inventory' ? '\r\nPlaced in room.' : '\r\n'}`
      };
      
    } catch (error) {
      console.error('Create command error:', error);
      return { 
        success: false, 
        message: `Failed to create item: ${error.message}\r\n` 
      };
    }
  }
};
