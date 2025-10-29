'use strict';

// Generic level-based silver table and modifiers
// Base range per level; pick random in range
// Example: level 1 → 2..8, level N → 2N..8N
function getBaseSilverForLevel(level = 1) {
  const lvl = Math.max(1, Math.floor(level));
  const min = 2 * lvl;
  const max = 8 * lvl;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Tier modifiers for silver
// poor: -50%, low: -25%, normal: 0%, high: +50%, rich: +100%
const SILVER_TIER_MULTIPLIER = {
  none: 1.0,
  poor: 0.5,
  low: 0.75,
  normal: 1.0,
  high: 1.5,
  rich: 2.0
};

function applySilverTier(baseAmount, tier = 'normal') {
  const mult = SILVER_TIER_MULTIPLIER[String(tier || 'normal').toLowerCase()] ?? 1.0;
  return Math.max(0, Math.floor(baseAmount * mult));
}

// Gem tier configuration: drop chance and target value band
const GEM_TIER_CONFIG = {
  none: { chance: 0, min: 0, max: 0 },
  low: { chance: 0.10, min: 1, max: 100 },
  normal: { chance: 0.20, min: 50, max: 500 },
  high: { chance: 0.35, min: 250, max: 1500 },
  rare: { chance: 0.50, min: 1000, max: 5000 }
};

// Select a gem variety by approximate value band from in-memory data
const GEMS_DATA = require('./gems');

function pickGemByValueBand(minVal, maxVal) {
  const candidates = [];
  for (const fam of GEMS_DATA) {
    for (const v of fam.varieties) {
      const lo = Number.isFinite(v.valueMin) ? v.valueMin : null;
      const hi = Number.isFinite(v.valueMax) ? v.valueMax : null;
      if (lo == null && hi == null) continue;
      const avg = (Number(lo ?? hi) + Number(hi ?? lo)) / 2;
      if (!Number.isFinite(avg)) continue;
      if (avg >= minVal && avg <= maxVal) {
        candidates.push({ family: fam.name, name: v.name, average: avg, valueMin: v.valueMin, valueMax: v.valueMax });
      }
    }
  }
  if (candidates.length === 0) return null;
  return candidates[Math.floor(Math.random() * candidates.length)];
}

function maybeGenerateGemLoot(gemTier = 'none') {
  const cfg = GEM_TIER_CONFIG[String(gemTier || 'none').toLowerCase()] || GEM_TIER_CONFIG.none;
  if (cfg.chance <= 0) return null;
  if (Math.random() > cfg.chance) return null;
  const pick = pickGemByValueBand(cfg.min, cfg.max);
  if (!pick) return null;
  return {
    type: 'GEM',
    name: pick.name,
    family: pick.family,
    valueEstimate: Math.round(pick.average)
  };
}

module.exports = {
  getBaseSilverForLevel,
  applySilverTier,
  maybeGenerateGemLoot
};


