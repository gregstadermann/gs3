'use strict';

/**
 * Wehnimer's Landing Herbs
 * Healing herbs available in the Wehnimers Landing area
 */

const WEHNIMERS_LANDING_HERBS = {
  // Blood healing (HP restoration)
  'acantha leaf': {
    name: 'some acantha leaf',
    type: 'blood',
    heals: 'hp',
    amount: 10,
    quantity: 10,
    weight: 2,
    roundtime: 5
  },

  // Nervous System healing
  'wolifrew lichen': {
    name: 'some wolifrew lichen',
    type: 'nervous_system',
    heals: 'wound',
    woundRank: 1,
    quantity: 4,
    weight: 2,
    roundtime: 5
  },
  'torban leaf': {
    name: 'some torban leaf',
    type: 'nervous_system',
    heals: 'scar',
    scarRank: 1,
    quantity: 3,
    weight: 2,
    roundtime: 15
  },
  'woth flower': {
    name: 'some woth flower',
    type: 'nervous_system',
    heals: 'scar',
    scarRank: 3,
    quantity: 2,
    weight: 2,
    roundtime: 30
  },

  // Head & Neck healing
  'aloeas stem': {
    name: 'some aloeas stem',
    type: 'head',
    heals: 'wound',
    woundRank: 3,
    quantity: 2,
    weight: 2,
    roundtime: 15
  },
  'haphip root': {
    name: 'some haphip root',
    type: 'head',
    heals: 'scar',
    scarRank: 1,
    quantity: 4,
    weight: 2,
    roundtime: 15
  },
  'brostheras potion': {
    name: 'some brostheras potion',
    type: 'head',
    heals: 'scar',
    scarRank: 3,
    quantity: 2,
    weight: 2,
    roundtime: 30
  },

  // Torso & Eyes healing
  'basal moss': {
    name: 'some basal moss',
    type: 'chest',
    heals: 'wound',
    woundRank: 1,
    quantity: 4,
    weight: 2,
    roundtime: 5
  },
  'pothinir grass': {
    name: 'some pothinir grass',
    type: 'chest',
    heals: 'wound',
    woundRank: 3,
    quantity: 2,
    weight: 2,
    roundtime: 15
  },

  // Arms & Legs healing
  'ambrominas leaf': {
    name: 'some ambrominas leaf',
    type: 'limbs',
    heals: 'wound',
    woundRank: 1,
    quantity: 4,
    weight: 2,
    roundtime: 5
  },
  'ephlox moss': {
    name: 'some ephlox moss',
    type: 'limbs',
    heals: 'wound',
    woundRank: 3,
    quantity: 4,
    weight: 2,
    roundtime: 15
  },
  'cactacae spine': {
    name: 'some cactacae spine',
    type: 'limbs',
    heals: 'scar',
    scarRank: 1,
    quantity: 4,
    weight: 2,
    roundtime: 15
  },
  'calamia fruit': {
    name: 'some calamia fruit',
    type: 'limbs',
    heals: 'scar',
    scarRank: 3,
    quantity: 2,
    weight: 2,
    roundtime: 30
  }
};

/**
 * Get herb by key
 */
function getHerb(key) {
  return WEHNIMERS_LANDING_HERBS[key.toLowerCase()];
}

/**
 * Get all herbs
 */
function getAllHerbs() {
  return WEHNIMERS_LANDING_HERBS;
}

/**
 * Check if an item is a herb
 */
function isHerb(item) {
  if (!item || !item.metadata) {
    return false;
  }
  
  const baseItem = item.metadata.baseItem;
  if (!baseItem) {
    return false;
  }
  
  return !!WEHNIMERS_LANDING_HERBS[baseItem.toLowerCase()];
}

module.exports = {
  WEHNIMERS_LANDING_HERBS,
  getHerb,
  getAllHerbs,
  isHerb
};

