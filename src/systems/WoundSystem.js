'use strict';

/**
 * Wound System
 * Manages wounds, scars, and their penalties
 * 
 * Body locations:
 * - head, neck, chest, abdomen, back
 * - right_eye, left_eye
 * - right_leg, left_leg, right_arm, left_arm
 * - right_hand, left_hand
 * - nervous_system
 */

const BODY_LOCATIONS = [
  'head', 'neck', 'chest', 'abdomen', 'back',
  'right_eye', 'left_eye',
  'right_leg', 'left_leg', 'right_arm', 'left_arm',
  'right_hand', 'left_hand',
  'nervous_system'
];

const WOUND_MESSAGES = {
  // Wounds (rank 1-3)
  wounds: {
    head: {
      1: 'minor bruises about the head',
      2: 'minor lacerations about the head and a possible mild concussion',
      3: 'severe head trauma and bleeding from the ears'
    },
    neck: {
      1: 'minor bruises on your neck',
      2: 'moderate bleeding from your neck',
      3: 'snapped bones and serious bleeding from your neck'
    },
    chest: {
      1: 'minor cuts and bruises on your chest',
      2: 'deep lacerations across your chest',
      3: 'deep gashes and serious bleeding from your chest'
    },
    abdomen: {
      1: 'minor cuts and bruises on your abdominal area',
      2: 'deep lacerations across your abdominal area',
      3: 'deep gashes and serious bleeding from your abdominal area'
    },
    back: {
      1: 'minor cuts and bruises on your back',
      2: 'deep lacerations across your back',
      3: 'deep gashes and serious bleeding from your back'
    },
    right_eye: {
      1: 'a bruised right eye',
      2: 'a swollen right eye',
      3: 'a blinded right eye'
    },
    left_eye: {
      1: 'a bruised left eye',
      2: 'a swollen left eye',
      3: 'a blinded left eye'
    },
    right_leg: {
      1: 'some minor cuts and bruises on your right leg',
      2: 'a fractured and bleeding right leg',
      3: 'a completely severed right leg'
    },
    left_leg: {
      1: 'some minor cuts and bruises on your left leg',
      2: 'a fractured and bleeding left leg',
      3: 'a completely severed left leg'
    },
    right_arm: {
      1: 'some minor cuts and bruises on your right arm',
      2: 'a fractured and bleeding right arm',
      3: 'a completely severed right arm'
    },
    left_arm: {
      1: 'some minor cuts and bruises on your left arm',
      2: 'a fractured and bleeding left arm',
      3: 'a completely severed left arm'
    },
    right_hand: {
      1: 'some minor cuts and bruises on your right hand',
      2: 'a fractured and bleeding right hand',
      3: 'a completely severed right hand'
    },
    left_hand: {
      1: 'some minor cuts and bruises on your left hand',
      2: 'a fractured and bleeding left hand',
      3: 'a completely severed left hand'
    },
    nervous_system: {
      1: 'a strange case of muscle twitching',
      2: 'a case of sporadic convulsions',
      3: 'a case of uncontrollable convulsions'
    }
  },
  // Scars (rank 1-3)
  scars: {
    head: {
      1: 'a scar across your face',
      2: 'several facial scars',
      3: 'old mutilation wounds about your head'
    },
    neck: {
      1: 'a scar across your neck',
      2: 'some old neck wounds',
      3: 'terrible scars from some serious neck injury'
    },
    chest: {
      1: 'an old battle scar across your chest',
      2: 'several painful-looking scars across your chest',
      3: 'terrible, permanent mutilation of your chest muscles'
    },
    abdomen: {
      1: 'an old battle scar across your abdominal area',
      2: 'several painful-looking scars across your abdominal area',
      3: 'terrible, permanent mutilation of your abdominal muscles'
    },
    back: {
      1: 'an old battle scar across your back',
      2: 'several painful-looking scars across your back',
      3: 'terrible, permanent mutilation of your back muscles'
    },
    right_eye: {
      1: 'a black-and-blue right eye',
      2: 'severe bruises and swelling around your right eye',
      3: 'a missing right eye'
    },
    left_eye: {
      1: 'a black-and-blue left eye',
      2: 'severe bruises and swelling around your left eye',
      3: 'a missing left eye'
    },
    right_leg: {
      1: 'old battle scars on your right leg',
      2: 'a mangled right leg',
      3: 'a missing right leg'
    },
    left_leg: {
      1: 'old battle scars on your left leg',
      2: 'a mangled left leg',
      3: 'a missing left leg'
    },
    right_arm: {
      1: 'old battle scars on your right arm',
      2: 'a mangled right arm',
      3: 'a missing right arm'
    },
    left_arm: {
      1: 'old battle scars on your left arm',
      2: 'a mangled left arm',
      3: 'a missing left arm'
    },
    right_hand: {
      1: 'old battle scars on your right hand',
      2: 'a mangled right hand',
      3: 'a missing right hand'
    },
    left_hand: {
      1: 'old battle scars on your left hand',
      2: 'a mangled left hand',
      3: 'a missing left hand'
    },
    nervous_system: {
      1: 'developed slurred speech',
      2: 'constant muscle spasms',
      3: 'a very difficult time with muscle control'
    }
  }
};

class WoundSystem {
  /**
   * Initialize wound data structure on character
   */
  static initializeWounds(character) {
    if (!character.wounds) {
      character.wounds = {
        wounds: {},  // Fresh wounds
        scars: {}    // Old scars
      };
    }
  }

  /**
   * Add a wound to a character
   * @param {Object} character - Character to wound
   * @param {string} location - Body location
   * @param {number} rank - Wound severity (1-3)
   */
  static addWound(character, location, rank) {
    this.initializeWounds(character);
    
    // Normalize location name (convert CHEST to chest, RIGHT_EYE to right_eye, etc.)
    const normalizedLocation = this.normalizeLocation(location);
    
    // Store wound (if already exists, upgrade to higher rank)
    const currentWound = character.wounds.wounds[normalizedLocation];
    if (!currentWound || currentWound.rank < rank) {
      character.wounds.wounds[normalizedLocation] = {
        rank: rank,
        timestamp: Date.now()
      };
    }
  }

  /**
   * Remove a wound (healing)
   * @param {Object} character - Character to heal
   * @param {string} location - Body location
   * @param {boolean} leaveScar - Whether to leave a scar
   */
  static removeWound(character, location, leaveScar = false) {
    if (!character.wounds) return;
    
    const normalizedLocation = this.normalizeLocation(location);
    const wound = character.wounds.wounds[normalizedLocation];
    
    if (wound) {
      delete character.wounds.wounds[normalizedLocation];
      
      // If healing via herbs, leave a scar
      if (leaveScar) {
        character.wounds.scars[normalizedLocation] = {
          rank: wound.rank,
          timestamp: Date.now()
        };
      }
    }
  }

  /**
   * Get wound description for a location
   * @param {Object} character - Character
   * @param {string} location - Body location
   * @returns {string|null} Wound description or null
   */
  static getWoundDescription(character, location) {
    this.initializeWounds(character);
    
    const normalizedLocation = this.normalizeLocation(location);
    
    // Check for fresh wound first
    const wound = character.wounds.wounds[normalizedLocation];
    if (wound && WOUND_MESSAGES.wounds[normalizedLocation]) {
      return WOUND_MESSAGES.wounds[normalizedLocation][wound.rank] || null;
    }
    
    // Check for scar
    const scar = character.wounds.scars[normalizedLocation];
    if (scar && WOUND_MESSAGES.scars[normalizedLocation]) {
      return WOUND_MESSAGES.scars[normalizedLocation][scar.rank] || null;
    }
    
    return null;
  }

  /**
   * Get all active wounds for a character
   * @returns {Object} Object mapping location to wound info
   */
  static getAllWounds(character) {
    this.initializeWounds(character);
    return character.wounds.wounds || {};
  }

  /**
   * Get all scars for a character
   * @returns {Object} Object mapping location to scar info
   */
  static getAllScars(character) {
    this.initializeWounds(character);
    return character.wounds.scars || {};
  }

  /**
   * Check if character has a wound/scar at a location
   * @returns {number} Highest rank wound/scar (0 = none)
   */
  static getWoundRank(character, location) {
    this.initializeWounds(character);
    
    const normalizedLocation = this.normalizeLocation(location);
    
    // Check wound first
    const wound = character.wounds.wounds[normalizedLocation];
    if (wound) return wound.rank;
    
    // Check scar
    const scar = character.wounds.scars[normalizedLocation];
    if (scar) return scar.rank;
    
    return 0;
  }

  /**
   * Apply wound penalties
   * Returns restrictions based on wounds
   */
  static getWoundPenalties(character) {
    this.initializeWounds(character);
    
    const penalties = {
      canSearch: true,
      canSpellcast: true,
      canRangeAttack: true,
      canSneak: true,
      woundCount: 0,
      bleedingWounds: []
    };

    // Check all wound locations
    for (const location in character.wounds.wounds) {
      const wound = character.wounds.wounds[location];
      const rank = wound.rank;
      
      penalties.woundCount++;
      
      // Rank 2+ wounds bleed
      if (rank >= 2) {
        penalties.bleedingWounds.push(location);
      }
      
      // Apply location-specific restrictions
      if (rank >= 2) {
        // Head: prevents searching, spellcasting
        if (location === 'head') {
          penalties.canSearch = false;
          penalties.canSpellcast = false;
        }
        // Nervous system: prevents spellcasting, searching
        if (location === 'nervous_system') {
          penalties.canSpellcast = false;
          penalties.canSearch = false;
        }
        // Legs: prevents sneaking
        if (location.includes('leg')) {
          penalties.canSneak = false;
        }
        // Arms/hands: prevents ranged attacks
        if (location.includes('arm') || location.includes('hand')) {
          penalties.canRangeAttack = false;
        }
      }
      
      if (rank >= 3) {
        // Head: prevents ranged attacks too
        if (location === 'head') {
          penalties.canRangeAttack = false;
        }
        // Arms/hands: prevents spellcasting
        if (location.includes('arm') || location.includes('hand')) {
          penalties.canSpellcast = false;
        }
      }
    }
    
    // Check scars (rank 2+ have penalties)
    for (const location in character.wounds.scars) {
      const scar = character.wounds.scars[location];
      const rank = scar.rank;
      
      if (rank >= 2) {
        // Same penalties as wounds
        if (location === 'head') {
          penalties.canSearch = false;
          penalties.canSpellcast = false;
        }
        if (location === 'nervous_system') {
          penalties.canSpellcast = false;
          penalties.canSearch = false;
        }
        if (location.includes('leg')) {
          penalties.canSneak = false;
        }
        if (location.includes('arm') || location.includes('hand')) {
          penalties.canRangeAttack = false;
        }
      }
    }
    
    return penalties;
  }

  /**
   * Normalize location name to standard format
   * Converts CHEST -> chest, RIGHT_EYE -> right_eye, etc.
   */
  static normalizeLocation(location) {
    return location.toLowerCase()
      .replace(/_/g, '_')  // Keep underscores
      .replace(/\s+/g, '_'); // Spaces to underscores
  }

  /**
   * Get wound message for display
   * Used in look commands, health display, etc.
   */
  static getWoundDisplayString(character) {
    this.initializeWounds(character);
    
    const woundDescriptions = [];
    
    // Get all wound locations
    for (const location in character.wounds.wounds) {
      const description = this.getWoundDescription(character, location);
      if (description) {
        woundDescriptions.push(`You have ${description}.`);
      }
    }
    
    return woundDescriptions.join('\r\n');
  }

  /**
   * Heal wounds on a specific body part with a herb
   * @param {Object} character - Character to heal
   * @param {string} location - Body location to heal
   * @param {number} woundRank - Maximum wound rank to heal (1-3)
   * @param {number} scarRank - Maximum scar rank to heal (1-3)
   * @returns {Object} Result of healing
   */
  static healWithHerb(character, location, woundRank = 3, scarRank = 3) {
    this.initializeWounds(character);
    
    const normalizedLocation = this.normalizeLocation(location);
    let healed = false;
    let healedWound = null;
    let healedScar = null;
    
    // Try to heal wound
    const wound = character.wounds.wounds[normalizedLocation];
    if (wound && wound.rank <= woundRank) {
      delete character.wounds.wounds[normalizedLocation];
      healedWound = wound.rank;
      healed = true;
    }
    
    // Try to heal scar
    const scar = character.wounds.scars[normalizedLocation];
    if (scar && scar.rank <= scarRank) {
      delete character.wounds.scars[normalizedLocation];
      healedScar = scar.rank;
      healed = true;
    }
    
    return {
      healed,
      healedWound,
      healedScar,
      location: normalizedLocation
    };
  }

  /**
   * Heal HP (blood loss)
   * @param {Object} character - Character to heal
   * @param {number} amount - HP amount to restore
   * @returns {Object} Result
   */
  static healHP(character, amount) {
    if (!character.attributes) {
      character.attributes = {};
    }
    if (!character.attributes.health) {
      character.attributes.health = { base: 100, delta: 0 };
    }
    
    const currentHealth = character.attributes.health.base + character.attributes.health.delta;
    const newHealth = Math.min(100, currentHealth + amount);
    
    character.attributes.health.base = Math.min(100, newHealth);
    character.attributes.health.delta = 0;
    
    return {
      healed: true,
      restoredHP: amount,
      currentHealth: newHealth,
      maxHealth: 100
    };
  }
}

module.exports = WoundSystem;
