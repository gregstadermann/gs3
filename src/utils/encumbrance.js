'use strict';

/**
 * Encumbrance Utilities (with DB dependencies)
 * Uses pure encumbrance service but adds DB-dependent carried weight calculation
 */

const encumbranceService = require('../services/encumbrance');
const { ENCUMBRANCE } = require('../constants/encumbrance');

/**
 * Calculate carried weight (includes DB queries for items)
 * @param {Object} player - Player object with gameEngine reference
 * @returns {Promise<number>} Total carried weight in pounds
 */
async function getCarriedWeight(player) {
  // Sum of held and worn items weights + container contents + silvers weight
  let total = 0;
  const db = player.gameEngine?.roomSystem?.db;
  
  // Check hands (now stores IDs)
  const hands = [player.equipment?.rightHand, player.equipment?.leftHand];
  for (const itemId of hands) {
    if (itemId && typeof itemId === 'string' && db) {
      try {
        const item = await db.collection('items').findOne({ id: itemId });
        if (item) {
          const weight = item.metadata?.weight || item.metadata?.baseWeight;
          if (typeof weight === 'number') {
            total += weight;
          }
        }
      } catch (_) {}
    }
  }
  
  // Add worn equipment weights (exclude main armor standard weight)
  try {
    const eq = player.equipment || {};
    for (const key of Object.keys(eq)) {
      if (key === 'rightHand' || key === 'leftHand') continue;
      const itemId = eq[key];
      if (!itemId || typeof itemId !== 'string') continue;
      
      // Fetch item from DB
      if (db) {
        try {
          const item = await db.collection('items').findOne({ id: itemId });
          if (!item) continue;
          
          const w = item.metadata?.weight || item.metadata?.baseWeight;
          if (typeof w !== 'number') continue;
          const isArmorMain = !!item.metadata?.armorGroup;
          if (isArmorMain) {
            // Skip main armor weight; capacity adjusted elsewhere
            continue;
          }
          total += w;
          
          // Check if this item is a container and add its contents
          if (item.type === 'CONTAINER' && item.metadata?.container && Array.isArray(item.metadata.items)) {
            for (const containedId of item.metadata.items) {
              if (typeof containedId !== 'string') continue;
              try {
                const containedItem = await db.collection('items').findOne({ id: containedId });
                if (containedItem) {
                  const containedWeight = containedItem.metadata?.weight || containedItem.metadata?.baseWeight;
                  if (typeof containedWeight === 'number') {
                    total += containedWeight;
                  }
                }
              } catch (_) {}
            }
          }
        } catch (_) {}
      }
    }
  } catch (_) {}
  
  // Check inventory items
  if (Array.isArray(player.inventory) && db) {
    for (const itemId of player.inventory) {
      if (typeof itemId !== 'string') continue;
      try {
        const item = await db.collection('items').findOne({ id: itemId });
        if (item) {
          const weight = item.metadata?.weight || item.metadata?.baseWeight;
          if (typeof weight === 'number') {
            total += weight;
          }
        }
      } catch (_) {}
    }
  }
  
  // Add currency weight
  const silvers = player.attributes?.currency?.silver || 0;
  total += encumbranceService.currencyWeight(silvers);
  
  return total;
}

/**
 * Calculate encumbrance percentage (async version with DB)
 * @param {Object} player - Player object
 * @returns {Promise<number>} Encumbrance percentage
 */
async function getEncumbrancePercent(player) {
  const bodyW = encumbranceService.getBodyWeight(player);
  const carried = await getCarriedWeight(player);
  const capacity = encumbranceService.getUnencumberedCapacity(player);
  return encumbranceService.encumbrancePercent(bodyW, carried, capacity);
}

/**
 * Recalculate and update player's encumbrance attribute
 * @param {Object} player - Player object (mutated)
 * @returns {Promise<void>}
 */
async function recalcEncumbrance(player) {
  try {
    if (!player.attributes) player.attributes = {};
    const bodyW = encumbranceService.getBodyWeight(player);
    const capacity = encumbranceService.getUnencumberedCapacity(player);
    const carried = await getCarriedWeight(player);
    const pct = encumbranceService.encumbrancePercent(bodyW, carried, capacity);
    
    player.attributes.encumbrance = {
      bodyWeight: Math.round(bodyW),
      capacity: Math.round(capacity),
      carried: Math.round(carried),
      percent: Math.round(pct)
    };
  } catch (_) {}
}

// Re-export pure functions for convenience
const getBodyWeight = encumbranceService.getBodyWeight;
const getUnencumberedCapacity = encumbranceService.getUnencumberedCapacity;
const getEncumbranceMessage = encumbranceService.getEncumbranceMessage;

module.exports = {
  // DB-dependent functions
  getCarriedWeight,
  getEncumbrancePercent,
  recalcEncumbrance,
  
  // Re-exported pure functions
  getBodyWeight,
  getUnencumberedCapacity,
  getEncumbranceMessage
};
