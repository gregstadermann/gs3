'use strict';

const WoundSystem = require('../systems/WoundSystem');
const { getHerb, isHerb } = require('../data/wehnimers-landing-herbs');
const { checkRoundtime } = require('../utils/roundtimeChecker');

/**
 * Eat Command
 * Allows players to consume herbs for healing
 */
module.exports = {
  name: 'eat',
  aliases: ['consume'],
  description: 'Eat or consume herbs for healing',
  usage: 'eat <herb>',
  
  async execute(player, args) {
    // Check roundtime/lag
    const roundtimeCheck = checkRoundtime(player);
    if (roundtimeCheck) {
      return roundtimeCheck;
    }

    if (args.length === 0) {
      return {
        success: false,
        message: 'Eat what?\r\n'
      };
    }

    const herbName = args.join(' ');
    
    // Find the herb in player's hands or inventory
    let herb = null;
    let herbItem = null;
    let handSlot = null;
    const db = player.gameEngine.roomSystem.db;
    
    // Check right hand
    if (player.equipment?.rightHand && typeof player.equipment.rightHand === 'string') {
      const item = await db.collection('items').findOne({ id: player.equipment.rightHand });
      if (item && isHerb(item)) {
        herbItem = item;
        herb = getHerb(item.metadata.baseItem);
        handSlot = 'rightHand';
      }
    }
    
    // Check left hand
    if (!herb && player.equipment?.leftHand && typeof player.equipment.leftHand === 'string') {
      const item = await db.collection('items').findOne({ id: player.equipment.leftHand });
      if (item && isHerb(item)) {
        herbItem = item;
        herb = getHerb(item.metadata.baseItem);
        handSlot = 'leftHand';
      }
    }

    // Check inventory (if needed later)
    // TODO: Check inventory for herbs

    if (!herb) {
      return {
        success: false,
        message: `You don't have ${herbName}.\r\n`
      };
    }

    // Apply healing based on herb type
    let message = '';
    let roundtime = herb.roundtime || 5;
    
    // Heal HP
    if (herb.heals === 'hp') {
      const healResult = WoundSystem.healHP(player, herb.amount);
      message = `You eat ${herb.name}.\r\n`;
      message += `You feel somewhat restored!\r\n`;
      message += `Restored ${healResult.restoredHP} HP. Your health is now ${healResult.currentHealth}/${healResult.maxHealth}.\r\n`;
      
      // Remove herb from hand
      if (handSlot) {
        player.equipment[handSlot] = null;
      }
    }
    // Heal wounds
    else if (herb.heals === 'wound') {
      // Determine which body parts to heal
      const bodyParts = this.getBodyPartsForHerbType(herb.type);
      let healed = false;
      
      for (const location of bodyParts) {
        const woundRank = herb.woundRank || 3;
        const result = WoundSystem.healWithHerb(player, location, woundRank, 0);
        
        if (result.healed) {
          healed = true;
          message = `You eat ${herb.name}.\r\n`;
          message += `You feel your ${location} wound healing!\r\n`;
          break;
        }
      }
      
      if (!healed) {
        message = `You eat ${herb.name}.\r\n`;
        message += `It doesn't seem to help any of your wounds.\r\n`;
      } else {
        // Remove herb from hand
        if (herbItem === player.equipment.rightHand) {
          player.equipment.rightHand = null;
        } else if (herbItem === player.equipment.leftHand) {
          player.equipment.leftHand = null;
        }
      }
      
      roundtime = this.getHerbRoundtime(herb);
    }
    // Heal scars
    else if (herb.heals === 'scar') {
      const bodyParts = this.getBodyPartsForHerbType(herb.type);
      let healed = false;
      
      for (const location of bodyParts) {
        const scarRank = herb.scarRank || 3;
        const result = WoundSystem.healWithHerb(player, location, 0, scarRank);
        
        if (result.healed) {
          healed = true;
          message = `You eat ${herb.name}.\r\n`;
          message += `You feel your ${location} scar healing!\r\n`;
          break;
        }
      }
      
      if (!healed) {
        message = `You eat ${herb.name}.\r\n`;
        message += `It doesn't seem to help any of your scars.\r\n`;
      } else {
        // Remove herb from hand
        if (herbItem === player.equipment.rightHand) {
          player.equipment.rightHand = null;
        } else if (herbItem === player.equipment.leftHand) {
          player.equipment.leftHand = null;
        }
      }
      
      roundtime = this.getHerbRoundtime(herb);
    }

    // Add roundtime
    if (player.gameEngine?.combatSystem) {
      player.gameEngine.combatSystem.addLag(player, roundtime * 1000);
      message += `Roundtime: ${roundtime} sec.\r\n`;
    }

    return {
      success: true,
      message: message
    };
  },

  /**
   * Get body parts for herb type
   */
  getBodyPartsForHerbType(type) {
    const bodyParts = {
      'nervous_system': ['nervous_system'],
      'head': ['head', 'neck'],
      'chest': ['chest', 'abdomen', 'back', 'right_eye', 'left_eye'],
      'limbs': ['right_arm', 'left_arm', 'right_leg', 'left_leg', 'right_hand', 'left_hand']
    };
    
    return bodyParts[type] || [];
  },

  /**
   * Get roundtime for herb based on what it heals
   */
  getHerbRoundtime(herb) {
    if (herb.roundtime) {
      return herb.roundtime;
    }
    
    // Default roundtimes based on what it heals
    if (herb.woundRank === 1 || (herb.heals === 'scar' && herb.scarRank === 1)) {
      return 5;
    } else if (herb.woundRank === 2 || (herb.heals === 'scar' && herb.scarRank === 2)) {
      return 10;
    } else if (herb.woundRank === 3 || (herb.heals === 'scar' && herb.scarRank === 3)) {
      return 15;
    }
    
    return 5;
  }
};

