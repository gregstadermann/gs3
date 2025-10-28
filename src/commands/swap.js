'use strict';

const { checkRoundtime } = require('../utils/roundtimeChecker');

module.exports = {
  name: 'swap',
  aliases: [],
  description: 'Swap the items in your hands',
  usage: 'swap',

  async execute(player, args) {
    // Respect roundtime
    const rt = checkRoundtime(player);
    if (rt) return rt;

    if (!player.equipment) {
      player.equipment = {};
    }

    const left = player.equipment.leftHand || null;
    const right = player.equipment.rightHand || null;

    if (!left && !right) {
      return { success: false, message: 'You are not holding anything to swap.\r\n' };
    }

    // Fetch item names from DB
    const db = player.gameEngine.roomSystem.db;
    let leftName = 'an item';
    let rightName = 'an item';
    
    if (left) {
      try {
        const item = await db.collection('items').findOne({ id: left });
        if (item) leftName = item.name || 'an item';
      } catch (_) {}
    }
    
    if (right) {
      try {
        const item = await db.collection('items').findOne({ id: right });
        if (item) rightName = item.name || 'an item';
      } catch (_) {}
    }

    // Swap
    player.equipment.leftHand = right || null;
    player.equipment.rightHand = left || null;

    // Persist change
    try {
      await db.collection('players').updateOne(
        { _id: player._id },
        { 
          $set: { 
            'equipment.leftHand': player.equipment.leftHand,
            'equipment.rightHand': player.equipment.rightHand
          } 
        }
      );
    } catch (e) {
      // Non-fatal if persistence fails
    }

    let msg = '';
    if (player.equipment.rightHand && player.equipment.leftHand) {
      msg = `You deftly swap ${rightName} to your right hand and ${leftName} to your left.\r\n`;
    } else if (player.equipment.rightHand) {
      msg = `You move ${rightName} to your right hand.\r\n`;
    } else if (player.equipment.leftHand) {
      msg = `You move ${leftName} to your left hand.\r\n`;
    } else {
      msg = 'Your hands are now empty.\r\n';
    }

    // Add a small RT to match similar handling actions
    if (player.gameEngine && player.gameEngine.combatSystem) {
      player.gameEngine.combatSystem.addLag(player, 1000);
      msg += 'Roundtime: 1 sec.\r\n';
    }

    return { success: true, message: msg };
  }
};


