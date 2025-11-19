'use strict';

const { findItemWithOther } = require('../utils/keywordMatcher');
const ArgParser = require('../core/ArgParser');

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

  // Get other players in room from GameEngine.players Map (where online players are stored)
  const allPlayers = Array.from(player.gameEngine.players.values());
  const playersInRoom = allPlayers.filter(p => p.room === player.room);
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
    // Check if player is admin (admins can see all exits, including hidden ones)
    // Refresh role from DB to ensure it's current
    let isAdmin = false;
    if (player && player.gameEngine?.roomSystem?.db && player.name) {
      try {
        const freshPlayer = await player.gameEngine.roomSystem.db.collection('players').findOne({ name: player.name });
        if (freshPlayer && freshPlayer.role) {
          player.role = freshPlayer.role;
        }
      } catch (error) {
        // Fall back to in-memory role if DB lookup fails
      }
    }
    isAdmin = player && (player.role === 'admin');
    
    let exitsToShow;
    if (isAdmin) {
      // Admins see all exits, mark hidden ones
      exitsToShow = room.exits.map(exit => {
        if (exit.hidden) {
          return `${exit.direction} [hidden]`;
        }
        return exit.direction;
      });
    } else {
      // Regular players only see non-hidden exits
      exitsToShow = room.exits.filter(exit => !exit.hidden).map(exit => exit.direction);
    }
    
    if (exitsToShow.length > 0) {
      message += '\r\nObvious paths: ';
      message += exitsToShow.join(', ');
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

  // If using possessive "MY" (and not specifically looking IN), limit search to player's belongings
  if (!lookInContainer && (searchLower.startsWith('my ') || searchLower === 'my')) {
    const term = searchLower.replace(/^my\s+/, '').trim();
    const belongings = [];
    if (player.equipment?.rightHand) belongings.push(player.equipment.rightHand);
    if (player.equipment?.leftHand) belongings.push(player.equipment.leftHand);
    if (player.equipment) {
      for (const [slot, item] of Object.entries(player.equipment)) {
        if (slot !== 'rightHand' && slot !== 'leftHand' && item) belongings.push(item);
      }
    }
    if (Array.isArray(player.inventory)) belongings.push(...player.inventory);

    const found = belongings.find(it => {
      const name = (it?.name || '').toLowerCase();
      const kws = (it?.keywords || []).map(k=>k.toLowerCase());
      return term.length === 0 || name.includes(term) || kws.some(k=> k.includes(term));
    });

    if (!found) {
      return { success:false, message: "You don't see that in your belongings.\r\n" };
    }

    // Describe the found item
    const longDesc = found.longDescription || found.description;
    if (longDesc) {
      return { success:true, message: longDesc };
    }
    const shown = found.name || 'an item';
    return { success:true, message: `You see ${shown}.` };
  }

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
      // Collect item references from belongings, prioritizing hands
      const handItems = [];
      const otherItems = [];
      
      if (player.equipment?.rightHand) handItems.push(player.equipment.rightHand);
      if (player.equipment?.leftHand) handItems.push(player.equipment.leftHand);
      if (player.equipment) {
        for (const [slot, item] of Object.entries(player.equipment)) {
          if (slot !== 'rightHand' && slot !== 'leftHand' && item) otherItems.push(item);
        }
      }
      if (Array.isArray(player.inventory)) otherItems.push(...player.inventory);
      
      // Fetch items in order: hands first, then other inventory
      const handIds = handItems.map(ref => typeof ref === 'string' ? ref : (ref?.id || ref));
      const otherIds = otherItems.map(ref => typeof ref === 'string' ? ref : (ref?.id || ref));
      
      const handItemsData = await db.collection('items').find({ id: { $in: handIds } }).toArray();
      const otherItemsData = await db.collection('items').find({ id: { $in: otherIds } }).toArray();
      
      // Search hands first, then worn items, then inventory
      let container = findItemWithOther(containerTerm, handItemsData);
      if (!container) {
        // Separate worn items from inventory for prioritization
        const wornBackpacks = otherItemsData.filter(item => 
          (item.type === 'CONTAINER' || item.metadata?.container) && 
          !handItemsData.find(h => h.id === item.id)
        );
        container = findItemWithOther(containerTerm, wornBackpacks);
        if (!container) {
          container = findItemWithOther(containerTerm, otherItemsData);
        }
      }

      if (!container) {
        return { success: false, message: "You don't see that container in your belongings.\r\n" };
      }

      // Check if it's a container
      if (container.type === 'CONTAINER' || (container.metadata && container.metadata.container)) {
        const items = container.metadata?.items || [];
        if (items.length === 0) {
          return { success: true, message: `You look in ${container.name}.\r\nIt is empty.\r\n` };
        }
        
        // Fetch item names
        const itemDocs = await db.collection('items').find({ id: { $in: items } }).toArray();
        const itemNames = itemDocs.map(doc => doc.name || 'an item');
        
        let contentMsg = '';
        if (itemNames.length === 1) {
          contentMsg = itemNames[0];
        } else if (itemNames.length === 2) {
          contentMsg = `${itemNames[0]} and ${itemNames[1]}`;
        } else {
          contentMsg = itemNames.slice(0, -1).join(', ') + ', and ' + itemNames[itemNames.length - 1];
        }
        
        return { success: true, message: `You look in ${container.name}.\r\n${contentMsg}.\r\n` };
      }
      return { success: false, message: `You cannot look inside ${container.name}.\r\n` };
    }
  }

  // Search items in room using keyword matcher
  if (room.items && room.items.length > 0 && player.gameEngine && player.gameEngine.roomSystem && player.gameEngine.roomSystem.db) {
    try {
      const itemIds = room.items.map(item => typeof item === 'string' ? item : (item.id || item.name || ''));
      const items = await player.gameEngine.roomSystem.db.collection('items')
        .find({ id: { $in: itemIds } })
        .toArray();
      
      const matchedItem = findItemWithOther(searchLower, items);
      
      if (matchedItem) {
        // If "look in" and this is a container, show contents
        if (lookInContainer && (matchedItem.type === 'CONTAINER' || (matchedItem.metadata && matchedItem.metadata.container))) {
          const containerItems = matchedItem.metadata?.items || [];
          if (containerItems.length === 0) {
            return { success: true, message: `You look in ${matchedItem.name}.\r\nIt is empty.\r\n` };
          }
          
          // Fetch item names
          const itemDocs = await db.collection('items').find({ id: { $in: containerItems } }).toArray();
          const itemNames = itemDocs.map(doc => doc.name || 'an item');
          
          let contentMsg = '';
          if (itemNames.length === 1) {
            contentMsg = itemNames[0];
          } else if (itemNames.length === 2) {
            contentMsg = `${itemNames[0]} and ${itemNames[1]}`;
          } else {
            contentMsg = itemNames.slice(0, -1).join(', ') + ', and ' + itemNames[itemNames.length - 1];
          }
          
          return { success: true, message: `You look in ${matchedItem.name}.\r\n${contentMsg}.\r\n` };
        }
        
        let message = '';
        if (matchedItem.longDescription) {
          message = matchedItem.longDescription;
        } else if (matchedItem.description) {
          message = matchedItem.description;
        } else {
          const shown = matchedItem.name || matchedItem.id;
          message = `You see ${shown}.`;
        }
        
        if (matchedItem.timeUntilDecay) {
          const decayIn = Math.floor(matchedItem.timeUntilDecay / 1000);
              message += ` You estimate it will rot away in ${decayIn} seconds.`;
            }
            
            return { success: true, message: message };
        }
      } catch (error) {
      console.error('Error fetching items:', error);
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

  // Search other players in room using ArgParser for better matching
  // Get players from GameEngine.players Map (where online players are stored)
  const allPlayers = Array.from(player.gameEngine.players.values());
  const playersInRoom = allPlayers.filter(p => p.room === player.room);
  const otherPlayers = playersInRoom.filter(p => p.name !== player.name);
  
  // Use ArgParser.findPartial for better fuzzy matching (exact, starts with, contains)
  const otherPlayer = ArgParser.findPartial(searchTerm, otherPlayers, (p) => p.name);
  
  if (otherPlayer) {
    const db = player.gameEngine.roomSystem.db;
    const pronoun = otherPlayer.gender === 'male' ? 'He' : 'She';
    
    let message = `You see ${otherPlayer.name}`;
    if (otherPlayer.class) {
      message += ` the ${otherPlayer.class}`;
    }
    message += '.';

    if (otherPlayer.race) {
      message += `\r\n${pronoun} appears to be a ${otherPlayer.race}.`;
    }

    // Show what they're holding
    const heldRightId = otherPlayer.equipment?.rightHand;
    const heldLeftId = otherPlayer.equipment?.leftHand;
    
    let heldRight = null;
    let heldLeft = null;
    
    if (heldRightId && db) {
      try {
        heldRight = await db.collection('items').findOne({ id: heldRightId });
      } catch (_) {}
    }
    if (heldLeftId && db) {
      try {
        heldLeft = await db.collection('items').findOne({ id: heldLeftId });
      } catch (_) {}
    }
    
    if (heldRight || heldLeft) {
      const parts = [];
      const possessive = otherPlayer.gender === 'male' ? 'his' : 'her';
      if (heldRight) {
        parts.push((heldRight.name || 'an item') + ' in ' + possessive + ' right hand');
      }
      if (heldLeft) {
        parts.push((heldLeft.name || 'an item') + ' in ' + possessive + ' left hand');
      }
      message += `\r\n${pronoun} is holding ${parts.join(' and ')}.`;
    }
    
    // Show what they're wearing
    const wornItems = [];
    if (otherPlayer.equipment && db) {
      for (const [slot, itemId] of Object.entries(otherPlayer.equipment)) {
        if (slot !== 'rightHand' && slot !== 'leftHand' && itemId) {
          // Handle shoulder slot specially (it's an array)
          if (slot === 'shoulder') {
            let shoulderItems = itemId;
            // Convert string to array if needed (backwards compatibility)
            if (typeof shoulderItems === 'string') {
              shoulderItems = [shoulderItems];
            }
            
            if (Array.isArray(shoulderItems)) {
              for (const sid of shoulderItems) {
                if (sid && typeof sid === 'string') {
                  try {
                    const item = await db.collection('items').findOne({ id: sid });
                    if (item) {
                      wornItems.push(item.name || sid);
                    }
                  } catch (_) {}
                }
              }
            }
            continue;
          }
          
          // Try to fetch item name
          let itemName = itemId;
          if (typeof itemId === 'string') {
            try {
              const item = await db.collection('items').findOne({ id: itemId });
              if (item) itemName = item.name || itemId;
            } catch (_) {}
          }
          wornItems.push(itemName);
        }
      }
    }
    
    if (wornItems.length > 0) {
      message += `\r\n${pronoun} is wearing ${wornItems.join(', ')}.`;
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
