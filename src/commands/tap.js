'use strict';

const ArgParser = require('../core/ArgParser');
const { findItemWithOther } = require('../utils/keywordMatcher');

/**
 * Tap Command
 * Allows players to tap their foot, themselves, other players, items, or creatures
 * 
 * Usage:
 *   tap              - Tap your foot impatiently
 *   tap self         - Tap yourself on the chest
 *   tap <player>     - Lightly tap a player on the shoulder
 *   tap <item>       - Tap an item (shows long description)
 *   tap <creature>   - Glance at creature and tap your foot
 */
module.exports = {
  name: 'tap',
  aliases: [],
  description: 'Tap your foot, yourself, others, items, or creatures',
  usage: 'tap [target]',
  
  async execute(player, args) {
    const db = player.gameEngine.roomSystem.db;
    const room = player.gameEngine.roomSystem.getRoom(player.room);
    
    if (!room) {
      return { success: false, message: 'You are nowhere.\r\n' };
    }
    
    // Helper function to send message to a player's connection
    const sendToPlayer = (targetPlayer, message) => {
      if (!targetPlayer.connection) {
        return;
      }
      
      if (typeof targetPlayer.connection.send === 'function') {
        // WebSocket
        targetPlayer.connection.send(message);
      } else if (typeof targetPlayer.connection.write === 'function') {
        // Telnet
        targetPlayer.connection.write(message);
      }
    };
    
    // Get all players in the room
    const allPlayers = Array.from(player.gameEngine.players.values());
    const playersInRoom = allPlayers.filter(p => p.room === player.room);
    const otherPlayers = playersInRoom.filter(p => p.name !== player.name);
    
    // Case 1: No target - tap foot impatiently
    if (args.length === 0) {
      // Send to other players
      otherPlayers.forEach(targetPlayer => {
        sendToPlayer(targetPlayer, `${player.name} taps their foot impatiently.\r\n`);
      });
      
      return { success: true, message: 'You tap your foot impatiently.\r\n' };
    }
    
    const searchTerm = args.join(' ').toLowerCase();
    
    // Case 2: Self/Me - tap yourself on the chest
    if (searchTerm === 'self' || searchTerm === 'me' || searchTerm === 'myself') {
      // Send to other players
      otherPlayers.forEach(targetPlayer => {
        sendToPlayer(targetPlayer, `${player.name} taps themselves on the chest.\r\n`);
      });
      
      return { success: true, message: 'You tap yourself on the chest.\r\n' };
    }
    
    // Case 3: Player - lightly tap on the shoulder
    const targetPlayer = ArgParser.findPartial(searchTerm, otherPlayers, (p) => p.name);
    if (targetPlayer) {
      // Send to the target
      sendToPlayer(targetPlayer, `${player.name} lightly taps you on the shoulder.\r\n`);
      
      // Send to other players in the room (not the target)
      otherPlayers.forEach(otherPlayer => {
        if (otherPlayer.name !== targetPlayer.name) {
          sendToPlayer(otherPlayer, `${player.name} lightly taps ${targetPlayer.name} on the shoulder.\r\n`);
        }
      });
      
      return { success: true, message: `You lightly tap ${targetPlayer.name} on the shoulder.\r\n` };
    }
    
    // Case 4: Item - tap item and show long description
    // Search order: hands -> worn -> room
    const itemCandidates = [];
    
    // Check hands
    if (player.equipment?.rightHand && typeof player.equipment.rightHand === 'string' && db) {
      try {
        const item = await db.collection('items').findOne({ id: player.equipment.rightHand });
        if (item) itemCandidates.push(item);
      } catch (_) {}
    }
    if (player.equipment?.leftHand && typeof player.equipment.leftHand === 'string' && db) {
      try {
        const item = await db.collection('items').findOne({ id: player.equipment.leftHand });
        if (item) itemCandidates.push(item);
      } catch (_) {}
    }
    
    // Check worn items
    if (player.equipment && db) {
      for (const [slot, itemId] of Object.entries(player.equipment)) {
        if (slot !== 'rightHand' && slot !== 'leftHand' && itemId && typeof itemId === 'string') {
          try {
            const item = await db.collection('items').findOne({ id: itemId });
            if (item) itemCandidates.push(item);
          } catch (_) {}
        }
      }
    }
    
    // Check room items
    if (room.items && Array.isArray(room.items) && db) {
      const itemIds = room.items.map(item => typeof item === 'string' ? item : (item.id || item.name || ''));
      try {
        const roomItems = await db.collection('items')
          .find({ id: { $in: itemIds } })
          .toArray();
        itemCandidates.push(...roomItems);
      } catch (_) {}
    }
    
    // Find item using keyword matcher
    const foundItem = findItemWithOther(searchTerm, itemCandidates);
    if (foundItem) {
      // Send to other players
      otherPlayers.forEach(targetPlayer => {
        sendToPlayer(targetPlayer, `${player.name} taps ${foundItem.name || 'an item'}.\r\n`);
      });
      
      // Show long description to the player
      const longDesc = foundItem.longDescription || foundItem.description || `${foundItem.name || 'an item'} looks ordinary.`;
      
      return { 
        success: true, 
        message: `You tap ${foundItem.name || 'an item'}.\r\n${longDesc}\r\n` 
      };
    }
    
    // Case 5: Creature/NPC - glance at creature and tap foot
    if (player.gameEngine && player.gameEngine.npcSystem) {
      const npcsInRoom = player.gameEngine.npcSystem.getNPCsInRoom(player.room);
      const npc = npcsInRoom.find(npc => {
        const name = (npc.name || npc.npcId || '').toLowerCase();
        if (name.includes(searchTerm)) {
          return true;
        }
        if (npc.keywords && npc.keywords.some(kw => kw.toLowerCase().includes(searchTerm))) {
          return true;
        }
        return false;
      });
      
      if (npc) {
        const creatureName = npc.name || npc.npcId || 'a creature';
        
        // Send to other players
        otherPlayers.forEach(targetPlayer => {
          sendToPlayer(targetPlayer, `${player.name} glances at ${creatureName} and taps their foot impatiently.\r\n`);
        });
        
        return { 
          success: true, 
          message: `You glance at ${creatureName} and tap your foot impatiently.\r\n` 
        };
      }
    }
    
    // No match found
    return { success: false, message: `You don't see that here.\r\n` };
  }
};

