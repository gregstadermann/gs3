'use strict';

const Enc = require('../utils/encumbrance');

module.exports = {
  name: 'encumbrance',
  aliases: ['enc'],
  description: 'Show your current encumbrance status',
  usage: 'encumbrance',

  execute(player) {
    const bodyW = Enc.getBodyWeight(player);
    const cap = Enc.getUnencumberedCapacity(player);
    const carried = Enc.getCarriedWeight(player);
    const pct = Enc.getEncumbrancePercent(player);
    const msg = Enc.getEncumbranceMessage(pct);
    const lines = [];
    lines.push(`Body Weight: ${bodyW.toFixed(2)} lbs.`);
    lines.push(`Unencumbered Capacity: ${cap.toFixed(2)} lbs.`);
    lines.push(`Carried (including silvers): ${carried.toFixed(2)} lbs.`);
    lines.push(`Encumbrance: ${pct.toFixed(2)}% of body weight.`);
    lines.push(msg);
    return { success: true, message: lines.join('\r\n') + '\r\n' };
  }
};


