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

  // Handle "look at X" and "look in X" syntax
  let searchTerm = args.join(' ');
  let isLookIn = false;
  if (args.length > 1 && args[0].toLowerCase() === 'at') {
    searchTerm = args.slice(1).join(' ');
  } else if (args.length > 1 && args[0].toLowerCase() === 'in') {
    isLookIn = true;
    searchTerm = args.slice(1).join(' ');
  }

  const searchLower = searchTerm.toLowerCase();

  // If looking in "my" container, prefer searching player possessions first
  if (isLookIn && searchLower.startsWith('my ')) {
    const target = searchLower.replace(/^my\s+/, '');
    // Gather candidate containers: hands + wornItems (if present)
    const candidates = [];
    if (player.equipment?.rightHand) candidates.push(player.equipment.rightHand);
    if (player.equipment?.leftHand) candidates.push(player.equipment.leftHand);
    if (Array.isArray(player.wornItems)) candidates.push(...player.wornItems);
    const cont = candidates.find(it => {
      const name = (it?.name||'').toLowerCase();
      const kws = (it?.keywords||[]).map(k=>k.toLowerCase());
      const isContainer = it && (it.type === 'CONTAINER' || it?.metadata?.container === true);
      return isContainer && (name.includes(target) || kws.some(k=> k.includes(target) || target.includes(k)));
    });
    if (cont) {
      const contents = (cont.metadata && Array.isArray(cont.metadata.contents)) ? cont.metadata.contents : [];
      if (contents.length === 0) {
        return { success: true, message: `It is empty.` };
      }
      const list = contents.join(', ');
      return { success: true, message: `Inside you see ${list}.` };
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
              // If "look in" and it's a container, show contents
              const isContainer = (itemData.type === 'CONTAINER') || (itemData.metadata && itemData.metadata.container === true);
              if (isLookIn && isContainer) {
                const contents = (itemData.metadata && Array.isArray(itemData.metadata.contents)) ? itemData.metadata.contents : [];
                if (contents.length === 0) {
                  return { success: true, message: `It is empty.` };
                }
                const list = contents.join(', ');
                return { success: true, message: `Inside you see ${list}.` };
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
            // If "look in" and it's a container, show contents
            const isContainer = (itemData.type === 'CONTAINER') || (itemData.metadata && itemData.metadata.container === true);
            if (isLookIn && isContainer) {
              const contents = (itemData.metadata && Array.isArray(itemData.metadata.contents)) ? itemData.metadata.contents : [];
              if (contents.length === 0) {
                return { success: true, message: `It is empty.` };
              }
              const list = contents.join(', ');
              return { success: true, message: `Inside you see ${list}.` };
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
