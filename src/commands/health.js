'use strict';

const WoundSystem = require('../systems/WoundSystem');
const HealthCalculation = require('../services/healthCalculation');

/**
 * Health Command
 * Displays character's wounds, scars, HP, spirit, bleeding, poison, and status
 */
module.exports = {
  name: 'health',
  aliases: ['hp'],
  description: 'View your health status, wounds, and bleeding',
  usage: 'health or hp',
  
  execute(player, args) {
    let message = '';
    
    // Get wounds and scars
    WoundSystem.initializeWounds(player);
    const wounds = WoundSystem.getAllWounds(player);
    const scars = WoundSystem.getAllScars(player);
    
    // Display wounds if any
    const woundDescriptions = [];
    for (const location in wounds) {
      const description = WoundSystem.getWoundDescription(player, location);
      if (description) {
        woundDescriptions.push(description);
      }
    }
    
    // Display scars if any
    const scarDescriptions = [];
    for (const location in scars) {
      // Only show scars if there's no fresh wound at that location
      if (!wounds[location]) {
        const description = WoundSystem.getWoundDescription(player, location);
        if (description) {
          scarDescriptions.push(description);
        }
      }
    }
    
    if (woundDescriptions.length > 0) {
      message += 'You have the following injuries: ';
      message += woundDescriptions.join(', ');
      message += '.\r\n';
    }
    
    if (scarDescriptions.length > 0) {
      message += 'You have the following scars: ';
      message += scarDescriptions.join(' and ');
      message += '.\r\n';
    }
    
    if (woundDescriptions.length === 0 && scarDescriptions.length === 0) {
      message += 'You have no injuries or scars.\r\n';
    }
    
    // Get bleeding wounds
    const bleedingWounds = [];
    const bleedDamage = this.calculateBleedDamage();
    
    for (const location in wounds) {
      const wound = wounds[location];
      if (wound.rank >= 2) {
        let damagePerRound = wound.rank === 2 ? 1 + Math.floor(Math.random() * 2) : 2 + Math.floor(Math.random() * 3);
        
        // Apply bandage reduction
        if (wound.bandaged) {
          const reduction = wound.bandageReduction || 0;
          damagePerRound = Math.floor(damagePerRound * (1 - reduction));
          
          // If fully bandaged, don't show in bleeding table
          if (reduction >= 1.0) {
            continue;
          }
        }
        
        const difficulty = this.getWoundDifficulty(location);
        const firstAidRanks = this.getFirstAidRanks(player);
        const bleedPerRound = wound.rank === 2 ? 2 : 4;
        const ranksRequired = ((2 * difficulty) + (6 * wound.rank) - 12) * bleedPerRound;
        const canTend = firstAidRanks >= (ranksRequired / 2);
        
        bleedingWounds.push({
          location,
          rank: wound.rank,
          damagePerRound,
          bandaged: wound.bandaged || false,
          canTend,
          tendTime: this.getTendTime(player, wound.rank, difficulty, bleedPerRound)
        });
      }
    }
    
    // Display bleeding table if any
    if (bleedingWounds.length > 0) {
      message += '\r\nBleeding:\r\n';
      message += 'Area'.padEnd(20) + 'Health per Round'.padEnd(20) + 'Bandaged'.padEnd(12) + 'Can Tend?'.padEnd(12) + 'Tend Time\r\n';
      message += '-'.repeat(80) + '\r\n';
      
      for (const wound of bleedingWounds) {
        const location = this.formatLocationName(wound.location);
        const bandaged = wound.bandaged ? 'Yes' : 'No';
        const canTend = wound.canTend ? 'Yes' : 'No';
        const tendTime = `${wound.tendTime}s`;
        
        message += location.padEnd(20) + 
                   wound.damagePerRound.toString().padEnd(20) + 
                   bandaged.padEnd(12) + 
                   canTend.padEnd(12) + 
                   tendTime + '\r\n';
      }
      message += '\r\n';
    }
    
    // Calculate HP stats using proper formula
    // Recalculate health to ensure it's up to date
    HealthCalculation.recalculateHealth(player);
    
    const maxHP = player.attributes?.health?.max || 100;
    const currentHP = player.attributes?.health?.current || maxHP;
    const healthRecovery = HealthCalculation.calculateHealthRegen(player);
    
    message += `   Maximum Health Points: ${maxHP}\r\n`;
    message += ` Remaining Health Points: ${currentHP}\r\n`;
    message += `         Health Recovery: ${healthRecovery}\r\n\r\n`;
    
    // Get Spirit stats (if applicable)
    const maxSpirit = player.attributes?.spirit?.base || 10;
    const currentSpirit = maxSpirit; // TODO: Calculate current
    const spiritRecovery = 1; // TODO: Calculate
    
    message += `   Maximum Spirit Points: ${maxSpirit}\r\n`;
    message += ` Remaining Spirit Points: ${currentSpirit}\r\n\r\n`;
    
    // Check for overexertion
    const overexerted = false; // TODO: Implement overexertion
    
    if (overexerted) {
      message += '\r\n[Overexerted status would be displayed here.]\r\n';
    }
    
    // Check for poison
    const poisoned = false; // TODO: Implement poison system
    const poisonDamage = 0;
    const poisonDissipation = 0;
    
    if (poisoned) {
      message += `\r\nPoisoned!  Taking ${poisonDamage} damage per round.  Dissipating ${poisonDissipation} per round.\r\n`;
    }
    
    // Check for diseases
    const diseased = false; // TODO: Implement disease system
    
    if (diseased) {
      message += '[Diseases would be displayed here.]\r\n';
    }
    
    return {
      success: true,
      message: message
    };
  },

  /**
   * Calculate bleed damage (return average)
   */
  calculateBleedDamage() {
    // This is called but the actual calculation is done per wound above
    return 0;
  },

  /**
   * Get tend time based on wound rank, difficulty, and bleed rate
   */
  getTendTime(player, rank, difficulty, bleedPerRound) {
    // Base roundtime formula
    const baseRoundtime = (2 * difficulty) + (6 * rank) + (2 * bleedPerRound) + 3;
    const firstAidRanks = this.getFirstAidRanks(player);
    const ranksRequired = ((2 * difficulty) + (6 * rank) - 12) * bleedPerRound;
    const extraRanks = Math.max(0, firstAidRanks - ranksRequired);
    return Math.max(3, baseRoundtime - extraRanks);
  },

  /**
   * Get wound difficulty
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
   * Get First Aid ranks
   * TODO: Get from actual skill system
   */
  getFirstAidRanks(player) {
    return 50;
  },

  /**
   * Format location name for display
   */
  formatLocationName(location) {
    const formatted = location
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    // Fix special cases
    return formatted
      .replace(/right eye/i, 'Right Eye')
      .replace(/left eye/i, 'Left Eye')
      .replace(/right arm/i, 'Right Arm')
      .replace(/left arm/i, 'Left Arm')
      .replace(/right leg/i, 'Right Leg')
      .replace(/left leg/i, 'Left Leg')
      .replace(/right hand/i, 'Right Hand')
      .replace(/left hand/i, 'Left Hand')
      .replace(/nervous system/i, 'Nervous System');
  }
};

