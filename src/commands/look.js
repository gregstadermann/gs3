'use strict';

/**
 * Look Command
 * Allows players to look at their surroundings or examine entities
 * Based on Gemstone3-style look command
 */
const lookRoom = async (player) => {
  const room = player.gameEngine.roomSystem.getRoom(player.room);
  if (!room) {
    return { success: false, message: 'You are in a void. There is nothing here.' };
  }

  let message = `[${room.title}]\r\n`;
  message += room.description;

  // Get items in room - inline with description
  let itemDescriptions = [];
  if (room.items && room.items.length > 0) {
    // Fetch items from database to get proper descriptions
    const itemIds = room.items.map(item => typeof item === 'string' ? item : (item.id || item.name || 'an item'));
    
    if (player.gameEngine && player.gameEngine.roomSystem && player.gameEngine.roomSystem.db) {
      try {
        const items = await player.gameEngine.roomSystem.db.collection('items')
          .find({ id: { $in: itemIds } })
          .toArray();
        
        itemDescriptions = items.map(item => item.roomDesc || item.name || item.id);
      } catch (error) {
        // Fallback to IDs if database lookup fails
        itemDescriptions = itemIds;
      }
    } else {
      itemDescriptions = itemIds;
    }

    if (itemDescriptions.length > 0) {
      message += '  You also see ';
      if (itemDescriptions.length === 1) {
        message += itemDescriptions[0] + '.';
      } else if (itemDescriptions.length === 2) {
        message += itemDescriptions[0] + ' and ' + itemDescriptions[1] + '.';
      } else {
        message += itemDescriptions.slice(0, -1).join(', ') + ', and ' + itemDescriptions[itemDescriptions.length - 1] + '.';
      }
    }
  }

  // Get NPCs in room from NPC system
  let npcNames = [];
  if (player.gameEngine && player.gameEngine.npcSystem) {
    const npcsInRoom = player.gameEngine.npcSystem.getNPCsInRoom(player.room);
    npcNames = npcsInRoom.map(npc => npc.name || npc.npcId);
  }

  // Get other players in room
  const playersInRoom = player.gameEngine.roomSystem.getPlayersInRoom(player.room);
  const otherPlayers = playersInRoom.filter(p => p.name !== player.name);

  // Add "Also here:" line if there are players or NPCs
  if (otherPlayers.length > 0 || npcNames.length > 0) {
    message += '\r\nAlso here: ';
    
    let entities = [];
    otherPlayers.forEach(p => entities.push(p.name));
    entities = entities.concat(npcNames);
    
    message += entities.join(', ');
  }

  // Show exits
  if (room.exits && room.exits.length > 0) {
    const visibleExits = room.exits.filter(exit => !exit.hidden);
    if (visibleExits.length > 0) {
      message += '\r\nObvious paths: ';
      message += visibleExits.map(exit => exit.direction).join(', ');
    }
  }

  return { success: true, message: message };
};

const lookEntity = async (player, args) => {
  const room = player.gameEngine.roomSystem.getRoom(player.room);
  if (!room) {
    return { success: false, message: "You don't see anything like that here." };
  }

  const db = player.gameEngine.roomSystem.db;

  // Handle "look at X" and "look in X" syntax
  let searchTerm = args.join(' ');
  let lookInContainer = false;
  if (args.length > 1 && args[0].toLowerCase() === 'at') {
    searchTerm = args.slice(1).join(' ');
  } else if (args.length > 1 && args[0].toLowerCase() === 'in') {
    searchTerm = args.slice(1).join(' ');
    lookInContainer = true;
  }

  const searchLower = searchTerm.toLowerCase();

  // Handle "look in MY container" - search player inventory (MY as possessive filter)
  if (lookInContainer) {
    // Check for possessive pronoun "MY" or implied possession
    const isPossessive = searchLower.startsWith('my ') || searchLower.startsWith('my');
    let containerTerm = searchLower;
    let searchIn = 'room'; // default: search room items
    
    if (isPossessive) {
      containerTerm = searchLower.replace(/^my\s+/, '').trim();
      searchIn = 'player'; // MY keyword directs search to player's items
    }
    
    if (searchIn === 'player') {
      const allItems = [];
      if (player.equipment?.rightHand) allItems.push(player.equipment.rightHand);
      if (player.equipment?.leftHand) allItems.push(player.equipment.leftHand);
      if (Array.isArray(player.inventory)) allItems.push(...player.inventory);
      
      const container = allItems.find(it => {
        const name = (it.name || '').toLowerCase();
        const kws = (it.keywords || []).map(k => k.toLowerCase());
        return name.includes(containerTerm) || kws.some(k => k.includes(containerTerm));
      });

      if (!container) {
        return { success: false, message: "You don't see that container in your belongings.\r\n" };
      }

      // Check if it's a container
      if (container.type === 'CONTAINER' || (container.metadata && container.metadata.container)) {
        // TODO: Fetch items inside container from DB once storage is implemented
        // For now, all containers are empty
        return { success: true, message: `You look in ${container.name}.\r\nIt is empty.\r\n` };
      }
      return { success: false, message: `You cannot look inside ${container.name}.\r\n` };
    }
  }

  // Search items in room - fetch from database
  if (room.items && room.items.length > 0) {
    // Get item IDs from room
    const itemIds = room.items.map(item => typeof item === 'string' ? item : (item.id || item.name || ''));
    
    // Search by ID or name/keywords
    for (const itemId of itemIds) {
      // Try exact match first
      if (itemId.toLowerCase().includes(searchLower)) {
        try {
          // Fetch item data from database
          if (player.gameEngine && player.gameEngine.roomSystem && player.gameEngine.roomSystem.db) {
            const itemData = await player.gameEngine.roomSystem.db.collection('items')
              .findOne({ id: itemId });
            
            if (itemData) {
              // If "look in" and this is a container, show contents
              if (lookInContainer && (itemData.type === 'CONTAINER' || (itemData.metadata && itemData.metadata.container))) {
                // TODO: Fetch items inside container from DB once storage is implemented
                return { success: true, message: `You look in ${itemData.name}.\r\nIt is empty.\r\n` };
              }
              
              let message = '';
              if (itemData.longDescription) {
                message = itemData.longDescription;
              } else if (itemData.description) {
                message = itemData.description;
              } else {
                const shown = itemData.name || itemId;
                message = `You see ${shown}.`;
              }
              
              // Show additional item details if available
              if (itemData.timeUntilDecay) {
                const decayIn = Math.floor(itemData.timeUntilDecay / 1000);
                message += ` You estimate it will rot away in ${decayIn} seconds.`;
              }
              
              return { success: true, message: message };
            }
          }
        } catch (error) {
          console.error('Error fetching item:', error);
        }
      }
      
      // Also try searching by keywords
      try {
        if (player.gameEngine && player.gameEngine.roomSystem && player.gameEngine.roomSystem.db) {
          const itemData = await player.gameEngine.roomSystem.db.collection('items')
            .findOne({ id: itemId });
          
          if (itemData && itemData.keywords && itemData.keywords.some(kw => 
            kw.toLowerCase().includes(searchLower) || searchLower.includes(kw.toLowerCase())
          )) {
            // If "look in" and this is a container, show contents
            if (lookInContainer && (itemData.type === 'CONTAINER' || (itemData.metadata && itemData.metadata.container))) {
              // TODO: Fetch items inside container from DB once storage is implemented
              return { success: true, message: `You look in ${itemData.name}.\r\nIt is empty.\r\n` };
            }
            
            let message = '';
            if (itemData.longDescription) {
              message = itemData.longDescription;
            } else if (itemData.description) {
              message = itemData.description;
            } else {
              const shown = itemData.name || itemId;
              message = `You see ${shown}.`;
            }
            
            if (itemData.timeUntilDecay) {
              const decayIn = Math.floor(itemData.timeUntilDecay / 1000);
              message += ` You estimate it will rot away in ${decayIn} seconds.`;
            }
            
            return { success: true, message: message };
          }
        }
      } catch (error) {
        console.error('Error searching item keywords:', error);
      }
    }
  }

  // Search NPCs in room from NPC system
  if (player.gameEngine && player.gameEngine.npcSystem) {
    const npcsInRoom = player.gameEngine.npcSystem.getNPCsInRoom(player.room);
    const npc = npcsInRoom.find(npc => {
      // Check name or keywords
      const name = npc.name || npc.npcId;
      if (name.toLowerCase().includes(searchLower)) {
        return true;
      }
      // Check keywords
      if (npc.keywords && npc.keywords.some(kw => kw.toLowerCase().includes(searchLower))) {
        return true;
      }
      return false;
    });

    if (npc) {
      let message = '';
      if (npc.description) {
        message = npc.description;
      } else {
        message = `You examine ${npc.name || npc.npcId}. They seem friendly.`;
      }

      return { success: true, message: message };
    }
  }

  // Search other players in room
  const playersInRoom = player.gameEngine.roomSystem.getPlayersInRoom(player.room);
  const otherPlayer = playersInRoom.find(p => p.name.toLowerCase().includes(searchLower));
  
  if (otherPlayer && otherPlayer.name !== player.name) {
    let message = `You see ${otherPlayer.name}`;
    if (otherPlayer.class) {
      message += ` the ${otherPlayer.class}`;
    }
    message += '.';

    if (otherPlayer.race) {
      const pronoun = otherPlayer.gender === 'male' ? 'He' : 'She';
      message += `\r\n${pronoun} appears to be a ${otherPlayer.race}.`;
    }

    return { success: true, message: message };
  }

  // Search exits
  if (room.exits && room.exits.length > 0) {
    const exit = room.exits.find(exit => exit.direction.toLowerCase().includes(searchLower));
    
    if (exit) {
      const destination = player.gameEngine.roomSystem.getRoom(exit.roomId);
      const destinationTitle = destination ? destination.title : 'unknown';
      return { 
        success: true, 
        message: `You look ${exit.direction}. You can see ${destinationTitle} in that direction.` 
      };
    }
  }

  return { success: false, message: `You don't see anything like that here.` };
};

module.exports = {
  name: 'look',
  aliases: ['l'],
  description: 'Look at your surroundings or examine something',
  usage: 'look [target]',
  
  async execute(player, args) {
    if (args.length === 0) {
      // Look at current room
      return await lookRoom(player);
    }
    
    // Look at specific target
    return await lookEntity(player, args);
  }
};
