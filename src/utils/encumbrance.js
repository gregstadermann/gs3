'use strict';

// Race body weight factors (approx) and base weights used to compute body weight
const RACE_BODY = {
  'burghal gnome': { factor: 0.40, base: 40 },
  'halfling': { factor: 0.4533, base: 45.3333 },
  'forest gnome': { factor: 0.4767, base: 47.6667 },
  'aelotoi': { factor: 0.6767, base: 67.6667 },
  'elf': { factor: 0.70, base: 70 },
  'erithian': { factor: 0.7233, base: 72.3333 },
  'sylvankind': { factor: 0.7233, base: 72.3333 },
  'dark elf': { factor: 0.7767, base: 77.6667 },
  'dwarf': { factor: 0.7767, base: 77.6667 },
  'half-elf': { factor: 0.8233, base: 82.3333 },
  'human': { factor: 0.90, base: 90 },
  'half-krolvin': { factor: 1.00, base: 100 },
  'giantman': { factor: 1.20, base: 120 }
};

// Race armor encumbrance factor (for armor weight delta carry capacity adjustment)
const RACE_ENC_FACTOR = {
  'burghal gnome': 0.50,
  'halfling': 0.50,
  'forest gnome': 0.60,
  'aelotoi': 0.75,
  'elf': 0.78,
  'dwarf': 0.80,
  'sylvankind': 0.81,
  'dark elf': 0.84,
  'erithian': 0.85,
  'half-elf': 0.92,
  'human': 1.00,
  'half-krolvin': 1.10,
  'giantman': 1.33
};

// Armor base weights by ASG
const ARMOR_BASE = {
  1: 0, 2: 8, 5: 10, 6: 13, 7: 15, 8: 16,
  9: 16, 10: 17, 11: 20, 12: 25,
  13: 25, 14: 25, 15: 26, 16: 27,
  17: 23, 18: 25, 19: 50, 20: 75
};

function evenStat(n) { return n % 2 === 0 ? n : n - 1; }

function getBodyWeight(player) {
  const raceKey = (player.race || 'human').toLowerCase();
  const race = RACE_BODY[raceKey] || RACE_BODY['human'];
  const STR = evenStat(player?.attributes?.strength?.base || 50);
  const CON = evenStat(player?.attributes?.constitution?.base || 50);
  let weight = race.base + ((STR + CON) * race.factor);
  // Clamp to 3x base max
  weight = Math.min(weight, race.base * 3);
  return weight;
}

function getUnencumberedCapacity(player) {
  const bodyW = getBodyWeight(player);
  const STR = player?.attributes?.strength?.base || 50; // raw stat, not bonus
  const baseCap = ((STR - 20) / 200) * bodyW + (bodyW / 200);
  // Armor adjustments if non-standard
  let armorAdj = 0;
  try {
    const raceKey = (player.race || 'human').toLowerCase();
    const encFactor = RACE_ENC_FACTOR[raceKey] || 1.0;
    const chest = player.equipment?.chest || player.equipment?.body;
    const asg = chest?.metadata?.armorGroup; // Using armor group as ASG proxy if provided
    const actual = chest?.metadata?.weight;
    if (asg && typeof actual === 'number' && ARMOR_BASE[asg] !== undefined) {
      const standard = ARMOR_BASE[asg];
      armorAdj = (standard - actual) * encFactor; // can be +/-
    }
  } catch (_) {}

  // Physical Fitness mitigation: 1 lb per 10 skill bonus
  const pfRanks = player?.skills?.physical_fitness?.ranks || 0;
  const pfBonus = (pfRanks * 5) / 10; // ranks->bonus: 5 per rank; 1 lb per 10 bonus
  return Math.max(0, baseCap + armorAdj + pfBonus);
}

async function getCarriedWeight(player) {
  // Sum of held and worn items weights if available + container contents + silvers weight
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
  
  const silvers = player.attributes?.currency?.silver || 0;
  total += silvers / 160; // 160 silvers per pound
  return total;
}

async function getEncumbrancePercent(player) {
  const bodyW = getBodyWeight(player);
  const carried = await getCarriedWeight(player);
  const capacity = getUnencumberedCapacity(player);
  const over = Math.max(0, carried - capacity);
  return (over / bodyW) * 100; // percentage of body weight
}

function getEncumbranceMessage(percent) {
  if (percent <= 0) return 'You adjust your gear comfortably and feel satisfied that you are not encumbered enough to notice.';
  if (percent <= 10) return 'Your load is a bit heavy, but you feel confident that the weight is not affecting your actions very much.';
  if (percent <= 20) return 'You feel somewhat weighed down, but can still move well, though you realize you are not as quick as you could be.';
  if (percent <= 30) return "You can't quite get comfortable, and are definitely feeling the effects of the weight you are carrying. Lightening your load could help.";
  if (percent <= 40) return 'Your shoulders are beginning to sag under the weight of your gear, and your reactions are not very fast. Time to unload, perhaps?';
  if (percent <= 50) return 'The weight you are carrying is giving you a backache. Perhaps you should unload some things soon before you actually have to move fast.';
  if (percent <= 65) return "You are beginning to stoop under the load you are carrying, and your reactions are slow. Hope you don't have to dodge anything.";
  if (percent <= 80) return 'It is difficult to move quickly at all, and your legs are strained with the effort of carrying all that stuff. You can probably manage to trudge around town, but hunting would be treacherous.';
  if (percent <= 100) return "You find it nearly impossible to make any fast moves, and you ache all over from the load you are trying to haul around. Hope you're in a safe place.";
  return 'You are so weighed down with junk you can barely move. You might be able to make it to your locker by summoning all your strength and willpower, but surviving much else would not be a good bet.';
}

module.exports = {
  getBodyWeight,
  getUnencumberedCapacity,
  getCarriedWeight,
  getEncumbrancePercent,
  getEncumbranceMessage,
  async recalcEncumbrance(player) {
    try {
      if (!player.attributes) player.attributes = {};
      const bodyW = getBodyWeight(player);
      const capacity = getUnencumberedCapacity(player);
      const carried = await getCarriedWeight(player);
      const pct = await getEncumbrancePercent(player);
      player.attributes.encumbrance = {
        bodyWeight: Math.round(bodyW),
        capacity: Math.round(capacity),
        carried: Math.round(carried),
        percent: Math.round(pct)
      };
    } catch (_) {}
  }
};


