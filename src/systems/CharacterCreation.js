'use strict';

/**
 * Character Creation System
 * Handles dice rolling, race/class selection, and skill training
 */
class CharacterCreation {
  constructor() {
    this.races = {
      human: {
        name: 'Human',
        statBonusModifiers: {
          strength: 0,
          intelligence: 0,
          wisdom: 0,
          constitution: 0,
          dexterity: 0,
          charisma: 0,
          agility: 0,
          logic: 0,
          discipline: 0,
          aura: 0
        }
      },
      elf: {
        name: 'Elf',
        statBonusModifiers: {
          strength: -1,
          intelligence: 1,
          wisdom: 0,
          constitution: -1,
          dexterity: 1,
          charisma: 0,
          agility: 1,
          logic: 1,
          discipline: 0,
          aura: 0
        }
      },
      dwarf: {
        name: 'Dwarf',
        statBonusModifiers: {
          strength: 1,
          intelligence: 0,
          wisdom: 0,
          constitution: 1,
          dexterity: -1,
          charisma: 0,
          agility: -1,
          logic: 0,
          discipline: 1,
          aura: 0
        }
      },
      halfling: {
        name: 'Halfling',
        statBonusModifiers: {
          strength: -1,
          intelligence: 0,
          wisdom: 0,
          constitution: 0,
          dexterity: 1,
          charisma: 1,
          agility: 1,
          logic: 0,
          discipline: 0,
          aura: 0
        }
      }
    };

    this.classes = {
      warrior: {
        name: 'Warrior',
        manaStat: 'aura',
        primeStats: ['strength', 'constitution'],
        skills: {
          brawling: { name: 'Brawling', cost: [2, 1], ranks: 0 },
          one_handed_edged: { name: 'Edged Weapons', cost: [2, 1], ranks: 0 },
          one_handed_blunt: { name: 'Blunt Weapons', cost: [2, 1], ranks: 0 },
          two_handed: { name: 'Two-Handed Weapons', cost: [3, 1], ranks: 0 },
          polearm: { name: 'Polearm Weapons', cost: [3, 1], ranks: 0 },
          ranged: { name: 'Ranged Weapons', cost: [2, 1], ranks: 0 },
          thrown: { name: 'Thrown Weapons', cost: [2, 1], ranks: 0 },
          combat_maneuvers: { name: 'Combat Maneuvers', cost: [4, 3], ranks: 0 },
          shield_use: { name: 'Shield Use', cost: [2, 0], ranks: 0 },
          armor_use: { name: 'Armor Use', cost: [2, 0], ranks: 0 },
          climbing: { name: 'Climbing', cost: [3, 0], ranks: 0 },
          swimming: { name: 'Swimming', cost: [2, 0], ranks: 0 },
          disarm_traps: { name: 'Disarming Traps', cost: [2, 4], ranks: 0 },
          pick_locks: { name: 'Picking Locks', cost: [2, 3], ranks: 0 },
          stalk_and_hide: { name: 'Stalking & Hiding', cost: [3, 2], ranks: 0 },
          perception: { name: 'Perception', cost: [0, 3], ranks: 0 },
          pickpocketing: { name: 'Picking Pockets', cost: [2, 3], ranks: 0 },
          ambush: { name: 'Ambush', cost: [3, 4], ranks: 0 },
          spell_aim: { name: 'Spell Aiming', cost: [4, 8], ranks: 0 },
          physical_fitness: { name: 'Physical Fitness', cost: [2, 0], ranks: 0, maxRanksPerLevel: 3 },
          mana_share: { name: 'Mana Sharing', cost: [0, 12], ranks: 0 },
          magic_item_use: { name: 'Magic Item Use', cost: [0, 7], ranks: 0 },
          scroll_reading: { name: 'Scroll Reading', cost: [0, 8], ranks: 0 },
          minor_elemental: { name: 'Minor Elemental', cost: [0, 120], ranks: 0 },
          minor_spiritual: { name: 'Minor Spiritual', cost: [0, 120], ranks: 0 },
          first_aid: { name: 'First Aid', cost: [1, 2], ranks: 0 }
        }
      },
      rogue: {
        name: 'Rogue',
        manaStat: 'aura',
        primeStats: ['agility', 'dexterity'],
        skills: {
          brawling: { name: 'Brawling', cost: [10, 2], ranks: 0 },
          one_handed_edged: { name: 'Edged Weapons', cost: [6, 1], ranks: 0 },
          one_handed_blunt: { name: 'Blunt Weapons', cost: [6, 1], ranks: 0 },
          two_handed: { name: 'Two-Handed Weapons', cost: [14, 3], ranks: 0 },
          polearm: { name: 'Polearm Weapons', cost: [14, 3], ranks: 0 },
          ranged: { name: 'Ranged Weapons', cost: [14, 3], ranks: 0 },
          thrown: { name: 'Thrown Weapons', cost: [8, 2], ranks: 0 },
          combat_maneuvers: { name: 'Combat Maneuvers', cost: [12, 8], ranks: 0 },
          shield_use: { name: 'Shield Use', cost: [13, 0], ranks: 0 },
          armor_use: { name: 'Armor Use', cost: [14, 0], ranks: 0 },
          climbing: { name: 'Climbing', cost: [4, 0], ranks: 0 },
          swimming: { name: 'Swimming', cost: [3, 0], ranks: 0 },
          disarm_traps: { name: 'Disarming Traps', cost: [2, 6], ranks: 0 },
          pick_locks: { name: 'Picking Locks', cost: [2, 4], ranks: 0 },
          stalk_and_hide: { name: 'Stalking & Hiding', cost: [5, 4], ranks: 0 },
          perception: { name: 'Perception', cost: [0, 3], ranks: 0 },
          pickpocketing: { name: 'Picking Pockets', cost: [3, 3], ranks: 0 },
          ambush: { name: 'Ambush', cost: [15, 10], ranks: 0 },
          spell_aim: { name: 'Spell Aiming', cost: [2, 1], ranks: 0 },
          physical_fitness: { name: 'Physical Fitness', cost: [8, 0], ranks: 0, maxRanksPerLevel: 2 },
          harness_power: { name: 'Harness Power', cost: [0, 4], ranks: 0 },
          mana_share: { name: 'Mana Sharing', cost: [0, 3], ranks: 0 },
          magic_item_use: { name: 'Magic Item Use', cost: [0, 1], ranks: 0 },
          scroll_reading: { name: 'Scroll Reading', cost: [0, 2], ranks: 0 },
          major_elemental: { name: 'Major Elemental', cost: [0, 8], ranks: 0 },
          minor_elemental: { name: 'Minor Elemental', cost: [0, 8], ranks: 0 },
          wizard_base: { name: 'Wizard Base', cost: [0, 8], ranks: 0 },
          first_aid: { name: 'First Aid', cost: [2, 1], ranks: 0 }
        }
      },
      wizard: {
        name: 'Wizard',
        manaStat: 'aura',
        primeStats: ['aura', 'logic'],
        skills: {
          brawling: { name: 'Brawling', cost: [10, 2], ranks: 0 },
          one_handed_edged: { name: 'Edged Weapons', cost: [6, 1], ranks: 0 },
          one_handed_blunt: { name: 'Blunt Weapons', cost: [6, 1], ranks: 0 },
          two_handed: { name: 'Two-Handed Weapons', cost: [14, 3], ranks: 0 },
          polearm: { name: 'Polearm Weapons', cost: [14, 3], ranks: 0 },
          ranged: { name: 'Ranged Weapons', cost: [14, 3], ranks: 0 },
          thrown: { name: 'Thrown Weapons', cost: [8, 2], ranks: 0 },
          combat_maneuvers: { name: 'Combat Maneuvers', cost: [12, 8], ranks: 0 },
          shield_use: { name: 'Shield Use', cost: [13, 0], ranks: 0 },
          armor_use: { name: 'Armor Use', cost: [14, 0], ranks: 0 },
          climbing: { name: 'Climbing', cost: [4, 0], ranks: 0 },
          swimming: { name: 'Swimming', cost: [3, 0], ranks: 0 },
          disarm_traps: { name: 'Disarming Traps', cost: [2, 6], ranks: 0 },
          pick_locks: { name: 'Picking Locks', cost: [2, 4], ranks: 0 },
          stalk_and_hide: { name: 'Stalking & Hiding', cost: [5, 4], ranks: 0 },
          perception: { name: 'Perception', cost: [0, 3], ranks: 0 },
          pickpocketing: { name: 'Picking Pockets', cost: [3, 3], ranks: 0 },
          ambush: { name: 'Ambush', cost: [15, 10], ranks: 0 },
          spell_aim: { name: 'Spell Aiming', cost: [2, 1], ranks: 0 },
          physical_fitness: { name: 'Physical Fitness', cost: [8, 0], ranks: 0, maxRanksPerLevel: 2 },
          mana_share: { name: 'Mana Sharing', cost: [0, 3], ranks: 0 },
          magic_item_use: { name: 'Magic Item Use', cost: [0, 1], ranks: 0 },
          scroll_reading: { name: 'Scroll Reading', cost: [0, 2], ranks: 0 },
          major_elemental: { name: 'Major Elemental', cost: [0, 8], ranks: 0 },
          minor_elemental: { name: 'Minor Elemental', cost: [0, 8], ranks: 0 },
          wizard_base: { name: 'Wizard Base', cost: [0, 8], ranks: 0 },
          first_aid: { name: 'First Aid', cost: [2, 1], ranks: 0 }
        }
      },
      cleric: {
        name: 'Cleric',
        manaStat: 'wisdom',
        primeStats: ['logic', 'wisdom'],
        skills: {
          brawling: { name: 'Brawling', cost: [10, 2], ranks: 0 },
          one_handed_edged: { name: 'Edged Weapons', cost: [6, 1], ranks: 0 },
          one_handed_blunt: { name: 'Blunt Weapons', cost: [6, 1], ranks: 0 },
          two_handed: { name: 'Two-Handed Weapons', cost: [14, 3], ranks: 0 },
          polearm: { name: 'Polearm Weapons', cost: [14, 3], ranks: 0 },
          ranged: { name: 'Ranged Weapons', cost: [14, 3], ranks: 0 },
          thrown: { name: 'Thrown Weapons', cost: [8, 2], ranks: 0 },
          combat_maneuvers: { name: 'Combat Maneuvers', cost: [12, 8], ranks: 0 },
          shield_use: { name: 'Shield Use', cost: [13, 0], ranks: 0 },
          armor_use: { name: 'Armor Use', cost: [14, 0], ranks: 0 },
          climbing: { name: 'Climbing', cost: [4, 0], ranks: 0 },
          swimming: { name: 'Swimming', cost: [3, 0], ranks: 0 },
          disarm_traps: { name: 'Disarming Traps', cost: [2, 6], ranks: 0 },
          pick_locks: { name: 'Picking Locks', cost: [2, 4], ranks: 0 },
          stalk_and_hide: { name: 'Stalking & Hiding', cost: [5, 4], ranks: 0 },
          perception: { name: 'Perception', cost: [0, 3], ranks: 0 },
          pickpocketing: { name: 'Picking Pockets', cost: [3, 3], ranks: 0 },
          ambush: { name: 'Ambush', cost: [15, 10], ranks: 0 },
          spell_aim: { name: 'Spell Aiming', cost: [2, 1], ranks: 0 },
          physical_fitness: { name: 'Physical Fitness', cost: [8, 0], ranks: 0, maxRanksPerLevel: 2 },
          mana_share: { name: 'Mana Sharing', cost: [0, 3], ranks: 0 },
          magic_item_use: { name: 'Magic Item Use', cost: [0, 1], ranks: 0 },
          scroll_reading: { name: 'Scroll Reading', cost: [0, 2], ranks: 0 },
          cleric_base: { name: 'Cleric Base', cost: [0, 8], ranks: 0 },
          minor_spiritual: { name: 'Minor Spiritual', cost: [0, 8], ranks: 0 },
          major_spiritual: { name: 'Major Spiritual', cost: [0, 8], ranks: 0 },
          first_aid: { name: 'First Aid', cost: [2, 1], ranks: 0 }
        }
      },
      empath: {
        name: 'Empath',
        manaStat: 'wisdom',
        primeStats: ['aura', 'wisdom'],
        skills: {
          brawling: { name: 'Brawling', cost: [10, 2], ranks: 0 },
          one_handed_edged: { name: 'Edged Weapons', cost: [6, 2], ranks: 0 },
          one_handed_blunt: { name: 'Blunt Weapons', cost: [6, 2], ranks: 0 },
          two_handed: { name: 'Two-Handed Weapons', cost: [13, 3], ranks: 0 },
          polearm: { name: 'Polearm Weapons', cost: [14, 3], ranks: 0 },
          ranged: { name: 'Ranged Weapons', cost: [14, 3], ranks: 0 },
          thrown: { name: 'Thrown Weapons', cost: [9, 3], ranks: 0 },
          combat_maneuvers: { name: 'Combat Maneuvers', cost: [12, 8], ranks: 0 },
          shield_use: { name: 'Shield Use', cost: [13, 0], ranks: 0 },
          armor_use: { name: 'Armor Use', cost: [15, 0], ranks: 0 },
          climbing: { name: 'Climbing', cost: [4, 0], ranks: 0 },
          swimming: { name: 'Swimming', cost: [3, 0], ranks: 0 },
          disarm_traps: { name: 'Disarming Traps', cost: [2, 6], ranks: 0 },
          pick_locks: { name: 'Picking Locks', cost: [2, 4], ranks: 0 },
          stalk_and_hide: { name: 'Stalking & Hiding', cost: [5, 4], ranks: 0 },
          perception: { name: 'Perception', cost: [0, 3], ranks: 0 },
          pickpocketing: { name: 'Picking Pockets', cost: [3, 3], ranks: 0 },
          ambush: { name: 'Ambush', cost: [15, 15], ranks: 0 },
          spell_aim: { name: 'Spell Aiming', cost: [3, 1], ranks: 0 },
          physical_fitness: { name: 'Physical Fitness', cost: [2, 0], ranks: 0 },
          mana_share: { name: 'Mana Sharing', cost: [0, 3], ranks: 0 },
          magic_item_use: { name: 'Magic Item Use', cost: [0, 2], ranks: 0 },
          scroll_reading: { name: 'Scroll Reading', cost: [0, 2], ranks: 0 },
          major_elemental: { name: 'Major Elemental', cost: [0, 8], ranks: 0 },
          minor_elemental: { name: 'Minor Elemental', cost: [0, 8], ranks: 0 },
          empath_base: { name: 'Empath Base', cost: [0, 8], ranks: 0 },
          first_aid: { name: 'First Aid', cost: [1, 0], ranks: 0 }
        }
      },
      ranger: {
        name: 'Ranger',
        manaStat: 'wisdom',
        primeStats: ['wisdom', 'dexterity'],
        skills: {
          brawling: { name: 'Brawling', cost: [4, 1], ranks: 0 },
          one_handed_edged: { name: 'Edged Weapons', cost: [3, 1], ranks: 0 },
          one_handed_blunt: { name: 'Blunt Weapons', cost: [4, 1], ranks: 0 },
          two_handed: { name: 'Two-Handed Weapons', cost: [6, 2], ranks: 0 },
          polearm: { name: 'Polearm Weapons', cost: [7, 2], ranks: 0 },
          ranged: { name: 'Ranged Weapons', cost: [3, 1], ranks: 0 },
          thrown: { name: 'Thrown Weapons', cost: [3, 1], ranks: 0 },
          combat_maneuvers: { name: 'Combat Maneuvers', cost: [6, 3], ranks: 0 },
          shield_use: { name: 'Shield Use', cost: [4, 0], ranks: 0 },
          armor_use: { name: 'Armor Use', cost: [4, 2], ranks: 0 },
          climbing: { name: 'Climbing', cost: [2, 0], ranks: 0 },
          swimming: { name: 'Swimming', cost: [2, 0], ranks: 0 },
          disarm_traps: { name: 'Disarming Traps', cost: [2, 4], ranks: 0 },
          pick_locks: { name: 'Picking Locks', cost: [2, 3], ranks: 0 },
          stalk_and_hide: { name: 'Stalking & Hiding', cost: [2, 1], ranks: 0 },
          perception: { name: 'Perception', cost: [0, 2], ranks: 0 },
          pickpocketing: { name: 'Picking Pockets', cost: [2, 3], ranks: 0 },
          ambush: { name: 'Ambush', cost: [3, 3], ranks: 0 },
          spell_aim: { name: 'Spell Aiming', cost: [5, 15], ranks: 0 },
          physical_fitness: { name: 'Physical Fitness', cost: [4, 0], ranks: 0, maxRanksPerLevel: 3 },
          harness_power: { name: 'Harness Power', cost: [0, 5], ranks: 0 },
          mana_share: { name: 'Mana Sharing', cost: [0, 5], ranks: 0 },
          magic_item_use: { name: 'Magic Item Use', cost: [0, 5], ranks: 0 },
          scroll_reading: { name: 'Scroll Reading', cost: [0, 5], ranks: 0 },
          major_spiritual: { name: 'Major Spiritual', cost: [0, 17], ranks: 0 },
          minor_spiritual: { name: 'Minor Spiritual', cost: [0, 17], ranks: 0 },
          ranger_base: { name: 'Ranger Base', cost: [0, 17], ranks: 0 },
          first_aid: { name: 'First Aid', cost: [2, 1], ranks: 0 }
        }
      },
      paladin: {
        name: 'Paladin',
        manaStat: 'wisdom',
        primeStats: ['wisdom', 'strength'],
        skills: {
          brawling: { name: 'Brawling', cost: [4, 1], ranks: 0 },
          one_handed_edged: { name: 'Edged Weapons', cost: [3, 1], ranks: 0 },
          one_handed_blunt: { name: 'Blunt Weapons', cost: [3, 1], ranks: 0 },
          two_handed: { name: 'Two-Handed Weapons', cost: [4, 2], ranks: 0 },
          polearm: { name: 'Polearm Weapons', cost: [5, 2], ranks: 0 },
          ranged: { name: 'Ranged Weapons', cost: [6, 2], ranks: 0 },
          thrown: { name: 'Thrown Weapons', cost: [5, 1], ranks: 0 },
          combat_maneuvers: { name: 'Combat Maneuvers', cost: [5, 4], ranks: 0 },
          shield_use: { name: 'Shield Use', cost: [3, 0], ranks: 0 },
          armor_use: { name: 'Armor Use', cost: [3, 0], ranks: 0 },
          climbing: { name: 'Climbing', cost: [3, 0], ranks: 0 },
          swimming: { name: 'Swimming', cost: [2, 0], ranks: 0 },
          disarm_traps: { name: 'Disarming Traps', cost: [2, 5], ranks: 0 },
          pick_locks: { name: 'Picking Locks', cost: [2, 4], ranks: 0 },
          stalk_and_hide: { name: 'Stalking & Hiding', cost: [4, 4], ranks: 0 },
          perception: { name: 'Perception', cost: [0, 3], ranks: 0 },
          pickpocketing: { name: 'Picking Pockets', cost: [4, 4], ranks: 0 },
          ambush: { name: 'Ambush', cost: [4, 5], ranks: 0 },
          spell_aim: { name: 'Spell Aiming', cost: [4, 2], ranks: 0 },
          physical_fitness: { name: 'Physical Fitness', cost: [3, 0], ranks: 0, maxRanksPerLevel: 3 },
          harness_power: { name: 'Harness Power', cost: [0, 5], ranks: 0 },
          mana_share: { name: 'Mana Sharing', cost: [0, 15], ranks: 0 },
          magic_item_use: { name: 'Magic Item Use', cost: [0, 5], ranks: 0 },
          scroll_reading: { name: 'Scroll Reading', cost: [0, 5], ranks: 0 },
          minor_spiritual: { name: 'Minor Spiritual', cost: [0, 17], ranks: 0 },
          paladin_base: { name: 'Paladin Base', cost: [0, 17], ranks: 0 },
          first_aid: { name: 'First Aid', cost: [1, 1], ranks: 0 }
        }
      },
      bard: {
        name: 'Bard',
        manaStat: 'aura',
        primeStats: ['charisma', 'aura'],
        skills: {
          brawling: { name: 'Brawling', cost: [10, 2], ranks: 0 },
          one_handed_edged: { name: 'Edged Weapons', cost: [6, 1], ranks: 0 },
          one_handed_blunt: { name: 'Blunt Weapons', cost: [6, 1], ranks: 0 },
          two_handed: { name: 'Two-Handed Weapons', cost: [14, 3], ranks: 0 },
          polearm: { name: 'Polearm Weapons', cost: [14, 3], ranks: 0 },
          ranged: { name: 'Ranged Weapons', cost: [14, 3], ranks: 0 },
          thrown: { name: 'Thrown Weapons', cost: [8, 2], ranks: 0 },
          combat_maneuvers: { name: 'Combat Maneuvers', cost: [12, 8], ranks: 0 },
          shield_use: { name: 'Shield Use', cost: [13, 0], ranks: 0 },
          armor_use: { name: 'Armor Use', cost: [14, 0], ranks: 0 },
          climbing: { name: 'Climbing', cost: [4, 0], ranks: 0 },
          swimming: { name: 'Swimming', cost: [3, 0], ranks: 0 },
          disarm_traps: { name: 'Disarming Traps', cost: [2, 6], ranks: 0 },
          pick_locks: { name: 'Picking Locks', cost: [2, 4], ranks: 0 },
          stalk_and_hide: { name: 'Stalking & Hiding', cost: [5, 4], ranks: 0 },
          perception: { name: 'Perception', cost: [0, 3], ranks: 0 },
          pickpocketing: { name: 'Picking Pockets', cost: [3, 3], ranks: 0 },
          ambush: { name: 'Ambush', cost: [15, 10], ranks: 0 },
          spell_aim: { name: 'Spell Aiming', cost: [2, 1], ranks: 0 },
          physical_fitness: { name: 'Physical Fitness', cost: [8, 0], ranks: 0, maxRanksPerLevel: 2 },
          harness_power: { name: 'Harness Power', cost: [0, 4], ranks: 0 },
          mana_share: { name: 'Mana Sharing', cost: [0, 3], ranks: 0 },
          magic_item_use: { name: 'Magic Item Use', cost: [0, 1], ranks: 0 },
          scroll_reading: { name: 'Scroll Reading', cost: [0, 2], ranks: 0 },
          major_elemental: { name: 'Major Elemental', cost: [0, 8], ranks: 0 },
          minor_elemental: { name: 'Minor Elemental', cost: [0, 8], ranks: 0 },
          wizard_base: { name: 'Wizard Base', cost: [0, 8], ranks: 0 },
          first_aid: { name: 'First Aid', cost: [2, 1], ranks: 0 }
        }
      },
      sorcerer: {
        name: 'Sorcerer',
        manaStat: 'aura',
        primeStats: ['aura', 'wisdom'],
        skills: {
          brawling: { name: 'Brawling', cost: [10, 2], ranks: 0 },
          one_handed_edged: { name: 'Edged Weapons', cost: [6, 1], ranks: 0 },
          one_handed_blunt: { name: 'Blunt Weapons', cost: [6, 1], ranks: 0 },
          two_handed: { name: 'Two-Handed Weapons', cost: [14, 3], ranks: 0 },
          polearm: { name: 'Polearm Weapons', cost: [14, 3], ranks: 0 },
          ranged: { name: 'Ranged Weapons', cost: [14, 3], ranks: 0 },
          thrown: { name: 'Thrown Weapons', cost: [8, 2], ranks: 0 },
          combat_maneuvers: { name: 'Combat Maneuvers', cost: [12, 8], ranks: 0 },
          shield_use: { name: 'Shield Use', cost: [13, 0], ranks: 0 },
          armor_use: { name: 'Armor Use', cost: [15, 0], ranks: 0 },
          climbing: { name: 'Climbing', cost: [4, 0], ranks: 0 },
          swimming: { name: 'Swimming', cost: [3, 0], ranks: 0 },
          disarm_traps: { name: 'Disarming Traps', cost: [2, 6], ranks: 0 },
          pick_locks: { name: 'Picking Locks', cost: [2, 4], ranks: 0 },
          stalk_and_hide: { name: 'Stalking & Hiding', cost: [5, 4], ranks: 0 },
          perception: { name: 'Perception', cost: [0, 3], ranks: 0 },
          pickpocketing: { name: 'Picking Pockets', cost: [3, 3], ranks: 0 },
          ambush: { name: 'Ambush', cost: [15, 10], ranks: 0 },
          spell_aim: { name: 'Spell Aiming', cost: [3, 1], ranks: 0 },
          physical_fitness: { name: 'Physical Fitness', cost: [8, 0], ranks: 0, maxRanksPerLevel: 2 },
          harness_power: { name: 'Harness Power', cost: [0, 4], ranks: 0 },
          mana_share: { name: 'Mana Sharing', cost: [0, 3], ranks: 0 },
          magic_item_use: { name: 'Magic Item Use', cost: [0, 2], ranks: 0 },
          scroll_reading: { name: 'Scroll Reading', cost: [0, 1], ranks: 0 },
          minor_spiritual: { name: 'Minor Spiritual', cost: [0, 8], ranks: 0 },
          minor_elemental: { name: 'Minor Elemental', cost: [0, 8], ranks: 0 },
          sorcerer_base: { name: 'Sorcerer Base', cost: [0, 8], ranks: 0 },
          first_aid: { name: 'First Aid', cost: [2, 1], ranks: 0 }
        }
      }
    };
  }

  /**
   * Roll 3d6 for stat generation
   */
  roll3d6() {
    return Math.floor(Math.random() * 6) + 1 + 
           Math.floor(Math.random() * 6) + 1 + 
           Math.floor(Math.random() * 6) + 1;
  }


  /**
   * Apply race bonuses to stats
   */
  applyRaceBonuses(baseStats, race) {
    const raceData = this.races[race];
    if (!raceData) return baseStats;

    const finalStats = { ...baseStats };
    
    for (const [stat, bonus] of Object.entries(raceData.statBonusModifiers)) {
      finalStats[stat] = Math.max(3, finalStats[stat] + bonus);
    }

    return finalStats;
  }

  /**
   * Calculate starting training points based on stats
   */
  calculateStartingTPs(stats) {
    // Physical TPs based on physical stats
    const physicalTPs = 25 + Math.floor(
      ((stats.aura + stats.discipline) / 2) +
      (stats.strength + stats.constitution + stats.dexterity + stats.agility) / 20
    );

    // Mental TPs based on mental stats  
    const mentalTPs = 25 + Math.floor(
      ((stats.aura + stats.discipline) / 2) +
      (stats.intelligence + stats.wisdom + stats.logic + stats.charisma) / 20
    );

    return [physicalTPs, mentalTPs];
  }

  /**
   * Create a new character with full creation process
   */
  createCharacter(name, race, playerClass, statAllocation = {}) {
    // Apply race bonuses to stat allocation
    const raceStats = this.applyRaceBonuses(statAllocation, race);
    
    // Calculate starting TPs
    const [physicalTPs, mentalTPs] = this.calculateStartingTPs(raceStats);
    
    // Get class data
    const classData = this.classes[playerClass];
    if (!classData) {
      throw new Error(`Invalid class: ${playerClass}`);
    }

    // Create character object
    // Capitalize profession name for class field (e.g., 'wizard' -> 'Wizard')
    const capitalizedClass = playerClass ? playerClass.charAt(0).toUpperCase() + playerClass.slice(1).toLowerCase() : playerClass;
    const character = {
      name: name,
      race: race,
      class: capitalizedClass,
      level: 1,
      experience: 0,
      attributes: {},
      skills: {},
      tps: [physicalTPs, mentalTPs], // [physical, mental]
      room: 'wehnimers-landing-town:tsc',
      account: name,
      metadata: {
        lastLogin: new Date().toISOString(),
        isOnline: true,
        creationDate: new Date().toISOString()
      }
    };

    // Set up attributes with base and delta
    for (const [stat, value] of Object.entries(raceStats)) {
      character.attributes[stat] = {
        base: value,
        delta: 0
      };
    }

    // Calculate health using proper HP formula
    const HealthCalculation = require('../services/healthCalculation');
    const maxHP = HealthCalculation.calculateMaxHP(character);

    // Add health and mana
    character.attributes.health = {
      current: maxHP,
      max: maxHP
    };
    character.attributes.mana = {
      base: 50,
      delta: 0
    };

    // Set up skills from class
    for (const [skillId, skillData] of Object.entries(classData.skills)) {
      character.skills[skillId] = {
        name: skillData.name,
        cost: skillData.cost,
        ranks: 0,
        maxRanksPerLevel: skillData.maxRanksPerLevel || 3 // Default to 3 if not specified
      };
    }

    return character;
  }

  /**
   * Train a skill (spend TPs)
   * Cost increases based on current ranks
   */
  trainSkill(character, skillId, ranks) {
    const skill = character.skills[skillId];
    if (!skill) {
      return { success: false, message: 'Skill not found.' };
    }

    // Get max ranks per level from skill definition
    const maxRanksPerLevel = skill.maxRanksPerLevel || 3; // Default to 3 if not specified

    // Check how many ranks trained this level
    const ranksInCurrentLevel = skill.ranks % maxRanksPerLevel;
    const maxRanksAllowed = maxRanksPerLevel - ranksInCurrentLevel;
    
    // Check if trying to train more than allowed this level
    if (ranks > maxRanksAllowed) {
      return { 
        success: false, 
        message: `You can only train ${maxRanksAllowed} more rank(s) in ${skill.name} this level (${maxRanksPerLevel} max per level).` 
      };
    }

    const [basePhysicalCost, baseMentalCost] = skill.cost;
    let totalPhysicalCost = 0;
    let totalMentalCost = 0;

    // Calculate cost for each rank
    // Cost multiplier depends on max ranks per level:
    // - 1 rank per level: always 1x
    // - 2 ranks per level: 1st rank = 1x, 2nd rank = 2x
    // - 3 ranks per level: 1st rank = 1x, 2nd rank = 2x, 3rd rank = 4x
    for (let i = 0; i < ranks; i++) {
      const rankInLevel = ranksInCurrentLevel + i;
      let costMultiplier;
      
      if (maxRanksPerLevel === 1) {
        costMultiplier = 1;
      } else if (maxRanksPerLevel === 2) {
        if (rankInLevel === 0) costMultiplier = 1;      // 1st rank
        else costMultiplier = 2;                        // 2nd rank
      } else {
        // Default to 3 ranks per level
      if (rankInLevel === 0) costMultiplier = 1;      // 1st rank
      else if (rankInLevel === 1) costMultiplier = 2; // 2nd rank  
      else costMultiplier = 4;                        // 3rd rank
      }
      
      const physicalCost = basePhysicalCost * costMultiplier;
      const mentalCost = baseMentalCost * costMultiplier;
      
      totalPhysicalCost += physicalCost;
      totalMentalCost += mentalCost;
    }

    // Check available TPs
    const availablePhysical = character.tps[0];
    const availableMental = character.tps[1];
    
    let neededPhysical = totalPhysicalCost;
    let neededMental = totalMentalCost;
    let physicalRemaining = availablePhysical;
    let mentalRemaining = availableMental;
    
    // First, spend available TPs
    const physicalSpent = Math.min(neededPhysical, physicalRemaining);
    neededPhysical -= physicalSpent;
    physicalRemaining -= physicalSpent;
    
    const mentalSpent = Math.min(neededMental, mentalRemaining);
    neededMental -= mentalSpent;
    mentalRemaining -= mentalSpent;
    
    // Convert 2:1 ratio if one pool is exhausted (at 0)
    let conversionMessage = '';
    if (mentalRemaining === 0 && neededMental > 0 && physicalRemaining >= neededMental * 2) {
      // Convert physical to mental (2:1)
      const converted = Math.floor(neededMental);
      physicalRemaining -= converted * 2;
      mentalRemaining += converted;
      neededMental = 0;
      conversionMessage = ` (Converted ${converted * 2} physical TPs to ${converted} mental TP)`;
    } else if (physicalRemaining === 0 && neededPhysical > 0 && mentalRemaining >= neededPhysical * 2) {
      // Convert mental to physical (2:1)
      const converted = Math.floor(neededPhysical);
      mentalRemaining -= converted * 2;
      physicalRemaining += converted;
      neededPhysical = 0;
      conversionMessage = ` (Converted ${converted * 2} mental TPs to ${converted} physical TP)`;
    }
    
    // Check if we still don't have enough
    if (neededPhysical > 0 || neededMental > 0) {
      return { 
        success: false, 
        message: `Not enough training points. Need ${totalPhysicalCost} physical and ${totalMentalCost} mental TPs.` 
      };
    }

    // Spend TPs
    character.tps[0] = physicalRemaining;
    character.tps[1] = mentalRemaining;
    skill.ranks += ranks;

    // If Physical Fitness was trained, recalculate HP
    if (skillId === 'physical_fitness') {
      try {
        const HealthCalculation = require('../services/healthCalculation');
        HealthCalculation.recalculateHealth(character);
      } catch (error) {
        console.warn(`[TRAIN] Could not recalculate health after PF training:`, error.message);
      }
    }

    return { 
      success: true, 
      message: `Trained ${skill.name} to rank ${skill.ranks}. Spent ${totalPhysicalCost} physical and ${totalMentalCost} mental TPs.${conversionMessage}`,
      remainingTPs: character.tps
    };
  }

  /**
   * Get available races
   */
  getRaces() {
    return Object.keys(this.races).map(raceId => ({
      id: raceId,
      name: this.races[raceId].name,
      bonuses: this.races[raceId].statBonusModifiers
    }));
  }

  /**
   * Get available classes
   */
  getClasses() {
    return Object.keys(this.classes).map(classId => ({
      id: classId,
      name: this.classes[classId].name,
      primeStats: this.classes[classId].primeStats,
      skills: Object.keys(this.classes[classId].skills)
    }));
  }

  /**
   * Get character creation summary
   */
  getCreationSummary(character) {
    return {
      name: character.name,
      race: character.race,
      class: character.class,
      stats: character.attributes,
      tps: character.tps,
      skills: character.skills
    };
  }
}

module.exports = CharacterCreation;
