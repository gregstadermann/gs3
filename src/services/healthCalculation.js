'use strict';

/**
 * Health Calculation Service
 * Calculates HP based on GS3 formulas
 */

const races = require('../data/races.json');
const { statBonus, getRawStat } = require('./statBonus');

/**
 * Race HP data
 * Based on GS3 tables:
 * - baseMax: Maximum HP at base (with CON bonus)
 * - hpGainRate: HP gained per Physical Fitness rank
 * - baseRegen: Base health regeneration per pulse
 */
const RACE_HP_DATA = {
  human: { baseMax: 150, hpGainRate: 6, baseRegen: 2 },
  elf: { baseMax: 130, hpGainRate: 5, baseRegen: 1 },
  dark_elf: { baseMax: 120, hpGainRate: 5, baseRegen: 1 },
  dwarf: { baseMax: 140, hpGainRate: 6, baseRegen: 3 },
  giantman: { baseMax: 200, hpGainRate: 7, baseRegen: 2 },
  halfling: { baseMax: 100, hpGainRate: 4, baseRegen: 3 },
  half_elf: { baseMax: 135, hpGainRate: 5, baseRegen: 2 },
  burghal_gnome: { baseMax: 90, hpGainRate: 4, baseRegen: 2 },
  forest_gnome: { baseMax: 100, hpGainRate: 4, baseRegen: 2 },
  sylvankind: { baseMax: 130, hpGainRate: 5, baseRegen: 1 },
  half_krolvin: { baseMax: 165, hpGainRate: 6, baseRegen: 2 },
  aelotoi: { baseMax: 120, hpGainRate: 5, baseRegen: 1 },
  erithian: { baseMax: 120, hpGainRate: 5, baseRegen: 2 }
};

/**
 * Calculate Base HP
 * Base HP = trunc((Strength statistic + Constitution statistic) / 10)
 * Uses actual stat values at level 0, not bonuses
 * @param {Object} character - Character object
 * @returns {number} Base HP
 */
function calculateBaseHP(character) {
  const str = getRawStat(character, 'strength');
  const con = getRawStat(character, 'constitution');
  return Math.trunc((str + con) / 10);
}

/**
 * Calculate HP per Physical Fitness rank
 * HP per PF rank = Race HP gain rate + trunc(Constitution bonus / 10)
 * @param {string} raceKey - Race identifier
 * @param {Object} character - Character object
 * @returns {number} HP gained per PF rank
 */
function calculateHPPerPFRank(raceKey, character) {
  const raceData = RACE_HP_DATA[raceKey] || RACE_HP_DATA.human;
  const conBonus = statBonus(raceKey, 'constitution', getRawStat(character, 'constitution'));
  return raceData.hpGainRate + Math.trunc(conBonus / 10);
}

/**
 * Calculate Maximum HP
 * Max HP = Base HP + (PF ranks * HP per PF rank) + Constitution bonus
 * @param {Object} character - Character object
 * @returns {number} Maximum HP
 */
function calculateMaxHP(character) {
  const raceKey = character.race || 'human';
  const normalizedRace = raceKey.toLowerCase().replace(/[-\s]/g, '_');
  const raceData = RACE_HP_DATA[normalizedRace] || RACE_HP_DATA.human;
  
  // Calculate Base HP (from STR + CON at level 0)
  const baseHP = calculateBaseHP(character);
  
  // Get Physical Fitness ranks
  const pfRanks = character.skills?.physical_fitness?.ranks || 0;
  
  // Calculate HP per PF rank
  const hpPerRank = calculateHPPerPFRank(normalizedRace, character);
  
  // Get Constitution bonus
  const conBonus = statBonus(normalizedRace, 'constitution', getRawStat(character, 'constitution'));
  
  // Calculate max HP
  const maxHP = baseHP + (pfRanks * hpPerRank) + conBonus;
  
  // The racial maximum table shows:
  // - Base: racial base max (e.g., 150 for human)
  // - +CON Bonus: baseMax + CON bonus (e.g., 175 for human)
  // - +Health Bonus: baseMax + CON bonus + 50 (e.g., 225 for human)
  // 
  // The calculated HP from PF training can exceed the base racial max.
  // Cap at: racial base max + CON bonus + 50 (for enhancive items/spells)
  // The +50 is for enhancive items/spells which we may implement later
  const racialCap = raceData.baseMax + conBonus + 50;
  
  // Return the calculated HP, but ensure it's at least baseHP
  // and capped at racial maximum (with enhancive allowance)
  return Math.max(baseHP, Math.min(maxHP, racialCap));
}

/**
 * Calculate Health Regeneration
 * Health Recovery = Base Regeneration + trunc(Physical Fitness ranks / 20) + modifiers
 * @param {Object} character - Character object
 * @returns {number} Health regenerated per pulse
 */
function calculateHealthRegen(character) {
  const raceKey = character.race || 'human';
  const normalizedRace = raceKey.toLowerCase().replace(/[-\s]/g, '_');
  const raceData = RACE_HP_DATA[normalizedRace] || RACE_HP_DATA.human;
  
  const pfRanks = character.skills?.physical_fitness?.ranks || 0;
  const baseRegen = raceData.baseRegen;
  
  return baseRegen + Math.trunc(pfRanks / 20);
}

/**
 * Recalculate and update character health
 * @param {Object} character - Character object (will be modified)
 * @returns {Object} Updated health object { current, max }
 */
function recalculateHealth(character) {
  const maxHP = calculateMaxHP(character);
  
  // Update health attributes
  if (!character.attributes) {
    character.attributes = {};
  }
  
  // Handle old health format (base/delta) or new format (current/max)
  let currentHP = maxHP;
  if (character.attributes.health) {
    if (typeof character.attributes.health.current === 'number') {
      // New format: use current HP, but cap at new max
      currentHP = Math.min(character.attributes.health.current, maxHP);
    } else if (typeof character.attributes.health.base === 'number') {
      // Old format (base/delta): assume full health at old max, convert to new max
      // If character was damaged, we can't know the exact current HP from old format,
      // so we'll set to full health (safer assumption)
      currentHP = maxHP;
    }
  }
  
  // Update to new format (current/max)
  character.attributes.health = {
    current: currentHP,
    max: maxHP
  };
  
  return character.attributes.health;
}

module.exports = {
  calculateBaseHP,
  calculateHPPerPFRank,
  calculateMaxHP,
  calculateHealthRegen,
  recalculateHealth,
  RACE_HP_DATA
};

