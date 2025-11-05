'use strict';

/**
 * Container Constants
 * Defines standard container weight capacity ranges and item quantity descriptions
 * Based on Gemstone3 container system
 */

/**
 * Standard Container Weight Capacity Chart
 * 
 * Defines weight capacity ranges (in pounds) for different container sizes
 * Used to determine how much weight a container can hold
 */
const CONTAINER_WEIGHT_CAPACITY = {
  VERY_SMALL: {
    description: 'Very Small',
    minCapacity: 0,
    maxCapacity: 4,
    examples: []
  },
  SMALL: {
    description: 'Small',
    minCapacity: 5,
    maxCapacity: 7,
    examples: ['small sack', 'herb pouch']
  },
  FAIRLY_SMALL: {
    description: 'Fairly Small',
    minCapacity: 8,
    maxCapacity: 11,
    examples: ['small chest (10 lbs)']
  },
  SOMEWHAT_SMALL: {
    description: 'Somewhat Small',
    minCapacity: 12,
    maxCapacity: 15,
    examples: ['scabbard', 'sheath']
  },
  SLIGHTLY_SMALL: {
    description: 'Slightly Small',
    minCapacity: 16,
    maxCapacity: 19,
    examples: []
  },
  MEDIUM: {
    description: 'Medium',
    minCapacity: 20,
    maxCapacity: 39,
    examples: ['large sack']
  },
  SLIGHTLY_LARGE: {
    description: 'Slightly Large',
    minCapacity: 40,
    maxCapacity: 49,
    examples: ['knapsack', 'rucksack']
  },
  FAIRLY_LARGE: {
    description: 'Fairly Large',
    minCapacity: 50,
    maxCapacity: 59,
    examples: []
  },
  LARGE: {
    description: 'Large',
    minCapacity: 60,
    maxCapacity: 69,
    examples: []
  },
  PARTICULARLY_LARGE: {
    description: 'Particularly Large',
    minCapacity: 70,
    maxCapacity: 79,
    examples: []
  },
  VERY_LARGE: {
    description: 'Very Large',
    minCapacity: 80,
    maxCapacity: 99,
    examples: ['small chest (80 lbs)']
  },
  SIGNIFICANT: {
    description: 'Significant',
    minCapacity: 100,
    maxCapacity: 119,
    examples: ['backpack']
  },
  EXCEPTIONAL: {
    description: 'Exceptional',
    minCapacity: 120,
    maxCapacity: 139,
    examples: []
  },
  HUGE: {
    description: 'Huge',
    minCapacity: 140,
    maxCapacity: 159,
    examples: []
  },
  INCREDIBLE: {
    description: 'Incredible',
    minCapacity: 160,
    maxCapacity: 179,
    examples: []
  },
  ENORMOUS: {
    description: 'Enormous',
    minCapacity: 180,
    maxCapacity: 199,
    examples: []
  },
  GIGANTIC: {
    description: 'Gigantic',
    minCapacity: 200,
    maxCapacity: 1000,
    examples: ['treasure system boxes']
  }
};

/**
 * Standard Container Item Quantity Chart
 * 
 * Defines descriptive text for different item counts
 * Used for container examination and messaging
 */
const CONTAINER_ITEM_QUANTITY = {
  ONE_ITEM: {
    description: 'one item',
    minItems: 1,
    maxItems: 1
  },
  COUPLE: {
    description: 'a couple of items',
    minItems: 2,
    maxItems: 2
  },
  FEW: {
    description: 'a few items',
    minItems: 3,
    maxItems: 3
  },
  SEVERAL: {
    description: 'several items',
    minItems: 4,
    maxItems: 6
  },
  NUMBER: {
    description: 'a number of items',
    minItems: 7,
    maxItems: 9
  },
  ANY_NUMBER: {
    description: 'any number of items',
    minItems: 10,
    maxItems: Infinity
  }
};

/**
 * Get capacity description from weight capacity
 * @param {number} weightCapacity - Weight capacity in pounds
 * @returns {string} Description (e.g., "Medium", "Significant")
 */
function getCapacityDescription(weightCapacity) {
  for (const [key, range] of Object.entries(CONTAINER_WEIGHT_CAPACITY)) {
    if (weightCapacity >= range.minCapacity && weightCapacity <= range.maxCapacity) {
      return range.description;
    }
  }
  return 'Unknown';
}

/**
 * Get item quantity description from item count
 * @param {number} itemCount - Number of items in container
 * @returns {string} Description (e.g., "a few items", "several items")
 */
function getItemQuantityDescription(itemCount) {
  for (const range of Object.values(CONTAINER_ITEM_QUANTITY)) {
    if (itemCount >= range.minItems && itemCount <= range.maxItems) {
      return range.description;
    }
  }
  return 'many items';
}

/**
 * Get capacity range for a description
 * @param {string} description - Size description (e.g., "Medium", "Significant")
 * @returns {Object|null} {minCapacity, maxCapacity} or null if not found
 */
function getCapacityRange(description) {
  for (const range of Object.values(CONTAINER_WEIGHT_CAPACITY)) {
    if (range.description.toLowerCase() === description.toLowerCase()) {
      return {
        minCapacity: range.minCapacity,
        maxCapacity: range.maxCapacity
      };
    }
  }
  return null;
}

/**
 * Validate container capacity
 * @param {number} currentWeight - Current weight in container (lbs)
 * @param {number} maxCapacity - Maximum capacity (lbs)
 * @param {number} additionalWeight - Weight to add (lbs)
 * @returns {boolean} True if item fits
 */
function canFitWeight(currentWeight, maxCapacity, additionalWeight) {
  return (currentWeight + additionalWeight) <= maxCapacity;
}

/**
 * Validate container item count
 * @param {number} currentItems - Current item count
 * @param {number} maxItems - Maximum item count
 * @returns {boolean} True if can add another item
 */
function canFitItem(currentItems, maxItems) {
  return currentItems < maxItems;
}

/**
 * Common container definitions with standard capacities
 * These match the "Off-The-Shelf Items" from the chart
 */
const STANDARD_CONTAINERS = {
  // Small (5-7 lbs capacity)
  'small_sack': {
    name: 'small sack',
    weightCapacity: 5,
    maxItems: 10,
    weight: 1
  },
  'herb_pouch': {
    name: 'herb pouch',
    weightCapacity: 5,
    maxItems: 15,  // Specialized for herbs (lighter items)
    weight: 0.5
  },
  
  // Fairly Small (8-11 lbs)
  'small_chest_light': {
    name: 'small chest',
    weightCapacity: 10,
    maxItems: 8,
    weight: 6,
    note: 'Can also store items on surface (fairly small capacity)'
  },
  
  // Somewhat Small (12-15 lbs)
  'scabbard': {
    name: 'scabbard',
    weightCapacity: 15,
    maxItems: 1,  // Typically holds one weapon
    weight: 2
  },
  'sheath': {
    name: 'sheath',
    weightCapacity: 15,
    maxItems: 1,
    weight: 1
  },
  
  // Medium (20-39 lbs)
  'large_sack': {
    name: 'large sack',
    weightCapacity: 20,
    maxItems: 20,
    weight: 2
  },
  
  // Slightly Large (40-49 lbs)
  'knapsack': {
    name: 'knapsack',
    weightCapacity: 40,
    maxItems: 30,
    weight: 5
  },
  'rucksack': {
    name: 'rucksack',
    weightCapacity: 40,
    maxItems: 30,
    weight: 5
  },
  
  // Very Large (80-99 lbs)
  'small_chest_heavy': {
    name: 'small chest',
    weightCapacity: 80,
    maxItems: 40,
    weight: 6,
    note: 'Fairly small surface capacity + very large internal capacity'
  },
  
  // Significant (100-119 lbs)
  'backpack': {
    name: 'backpack',
    weightCapacity: 100,
    maxItems: 50,
    weight: 8
  },
  
  // Gigantic (200-1000 lbs) - Treasure boxes
  'treasure_box': {
    name: 'treasure box',
    weightCapacity: 500,
    maxItems: 100,
    weight: 10,
    note: 'From treasure system'
  }
};

module.exports = {
  CONTAINER_WEIGHT_CAPACITY,
  CONTAINER_ITEM_QUANTITY,
  STANDARD_CONTAINERS,
  
  // Helper functions
  getCapacityDescription,
  getItemQuantityDescription,
  getCapacityRange,
  canFitWeight,
  canFitItem
};

