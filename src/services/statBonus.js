'use strict';

/**
 * Stat Bonus Service - Pure Deterministic Functions
 * Calculates stat bonuses using the formula: ⌊(RawStat - 50)/2⌋ + RaceModifier
 */

const races = require('../data/races.json');

/**
 * Calculate stat bonus using formula: ⌊(RawStat - 50)/2⌋ + RaceModifier
 * @param {string} raceKey - Race identifier (e.g., 'human', 'elf', 'dark_elf')
 * @param {string} statName - Stat name (e.g., 'strength', 'intelligence')
 * @param {number} rawStat - Raw stat value
 * @returns {number} Calculated stat bonus
 */
function statBonus(raceKey, statName, rawStat) {
  const race = races[raceKey] || races['human'];
  const baseStat = Math.floor((rawStat - 50) / 2);
  const raceMod = race.statModifiers?.[statName] ?? 0;
  return baseStat + raceMod;
}

/**
 * Get race modifier for a specific stat
 * @param {string} raceKey - Race identifier
 * @param {string} statName - Stat name
 * @returns {number} Race modifier for the stat
 */
function raceModifier(raceKey, statName) {
  const race = races[raceKey] || races['human'];
  return race.statModifiers?.[statName] ?? 0;
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

/**
 * Get all stat bonuses for given raw stats
 * @param {string} raceKey - Race identifier
 * @param {Object} rawStats - Object with raw stat values
 * @returns {Object} Object with calculated stat bonuses
 */
function allStatBonuses(raceKey, rawStats) {
  const statNames = [
    'strength', 'constitution', 'dexterity', 'agility',
    'discipline', 'aura', 'logic', 'intelligence', 
    'wisdom', 'charisma'
  ];
  
  const bonuses = {};
  for (const statName of statNames) {
    const rawStat = rawStats[statName] ?? 50;
    bonuses[statName] = statBonus(raceKey, statName, rawStat);
  }
  
  return bonuses;
}

// Legacy wrapper functions for backward compatibility
function calculateStatBonus(rawStat, race, statName) {
  const raceKey = normalizeRaceKey(race);
  return statBonus(raceKey, statName, rawStat);
}

function getRaceBonus(race, statName) {
  const raceKey = normalizeRaceKey(race);
  return raceModifier(raceKey, statName);
}

function getAllStatBonuses(character) {
  const raceKey = normalizeRaceKey(character.race);
  const rawStats = {};
  
  const statNames = [
    'strength', 'constitution', 'dexterity', 'agility',
    'discipline', 'aura', 'logic', 'intelligence', 
    'wisdom', 'charisma'
  ];
  
  for (const statName of statNames) {
    rawStats[statName] = getRawStat(character, statName);
  }
  
  return allStatBonuses(raceKey, rawStats);
}

function getRawStat(character, statName) {
  if (!character.attributes || !character.attributes[statName]) {
    return 50; // Default value
  }
  
  const stat = character.attributes[statName];
  if (typeof stat === 'object') {
    return (stat.base || 50) + (stat.delta || 0);
  }
  
  return stat || 50;
}

module.exports = {
  // Pure API
  statBonus,
  raceModifier,
  normalizeRaceKey,
  allStatBonuses,
  
  // Legacy API (for backward compatibility)
  calculateStatBonus,
  getRaceBonus,
  getAllStatBonuses,
  getRawStat
};
