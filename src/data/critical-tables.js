'use strict';

/**
 * Critical Hit Tables
 * Based on Gemstone3 critical hit system
 * Contains messaging for different body parts and damage ranks
 */

const SLASH_CRITICALS = {
  HEAD: [
    { rank: 0, damage: 0, message: 'Flashy swing! Too bad it only bopped the [target]\'s nose.', effects: [], wounds: [] },
    { rank: 1, damage: 5, message: 'Quick slash catches the [target]\'s cheek! Dimples are always nice.', effects: [], wounds: ['R1'] },
    { rank: 2, damage: 10, message: 'Blade slashes across the [target]\'s face! Nice nose job.', effects: ['S1'], wounds: ['R1'] },
    { rank: 3, damage: 15, message: 'Blow to head!', effects: ['S3'], wounds: ['R2'] },
    { rank: 4, damage: 20, message: 'Quick flick of the wrist! The [target] is slashed across its forehead!', effects: ['S6'], wounds: ['R2'] },
    { rank: 5, damage: 25, message: 'Hard blow to the [target]\'s ear! Deep gash and a terrible headache!', effects: ['S8'], wounds: ['R3'] },
    { rank: 6, damage: 30, message: 'Gruesome slash opens the [target]\'s forehead! Grey matter spills forth!', effects: ['F'], wounds: ['R3'] },
    { rank: 7, damage: 35, message: 'Wild upward slash remove the [target]\'s face from its skull! Interesting way to die.', effects: ['F'], wounds: ['R3'] },
    { rank: 8, damage: 40, message: 'Horrible slash to the [target]\'s head! Brain matter goes flying! Looks like it never felt a thing.', effects: ['F'], wounds: ['R3'] },
    { rank: 9, damage: 50, message: 'Gruesome, slashing blow to the side of the [target]\'s head! Skull split open! Brain (and life) vanishes in a fine mist.', effects: ['F'], wounds: ['R3'] }
  ],
  CHEST: [
    { rank: 0, damage: 0, message: 'Weak slash across chest! Slightly less painful than heartburn.', effects: [], wounds: [] },
    { rank: 1, damage: 1, message: 'Deft slash across chest draws blood! The [target] takes a deep breath.', effects: [], wounds: ['R1'] },
    { rank: 2, damage: 10, message: 'Slash to the [target]\'s chest! That heart\'s not broken, it\'s only scratched.', effects: [], wounds: ['R1'] },
    { rank: 3, damage: 15, message: 'Slash to [target]\'s chest. Breathe deep, it\'ll feel better in a minute.', effects: ['S1'], wounds: ['R1'] },
    { rank: 4, damage: 20, message: 'Slashing blow to chest knocks the [target] back a few paces!', effects: ['S3'], wounds: ['R2'] },
    { rank: 5, damage: 25, message: 'Crossing slash to the chest catches the [target]\'s attention!', effects: ['S5'], wounds: ['R2'] },
    { rank: 6, damage: 45, message: 'Hard slash to the [target]\'s side opens its spleen!', effects: ['S6'], wounds: ['R3 chest', 'R2 back'] },
    { rank: 7, damage: 60, message: 'Quick, powerful slash! The [target]\'s chest is ripped open!', effects: ['S8'], wounds: ['R3 chest', 'R2 back'] },
    { rank: 8, damage: 65, message: 'Slash to the [target]\'s ribs opens a sucking chest wound!', effects: ['F'], wounds: ['R3 chest', 'R3 abdomen'] },
    { rank: 9, damage: 70, message: 'Wicked slash slices open the [target]\'s chest! Heart and lung pureed! Sickening!', effects: ['F'], wounds: ['R3 chest', 'R3 abdomen'] }
  ]
  // Note: This is a simplified version. Full implementation would include all body parts
};

/**
 * Get critical hit message based on damage
 * @param {string} damageType - 'slash', 'puncture', 'crush'
 * @param {number} damage - Amount of damage dealt
 * @returns {Object} Critical result
 */
function getCritical(damageType, damage) {
  // Determine body part (random for now)
  const bodyParts = ['HEAD', 'CHEST', 'ABDOMEN', 'RIGHT_ARM', 'LEFT_ARM', 'RIGHT_LEG', 'LEFT_LEG'];
  const bodyPart = bodyParts[Math.floor(Math.random() * bodyParts.length)];

  // Use slash criticals table
  if (damageType === 'slash' && SLASH_CRITICALS[bodyPart]) {
    const table = SLASH_CRITICALS[bodyPart];
    
    // Determine rank based on damage (more damage = higher rank)
    let rank = Math.min(9, Math.floor(damage / 5));
    
    // Get critical entry
    const critical = table[rank];
    
    return {
      bodyPart,
      rank,
      damage: critical.damage,
      message: critical.message,
      effects: critical.effects,
      wounds: critical.wounds,
      isFatal: critical.effects.includes('F'),
      isStun: critical.effects.some(e => e.startsWith('S')),
      isKnockdown: critical.effects.includes('K'),
      isAmputation: critical.effects.includes('A')
    };
  }

  // Default critical
  return {
    bodyPart: 'CHEST',
    rank: 1,
    damage: Math.floor(damage * 0.1),
    message: 'Critical hit!',
    effects: [],
    wounds: [],
    isFatal: false,
    isStun: false,
    isKnockdown: false,
    isAmputation: false
  };
}

module.exports = {
  getCritical,
  SLASH_CRITICALS
};

