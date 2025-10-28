'use strict';

/**
 * Stat Bonus Calculator
 * Calculates stat bonuses using the formula: ⌊(RawStat - 50)/2⌋ + RaceModifier
 */

const RACE_MODIFIERS = {
  // Physical stats: STR, CON, DEX, AGI
  // Mental stats: DIS, AUR, LOG, INT, WIS, CHA
  
  human: {
    strength: 5,
    constitution: 0,
    dexterity: 0,
    agility: 0,
    discipline: 0,
    aura: 0,
    logic: 5,
    intelligence: 5,
    wisdom: 0,
    charisma: 0
  },
  
  elf: {
    strength: 0,
    constitution: 0,
    dexterity: 5,
    agility: 15,
    discipline: -15,
    aura: 5,
    logic: 0,
    intelligence: 0,
    wisdom: 0,
    charisma: 10
  },
  
  dark_elf: {
    strength: 0,
    constitution: -5,
    dexterity: 10,
    agility: 5,
    discipline: -10,
    aura: 10,
    logic: 0,
    intelligence: 5,
    wisdom: 5,
    charisma: -5
  },
  
  dwarf: {
    strength: 10,
    constitution: 15,
    dexterity: 0,
    agility: -5,
    discipline: 10,
    aura: -10,
    logic: 5,
    intelligence: 0,
    wisdom: 0,
    charisma: -10
  },
  
  giantman: {
    strength: 15,
    constitution: 10,
    dexterity: -5,
    agility: -5,
    discipline: 0,
    aura: -5,
    logic: -5,
    intelligence: 0,
    wisdom: 0,
    charisma: 5
  },
  
  halfling: {
    strength: -15,
    constitution: 10,
    dexterity: 15,
    agility: 10,
    discipline: -5,
    aura: -5,
    logic: 5,
    intelligence: 10,
    wisdom: 0,
    charisma: -5
  },
  
  half_elf: {
    strength: 0,
    constitution: 0,
    dexterity: 5,
    agility: 10,
    discipline: -5,
    aura: 0,
    logic: 0,
    intelligence: 0,
    wisdom: 0,
    charisma: 5
  }
};

/**
 * Get race bonus for a stat
 */
function getRaceBonus(race, statName) {
  const raceKey = race ? race.toLowerCase().replace(/[-\s]/g, '_') : 'human';
  const modifiers = RACE_MODIFIERS[raceKey] || RACE_MODIFIERS.human;
  return modifiers[statName] || 0;
}

/**
 * Calculate stat bonus using formula: ⌊(RawStat - 50)/2⌋ + RaceModifier
 */
function calculateStatBonus(rawStat, race, statName) {
  const baseBonus = Math.floor((rawStat - 50) / 2);
  const raceBonus = getRaceBonus(race, statName);
  return baseBonus + raceBonus;
}

/**
 * Get all stat bonuses for a character
 */
function getAllStatBonuses(character) {
  const race = character.race || 'human';
  const bonuses = {};
  
  const statNames = [
    'strength', 'constitution', 'dexterity', 'agility',
    'discipline', 'aura', 'logic', 'intelligence', 
    'wisdom', 'charisma'
  ];
  
  for (const statName of statNames) {
    const rawStat = getRawStat(character, statName);
    bonuses[statName] = calculateStatBonus(rawStat, race, statName);
  }
  
  return bonuses;
}

/**
 * Get raw stat value
 */
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
  calculateStatBonus,
  getRaceBonus,
  getAllStatBonuses,
  getRawStat
};

