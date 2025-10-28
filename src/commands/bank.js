'use strict';

module.exports = {
  name: 'bank',
  aliases: [],
  description: 'Banking services: check balance, deposit, withdraw',
  usage: 'bank [balance|deposit <amount>|withdraw <amount>]',

  async execute(player, args) {
    // Ensure in bank room (TSW bank). Require room id contains ':tsw' and 'bank', or exact id if known.
    const roomId = player.room || '';
    const inBank = typeof roomId === 'string' && (roomId.toLowerCase().includes(':tsw') || roomId.toLowerCase().includes('town square west')) && roomId.toLowerCase().includes('bank');
    if (!inBank) {
      return { success: false, message: 'You must be in the bank at Town Square West to use that.\r\n' };
    }

    if (!player.attributes) player.attributes = {};
    if (!player.attributes.currency) player.attributes.currency = { silver: 0, bank: 0 };

    const sub = (args[0] || '').toLowerCase();
    if (!sub || sub === 'balance' || sub === 'bal') {
      const onHand = player.attributes.currency.silver || 0;
      const banked = player.attributes.currency.bank || 0;
      return { success: true, message: `On hand: ${onHand} silvers. In bank: ${banked} silvers.\r\n` };
    }

    if (sub === 'deposit' || sub === 'dep') {
      const amt = parseInt(args[1], 10);
      if (isNaN(amt) || amt <= 0) return { success: false, message: 'Deposit how much?\r\n' };
      const onHand = player.attributes.currency.silver || 0;
      if (amt > onHand) return { success: false, message: "You don't have that many silvers.\r\n" };
      player.attributes.currency.silver = onHand - amt;
      player.attributes.currency.bank = (player.attributes.currency.bank || 0) + amt;
      try { const Enc = require('../utils/encumbrance'); await Enc.recalcEncumbrance(player); await player.gameEngine.playerSystem.saveCharacter(player); } catch (_) {}
      return { success: true, message: `You deposit ${amt} silvers.\r\n` };
    }

    if (sub === 'withdraw' || sub === 'wd') {
      const amt = parseInt(args[1], 10);
      if (isNaN(amt) || amt <= 0) return { success: false, message: 'Withdraw how much?\r\n' };
      const banked = player.attributes.currency.bank || 0;
      if (amt > banked) return { success: false, message: "You don't have that many silvers in the bank.\r\n" };
      player.attributes.currency.bank = banked - amt;
      player.attributes.currency.silver = (player.attributes.currency.silver || 0) + amt;
      try { const Enc = require('../utils/encumbrance'); await Enc.recalcEncumbrance(player); await player.gameEngine.playerSystem.saveCharacter(player); } catch (_) {}
      return { success: true, message: `You withdraw ${amt} silvers.\r\n` };
    }

    return { success: false, message: 'Usage: bank [balance|deposit <amount>|withdraw <amount>]\r\n' };
  }
};


