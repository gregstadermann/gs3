'use strict';

const Enc = require('../utils/encumbrance');

module.exports = {
  name: 'encumbrance',
  aliases: ['enc'],
  description: 'Show your current encumbrance status',
  usage: 'encumbrance',

  async execute(player) {
    const bodyW = Math.round(Enc.getBodyWeight(player));
    const cap = Math.round(Enc.getUnencumberedCapacity(player));
    const carried = Math.round(await Enc.getCarriedWeight(player));
    const pct = Math.round(await Enc.getEncumbrancePercent(player));
    const msg = Enc.getEncumbranceMessage(pct);
    const lines = [];
    lines.push(`Body Weight: ${bodyW} lbs.`);
    lines.push(`Unencumbered Capacity: ${cap} lbs.`);
    lines.push(`Carried (including silvers): ${carried} lbs.`);
    lines.push(`Encumbrance: ${pct}% of body weight.`);
    lines.push(msg);
    return { success: true, message: lines.join('\r\n') + '\r\n' };
  }
};


