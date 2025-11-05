'use strict';

/**
 * Base Container Definitions
 * Templates used to create container item instances in-game
 * 
 * Based on Gemstone3 container system:
 * - Weight capacity determines how much the container can hold (in pounds)
 * - Item capacity determines max number of items
 * - Container weight is the empty container's weight
 * 
 * See: src/constants/containers.js for capacity ranges and standards
 */

const BASE_CONTAINERS = {
  // SMALL (5-7 lbs capacity)
  container_small_sack: {
    name: 'a small sack',
    type: 'CONTAINER',
    weight: 1,
    slot: 'belt',
    keywords: ['sack', 'small'],
    description: 'A small cloth sack with a drawstring closure.',
    container: {
      maxItems: 10,
      weightCapacity: 5  // Small capacity
    }
  },
  
  container_herb_pouch: {
    name: 'an herb pouch',
    type: 'CONTAINER',
    weight: 0.5,
    slot: 'belt',
    keywords: ['pouch', 'herb'],
    description: 'A small leather pouch designed for storing herbs and reagents.',
    container: {
      maxItems: 15,
      weightCapacity: 5  // Small capacity
    }
  },
  
  // FAIRLY SMALL (8-11 lbs capacity)
  container_small_chest: {
    name: 'a small chest',
    type: 'CONTAINER',
    weight: 6,
    slot: null,  // Portable, not worn
    keywords: ['chest', 'small'],
    description: 'A small wooden chest with brass fittings and a hinged lid.',
    container: {
      maxItems: 8,
      weightCapacity: 10  // Fairly small capacity
    }
  },
  
  // SOMEWHAT SMALL (12-15 lbs capacity)
  container_scabbard: {
    name: 'a leather scabbard',
    type: 'CONTAINER',
    weight: 2,
    slot: 'belt',
    keywords: ['scabbard', 'leather'],
    description: 'A leather scabbard designed to hold a single weapon.',
    container: {
      maxItems: 1,  // Holds one weapon
      weightCapacity: 15  // Somewhat small capacity
    }
  },
  
  container_sheath: {
    name: 'a weapon sheath',
    type: 'CONTAINER',
    weight: 1,
    slot: 'belt',
    keywords: ['sheath', 'weapon'],
    description: 'A simple weapon sheath.',
    container: {
      maxItems: 1,
      weightCapacity: 15  // Somewhat small capacity
    }
  },
  
  // MEDIUM (20-39 lbs capacity)
  container_large_sack: {
    name: 'a large sack',
    type: 'CONTAINER',
    weight: 2,
    slot: 'shoulder',
    keywords: ['sack', 'large'],
    description: 'A large burlap sack with a sturdy rope closure.',
    container: {
      maxItems: 20,
      weightCapacity: 20  // Medium capacity
    }
  },
  
  // SLIGHTLY LARGE (40-49 lbs capacity)
  container_knapsack: {
    name: 'a canvas knapsack',
    type: 'CONTAINER',
    weight: 5,
    slot: 'back',
    keywords: ['knapsack', 'canvas'],
    description: 'A sturdy canvas knapsack with leather straps.',
    container: {
      maxItems: 30,
      weightCapacity: 40  // Slightly large capacity
    }
  },
  
  container_rucksack: {
    name: 'a leather rucksack',
    type: 'CONTAINER',
    weight: 5,
    slot: 'back',
    keywords: ['rucksack', 'leather'],
    description: 'A well-worn leather rucksack with multiple compartments.',
    container: {
      maxItems: 30,
      weightCapacity: 40  // Slightly large capacity
    }
  },
  
  // VERY LARGE (80-99 lbs capacity)
  container_small_chest_heavy: {
    name: 'a reinforced small chest',
    type: 'CONTAINER',
    weight: 6,
    slot: null,  // Not worn - too heavy
    keywords: ['chest', 'small', 'reinforced'],
    description: 'A small wooden chest reinforced with iron bands. Despite its small size, it has considerable internal capacity. Items can also be stored on its surface.',
    container: {
      maxItems: 40,
      weightCapacity: 80,  // Very large internal capacity
      surfaceCapacity: 10  // Fairly small surface capacity
    }
  },
  
  // SIGNIFICANT (100-119 lbs capacity)
  container_backpack: {
    name: 'a heavy backpack',
    type: 'CONTAINER',
    weight: 8,
    slot: 'back',
    keywords: ['backpack', 'heavy'],
    description: 'A rugged, heavy backpack with reinforced straps and a sturdy frame.',
    container: {
      maxItems: 50,
      weightCapacity: 100  // Significant capacity
    }
  },
  
  // GIGANTIC (200-1000 lbs capacity) - Treasure System
  container_treasure_box: {
    name: 'a treasure box',
    type: 'CONTAINER',
    weight: 10,
    slot: null,  // Not worn
    keywords: ['box', 'treasure'],
    description: 'A mysterious box from the treasure system, capable of holding vast amounts.',
    container: {
      maxItems: 100,
      weightCapacity: 500  // Gigantic capacity
    }
  },
  
  // Specialized containers
  container_gem_pouch: {
    name: 'a gem pouch',
    type: 'CONTAINER',
    weight: 0.5,
    slot: 'belt',
    keywords: ['pouch', 'gem'],
    description: 'A soft velvet pouch designed specifically for storing gems.',
    container: {
      maxItems: 50,  // Many gems (they're small/light)
      weightCapacity: 5,  // Small weight capacity
      restriction: 'gems'  // Only accepts gems
    }
  },
  
  container_coin_purse: {
    name: 'a coin purse',
    type: 'CONTAINER',
    weight: 0.3,
    slot: 'belt',
    keywords: ['purse', 'coin'],
    description: 'A small leather coin purse.',
    container: {
      maxItems: 1,  // Holds coins as single "item"
      weightCapacity: 3,
      restriction: 'coins'
    }
  },
  
  container_quiver: {
    name: 'a leather quiver',
    type: 'CONTAINER',
    weight: 1,
    slot: 'shoulder',
    keywords: ['quiver', 'leather'],
    description: 'A leather quiver designed to hold arrows or bolts.',
    container: {
      maxItems: 30,
      weightCapacity: 10,
      restriction: 'ammunition'
    }
  }
};

module.exports = BASE_CONTAINERS;


