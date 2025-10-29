'use strict';

const LEVELS = require('../data/experience-levels');

class ExperienceSystem {
  constructor() {
    this.levels = LEVELS.slice().sort((a, b) => a[0] - b[0]);
    this.pulseSeconds = 120; // absorption pulse cadence used by GameEngine
  }

  // Returns { level, nextLevel, nextLevelTotal }
  getLevelForTotalExp(totalExp) {
    if (!Number.isFinite(totalExp) || totalExp < 0) totalExp = 0;
    let level = 0;
    for (const [lvl, req] of this.levels) {
      if (totalExp >= req) level = lvl; else break;
    }
    let idx = this.levels.findIndex(([lvl]) => lvl === level);
    let next = null;
    if (level === 0) {
      // Below first threshold: next is the first level entry
      next = this.levels[0] || null;
    } else if (idx >= 0 && idx + 1 < this.levels.length) {
      next = this.levels[idx + 1];
    }
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

  // Determine location category and node status
  getLocationContext(player, room) {
    const areaId = room?.areaId || '';
    const meta = room?.metadata || {};
    const isSuperNode = meta.superNode === true || meta.node === 'super';
    const isOnNode = isSuperNode || meta.onNode === true || meta.node === true;
    const isTown = /town/i.test(areaId) || meta.isTown === true;
    let category = 'other';
    if (isOnNode) category = 'on-node';
    else if (isTown) category = 'in-town';
    return { category, isOnNode, isSuperNode, isTown };
  }

  // Compute per-pulse absorption using provided rules
  computeAbsorbPerPulse(player, room) {
    const { category, isOnNode, isSuperNode } = this.getLocationContext(player, room);

    // Base rates
    let base = 19;
    if (category === 'on-node') base = 25;
    else if (category === 'in-town') base = 22;

    // Logic bonus component
    const { calculateStatBonus, getRawStat } = require('../utils/statBonus');
    const rawLOG = getRawStat(player, 'logic');
    const logicBonus = calculateStatBonus(rawLOG, player.race, 'logic');
    let logicAdd = 0;
    if (category === 'other') logicAdd = Math.trunc(logicBonus / 7);
    else logicAdd = Math.trunc(logicBonus / 5);

    // Pool size bonus: +1 per 200 field (cap +10)
    const field = Math.trunc(player?.attributes?.experience?.field || 0);
    const poolAdd = Math.min(10, Math.floor(field / 200));

    // Group bonus: +1 if in group (heuristic flags)
    const inGroup = !!(player.groupId || player.metadata?.inGroup);
    const groupAdd = inGroup ? 1 : 0;

    // Super node bonus: +2
    const superAdd = isSuperNode ? 2 : 0;

    let perPulse = base + logicAdd + poolAdd + groupAdd + superAdd;

    // Injury penalties: major head or nervous system (rank >=2) severely diminish (halve)
    try {
      const wounds = require('./WoundSystem').getAllWounds(player) || {};
      const head = wounds.HEAD || wounds.head;
      const nervous = wounds.NERVOUS_SYSTEM || wounds.nervous_system || wounds.nervous;
      if ((head && head.rank >= 2) || (nervous && nervous.rank >= 2)) {
        perPulse = Math.floor(perPulse * 0.25); // severe reduction
      }
    } catch (_) {}

    // Death's sting: multiply by fraction if present
    const sting = player?.attributes?.experience?.deathsStingRatio;
    if (typeof sting === 'number' && isFinite(sting) && sting >= 0 && sting <= 1) {
      perPulse = Math.floor(perPulse * sting);
    }

    // No negative pulses
    if (perPulse < 0) perPulse = 0;
    return perPulse;
  }

  // Apply one absorption pulse: move from field -> total, cap by remaining field and pool capacity
  applyAbsorptionPulse(player, room) {
    if (!player.attributes) player.attributes = {};
    if (!player.attributes.experience) player.attributes.experience = {};
    const total = Math.trunc(player.attributes.experience.total || 0);
    const field = Math.trunc(player.attributes.experience.field || 0);
    if (field <= 0) return { moved: 0, total, field };

    const perPulse = this.computeAbsorbPerPulse(player, room);
    const moved = Math.min(perPulse, field);
    player.attributes.experience.total = total + moved;
    player.attributes.experience.field = field - moved;
    return { moved, total: player.attributes.experience.total, field: player.attributes.experience.field };
  }
}

module.exports = ExperienceSystem;


