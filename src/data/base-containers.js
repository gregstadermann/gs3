'use strict';

// Base container definitions
// These are templates used to create container item instances in-game

const BASE_CONTAINERS = {
  container_heavy_backpack: {
    name: 'a heavy backpack',
    type: 'CONTAINER',
    weight: 8, // lbs
    slot: 'back',
    keywords: ['backpack','heavy'],
    description: 'A rugged, heavy backpack with reinforced straps and a sturdy frame.',
    container: {
      maxItems: 50,
      minWeight: 0,
      maxWeight: 100, // default overall capacity in lbs (can be tuned later)
    }
  }
};

module.exports = BASE_CONTAINERS;


