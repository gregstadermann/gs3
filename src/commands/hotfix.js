'use strict';

/**
 * Hotfix Command (Admin Only)
 * Reloads game data (rooms, items, NPCs) without restarting the server
 */
module.exports = {
  name: 'hotfix',
  aliases: ['reload'],
  description: 'Reload game data without restart (Admin only)',
  usage: 'hotfix',
  
  async execute(player, args) {
    try {
      const message = [];
      
      // Reload player data FIRST (this will update role if needed)
      message.push('Reloading player data...');
      const db = player.gameEngine.roomSystem.db;
      const playerData = await db.collection('players').findOne({ name: player.name });
      console.log(`[HOTFIX DEBUG] Loaded from DB - role: ${playerData?.role}`);
      if (playerData) {
        // Update player with fresh data - use Object.assign but also explicitly set role
        Object.assign(player, playerData);
        // Explicitly ensure role is set
        if (playerData.role) {
          player.role = playerData.role;
        }
        player.gameEngine = player.gameEngine; // Keep gameEngine reference
        message.push(`Reloaded data for ${player.name}.`);
        console.log(`[HOTFIX DEBUG] Player: ${player.name}, role after reload: ${player.role}`);
      } else {
        message.push('Player data not found in database.');
      }
      
      // NOW check if player is admin
      if (player.role !== 'admin') {
        return { 
          success: false, 
          message: 'You are not authorized to use this command.\r\n' 
        };
      }
      
      // Reload rooms
      message.push('Reloading rooms...');
      await player.gameEngine.roomSystem.loadRoomsFromDatabase();
      const rooms = player.gameEngine.roomSystem.getAllRooms();
      message.push(`Loaded ${rooms.length} rooms.`);
      
      // Reload NPCs
      message.push('Reloading NPCs...');
      
      // Get all NPCs from database
      const npcDefinitions = await db.collection('npcs').find({}).toArray();
      const npcSystem = player.gameEngine.npcSystem;
      
      // Clear existing NPCs
      npcSystem.clearAllNPCs();
      
      // Respawn NPCs in their designated rooms
      const areas = await db.collection('areas').find({}).toArray();
      let spawnedCount = 0;
      
      for (const area of areas) {
        const rooms = await db.collection('rooms').find({ areaId: area.id }).toArray();
        
        for (const room of rooms) {
          if (room.npcs && room.npcs.length > 0) {
            for (const npcRef of room.npcs) {
              try {
                let npcId;
                if (typeof npcRef === 'string') {
                  npcId = npcRef;
                } else if (npcRef && npcRef.id) {
                  npcId = npcRef.id;
                } else {
                  continue;
                }
                
                const npcDefinition = await npcSystem.getNPC(npcId);
                if (npcDefinition) {
                  npcSystem.spawnNPC(npcDefinition, room.id);
                  spawnedCount++;
                }
              } catch (error) {
                // Skip NPCs that fail to spawn
              }
            }
          }
        }
      }
      
      message.push(`Spawned ${spawnedCount} NPCs.`);
      
      message.push('Hotfix complete!');
      
      return { 
        success: true, 
        message: message.join('\r\n') + '\r\n' 
      };
    } catch (error) {
      console.error('Hotfix error:', error);
      return { 
        success: false, 
        message: `Hotfix failed: ${error.message}\r\n` 
      };
    }
  }
};

