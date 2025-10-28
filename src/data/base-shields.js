'use strict';

// Base Shield Definitions
// Size → type mapping with base weights

const BASE_SHIELDS = {
  'shield_kidney_small': {
    name: 'Kidney Shield',
    size: 'small',
    type: 'kidney',
    baseWeight: 5,
    coverage: ['arm'],
    metadata: { }
  },
  'shield_target_medium': {
    name: 'Target Shield',
    size: 'medium',
    type: 'target',
    baseWeight: 8,
    coverage: ['arm'],
    metadata: { }
  },
  'shield_round_large': {
    name: 'Round Shield',
    size: 'large',
    type: 'round',
    baseWeight: 10,
    coverage: ['arm'],
    metadata: { }
  },
  'shield_great_tower': {
    name: 'Greatshield',
    size: 'tower',
    type: 'greatshield',
    baseWeight: 12,
    coverage: ['arm'],
    metadata: { }
  }
};

module.exports = BASE_SHIELDS;


