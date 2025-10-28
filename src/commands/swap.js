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

    // Swap
    player.equipment.leftHand = right || null;
    player.equipment.rightHand = left || null;

    // Persist change if player system supports it
    try {
      if (player.gameEngine && player.gameEngine.playerSystem && player.name) {
        await player.gameEngine.playerSystem.saveCharacter(player);
      }
    } catch (e) {
      // Non-fatal if persistence fails
    }

    let msg = '';
    if (player.equipment.rightHand && player.equipment.leftHand) {
      msg = `You deftly swap ${player.equipment.rightHand.name || 'an item'} to your right hand and ${player.equipment.leftHand.name || 'an item'} to your left.\r\n`;
    } else if (player.equipment.rightHand) {
      msg = `You move ${player.equipment.rightHand.name || 'an item'} to your right hand.\r\n`;
    } else if (player.equipment.leftHand) {
      msg = `You move ${player.equipment.leftHand.name || 'an item'} to your left hand.\r\n`;
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


