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

    // Use stored level field, falling back to calculated level from experience
    const calculatedLevel = expSystem.getLevelForTotalExp(totalExp).level;
    const level = Math.trunc(player.level) || calculatedLevel || 0;
    const expToNext = expSystem.getExpToNext(totalExp);
    const mind = expSystem.getMindStatus(fieldExp, capacity);

    // Aligned formatting helpers
    const LEFT_INDENT = 3;            // spaces before left label
    const LEFT_LABEL_WIDTH = 12;      // width for left label text (colon aligns after this)
    const RIGHT_START_COL = 28;       // absolute column where the right label will start (0-based length of line)
    const RIGHT_LABEL_WIDTH = 16;     // width for right label text (colon aligns after this)

    const pad = (n) => ' '.repeat(Math.max(0, n));
    const leftLabel = (label) => pad(LEFT_INDENT) + label.padStart(LEFT_LABEL_WIDTH, ' ');
    const rightLabel = (label) => label.padEnd(RIGHT_LABEL_WIDTH, ' ');
    const padToColumn = (line, col) => line + pad(col - line.length);

    let message = '';
    // Row 1: Level
    {
      const left = `${leftLabel('Level')}: ${formatInt(level)}`;
      message += left + `\r\n`;
    }
    // Row 2: Experience | Recent Deaths
    {
      let line = `${leftLabel('Experience')}: ${formatInt(totalExp)}`;
      line = padToColumn(line, RIGHT_START_COL);
      line += `${rightLabel('Recent Deaths')}: ${formatInt(recentDeaths)}`;
      message += line + `\r\n`;
    }
    // Row 3: Exp until lvl | Death's Sting
    {
      let line = `${leftLabel('Exp until lvl')}: ${formatInt(expToNext)}`;
      line = padToColumn(line, RIGHT_START_COL);
      line += `${rightLabel("Death's Sting")}: ${deathsSting}`;
      message += line + `\r\n`;
    }
    // Row 4: Field Exp | Deeds
    {
      let line = `${leftLabel('Field Exp')}: ${formatInt(fieldExp)}/${formatInt(capacity)}`;
      line = padToColumn(line, RIGHT_START_COL);
      line += `${rightLabel('Deeds')}: ${formatInt(deeds)}`;
      message += line + `\r\n`;
    }
    // Row 5: PTPs/MTPs
    {
      const left = `${leftLabel('PTPs/MTPs')}: ${formatInt(ptp)}/${formatInt(mtp)}`;
      message += left + `\r\n`;
    }
    message += `\r\n`;
    message += `${mind}\r\n`;

    return { success: true, message };
  }
};


