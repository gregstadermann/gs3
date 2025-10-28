'use strict';

const WoundSystem = require('../systems/WoundSystem');

/**
 * Tend Command
 * Allows players to bandage bleeding wounds
 * NOTE: TEND can be used even during roundtime/lag
 */
module.exports = {
  name: 'tend',
  description: 'Tend and bandage bleeding wounds',
  usage: 'tend [my|character] <area>',
  
  async execute(player, args) {
    if (args.length === 0) {
      return {
        success: false,
        message: 'Tend what? Usage: tend my <area> or tend <character> <area>\r\n'
      };
    }

    // Parse target (self or other player)
    let target = player;
    let locationArg = '';
    
    if (args[0].toLowerCase() === 'my') {
      target = player;
      locationArg = args.slice(1).join(' ');
    } else {
      // TODO: Support tending other players
      target = player;
      locationArg = args.join(' ');
    }

    if (!locationArg) {
      return {
        success: false,
        message: 'Tend which area? Usage: tend my chest, tend my right arm, etc.\r\n'
      };
    }

    // Initialize wounds
    WoundSystem.initializeWounds(target);
    
    // Normalize location
    const location = this.normalizeLocation(locationArg);
    
    // Get wound at this location
    const wounds = WoundSystem.getAllWounds(target);
    const wound = wounds[location];
    
    if (!wound) {
      return {
        success: false,
        message: `You don't have any wounds at ${locationArg}.\r\n`
      };
    }

    // Check if wound is bleeding (rank 2+)
    if (wound.rank < 2) {
      return {
        success: false,
        message: `That area is not bleeding.\r\n`
      };
    }

    // Get wound difficulty
    const difficulty = this.getWoundDifficulty(location);
    
    // Calculate bleed per round
    const bleedPerRound = wound.rank === 2 ? 2 : 4;
    
    // Check if already bandaged
    if (wound.bandaged) {
      return {
        success: false,
        message: `You have already bandaged that wound.\r\n`
      };
    }

    // Calculate First Aid ranks required
    const firstAidRanks = this.getFirstAidRanks(player); // TODO: Get from player skills
    const ranksRequired = ((2 * difficulty) + (6 * wound.rank) - 12) * bleedPerRound;
    
    // If target is self, display message
    let message = '';
    if (target === player) {
      message = 'You begin to do your best to bandage your wound.\r\n';
    } else {
      message = `You begin to tend ${target.name}'s wound.\r\n`;
    }

    // Check if player has enough ranks to tend
    const isPartial = firstAidRanks >= (ranksRequired / 2) && firstAidRanks < ranksRequired;
    const isFull = firstAidRanks >= ranksRequired;
    
    if (!isPartial && !isFull) {
      return {
        success: false,
        message: 'The severity of that injury is beyond your skill to tend.\r\n'
      };
    }

    // Calculate roundtime
    const baseRoundtime = (2 * difficulty) + (6 * wound.rank) + (2 * bleedPerRound) + 3;
    const extraRanks = isFull ? Math.max(0, firstAidRanks - ranksRequired) : 0;
    const roundtime = Math.max(3, baseRoundtime - extraRanks);
    
    // Apply bandage
    if (isPartial) {
      wound.bandaged = true;
      wound.bandageReduction = 0.5; // Reduce bleed by half
      message += 'After some effort you manage to reduce the bleeding somewhat.\r\n';
    } else if (isFull) {
      wound.bandaged = true;
      wound.bandageReduction = 1.0; // Stop bleeding completely
      message += 'After some effort you manage to stop the bleeding.\r\n';
    }
    
    message += `Roundtime: ${roundtime} sec.\r\n`;
    
    // Add roundtime to player
    if (player.gameEngine?.combatSystem) {
      player.gameEngine.combatSystem.addLag(player, roundtime * 1000);
    }
    
    // If tending someone else, add roundtime to them
    if (target !== player && target.gameEngine?.combatSystem) {
      target.gameEngine.combatSystem.addLag(target, roundtime * 1000);
    }

    return {
      success: true,
      message: message
    };
  },

  /**
   * Get wound difficulty based on location
   */
  getWoundDifficulty(location) {
    const low = ['back', 'right_arm', 'left_arm', 'right_hand', 'left_hand', 'right_leg', 'left_leg'];
    const medium = ['head', 'chest', 'abdomen'];
    const high = ['neck'];
    
    if (low.includes(location)) return 1;
    if (medium.includes(location)) return 2;
    if (high.includes(location)) return 3;
    return 1;
  },

  /**
   * Get First Aid ranks for player
   * TODO: Retrieve from actual skill system
   */
  getFirstAidRanks(player) {
    // For now, give everyone enough skill to tend rank 2 wounds
    return 50; // TODO: Get from player.skills.firstAid.ranks
  },

  /**
   * Normalize location name
   */
  normalizeLocation(location) {
    const lower = location.toLowerCase().trim();
    
    // Handle common variations
    const locationMap = {
      'head': 'head',
      'neck': 'neck',
      'chest': 'chest',
      'back': 'back',
      'abdomen': 'abdomen',
      'right arm': 'right_arm',
      'r arm': 'right_arm',
      'left arm': 'left_arm',
      'l arm': 'left_arm',
      'right hand': 'right_hand',
      'r hand': 'right_hand',
      'left hand': 'left_hand',
      'l hand': 'left_hand',
      'right leg': 'right_leg',
      'r leg': 'right_leg',
      'left leg': 'left_leg',
      'l leg': 'left_leg'
    };
    
    return locationMap[lower] || lower.replace(/ /g, '_');
  }
};

