'use strict';

/**
 * Base Weapon Definitions
 * Contains DF (damage factors) and AvD (attack vs defense) for each weapon base type
 * Based on Gemstone3 weapon tables
 */

const BASE_WEAPONS = {
  'weapon_broadsword': {
    name: 'Broadsword',
    type: 'one_handed_edged',
    roundtime: 5,
    minRoundtime: 1,
    damageType: ['slash', 'puncture', 'crush'],
    strReq: 75,
    disReq: 160,
    weight: 5,
    // Damage factors by armor type (1=cloth, 5-8=leather, 9-12=scale, 13-16=chain, 17-20=plate)
    damageFactors: {
      1: 0.450,    // Cloth
      5: 0.300,    // Leather (various)
      6: 0.300,
      7: 0.300,
      8: 0.300,
      9: 0.250,    // Scale
      10: 0.250,
      11: 0.250,
      12: 0.250,
      13: 0.225,   // Chain
      14: 0.225,
      15: 0.225,
      16: 0.225,
      17: 0.200,   // Plate
      18: 0.200,
      19: 0.200,
      20: 0.200
    },
    // Attack vs Defense by armor type
    attackVsDefense: {
      1: 36,       // Cloth
      5: 36,       // Leather grades
      6: 35,
      7: 34,
      8: 33,
      9: 36,       // Scale grades
      10: 34,
      11: 32,
      12: 30,
      13: 37,      // Chain grades
      14: 33,
      15: 29,
      16: 25,
      17: 36,      // Plate grades
      18: 30,
      19: 24,
      20: 18
    }
  },
  'weapon_short_sword': {
    name: 'Short Sword',
    type: 'one_handed_edged',
    roundtime: 1.5,
    minRoundtime: 1.5,
    damageType: ['slash', 'puncture', 'crush'],
    strReq: 70,
    disReq: 185,
    damageFactors: { 1: 0.350, 5: 0.240, 6: 0.240, 7: 0.240, 8: 0.240, 9: 0.200, 10: 0.200, 11: 0.200, 12: 0.200, 13: 0.150, 14: 0.150, 15: 0.150, 16: 0.150, 17: 0.125, 18: 0.125, 19: 0.125, 20: 0.125 },
    attackVsDefense: { 1: 40, 5: 36, 6: 35, 7: 34, 8: 33, 9: 30, 10: 28, 11: 26, 12: 24, 13: 25, 14: 21, 15: 17, 16: 13, 17: 25, 18: 19, 19: 13, 20: 7 }
  },
  'weapon_dagger': {
    name: 'Dagger',
    type: 'one_handed_edged',
    roundtime: 0.5,
    minRoundtime: 1.0,
    damageType: ['slash', 'puncture'],
    strReq: 18,
    disReq: 195,
    weight: 1,
    damageFactors: { 1: 0.250, 5: 0.200, 6: 0.200, 7: 0.200, 8: 0.200, 9: 0.100, 10: 0.100, 11: 0.100, 12: 0.100, 13: 0.125, 14: 0.125, 15: 0.125, 16: 0.125, 17: 0.075, 18: 0.075, 19: 0.075, 20: 0.075 },
    attackVsDefense: { 1: 25, 5: 23, 6: 22, 7: 21, 8: 20, 9: 15, 10: 13, 11: 11, 12: 9, 13: 10, 14: 6, 15: 2, 16: -2, 17: 0, 18: -6, 19: -12, 20: -18 }
  },
  'weapon_longsword': {
    name: 'Longsword',
    type: 'one_handed_edged',
    roundtime: 2.0,
    minRoundtime: 2.0,
    damageType: ['slash', 'puncture', 'crush'],
    strReq: 65,
    disReq: 160,
    weight: 5,
    damageFactors: { 1: 0.425, 5: 0.275, 6: 0.275, 7: 0.275, 8: 0.275, 9: 0.225, 10: 0.225, 11: 0.225, 12: 0.225, 13: 0.200, 14: 0.200, 15: 0.200, 16: 0.200, 17: 0.175, 18: 0.175, 19: 0.175, 20: 0.175 },
    attackVsDefense: { 1: 41, 5: 42, 6: 41, 7: 40, 8: 39, 9: 43, 10: 41, 11: 39, 12: 37, 13: 37, 14: 33, 15: 29, 16: 25, 17: 35, 18: 29, 19: 23, 20: 17 }
  },
  'weapon_scimitar': {
    name: 'Scimitar',
    type: 'one_handed_edged',
    roundtime: 2.0,
    minRoundtime: 2.0,
    damageType: ['slash', 'puncture', 'crush'],
    strReq: 60,
    disReq: 150,
    weight: 5,
    damageFactors: { 1: 0.375, 5: 0.260, 6: 0.260, 7: 0.260, 8: 0.260, 9: 0.210, 10: 0.210, 11: 0.210, 12: 0.210, 13: 0.200, 14: 0.200, 15: 0.200, 16: 0.200, 17: 0.165, 18: 0.165, 19: 0.165, 20: 0.165 },
    attackVsDefense: { 1: 30, 5: 31, 6: 30, 7: 29, 8: 28, 9: 30, 10: 28, 11: 26, 12: 24, 13: 30, 14: 26, 15: 22, 16: 18, 17: 30, 18: 24, 19: 18, 20: 12 }
  },
  'weapon_rapier': {
    name: 'Rapier',
    type: 'one_handed_edged',
    roundtime: 1.0,
    minRoundtime: 1.5,
    damageType: ['slash', 'puncture'],
    strReq: 30,
    disReq: 100,
    weight: 3,
    damageFactors: { 1: 0.325, 5: 0.225, 6: 0.225, 7: 0.225, 8: 0.225, 9: 0.125, 10: 0.125, 11: 0.125, 12: 0.125, 13: 0.125, 14: 0.125, 15: 0.125, 16: 0.125, 17: 0.075, 18: 0.075, 19: 0.075, 20: 0.075 },
    attackVsDefense: { 1: 45, 5: 40, 6: 39, 7: 38, 8: 37, 9: 30, 10: 28, 11: 26, 12: 24, 13: 35, 14: 31, 15: 27, 16: 23, 17: 15, 18: 9, 19: 3, 20: -3 }
  },
  'weapon_falchion': {
    name: 'Falchion',
    type: 'one_handed_edged',
    roundtime: 2.5,
    minRoundtime: 2.0,
    damageType: ['slash', 'crush'],
    strReq: 75,
    disReq: 160,
    weight: 5,
    damageFactors: { 1: 0.450, 5: 0.325, 6: 0.325, 7: 0.325, 8: 0.325, 9: 0.250, 10: 0.250, 11: 0.250, 12: 0.250, 13: 0.250, 14: 0.250, 15: 0.250, 16: 0.250, 17: 0.175, 18: 0.175, 19: 0.175, 20: 0.175 },
    attackVsDefense: { 1: 35, 5: 37, 6: 36, 7: 35, 8: 34, 9: 38, 10: 36, 11: 34, 12: 32, 13: 39, 14: 35, 15: 31, 16: 27, 17: 39, 18: 33, 19: 27, 20: 21 }
  },
  'weapon_katar': {
    name: 'Katar',
    type: 'one_handed_edged',
    roundtime: 1.5,
    minRoundtime: 1.5,
    damageType: ['slash', 'puncture'],
    strReq: 70,
    disReq: 175,
    // OHE katar weight not specified; leaving unset
    damageFactors: { 1: 0.325, 5: 0.250, 6: 0.250, 7: 0.250, 8: 0.250, 9: 0.225, 10: 0.225, 11: 0.225, 12: 0.225, 13: 0.200, 14: 0.200, 15: 0.200, 16: 0.200, 17: 0.175, 18: 0.175, 19: 0.175, 20: 0.175 },
    attackVsDefense: { 1: 30, 5: 32, 6: 31, 7: 30, 8: 29, 9: 40, 10: 38, 11: 36, 12: 34, 13: 45, 14: 41, 15: 37, 16: 33, 17: 40, 18: 34, 19: 28, 20: 22 }
  },
  'weapon_main_gauche': {
    name: 'Main Gauche',
    type: 'one_handed_edged',
    roundtime: 1.0,
    minRoundtime: 1.0,
    damageType: ['slash', 'puncture'],
    strReq: 25,
    disReq: 125,
    weight: 2,
    damageFactors: { 1: 0.175, 5: 0.125, 6: 0.125, 7: 0.125, 8: 0.125, 9: 0.075, 10: 0.075, 11: 0.075, 12: 0.075, 13: 0.075, 14: 0.075, 15: 0.075, 16: 0.075, 17: 0.050, 18: 0.050, 19: 0.050, 20: 0.050 },
    attackVsDefense: { 1: 30, 5: 30, 6: 29, 7: 28, 8: 27, 9: 25, 10: 23, 11: 21, 12: 19, 13: 30, 14: 26, 15: 22, 16: 18, 17: 15, 18: 9, 19: 3, 20: -3 }
  },
  'weapon_whip_blade': {
    name: 'Whip Blade',
    type: 'one_handed_edged',
    roundtime: 2.0,
    minRoundtime: 2.0,
    damageType: ['slash', 'crush'],
    strReq: 75,
    disReq: 180,
    // weight unspecified
    damageFactors: { 1: 0.400, 5: 0.300, 6: 0.300, 7: 0.300, 8: 0.300, 9: 0.275, 10: 0.275, 11: 0.275, 12: 0.275, 13: 0.225, 14: 0.225, 15: 0.225, 16: 0.225, 17: 0.200, 18: 0.200, 19: 0.200, 20: 0.200 },
    attackVsDefense: { 1: 35, 5: 36, 6: 35, 7: 34, 8: 33, 9: 35, 10: 33, 11: 31, 12: 29, 13: 36, 14: 32, 15: 28, 16: 24, 17: 35, 18: 29, 19: 23, 20: 17 }
  },
  'weapon_estoc': {
    name: 'Estoc',
    type: 'one_handed_edged',
    roundtime: 1.5,
    minRoundtime: 1.5,
    damageType: ['puncture'],
    strReq: 60,
    disReq: 175,
    weight: 4,
    damageFactors: { 1: 0.300, 5: 0.200, 6: 0.200, 7: 0.200, 8: 0.200, 9: 0.150, 10: 0.150, 11: 0.150, 12: 0.150, 13: 0.150, 14: 0.150, 15: 0.150, 16: 0.150, 17: 0.125, 18: 0.125, 19: 0.125, 20: 0.125 },
    attackVsDefense: { 1: 30, 5: 33, 6: 32, 7: 31, 8: 30, 9: 40, 10: 38, 11: 36, 12: 34, 13: 42, 14: 38, 15: 34, 16: 30, 17: 35, 18: 29, 19: 23, 20: 17 }
  },
  'weapon_handaxe': {
    name: 'Hand Axe',
    type: 'one_handed_edged',
    roundtime: 2.0,
    minRoundtime: 2.0,
    damageType: ['slash', 'crush'],
    strReq: 70,
    disReq: 150,
    weight: 6,
    damageFactors: { 1: 0.450, 5: 0.325, 6: 0.325, 7: 0.325, 8: 0.325, 9: 0.275, 10: 0.275, 11: 0.275, 12: 0.275, 13: 0.250, 14: 0.250, 15: 0.250, 16: 0.250, 17: 0.200, 18: 0.200, 19: 0.200, 20: 0.200 },
    attackVsDefense: { 1: 33, 5: 35, 6: 34, 7: 33, 8: 32, 9: 40, 10: 38, 11: 36, 12: 34, 13: 38, 14: 34, 15: 30, 16: 26, 17: 37, 18: 31, 19: 25, 20: 19 }
  },
  'weapon_backsword': {
    name: 'Backsword',
    type: 'one_handed_edged',
    roundtime: 2.0,
    minRoundtime: 2.0,
    damageType: ['slash', 'puncture', 'crush'],
    strReq: 65,
    disReq: 160,
    weight: 5,
    damageFactors: { 1: 0.400, 5: 0.275, 6: 0.275, 7: 0.275, 8: 0.275, 9: 0.250, 10: 0.250, 11: 0.250, 12: 0.250, 13: 0.200, 14: 0.200, 15: 0.200, 16: 0.200, 17: 0.175, 18: 0.175, 19: 0.175, 20: 0.175 },
    attackVsDefense: { 1: 38, 5: 39, 6: 38, 7: 37, 8: 36, 9: 40, 10: 38, 11: 36, 12: 34, 13: 36, 14: 32, 15: 28, 16: 24, 17: 34, 18: 28, 19: 22, 20: 16 }
  },
  'weapon_katana': {
    name: 'Katana',
    type: 'one_handed_edged',
    roundtime: 2.5,
    minRoundtime: 2.0,
    damageType: ['slash', 'puncture', 'crush'],
    strReq: 75,
    disReq: 180,
    weight: 6,
    damageFactors: { 1: 0.425, 5: 0.300, 6: 0.300, 7: 0.300, 8: 0.300, 9: 0.250, 10: 0.250, 11: 0.250, 12: 0.250, 13: 0.225, 14: 0.225, 15: 0.225, 16: 0.225, 17: 0.200, 18: 0.200, 19: 0.200, 20: 0.200 },
    attackVsDefense: { 1: 40, 5: 40, 6: 39, 7: 38, 8: 37, 9: 38, 10: 36, 11: 34, 12: 32, 13: 38, 14: 34, 15: 30, 16: 26, 17: 38, 18: 32, 19: 26, 20: 20 }
  },
  'weapon_bastard_sword': {
    name: 'Bastard Sword',
    type: 'two_handed_edged',
    roundtime: 2.5,
    minRoundtime: 2.5,
    damageType: ['slash', 'puncture', 'crush'],
    strReq: 85,
    disReq: 185,
    weight: 9,
    damageFactors: { 1: 0.500, 5: 0.350, 6: 0.350, 7: 0.350, 8: 0.350, 9: 0.300, 10: 0.300, 11: 0.300, 12: 0.300, 13: 0.275, 14: 0.275, 15: 0.275, 16: 0.275, 17: 0.225, 18: 0.225, 19: 0.225, 20: 0.225 },
    attackVsDefense: { 1: 45, 5: 48, 6: 47, 7: 46, 8: 45, 9: 50, 10: 48, 11: 46, 12: 44, 13: 45, 14: 41, 15: 37, 16: 33, 17: 42, 18: 36, 19: 30, 20: 24 }
  },
  'weapon_bite': {
    name: 'Bite',
    type: 'natural',
    roundtime: 2.5,
    minRoundtime: 2.5,
    damageType: ['puncture', 'crush', 'slash'],
    strReq: 0,
    disReq: 0,
    damageFactors: { 1: 0.400, 5: 0.375, 6: 0.375, 7: 0.375, 8: 0.375, 9: 0.375, 10: 0.375, 11: 0.375, 12: 0.375, 13: 0.325, 14: 0.325, 15: 0.325, 16: 0.325, 17: 0.300, 18: 0.300, 19: 0.300, 20: 0.300 },
    attackVsDefense: { 1: 39, 5: 35, 6: 34, 7: 33, 8: 32, 9: 30, 10: 28, 11: 26, 12: 24, 13: 32, 14: 28, 15: 24, 16: 20, 17: 25, 18: 19, 19: 13, 20: 7 }
  }
};

// Two-handed weapons from table
BASE_WEAPONS['weapon_runestaff'] = {
  name: 'Runestaff',
  type: 'two_handed_crush',
  roundtime: 3.0,
  minRoundtime: 2.0,
  damageType: ['crush'],
  strReq: 20,
  disReq: 270,
  damageFactors: { 1: 0.250, 5: 0.200, 6: 0.200, 7: 0.200, 8: 0.200, 9: 0.150, 10: 0.150, 11: 0.150, 12: 0.150, 13: 0.150, 14: 0.150, 15: 0.150, 16: 0.150, 17: 0.075, 18: 0.075, 19: 0.075, 20: 0.075 },
  attackVsDefense: { 1: 10, 5: 15, 6: 14, 7: 13, 8: 12, 9: 10, 10: 8, 11: 6, 12: 4, 13: 15, 14: 11, 15: 7, 16: 3, 17: 10, 18: 4, 19: -2, 20: -8 }
};

BASE_WEAPONS['weapon_quarterstaff'] = {
  name: 'Quarterstaff',
  type: 'two_handed_crush',
  roundtime: 1.5,
  minRoundtime: 1.5,
  damageType: ['crush'],
  strReq: 20,
  disReq: 140,
  weight: 5,
  damageFactors: { 1: 0.450, 5: 0.350, 6: 0.350, 7: 0.350, 8: 0.350, 9: 0.325, 10: 0.325, 11: 0.325, 12: 0.325, 13: 0.175, 14: 0.175, 15: 0.175, 16: 0.175, 17: 0.100, 18: 0.100, 19: 0.100, 20: 0.100 },
  attackVsDefense: { 1: 25, 5: 26, 6: 25, 7: 24, 8: 23, 9: 25, 10: 23, 11: 21, 12: 19, 13: 26, 14: 22, 15: 18, 16: 14, 17: 24, 18: 18, 19: 12, 20: 6 }
};

// Bastard sword (two-handed numbers)
BASE_WEAPONS['weapon_bastard_sword_2h'] = {
  name: 'Bastard Sword (two-handed)',
  type: 'two_handed_edged',
  roundtime: 3.0,
  minRoundtime: 2.0,
  damageType: ['slash', 'crush'],
  strReq: 75,
  disReq: 200,
  damageFactors: { 1: 0.550, 5: 0.400, 6: 0.400, 7: 0.400, 8: 0.400, 9: 0.375, 10: 0.375, 11: 0.375, 12: 0.375, 13: 0.300, 14: 0.300, 15: 0.300, 16: 0.300, 17: 0.225, 18: 0.225, 19: 0.225, 20: 0.225 },
  attackVsDefense: { 1: 42, 5: 45, 6: 44, 7: 43, 8: 42, 9: 41, 10: 39, 11: 37, 12: 35, 13: 44, 14: 40, 15: 36, 16: 32, 17: 43, 18: 37, 19: 31, 20: 25 }
};

BASE_WEAPONS['weapon_katana_2h'] = {
  name: 'Katana (two-handed)',
  type: 'two_handed_edged',
  roundtime: 3.0,
  minRoundtime: 2.0,
  damageType: ['slash'],
  strReq: 75,
  disReq: 225,
  damageFactors: { 1: 0.575, 5: 0.425, 6: 0.425, 7: 0.425, 8: 0.425, 9: 0.400, 10: 0.400, 11: 0.400, 12: 0.400, 13: 0.325, 14: 0.325, 15: 0.325, 16: 0.325, 17: 0.210, 18: 0.210, 19: 0.210, 20: 0.210 },
  attackVsDefense: { 1: 39, 5: 41, 6: 40, 7: 39, 8: 38, 9: 40, 10: 38, 11: 36, 12: 34, 13: 41, 14: 37, 15: 33, 16: 29, 17: 39, 18: 33, 19: 27, 20: 21 }
};

BASE_WEAPONS['weapon_military_pick'] = {
  name: 'Military Pick',
  type: 'two_handed_crush',
  roundtime: 3.5,
  minRoundtime: 2.0,
  damageType: ['puncture', 'crush'],
  strReq: 60,
  disReq: 150,
  weight: 8,
  damageFactors: { 1: 0.500, 5: 0.375, 6: 0.375, 7: 0.375, 8: 0.375, 9: 0.425, 10: 0.425, 11: 0.425, 12: 0.425, 13: 0.375, 14: 0.375, 15: 0.375, 16: 0.375, 17: 0.260, 18: 0.260, 19: 0.260, 20: 0.260 },
  attackVsDefense: { 1: 25, 5: 30, 6: 29, 7: 28, 8: 27, 9: 40, 10: 38, 11: 36, 12: 34, 13: 40, 14: 36, 15: 32, 16: 28, 17: 47, 18: 41, 19: 35, 20: 29 }
};

BASE_WEAPONS['weapon_flail'] = {
  name: 'Flail',
  type: 'two_handed_crush',
  roundtime: 3.5,
  minRoundtime: 2.0,
  damageType: ['puncture', 'crush'],
  strReq: 60,
  disReq: 150,
  weight: 10,
  damageFactors: { 1: 0.575, 5: 0.425, 6: 0.425, 7: 0.425, 8: 0.425, 9: 0.400, 10: 0.400, 11: 0.400, 12: 0.400, 13: 0.350, 14: 0.350, 15: 0.350, 16: 0.350, 17: 0.250, 18: 0.250, 19: 0.250, 20: 0.250 },
  attackVsDefense: { 1: 40, 5: 45, 6: 44, 7: 43, 8: 42, 9: 46, 10: 44, 11: 42, 12: 40, 13: 51, 14: 47, 15: 43, 16: 39, 17: 52, 18: 46, 19: 40, 20: 34 }
};

BASE_WEAPONS['weapon_flamberge'] = {
  name: 'Flamberge',
  type: 'two_handed_edged',
  roundtime: 3.5,
  minRoundtime: 2.0,
  damageType: ['slash', 'crush'],
  strReq: 70,
  disReq: 190,
  weight: 10,
  damageFactors: { 1: 0.600, 5: 0.450, 6: 0.450, 7: 0.450, 8: 0.450, 9: 0.475, 10: 0.475, 11: 0.475, 12: 0.475, 13: 0.325, 14: 0.325, 15: 0.325, 16: 0.325, 17: 0.225, 18: 0.225, 19: 0.225, 20: 0.225 },
  attackVsDefense: { 1: 39, 5: 43, 6: 42, 7: 41, 8: 40, 9: 48, 10: 46, 11: 44, 12: 42, 13: 50, 14: 46, 15: 42, 16: 38, 17: 44, 18: 38, 19: 32, 20: 26 }
};

BASE_WEAPONS['weapon_war_mattock'] = {
  name: 'War Mattock',
  type: 'two_handed_crush',
  roundtime: 3.5,
  minRoundtime: 2.0,
  damageType: ['crush'],
  strReq: 60,
  disReq: 145,
  weight: 8,
  damageFactors: { 1: 0.550, 5: 0.450, 6: 0.450, 7: 0.450, 8: 0.450, 9: 0.425, 10: 0.425, 11: 0.425, 12: 0.425, 13: 0.375, 14: 0.375, 15: 0.375, 16: 0.375, 17: 0.275, 18: 0.275, 19: 0.275, 20: 0.275 },
  attackVsDefense: { 1: 32, 5: 37, 6: 36, 7: 35, 8: 34, 9: 44, 10: 42, 11: 40, 12: 38, 13: 48, 14: 44, 15: 40, 16: 36, 17: 53, 18: 47, 19: 41, 20: 35 }
};

BASE_WEAPONS['weapon_maul'] = {
  name: 'Maul',
  type: 'two_handed_crush',
  roundtime: 3.5,
  minRoundtime: 2.0,
  damageType: ['crush'],
  strReq: 60,
  disReq: 145,
  weight: 8,
  damageFactors: { 1: 0.550, 5: 0.425, 6: 0.425, 7: 0.425, 8: 0.425, 9: 0.425, 10: 0.425, 11: 0.425, 12: 0.425, 13: 0.375, 14: 0.375, 15: 0.375, 16: 0.375, 17: 0.300, 18: 0.300, 19: 0.300, 20: 0.300 },
  attackVsDefense: { 1: 31, 5: 36, 6: 35, 7: 34, 8: 33, 9: 44, 10: 42, 11: 40, 12: 38, 13: 52, 14: 48, 15: 44, 16: 40, 17: 54, 18: 48, 19: 42, 20: 36 }
};

BASE_WEAPONS['weapon_two_handed_sword'] = {
  name: 'Two-handed Sword',
  type: 'two_handed_edged',
  roundtime: 4.0,
  minRoundtime: 2.0,
  damageType: ['slash', 'crush'],
  strReq: 75,
  disReq: 200,
  weight: 12,
  damageFactors: { 1: 0.625, 5: 0.500, 6: 0.500, 7: 0.500, 8: 0.500, 9: 0.500, 10: 0.500, 11: 0.500, 12: 0.500, 13: 0.350, 14: 0.350, 15: 0.350, 16: 0.350, 17: 0.275, 18: 0.275, 19: 0.275, 20: 0.275 },
  attackVsDefense: { 1: 41, 5: 45, 6: 44, 7: 43, 8: 42, 9: 44, 10: 42, 11: 40, 12: 38, 13: 48, 14: 44, 15: 40, 16: 36, 17: 47, 18: 41, 19: 35, 20: 29 }
};

BASE_WEAPONS['weapon_battle_axe'] = {
  name: 'Battle Axe',
  type: 'two_handed_edged',
  roundtime: 4.0,
  minRoundtime: 2.0,
  damageType: ['slash', 'crush'],
  strReq: 70,
  disReq: 155,
  weight: 9,
  damageFactors: { 1: 0.650, 5: 0.475, 6: 0.475, 7: 0.475, 8: 0.475, 9: 0.500, 10: 0.500, 11: 0.500, 12: 0.500, 13: 0.375, 14: 0.375, 15: 0.375, 16: 0.375, 17: 0.275, 18: 0.275, 19: 0.275, 20: 0.275 },
  attackVsDefense: { 1: 35, 5: 39, 6: 38, 7: 37, 8: 36, 9: 43, 10: 41, 11: 39, 12: 37, 13: 50, 14: 46, 15: 42, 16: 38, 17: 50, 18: 44, 19: 38, 20: 32 }
};

BASE_WEAPONS['weapon_claidhmore_new'] = {
  name: 'Claidhmore (new-style)',
  type: 'two_handed_edged',
  roundtime: 4.0,
  minRoundtime: 2.0,
  damageType: ['slash', 'crush'],
  strReq: 75,
  disReq: 200,
  weight: 12,
  damageFactors: { 1: 0.625, 5: 0.475, 6: 0.475, 7: 0.475, 8: 0.475, 9: 0.500, 10: 0.500, 11: 0.500, 12: 0.500, 13: 0.350, 14: 0.350, 15: 0.350, 16: 0.350, 17: 0.225, 18: 0.225, 19: 0.225, 20: 0.225 },
  attackVsDefense: { 1: 31, 5: 35, 6: 34, 7: 33, 8: 32, 9: 34, 10: 32, 11: 30, 12: 28, 13: 38, 14: 34, 15: 30, 16: 26, 17: 37, 18: 31, 19: 25, 20: 19 }
};

BASE_WEAPONS['weapon_claidhmore_old'] = {
  name: 'Claidhmore (old-style)',
  type: 'two_handed_edged',
  roundtime: 4.0,
  minRoundtime: 2.0,
  damageType: ['slash', 'crush'],
  strReq: 75,
  disReq: 200,
  weight: 12,
  damageFactors: { 1: 0.625, 5: 0.500, 6: 0.500, 7: 0.500, 8: 0.500, 9: 0.500, 10: 0.500, 11: 0.500, 12: 0.500, 13: 0.350, 14: 0.350, 15: 0.350, 16: 0.350, 17: 0.275, 18: 0.275, 19: 0.275, 20: 0.275 },
  attackVsDefense: { 1: 41, 5: 45, 6: 44, 7: 43, 8: 42, 9: 44, 10: 42, 11: 40, 12: 38, 13: 48, 14: 44, 15: 40, 16: 36, 17: 47, 18: 41, 19: 35, 20: 29 }
};

// Polearms
BASE_WEAPONS['weapon_pilum'] = {
  name: 'Pilum',
  type: 'one_handed_polearm',
  roundtime: 1.5,
  minRoundtime: 1.5,
  damageType: ['slash', 'puncture'],
  strReq: 50,
  disReq: 150,
  weight: 5,
  damageFactors: { 1: 0.350, 5: 0.250, 6: 0.250, 7: 0.250, 8: 0.250, 9: 0.225, 10: 0.225, 11: 0.225, 12: 0.225, 13: 0.175, 14: 0.175, 15: 0.175, 16: 0.175, 17: 0.060, 18: 0.060, 19: 0.060, 20: 0.060 },
  attackVsDefense: { 1: 30, 5: 27, 6: 26, 7: 25, 8: 24, 9: 22, 10: 20, 11: 18, 12: 16, 13: 23, 14: 19, 15: 15, 16: 11, 17: 15, 18: 9, 19: 3, 20: -3 }
};

BASE_WEAPONS['weapon_spear_1h'] = {
  name: 'Spear (one-handed)',
  type: 'one_handed_polearm',
  roundtime: 2.5,
  minRoundtime: 2.0,
  damageType: ['slash', 'puncture'],
  strReq: 15,
  disReq: 130,
  weight: 6,
  damageFactors: { 1: 0.425, 5: 0.325, 6: 0.325, 7: 0.325, 8: 0.325, 9: 0.250, 10: 0.250, 11: 0.250, 12: 0.250, 13: 0.250, 14: 0.250, 15: 0.250, 16: 0.250, 17: 0.160, 18: 0.160, 19: 0.160, 20: 0.160 },
  attackVsDefense: { 1: 27, 5: 29, 6: 28, 7: 27, 8: 26, 9: 27, 10: 25, 11: 23, 12: 21, 13: 30, 14: 26, 15: 22, 16: 18, 17: 25, 18: 19, 19: 13, 20: 7 }
};

BASE_WEAPONS['weapon_spear_2h'] = {
  name: 'Spear (two-handed)',
  type: 'two_handed_polearm',
  roundtime: 3.0,
  minRoundtime: 2.0,
  damageType: ['slash', 'puncture'],
  strReq: 15,
  disReq: 130,
  weight: 6,
  damageFactors: { 1: 0.550, 5: 0.385, 6: 0.385, 7: 0.385, 8: 0.385, 9: 0.340, 10: 0.340, 11: 0.340, 12: 0.340, 13: 0.325, 14: 0.325, 15: 0.325, 16: 0.325, 17: 0.230, 18: 0.230, 19: 0.230, 20: 0.230 },
  attackVsDefense: { 1: 33, 5: 32, 6: 31, 7: 30, 8: 29, 9: 34, 10: 32, 11: 30, 12: 28, 13: 36, 14: 32, 15: 28, 16: 24, 17: 33, 18: 27, 19: 21, 20: 15 }
};

BASE_WEAPONS['weapon_trident_1h'] = {
  name: 'Trident (one-handed)',
  type: 'one_handed_polearm',
  roundtime: 2.5,
  minRoundtime: 2.0,
  damageType: ['slash', 'puncture'],
  strReq: 70,
  disReq: 190,
  weight: 12,
  damageFactors: { 1: 0.425, 5: 0.350, 6: 0.350, 7: 0.350, 8: 0.350, 9: 0.260, 10: 0.260, 11: 0.260, 12: 0.260, 13: 0.230, 14: 0.230, 15: 0.230, 16: 0.230, 17: 0.150, 18: 0.150, 19: 0.150, 20: 0.150 },
  attackVsDefense: { 1: 31, 5: 31, 6: 30, 7: 29, 8: 28, 9: 34, 10: 32, 11: 30, 12: 28, 13: 42, 14: 38, 15: 34, 16: 30, 17: 29, 18: 23, 19: 17, 20: 11 }
};

BASE_WEAPONS['weapon_trident_2h'] = {
  name: 'Trident (two-handed)',
  type: 'two_handed_polearm',
  roundtime: 3.0,
  minRoundtime: 2.0,
  damageType: ['slash', 'puncture'],
  strReq: 70,
  disReq: 190,
  weight: 12,
  damageFactors: { 1: 0.600, 5: 0.425, 6: 0.425, 7: 0.425, 8: 0.425, 9: 0.375, 10: 0.375, 11: 0.375, 12: 0.375, 13: 0.300, 14: 0.300, 15: 0.300, 16: 0.300, 17: 0.185, 18: 0.185, 19: 0.185, 20: 0.185 },
  attackVsDefense: { 1: 29, 5: 30, 6: 29, 7: 28, 8: 27, 9: 30, 10: 28, 11: 26, 12: 24, 13: 37, 14: 33, 15: 29, 16: 25, 17: 25, 18: 19, 19: 13, 20: 7 }
};

BASE_WEAPONS['weapon_halberd'] = {
  name: 'Halberd',
  type: 'two_handed_polearm',
  roundtime: 3.0,
  minRoundtime: 2.0,
  damageType: ['slash', 'puncture', 'crush'],
  strReq: 25,
  disReq: 150,
  weight: 9,
  damageFactors: { 1: 0.550, 5: 0.400, 6: 0.400, 7: 0.400, 8: 0.400, 9: 0.400, 10: 0.400, 11: 0.400, 12: 0.400, 13: 0.300, 14: 0.300, 15: 0.300, 16: 0.300, 17: 0.200, 18: 0.200, 19: 0.200, 20: 0.200 },
  attackVsDefense: { 1: 30, 5: 30, 6: 29, 7: 28, 8: 27, 9: 31, 10: 29, 11: 27, 12: 25, 13: 32, 14: 28, 15: 24, 16: 20, 17: 32, 18: 26, 19: 20, 20: 14 }
};

BASE_WEAPONS['weapon_naginata'] = {
  name: 'Naginata',
  type: 'two_handed_polearm',
  roundtime: 3.0,
  minRoundtime: 2.0,
  damageType: ['slash', 'puncture', 'crush'],
  strReq: 25,
  disReq: 150,
  weight: 9,
  damageFactors: { 1: 0.550, 5: 0.400, 6: 0.400, 7: 0.400, 8: 0.400, 9: 0.400, 10: 0.400, 11: 0.400, 12: 0.400, 13: 0.300, 14: 0.300, 15: 0.300, 16: 0.300, 17: 0.200, 18: 0.200, 19: 0.200, 20: 0.200 },
  attackVsDefense: { 1: 50, 5: 50, 6: 49, 7: 48, 8: 47, 9: 51, 10: 49, 11: 47, 12: 45, 13: 52, 14: 48, 15: 44, 16: 40, 17: 52, 18: 46, 19: 40, 20: 34 }
};

BASE_WEAPONS['weapon_jeddart_axe'] = {
  name: 'Jeddart-axe',
  type: 'two_handed_polearm',
  roundtime: 3.5,
  minRoundtime: 2.0,
  damageType: ['slash', 'crush'],
  strReq: 60,
  disReq: 185,
  weight: 9,
  damageFactors: { 1: 0.550, 5: 0.425, 6: 0.425, 7: 0.425, 8: 0.425, 9: 0.425, 10: 0.425, 11: 0.425, 12: 0.425, 13: 0.325, 14: 0.325, 15: 0.325, 16: 0.325, 17: 0.250, 18: 0.250, 19: 0.250, 20: 0.250 },
  attackVsDefense: { 1: 30, 5: 32, 6: 31, 7: 30, 8: 29, 9: 30, 10: 28, 11: 26, 12: 24, 13: 40, 14: 36, 15: 32, 16: 28, 17: 30, 18: 24, 19: 18, 20: 12 }
};

BASE_WEAPONS['weapon_hammer_of_kai'] = {
  name: 'Hammer of Kai',
  type: 'two_handed_polearm',
  roundtime: 3.5,
  minRoundtime: 2.0,
  damageType: ['puncture', 'crush'],
  strReq: 50,
  disReq: 190,
  weight: 9,
  damageFactors: { 1: 0.550, 5: 0.425, 6: 0.425, 7: 0.425, 8: 0.425, 9: 0.450, 10: 0.450, 11: 0.450, 12: 0.450, 13: 0.350, 14: 0.350, 15: 0.350, 16: 0.350, 17: 0.250, 18: 0.250, 19: 0.250, 20: 0.250 },
  attackVsDefense: { 1: 20, 5: 25, 6: 24, 7: 23, 8: 22, 9: 35, 10: 33, 11: 31, 12: 29, 13: 40, 14: 36, 15: 32, 16: 28, 17: 40, 18: 34, 19: 28, 20: 22 }
};

BASE_WEAPONS['weapon_awl_pike'] = {
  name: 'Awl-pike',
  type: 'two_handed_polearm',
  roundtime: 4.5,
  minRoundtime: 2.0,
  damageType: ['puncture', 'crush'],
  strReq: 60,
  disReq: 160,
  weight: 8,
  damageFactors: { 1: 0.600, 5: 0.550, 6: 0.550, 7: 0.550, 8: 0.550, 9: 0.575, 10: 0.575, 11: 0.575, 12: 0.575, 13: 0.450, 14: 0.450, 15: 0.450, 16: 0.450, 17: 0.350, 18: 0.350, 19: 0.350, 20: 0.350 },
  attackVsDefense: { 1: 15, 5: 20, 6: 19, 7: 18, 8: 17, 9: 35, 10: 33, 11: 31, 12: 29, 13: 45, 14: 41, 15: 37, 16: 33, 17: 50, 18: 44, 19: 38, 20: 32 }
};

BASE_WEAPONS['weapon_lance'] = {
  name: 'Lance',
  type: 'two_handed_polearm',
  roundtime: 4.5,
  minRoundtime: 2.0,
  damageType: ['puncture', 'crush'],
  strReq: 17,
  disReq: 105,
  weight: 15,
  damageFactors: { 1: 0.725, 5: 0.525, 6: 0.525, 7: 0.525, 8: 0.525, 9: 0.550, 10: 0.550, 11: 0.550, 12: 0.550, 13: 0.475, 14: 0.475, 15: 0.475, 16: 0.475, 17: 0.350, 18: 0.350, 19: 0.350, 20: 0.350 },
  attackVsDefense: { 1: 35, 5: 38, 6: 37, 7: 36, 8: 35, 9: 39, 10: 37, 11: 35, 12: 33, 13: 53, 14: 49, 15: 45, 16: 41, 17: 50, 18: 44, 19: 38, 20: 32 }
};

// Brawling weapons
BASE_WEAPONS['weapon_closed_fist'] = {
  name: 'Closed Fist',
  type: 'brawling',
  roundtime: 0.5,
  minRoundtime: 1.0,
  damageType: ['crush'],
  strReq: 0,
  disReq: 0,
  weight: 0,
  damageFactors: { 1: 0.100, 5: 0.075, 6: 0.075, 7: 0.075, 8: 0.075, 9: 0.040, 10: 0.040, 11: 0.040, 12: 0.040, 13: 0.036, 14: 0.036, 15: 0.036, 16: 0.036, 17: 0.032, 18: 0.032, 19: 0.032, 20: 0.032 },
  attackVsDefense: { 1: 25, 5: 20, 6: 19, 7: 18, 8: 17, 9: 10, 10: 8, 11: 6, 12: 4, 13: 5, 14: 1, 15: -3, 16: -7, 17: -5, 18: -11, 19: -17, 20: -23 }
};

BASE_WEAPONS['weapon_razorpaw'] = {
  name: 'Razorpaw',
  type: 'brawling',
  roundtime: 0.5,
  minRoundtime: 1.0,
  damageType: ['slash'],
  strReq: 40,
  disReq: 80,
  weight: 2,
  damageFactors: { 1: 0.275, 5: 0.200, 6: 0.200, 7: 0.200, 8: 0.200, 9: 0.125, 10: 0.125, 11: 0.125, 12: 0.125, 13: 0.050, 14: 0.050, 15: 0.050, 16: 0.050, 17: 0.030, 18: 0.030, 19: 0.030, 20: 0.030 },
  attackVsDefense: { 1: 35, 5: 20, 6: 19, 7: 18, 8: 17, 9: 10, 10: 8, 11: 6, 12: 4, 13: 0, 14: -4, 15: -8, 16: -12, 17: -25, 18: -31, 19: -37, 20: -43 }
};

BASE_WEAPONS['weapon_paingrip'] = {
  name: 'Paingrip',
  type: 'brawling',
  roundtime: 0.5,
  minRoundtime: 1.0,
  damageType: ['slash', 'puncture', 'crush'],
  strReq: 50,
  disReq: 80,
  weight: 2,
  damageFactors: { 1: 0.225, 5: 0.200, 6: 0.200, 7: 0.200, 8: 0.200, 9: 0.125, 10: 0.125, 11: 0.125, 12: 0.125, 13: 0.075, 14: 0.075, 15: 0.075, 16: 0.075, 17: 0.030, 18: 0.030, 19: 0.030, 20: 0.030 },
  attackVsDefense: { 1: 40, 5: 20, 6: 19, 7: 18, 8: 17, 9: 15, 10: 13, 11: 11, 12: 9, 13: 15, 14: 11, 15: 7, 16: 3, 17: -25, 18: -31, 19: -37, 20: -43 }
};

BASE_WEAPONS['weapon_cestus'] = {
  name: 'Cestus',
  type: 'brawling',
  roundtime: 0.5,
  minRoundtime: 1.0,
  damageType: ['crush'],
  strReq: 50,
  disReq: 80,
  weight: 2,
  damageFactors: { 1: 0.250, 5: 0.175, 6: 0.175, 7: 0.175, 8: 0.175, 9: 0.150, 10: 0.150, 11: 0.150, 12: 0.150, 13: 0.075, 14: 0.075, 15: 0.075, 16: 0.075, 17: 0.035, 18: 0.035, 19: 0.035, 20: 0.035 },
  attackVsDefense: { 1: 40, 5: 30, 6: 29, 7: 28, 8: 27, 9: 20, 10: 18, 11: 16, 12: 14, 13: 10, 14: 6, 15: 2, 16: -2, 17: -25, 18: -31, 19: -37, 20: -43 }
};

BASE_WEAPONS['weapon_knuckle_duster'] = {
  name: 'Knuckle-duster',
  type: 'brawling',
  roundtime: 0.5,
  minRoundtime: 1.0,
  damageType: ['crush'],
  strReq: 18,
  disReq: 199,
  weight: 1,
  damageFactors: { 1: 0.250, 5: 0.175, 6: 0.175, 7: 0.175, 8: 0.175, 9: 0.125, 10: 0.125, 11: 0.125, 12: 0.125, 13: 0.100, 14: 0.100, 15: 0.100, 16: 0.100, 17: 0.040, 18: 0.040, 19: 0.040, 20: 0.040 },
  attackVsDefense: { 1: 35, 5: 32, 6: 31, 7: 30, 8: 29, 9: 25, 10: 23, 11: 21, 12: 19, 13: 18, 14: 14, 15: 10, 16: 6, 17: 0, 18: -6, 19: -12, 20: -18 }
};

BASE_WEAPONS['weapon_hook_knife'] = {
  name: 'Hook-knife',
  type: 'brawling',
  roundtime: 0.5,
  minRoundtime: 1.0,
  damageType: ['slash', 'puncture'],
  strReq: 30,
  disReq: 100,
  weight: 1,
  damageFactors: { 1: 0.250, 5: 0.175, 6: 0.175, 7: 0.175, 8: 0.175, 9: 0.125, 10: 0.125, 11: 0.125, 12: 0.125, 13: 0.070, 14: 0.070, 15: 0.070, 16: 0.070, 17: 0.035, 18: 0.035, 19: 0.035, 20: 0.035 },
  attackVsDefense: { 1: 40, 5: 30, 6: 29, 7: 28, 8: 27, 9: 18, 10: 16, 11: 14, 12: 12, 13: 10, 14: 6, 15: 2, 16: -2, 17: -15, 18: -21, 19: -27, 20: -33 }
};

BASE_WEAPONS['weapon_tiger_claw'] = {
  name: 'Tiger-claw',
  type: 'brawling',
  roundtime: 0.5,
  minRoundtime: 1.0,
  damageType: ['slash', 'crush'],
  strReq: 18,
  disReq: 165,
  weight: 1,
  damageFactors: { 1: 0.275, 5: 0.200, 6: 0.200, 7: 0.200, 8: 0.200, 9: 0.150, 10: 0.150, 11: 0.150, 12: 0.150, 13: 0.100, 14: 0.100, 15: 0.100, 16: 0.100, 17: 0.035, 18: 0.035, 19: 0.035, 20: 0.035 },
  attackVsDefense: { 1: 40, 5: 25, 6: 24, 7: 23, 8: 22, 9: 15, 10: 13, 11: 11, 12: 9, 13: 5, 14: 1, 15: -3, 16: -7, 17: -25, 18: -31, 19: -37, 20: -43 }
};

BASE_WEAPONS['weapon_knuckle_blade'] = {
  name: 'Knuckle-blade',
  type: 'brawling',
  roundtime: 0.5,
  minRoundtime: 1.0,
  damageType: ['slash', 'crush'],
  strReq: 18,
  disReq: 195,
  weight: 2,
  damageFactors: { 1: 0.250, 5: 0.150, 6: 0.150, 7: 0.150, 8: 0.150, 9: 0.100, 10: 0.100, 11: 0.100, 12: 0.100, 13: 0.075, 14: 0.075, 15: 0.075, 16: 0.075, 17: 0.075, 18: 0.075, 19: 0.075, 20: 0.075 },
  attackVsDefense: { 1: 45, 5: 40, 6: 39, 7: 38, 8: 37, 9: 25, 10: 23, 11: 21, 12: 19, 13: 25, 14: 21, 15: 17, 16: 13, 17: 0, 18: -6, 19: -12, 20: -18 }
};

BASE_WEAPONS['weapon_yierka_spur'] = {
  name: 'Yierka-spur',
  type: 'brawling',
  roundtime: 0.5,
  minRoundtime: 1.0,
  damageType: ['slash', 'puncture', 'crush'],
  strReq: 18,
  disReq: 185,
  weight: 2,
  damageFactors: { 1: 0.250, 5: 0.150, 6: 0.150, 7: 0.150, 8: 0.150, 9: 0.125, 10: 0.125, 11: 0.125, 12: 0.125, 13: 0.125, 14: 0.125, 15: 0.125, 16: 0.125, 17: 0.075, 18: 0.075, 19: 0.075, 20: 0.075 },
  attackVsDefense: { 1: 40, 5: 35, 6: 34, 7: 33, 8: 32, 9: 25, 10: 23, 11: 21, 12: 19, 13: 30, 14: 26, 15: 22, 16: 18, 17: 0, 18: -6, 19: -12, 20: -18 }
};

BASE_WEAPONS['weapon_blackjack'] = {
  name: 'Blackjack',
  type: 'brawling',
  roundtime: 0.5,
  minRoundtime: 1.0,
  damageType: ['crush'],
  strReq: 50,
  disReq: 80,
  weight: 3,
  damageFactors: { 1: 0.250, 5: 0.140, 6: 0.140, 7: 0.140, 8: 0.140, 9: 0.090, 10: 0.090, 11: 0.090, 12: 0.090, 13: 0.110, 14: 0.110, 15: 0.110, 16: 0.110, 17: 0.075, 18: 0.075, 19: 0.075, 20: 0.075 },
  attackVsDefense: { 1: 40, 5: 35, 6: 34, 7: 33, 8: 32, 9: 25, 10: 23, 11: 21, 12: 19, 13: 15, 14: 11, 15: 7, 16: 3, 17: 0, 18: -6, 19: -12, 20: -18 }
};

BASE_WEAPONS['weapon_jackblade'] = {
  name: 'Jackblade',
  type: 'brawling',
  roundtime: 1.0,
  minRoundtime: 1.5,
  damageType: ['slash', 'crush'],
  strReq: 60,
  disReq: 90,
  weight: 3,
  damageFactors: { 1: 0.250, 5: 0.175, 6: 0.175, 7: 0.175, 8: 0.175, 9: 0.150, 10: 0.150, 11: 0.150, 12: 0.150, 13: 0.150, 14: 0.150, 15: 0.150, 16: 0.150, 17: 0.110, 18: 0.110, 19: 0.110, 20: 0.110 },
  attackVsDefense: { 1: 45, 5: 35, 6: 34, 7: 33, 8: 32, 9: 25, 10: 23, 11: 21, 12: 19, 13: 20, 14: 16, 15: 12, 16: 8, 17: 10, 18: 4, 19: -2, 20: -8 }
};

BASE_WEAPONS['weapon_troll_claw'] = {
  name: 'Troll-claw',
  type: 'brawling',
  roundtime: 1.0,
  minRoundtime: 1.5,
  damageType: ['slash', 'crush'],
  strReq: 60,
  disReq: 185,
  weight: 3,
  damageFactors: { 1: 0.325, 5: 0.175, 6: 0.175, 7: 0.175, 8: 0.175, 9: 0.140, 10: 0.140, 11: 0.140, 12: 0.140, 13: 0.120, 14: 0.120, 15: 0.120, 16: 0.120, 17: 0.090, 18: 0.090, 19: 0.090, 20: 0.090 },
  attackVsDefense: { 1: 45, 5: 35, 6: 34, 7: 33, 8: 32, 9: 25, 10: 23, 11: 21, 12: 19, 13: 25, 14: 21, 15: 17, 16: 13, 17: 15, 18: 9, 19: 3, 20: -3 }
};

BASE_WEAPONS['weapon_sai'] = {
  name: 'Sai',
  type: 'brawling',
  roundtime: 1.0,
  minRoundtime: 1.5,
  damageType: ['puncture'],
  strReq: 25,
  disReq: 175,
  weight: 3,
  damageFactors: { 1: 0.250, 5: 0.200, 6: 0.200, 7: 0.200, 8: 0.200, 9: 0.110, 10: 0.110, 11: 0.110, 12: 0.110, 13: 0.150, 14: 0.150, 15: 0.150, 16: 0.150, 17: 0.040, 18: 0.040, 19: 0.040, 20: 0.040 },
  attackVsDefense: { 1: 30, 5: 31, 6: 30, 7: 29, 8: 28, 9: 25, 10: 23, 11: 21, 12: 19, 13: 33, 14: 29, 15: 25, 16: 21, 17: 6, 18: 0, 19: -6, 20: -12 }
};

BASE_WEAPONS['weapon_fist_scythe'] = {
  name: 'Fist-scythe',
  type: 'brawling',
  roundtime: 1.5,
  minRoundtime: 1.5,
  damageType: ['slash', 'puncture', 'crush'],
  strReq: 70,
  disReq: 185,
  weight: 4,
  damageFactors: { 1: 0.350, 5: 0.225, 6: 0.225, 7: 0.225, 8: 0.225, 9: 0.200, 10: 0.200, 11: 0.200, 12: 0.200, 13: 0.175, 14: 0.175, 15: 0.175, 16: 0.175, 17: 0.125, 18: 0.125, 19: 0.125, 20: 0.125 },
  attackVsDefense: { 1: 45, 5: 40, 6: 39, 7: 38, 8: 37, 9: 30, 10: 28, 11: 26, 12: 24, 13: 37, 14: 33, 15: 29, 16: 25, 17: 20, 18: 14, 19: 8, 20: 2 }
};

BASE_WEAPONS['weapon_katar_brawling'] = {
  name: 'Katar (brawling)',
  type: 'brawling',
  roundtime: 1.5,
  minRoundtime: 1.5,
  damageType: ['slash', 'puncture'],
  strReq: 70,
  disReq: 175,
  weight: 4,
  damageFactors: { 1: 0.325, 5: 0.250, 6: 0.250, 7: 0.250, 8: 0.250, 9: 0.225, 10: 0.225, 11: 0.225, 12: 0.225, 13: 0.200, 14: 0.200, 15: 0.200, 16: 0.200, 17: 0.175, 18: 0.175, 19: 0.175, 20: 0.175 },
  attackVsDefense: { 1: 30, 5: 32, 6: 31, 7: 30, 8: 29, 9: 40, 10: 38, 11: 36, 12: 34, 13: 45, 14: 41, 15: 37, 16: 33, 17: 40, 18: 34, 19: 28, 20: 22 }
};

// One-handed blunt weapons
BASE_WEAPONS['weapon_leather_whip'] = {
  name: 'Leather Whip',
  type: 'one_handed_crush',
  roundtime: 1.0,
  minRoundtime: 1.5,
  damageType: ['crush'],
  strReq: 10,
  disReq: 75,
  damageFactors: { 1: 0.275, 5: 0.150, 6: 0.150, 7: 0.150, 8: 0.150, 9: 0.090, 10: 0.090, 11: 0.090, 12: 0.090, 13: 0.100, 14: 0.100, 15: 0.100, 16: 0.100, 17: 0.035, 18: 0.035, 19: 0.035, 20: 0.035 },
  attackVsDefense: { 1: 35, 5: 25, 6: 24, 7: 23, 8: 22, 9: 20, 10: 18, 11: 16, 12: 14, 13: 25, 14: 21, 15: 17, 16: 13, 17: 15, 18: 9, 19: 3, 20: -3 }
};

BASE_WEAPONS['weapon_crowbill'] = {
  name: 'Crowbill',
  type: 'one_handed_crush',
  roundtime: 1.5,
  minRoundtime: 1.5,
  damageType: ['puncture', 'crush'],
  strReq: 65,
  disReq: 250,
  damageFactors: { 1: 0.350, 5: 0.250, 6: 0.250, 7: 0.250, 8: 0.250, 9: 0.200, 10: 0.200, 11: 0.200, 12: 0.200, 13: 0.150, 14: 0.150, 15: 0.150, 16: 0.150, 17: 0.125, 18: 0.125, 19: 0.125, 20: 0.125 },
  attackVsDefense: { 1: 40, 5: 36, 6: 35, 7: 34, 8: 33, 9: 30, 10: 28, 11: 26, 12: 24, 13: 30, 14: 26, 15: 22, 16: 18, 17: 20, 18: 14, 19: 8, 20: 2 }
};

BASE_WEAPONS['weapon_cudgel'] = {
  name: 'Cudgel',
  type: 'one_handed_crush',
  roundtime: 2.0,
  minRoundtime: 2.0,
  damageType: ['crush'],
  strReq: 8,
  disReq: 130,
  damageFactors: { 1: 0.350, 5: 0.275, 6: 0.275, 7: 0.275, 8: 0.275, 9: 0.200, 10: 0.200, 11: 0.200, 12: 0.200, 13: 0.225, 14: 0.225, 15: 0.225, 16: 0.225, 17: 0.150, 18: 0.150, 19: 0.150, 20: 0.150 },
  attackVsDefense: { 1: 20, 5: 20, 6: 19, 7: 18, 8: 17, 9: 25, 10: 23, 11: 21, 12: 19, 13: 25, 14: 21, 15: 17, 16: 13, 17: 30, 18: 24, 19: 18, 20: 12 }
};

BASE_WEAPONS['weapon_mace'] = {
  name: 'Mace',
  type: 'one_handed_crush',
  roundtime: 2.0,
  minRoundtime: 2.0,
  damageType: ['crush'],
  strReq: 65,
  disReq: 250,
  damageFactors: { 1: 0.400, 5: 0.300, 6: 0.300, 7: 0.300, 8: 0.300, 9: 0.225, 10: 0.225, 11: 0.225, 12: 0.225, 13: 0.250, 14: 0.250, 15: 0.250, 16: 0.250, 17: 0.175, 18: 0.175, 19: 0.175, 20: 0.175 },
  attackVsDefense: { 1: 31, 5: 32, 6: 31, 7: 30, 8: 29, 9: 35, 10: 33, 11: 31, 12: 29, 13: 42, 14: 38, 15: 34, 16: 30, 17: 36, 18: 30, 19: 24, 20: 18 }
};

BASE_WEAPONS['weapon_ball_and_chain'] = {
  name: 'Ball and Chain',
  type: 'one_handed_crush',
  roundtime: 3.0,
  minRoundtime: 2.0,
  damageType: ['crush'],
  strReq: 75,
  disReq: 175,
  damageFactors: { 1: 0.400, 5: 0.300, 6: 0.300, 7: 0.300, 8: 0.300, 9: 0.230, 10: 0.230, 11: 0.230, 12: 0.230, 13: 0.260, 14: 0.260, 15: 0.260, 16: 0.260, 17: 0.180, 18: 0.180, 19: 0.180, 20: 0.180 },
  attackVsDefense: { 1: 15, 5: 20, 6: 19, 7: 18, 8: 17, 9: 27, 10: 25, 11: 23, 12: 21, 13: 35, 14: 31, 15: 27, 16: 23, 17: 30, 18: 24, 19: 18, 20: 12 }
};

BASE_WEAPONS['weapon_war_hammer'] = {
  name: 'War Hammer',
  type: 'one_handed_crush',
  roundtime: 2.0,
  minRoundtime: 2.0,
  damageType: ['puncture', 'crush'],
  strReq: 60,
  disReq: 155,
  damageFactors: { 1: 0.410, 5: 0.290, 6: 0.290, 7: 0.290, 8: 0.290, 9: 0.250, 10: 0.250, 11: 0.250, 12: 0.250, 13: 0.275, 14: 0.275, 15: 0.275, 16: 0.275, 17: 0.200, 18: 0.200, 19: 0.200, 20: 0.200 },
  attackVsDefense: { 1: 25, 5: 30, 6: 29, 7: 28, 8: 27, 9: 32, 10: 30, 11: 28, 12: 26, 13: 41, 14: 37, 15: 33, 16: 29, 17: 37, 18: 31, 19: 25, 20: 19 }
};

BASE_WEAPONS['weapon_morning_star'] = {
  name: 'Morning Star',
  type: 'one_handed_crush',
  roundtime: 2.5,
  minRoundtime: 2.0,
  damageType: ['crush', 'puncture'],
  strReq: 65,
  disReq: 250,
  damageFactors: { 1: 0.425, 5: 0.325, 6: 0.325, 7: 0.325, 8: 0.325, 9: 0.275, 10: 0.275, 11: 0.275, 12: 0.275, 13: 0.300, 14: 0.300, 15: 0.300, 16: 0.300, 17: 0.225, 18: 0.225, 19: 0.225, 20: 0.225 },
  attackVsDefense: { 1: 33, 5: 35, 6: 34, 7: 33, 8: 32, 9: 34, 10: 32, 11: 30, 12: 28, 13: 42, 14: 38, 15: 34, 16: 30, 17: 37, 18: 31, 19: 25, 20: 19 }
};

module.exports = BASE_WEAPONS;

