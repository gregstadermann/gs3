'use strict';

/**
 * Encumbrance Service - Pure Deterministic Functions
 * Calculates body weight, capacity, and encumbrance messages
 */

const { ENCUMBRANCE } = require('../constants/encumbrance');
const races = require('../data/races.json');

/**
 * Calculate body weight based on race and stats
 * @param {string} raceKey - Race identifier (e.g., 'human', 'elf')
 * @param {number} STR - Strength stat (raw value)
 * @param {number} CON - Constitution stat (raw value)
 * @returns {number} Body weight in pounds
 */
function bodyWeight(raceKey, STR, CON) {
  const race = races[raceKey] || races['human'];
  const evenStat = (n) => n % 2 === 0 ? n : n - 1;
  const evenSTR = evenStat(STR);
  const evenCON = evenStat(CON);
  
  const weight = race.baseWeight + ((evenSTR + evenCON) * race.bodyFactor);
  
  // Clamp to 3x base max
  return Math.min(weight, race.baseWeight * 3);
}

/**
 * Calculate unencumbered capacity
 * @param {string} raceKey - Race identifier
 * @param {number} STR - Strength stat (raw value)
 * @param {Object} chest - Chest armor object (optional)
 * @param {number} chest.asg - Armor Skill Group
 * @param {number} chest.weight - Actual armor weight
 * @param {number} pfRanks - Physical Fitness skill ranks (default 0)
 * @returns {number} Unencumbered capacity in pounds
 */
function unencumberedCapacity(raceKey, STR, chest = null, pfRanks = 0) {
  const race = races[raceKey] || races['human'];
  const bodyW = bodyWeight(raceKey, STR, 50);
  const baseCap = ((STR - 20) / 200) * bodyW + (bodyW / 200);
  
  // Armor adjustment
  let armorAdj = 0;
  if (chest?.asg != null && chest?.weight != null) {
    const standardWeight = ENCUMBRANCE.armorBaseWeightByASG[chest.asg];
    if (standardWeight !== undefined) {
      armorAdj = (standardWeight - chest.weight) * (race.encumbranceFactor ?? 1.0);
    }
  }
  
  // Physical Fitness mitigation: 1 lb per 10 skill bonus
  const pfBonus = (pfRanks * 5) / ENCUMBRANCE.pfReductionRate;
  
  return Math.max(0, baseCap + armorAdj + pfBonus);
}

/**
 * Calculate encumbrance percentage
 * @param {number} bodyW - Body weight in pounds
 * @param {number} carried - Weight being carried
 * @param {number} capacity - Unencumbered capacity
 * @returns {number} Encumbrance as percentage of body weight
 */
function encumbrancePercent(bodyW, carried, capacity) {
  const over = Math.max(0, carried - capacity);
  return (over / bodyW) * 100;
}

/**
 * Get encumbrance message based on percentage
 * @param {number} percent - Encumbrance percentage
 * @returns {string} Descriptive encumbrance message
 */
function encumbranceMessage(percent) {
  for (const threshold of ENCUMBRANCE.messageThresholds) {
    if (percent <= threshold.max) {
      return threshold.message;
    }
  }
  return ENCUMBRANCE.messageThresholds[ENCUMBRANCE.messageThresholds.length - 1].message;
}

/**
 * Calculate weight of currency
 * @param {number} silvers - Amount of silver
 * @returns {number} Weight in pounds
 */
function currencyWeight(silvers) {
  return silvers / ENCUMBRANCE.silversPerPound;
}

/**
 * Normalize race key (convert display names to keys)
 * @param {string} raceName - Race name or key
 * @returns {string} Normalized race key
 */
function normalizeRaceKey(raceName) {
  if (!raceName) return 'human';
  
  // Convert to lowercase and replace spaces/hyphens with underscores
  const normalized = raceName.toLowerCase().replace(/[-\s]/g, '_');
  
  // Check if it exists in races
  if (races[normalized]) return normalized;
  
  // Fallback to human
  return 'human';
}

// Legacy wrapper functions for backward compatibility
function getBodyWeight(player) {
  const raceKey = normalizeRaceKey(player.race);
  const STR = player?.attributes?.strength?.base || 50;
  const CON = player?.attributes?.constitution?.base || 50;
  return bodyWeight(raceKey, STR, CON);
}

function getUnencumberedCapacity(player) {
  const raceKey = normalizeRaceKey(player.race);
  const STR = player?.attributes?.strength?.base || 50;
  
  // Extract chest armor info
  let chest = null;
  const chestArmor = player.equipment?.chest || player.equipment?.body;
  if (chestArmor?.metadata?.armorGroup && chestArmor?.metadata?.weight != null) {
    chest = {
      asg: chestArmor.metadata.armorGroup,
      weight: chestArmor.metadata.weight
    };
  }
  
  const pfRanks = player?.skills?.physical_fitness?.ranks || 0;
  
  return unencumberedCapacity(raceKey, STR, chest, pfRanks);
}

function getEncumbranceMessage(percent) {
  return encumbranceMessage(percent);
}

module.exports = {
  // Pure API
  bodyWeight,
  unencumberedCapacity,
  encumbrancePercent,
  encumbranceMessage,
  currencyWeight,
  normalizeRaceKey,
  
  // Legacy API (for backward compatibility)
  getBodyWeight,
  getUnencumberedCapacity,
  getEncumbranceMessage
};

