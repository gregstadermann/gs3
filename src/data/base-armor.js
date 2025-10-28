'use strict';

// Base Armor Definitions (main armor only, accessories omitted for now)
// Keys use asg name mapping for convenience

const BASE_ARMOR = {
  'armor_clothing': {
    name: 'Normal Clothing', asg: 1, ag: 1, baseWeight: 0, rt: 0, ap: 0, cva: { normal: 25, magical: 20 }, spellHindrance: {}, coverage: ['torso']
  },
  'armor_robes': {
    name: 'Flowing robes', asg: 2, ag: 1, baseWeight: 8, rt: 0, ap: 0, cva: { normal: 25, magical: 15 }, spellHindrance: {}, coverage: ['torso']
  },
  'armor_light_leather': {
    name: 'Light Leather', asg: 5, ag: 2, baseWeight: 10, rt: 0, ap: 0, cva: { normal: 20, magical: 15 }, spellHindrance: {}, coverage: ['torso']
  },
  'armor_full_leather': {
    name: 'Full Leather', asg: 6, ag: 2, baseWeight: 13, rt: 1, ap: -1, cva: { normal: 19, magical: 14 }, spellHindrance: {}, coverage: ['torso','arms']
  },
  'armor_reinforced_leather': {
    name: 'Reinforced Leather', asg: 7, ag: 2, baseWeight: 15, rt: 2, ap: -5, cva: { normal: 18, magical: 13 }, spellHindrance: {}, coverage: ['torso','arms']
  },
  'armor_double_leather': {
    name: 'Double Leather', asg: 8, ag: 2, baseWeight: 16, rt: 2, ap: -6, cva: { normal: 17, magical: 12 }, spellHindrance: {}, coverage: ['torso','arms','legs']
  },
  'armor_leather_breastplate': {
    name: 'Leather Breastplate', asg: 9, ag: 3, baseWeight: 16, rt: 3, ap: -7, cva: { normal: 11, magical: 5 }, spellHindrance: {}, coverage: ['torso']
  },
  'armor_cuirbouilli_leather': {
    name: 'Cuirbouilli Leather', asg: 10, ag: 3, baseWeight: 17, rt: 4, ap: -8, cva: { normal: 10, magical: 4 }, spellHindrance: {}, coverage: ['torso','arms']
  },
  'armor_studded_leather': {
    name: 'Studded Leather', asg: 11, ag: 3, baseWeight: 20, rt: 5, ap: -10, cva: { normal: 9, magical: 3 }, spellHindrance: {}, coverage: ['torso','arms']
  },
  'armor_brigandine': {
    name: 'Brigandine Armor', asg: 12, ag: 3, baseWeight: 25, rt: 6, ap: -12, cva: { normal: 8, magical: 2 }, spellHindrance: {}, coverage: ['torso','arms','legs']
  },
  'armor_chain_mail': {
    name: 'Chain Mail', asg: 13, ag: 4, baseWeight: 25, rt: 7, ap: -13, cva: { normal: 1, magical: -6 }, spellHindrance: {}, coverage: ['torso']
  },
  'armor_double_chain': {
    name: 'Double Chain', asg: 14, ag: 4, baseWeight: 25, rt: 8, ap: -14, cva: { normal: 0, magical: -7 }, spellHindrance: {}, coverage: ['torso','arms']
  },
  'armor_augmented_chain': {
    name: 'Augmented Chain', asg: 15, ag: 4, baseWeight: 26, rt: 8, ap: -16, cva: { normal: -1, magical: -8 }, spellHindrance: {}, coverage: ['torso','arms']
  },
  'armor_chain_hauberk': {
    name: 'Chain Hauberk', asg: 16, ag: 4, baseWeight: 27, rt: 9, ap: -18, cva: { normal: -2, magical: -9 }, spellHindrance: {}, coverage: ['torso','arms','legs']
  },
  'armor_metal_breastplate': {
    name: 'Metal Breastplate', asg: 17, ag: 5, baseWeight: 23, rt: 9, ap: -20, cva: { normal: -10, magical: -18 }, spellHindrance: {}, coverage: ['torso']
  },
  'armor_augmented_plate': {
    name: 'Augmented Breastplate', asg: 18, ag: 5, baseWeight: 25, rt: 10, ap: -25, cva: { normal: -11, magical: -19 }, spellHindrance: {}, coverage: ['torso','arms']
  },
  'armor_half_plate': {
    name: 'Half Plate', asg: 19, ag: 5, baseWeight: 50, rt: 11, ap: -30, cva: { normal: -12, magical: -20 }, spellHindrance: {}, coverage: ['torso','arms']
  },
  'armor_full_plate': {
    name: 'Full Plate', asg: 20, ag: 5, baseWeight: 75, rt: 12, ap: -35, cva: { normal: -13, magical: -21 }, spellHindrance: {}, coverage: ['torso','arms','legs']
  }
};

module.exports = BASE_ARMOR;


