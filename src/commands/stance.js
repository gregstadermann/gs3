'use strict';

const { checkRoundtime } = require('../utils/roundtimeChecker');

/**
 * Stance Command
 * Changes combat stance (offensive to defensive)
 * Affects AS (Attack Strength) and DS (Defensive Strength)
 */
module.exports = {
  name: 'stance',
  aliases: ['posture'],
  description: 'Change your combat stance',
  usage: 'stance <offensive|advance|forward|neutral|guarded|defensive>',
  
  execute(player, args) {
    // Check roundtime/lag
    const roundtimeCheck = checkRoundtime(player);
    if (roundtimeCheck) {
      return roundtimeCheck;
    }

    if (args.length === 0) {
      // Show current stance
      const stance = player.combatStance || 'neutral';
      const stanceInfo = this.getStanceInfo(stance);
      
      return { 
        success: true, 
        message: `You are in ${stance.toUpperCase()} stance (${stanceInfo.percent}% defensive).\r\n` 
      };
    }

    const stanceArg = args[0].toLowerCase();
    
    // Map stance names to canonical stance
    const stanceMap = {
      'o': 'offensive',
      'off': 'offensive',
      'offensive': 'offensive',
      'a': 'advance',
      'adv': 'advance',
      'advance': 'advance',
      'f': 'forward',
      'for': 'forward',
      'forward': 'forward',
      'n': 'neutral',
      'neu': 'neutral',
      'neutral': 'neutral',
      'g': 'guarded',
      'gua': 'guarded',
      'guarded': 'guarded',
      'd': 'defensive',
      'def': 'defensive',
      'defensive': 'defensive'
    };

    const newStance = stanceMap[stanceArg];
    
    if (!newStance) {
      return { 
        success: false, 
        message: 'Valid stances: OFFENSIVE, ADVANCE, FORWARD, NEUTRAL, GUARDED, DEFENSIVE\r\n' 
      };
    }

    // Get stance information
    const stanceInfo = this.getStanceInfo(newStance);
    const oldStance = player.combatStance || 'neutral';
    const oldStanceInfo = this.getStanceInfo(oldStance);

    // Set new stance
    player.combatStance = newStance;

    // Determine stance change message
    let message = '';
    
    if (newStance === 'offensive') {
      message = `You drop all defense as you move into a battle-ready stance.\r\n`;
    } else if (newStance === 'advance') {
      message = `You move into an aggressive stance, clearly preparing for an attack.\r\n`;
    } else if (newStance === 'forward') {
      message = `You switch to a slightly aggressive stance.\r\n`;
    } else if (newStance === 'neutral') {
      message = `You fall back into a relaxed, neutral stance.\r\n`;
    } else if (newStance === 'guarded') {
      message = `You move into a defensive stance, clearly guarding yourself.\r\n`;
    } else if (newStance === 'defensive') {
      message = `You move into a defensive stance, ready to fend off an attack.\r\n`;
    }

    return { 
      success: true, 
      message: message 
    };
  },

  /**
   * Get stance information
   */
  getStanceInfo(stance) {
    const stances = {
      'offensive': { percent: 0, description: 'All offensive, no defense' },
      'advance': { percent: 20, description: 'Mostly offensive, little defense' },
      'forward': { percent: 40, description: 'More offensive, moderate defense' },
      'neutral': { percent: 60, description: 'More defense, moderate offense' },
      'guarded': { percent: 80, description: 'Mostly defensive, little offense' },
      'defensive': { percent: 100, description: 'All defensive, no offense' }
    };

    return stances[stance] || stances['neutral'];
  }
};

