'use strict';

const LEVELS = require('../data/experience-levels');

class ExperienceSystem {
  constructor() {
    this.levels = LEVELS.slice().sort((a, b) => a[0] - b[0]);
  }

  // Returns { level, nextLevel, nextLevelTotal }
  getLevelForTotalExp(totalExp) {
    if (!Number.isFinite(totalExp) || totalExp < 0) totalExp = 0;
    let level = 0;
    for (const [lvl, req] of this.levels) {
      if (totalExp >= req) level = lvl; else break;
    }
    const idx = this.levels.findIndex(([lvl]) => lvl === level);
    const next = (idx >= 0 && idx + 1 < this.levels.length) ? this.levels[idx + 1] : null;
    return { level, nextLevel: next ? next[0] : null, nextLevelTotal: next ? next[1] : null };
  }

  getExpToNext(totalExp) {
    const info = this.getLevelForTotalExp(totalExp);
    if (!info.nextLevelTotal) return 0; // maxed
    return Math.max(0, info.nextLevelTotal - totalExp);
  }

  // Field experience pool capacity = 800 + LOG + DIS
  getFieldPoolCapacity(player) {
    const log = Number(player?.attributes?.stats?.LOG ?? player?.attributes?.LOG ?? 0) || 0;
    const dis = Number(player?.attributes?.stats?.DIS ?? player?.attributes?.DIS ?? 0) || 0;
    return 800 + Math.trunc(log) + Math.trunc(dis);
  }

  // Mind status based on ratio fieldExp/pool
  getMindStatus(fieldExp, capacity) {
    const r = capacity > 0 ? fieldExp / capacity : 0;
    if (r > 1.0) return 'Completely saturated';
    if (r >= 0.90) return 'You must rest.';
    if (r >= 0.75) return 'You feel numbed.';
    if (r >= 0.62) return 'You are becoming numbed.';
    if (r >= 0.50) return 'You feel muddled.';
    if (r >= 0.25) return 'Your mind is clear.';
    if (r > 0.0) return 'Your mind is fresh and clear.';
    return 'Your mind is as clear as a bell.';
  }
}

module.exports = ExperienceSystem;


