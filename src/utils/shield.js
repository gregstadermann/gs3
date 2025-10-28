'use strict';

function getShieldSpecFromItem(item) {
  if (!item || !item.metadata) return null;
  const size = (item.metadata.size || '').toString().toLowerCase();
  const type = (item.metadata.baseType || item.metadata.type || '').toString().toLowerCase();
  // Map size/type to spec
  if (size === 'small' || type.includes('kidney') || type.includes('buckler')) {
    return { base: 10, perRank: 0.2 };
  }
  if (size === 'medium' || type.includes('target') || type.includes('heater')) {
    return { base: 15, perRank: 0.25 };
  }
  if (size === 'large' || size === 'tower' || type.includes('round') || type.includes('kite') || type.includes('greatshield')) {
    return { base: 20, perRank: 0.3 };
  }
  return null;
}

function getShieldUseRanks(character) {
  // Expect skill id 'shield_use'; fall back to 'shield' if present
  const s = character?.skills;
  if (!s) return 0;
  if (s.shield_use && typeof s.shield_use.ranks === 'number') return s.shield_use.ranks;
  if (s.shield && typeof s.shield.ranks === 'number') return s.shield.ranks;
  return 0;
}

function computeShieldDS(character) {
  // DS benefit only when a shield is held in left hand
  const eq = character?.equipment || {};
  const shieldItem = eq.leftHand;
  const spec = getShieldSpecFromItem(shieldItem);
  if (!spec) return 0;
  const ranks = getShieldUseRanks(character);
  const bonus = spec.base + (ranks * spec.perRank);
  return Math.round(bonus);
}

module.exports = {
  computeShieldDS,
};


