'use strict';

/**
 * Encumbrance Constants (SSOT)
 * Pure data tables with no logic
 */

const ENCUMBRANCE = {
  // Armor base weights by Armor Skill Group (ASG)
  armorBaseWeightByASG: {
    1: 0,   // Skin (robes)
    2: 8,   // Leather
    5: 10,  // Light leather
    6: 13,  // Full leather
    7: 15,  // Reinforced leather
    8: 16,  // Double leather
    9: 16,  // Leather breastplate
    10: 17, // Cuirbouilli leather
    11: 20, // Studded leather
    12: 25, // Brigandine
    13: 25, // Chain mail
    14: 25, // Double chain
    15: 26, // Augmented chain
    16: 27, // Chain hauberk
    17: 23, // Metal breastplate
    18: 25, // Augmented breastplate
    19: 50, // Half plate
    20: 75  // Full plate
  },

  // Currency weight conversion (silvers per pound)
  silversPerPound: 160,

  // Physical Fitness skill reduction: 1 lb capacity per 10 skill bonus
  pfReductionRate: 10,

  // Encumbrance message thresholds (percent of body weight over capacity)
  messageThresholds: [
    { max: 0,   message: 'You adjust your gear comfortably and feel satisfied that you are not encumbered enough to notice.' },
    { max: 10,  message: 'Your load is a bit heavy, but you feel confident that the weight is not affecting your actions very much.' },
    { max: 20,  message: 'You feel somewhat weighed down, but can still move well, though you realize you are not as quick as you could be.' },
    { max: 30,  message: "You can't quite get comfortable, and are definitely feeling the effects of the weight you are carrying. Lightening your load could help." },
    { max: 40,  message: 'Your shoulders are beginning to sag under the weight of your gear, and your reactions are not very fast. Time to unload, perhaps?' },
    { max: 50,  message: 'The weight you are carrying is giving you a backache. Perhaps you should unload some things soon before you actually have to move fast.' },
    { max: 65,  message: "You are beginning to stoop under the load you are carrying, and your reactions are slow. Hope you don't have to dodge anything." },
    { max: 80,  message: 'It is difficult to move quickly at all, and your legs are strained with the effort of carrying all that stuff. You can probably manage to trudge around town, but hunting would be treacherous.' },
    { max: 100, message: "You find it nearly impossible to make any fast moves, and you ache all over from the load you are trying to haul around. Hope you're in a safe place." },
    { max: Infinity, message: 'You are so weighed down with junk you can barely move. You might be able to make it to your locker by summoning all your strength and willpower, but surviving much else would not be a good bet.' }
  ]
};

module.exports = { ENCUMBRANCE };

