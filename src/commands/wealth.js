'use strict';

module.exports = {
  name: 'wealth',
  aliases: [],
  description: 'Display current silvers carried',
  usage: 'wealth',

  execute(player) {
    const silver = player.attributes?.currency?.silver || 0;
    if (silver <= 0) {
      return { success: true, message: 'You have no silver with you.\r\n' };
    }
    return { success: true, message: `You have ${silver} coins with you.\r\n` };
  }
};


