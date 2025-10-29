'use strict';

const ExperienceSystem = require('../systems/ExperienceSystem');

function formatInt(n) {
  try { return Number(n).toLocaleString('en-US'); } catch { return String(n); }
}

module.exports = {
  name: 'experience',
  aliases: ['exp'],
  description: 'Show experience, training points, and mind state',
  usage: 'exp',

  async execute(player) {
    const expSystem = new ExperienceSystem();

    const attrs = player.attributes || {};
    const totalExp = Math.trunc(attrs.experience?.total || 0);
    const recentDeaths = Math.trunc(attrs.experience?.recentDeaths || 0);
    const deathsSting = attrs.experience?.deathsSting || 'None';
    const deeds = Math.trunc(attrs.experience?.deeds || 0);
    const ptp = Math.trunc(attrs.trainingPoints?.physical || 0);
    const mtp = Math.trunc(attrs.trainingPoints?.mental || 0);

    const capacity = expSystem.getFieldPoolCapacity(player);
    const fieldExp = Math.min(Math.trunc(attrs.experience?.field || 0), capacity);

    const { level } = expSystem.getLevelForTotalExp(totalExp);
    const expToNext = expSystem.getExpToNext(totalExp);
    const mind = expSystem.getMindStatus(fieldExp, capacity);

    let message = '';
    message += `          Level: ${formatInt(level)}                          \r\n`;
    message += `     Experience: ${formatInt(totalExp)}      Recent Deaths: ${formatInt(recentDeaths)}             \r\n`;
    message += `  Exp until lvl: ${formatInt(expToNext)}          Death's Sting: ${deathsSting}               \r\n`;
    message += `      Field Exp: ${formatInt(fieldExp)}/${formatInt(capacity)}          Deeds: ${formatInt(deeds)}                      \r\n`;
    message += `       PTPs/MTPs: ${formatInt(ptp)}/${formatInt(mtp)}         \r\n`;
    message += `    \r\n`;
    message += `${mind}\r\n`;

    return { success: true, message };
  }
};


