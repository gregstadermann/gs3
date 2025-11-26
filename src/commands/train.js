'use strict';

const { checkRoundtime } = require('../utils/roundtimeChecker');

/**
 * Train Command
 * Handles skill training with Training Points (TPs)
 */
module.exports = {
  name: 'train',
  aliases: ['skill'],
  description: 'Train a skill using Training Points',
  usage: 'train <skill> <ranks>',
  
  execute(player, args) {
    // Handle help request
    if (args.length > 0 && (args[0].toLowerCase() === 'help' || args[0].toLowerCase() === '?')) {
      return {
        success: true,
        message: 'TRAIN Command Help\r\n' +
                 '==================\r\n\r\n' +
                 'Usage:\r\n' +
                 '  train <skill> <ranks>     - Train a skill by name or number\r\n' +
                 '  train help                - Show this help message\r\n\r\n' +
                 'Training Basics:\r\n' +
                 '  - You can train up to 3 ranks per skill per level\r\n' +
                 '  - When you level up, your training limit resets\r\n' +
                 '  - Training costs increase: 1st rank = 1x, 2nd rank = 2x, 3rd rank = 4x\r\n' +
                 '  - You need both physical and mental Training Points (TPs)\r\n\r\n' +
                 'Training Point Conversion:\r\n' +
                 '  - If you run out of one type of TP, the system will convert the other type\r\n' +
                 '  - Conversion rate: 2 physical TPs = 1 mental TP (or vice versa)\r\n' +
                 '  - Conversion only happens when one pool is completely exhausted\r\n\r\n' +
                 'Examples:\r\n' +
                 '  train edged 2            - Train 2 ranks of Edged Weapons by name\r\n' +
                 '  train "edged weapons" 1   - Train 1 rank using full skill name\r\n' +
                 '  train 1 3                 - Train 3 ranks of skill #1 from skills list\r\n' +
                 '  train brawling 1          - Train 1 rank of Brawling\r\n' +
                 '  train physical_fitness 2  - Train 2 ranks of Physical Fitness\r\n\r\n' +
                 'Finding Skills:\r\n' +
                 '  - Type "skills" to see all available skills with numbers\r\n' +
                 '  - Use the skill number or name to train\r\n' +
                 '  - Skill names can be partial matches (e.g., "edged" for "Edged Weapons")\r\n\r\n' +
                 'Training Limits:\r\n' +
                 '  - Check "skills" to see how many ranks you\'ve trained this level (X/3)\r\n' +
                 '  - You cannot train more than 3 ranks per skill per level\r\n' +
                 '  - Example: If you see "2/3", you can only train 1 more rank this level\r\n\r\n' +
                 'Cost Calculation:\r\n' +
                 '  - Base cost is shown in the skills list\r\n' +
                 '  - 1st rank this level: base cost × 1\r\n' +
                 '  - 2nd rank this level: base cost × 2\r\n' +
                 '  - 3rd rank this level: base cost × 4\r\n' +
                 '  - Example: If base is 2 physical/1 mental and you train 3 ranks:\r\n' +
                 '            1st rank: 2/1 × 1 = 2/1\r\n' +
                 '            2nd rank: 2/1 × 2 = 4/2\r\n' +
                 '            3rd rank: 2/1 × 4 = 8/4\r\n' +
                 '            Total cost: 14 physical, 7 mental TPs\r\n\r\n' +
                 'Tips:\r\n' +
                 '  - Use "exp" to check your Training Points\r\n' +
                 '  - Use "skills <skill>" to see detailed cost breakdown\r\n' +
                 '  - Plan your training - costs increase significantly for the 3rd rank\r\n\r\n' +
                 'Note: Skill training may be restricted to certain locations.\r\n' +
                 '      Look for innkeepers or trainers who can help you improve your skills.\r\n'
      };
    }

    if (args.length < 2) {
      return { 
        success: false, 
        message: 'Usage: train <skill> <ranks>\r\n' +
                 '       train help              - Show detailed help\r\n\r\n' +
                 'Examples:\r\n' +
                 '  train edged 2                - Train 2 ranks of Edged Weapons\r\n' +
                 '  train 1 3                    - Train 3 ranks of skill #1 from skills list\r\n' +
                 '  train "physical fitness" 1   - Train 1 rank using full skill name\r\n\r\n' +
                 'Type "skills" to see available skills and their numbers.\r\n' +
                 'Type "train help" for detailed training information.\r\n'
      };
    }

    // Check roundtime/lag
    const roundtimeCheck = checkRoundtime(player);
    if (roundtimeCheck) {
      return roundtimeCheck;
    }

    const [skillNameOrNumber, ranksStr] = args;
    const ranks = parseInt(ranksStr);

    if (isNaN(ranks) || ranks <= 0) {
      return { 
        success: false, 
        message: `"${ranksStr}" is not a valid number of ranks to train.\r\n` +
                 'Please enter a positive number (e.g., 1, 2, or 3).\r\n' +
                 'Example: train edged 2\r\n'
      };
    }

    // Check if skillNameOrNumber is a number
    let skillId;
    const skillNumber = parseInt(skillNameOrNumber);
    
    if (!isNaN(skillNumber)) {
      // Try to find skill by number
      const skills = Object.entries(player.skills || {});
      
      // Group skills by category
      const combatSkills = skills.filter(([id, skill]) =>
        ['brawling', 'one_handed_edged', 'one_handed_blunt', 'two_handed', 'polearm', 'ranged', 'thrown', 'combat_maneuvers', 'shield_use', 'armor_use'].includes(id)
      );
      const utilitySkills = skills.filter(([id, skill]) =>
        ['climbing', 'swimming', 'disarm_traps', 'pick_locks', 'stalk_and_hide', 'perception', 'ambush', 'first_aid', 'physical_fitness'].includes(id)
      );
      const magicSkills = skills.filter(([id, skill]) =>
        ['spell_aim', 'mana_share', 'magic_item_use', 'scroll_reading', 'harness_power', 'major_elemental', 'minor_elemental', 'major_spiritual', 'minor_spiritual', 'cleric_base', 'wizard_base', 'empath_base', 'sorcerer_base', 'ranger_base', 'paladin_base', 'bard_base'].includes(id)
      );
      
      // Combine in display order
      const allSkillsInOrder = [...combatSkills, ...utilitySkills, ...magicSkills];
      
      if (skillNumber < 1 || skillNumber > allSkillsInOrder.length) {
        return { 
          success: false, 
          message: `Skill number ${skillNumber} not found.\r\n` +
                   `Available skill numbers: 1-${allSkillsInOrder.length}\r\n` +
                   'Type "skills" to see the full list of skills with their numbers.\r\n' +
                   'Example: train 1 2 (to train 2 ranks of skill #1)\r\n'
        };
      }
      
      skillId = allSkillsInOrder[skillNumber - 1][0];
    } else {
      // Find the skill by name (case insensitive)
      skillId = Object.keys(player.skills).find(id => 
        id.toLowerCase() === skillNameOrNumber.toLowerCase() || 
        player.skills[id].name.toLowerCase() === skillNameOrNumber.toLowerCase()
      );

      if (!skillId) {
        return { 
          success: false, 
          message: `Skill "${skillNameOrNumber}" not found.\r\n` +
                   'Type "skills" to see available skills.\r\n' +
                   'You can train by skill name or number:\r\n' +
                   '  Example: train edged 2        (by name)\r\n' +
                   '  Example: train 1 2            (by number from skills list)\r\n' +
                   'Tip: Skill names can be partial matches (e.g., "edged" for "Edged Weapons").\r\n'
        };
      }
    }

    // Train the skill
    const result = player.gameEngine.characterCreation.trainSkill(player, skillId, ranks);
    
    if (result.success) {
      // If Physical Fitness was trained, HP is already recalculated by trainSkill
      // But we should also recalculate if Constitution changed (unlikely, but good practice)
      // For now, only PF training affects HP
      
      // Save the player after training (HP recalculation happens in trainSkill if PF was trained)
      player.gameEngine.playerSystem.savePlayer(player.name, player);
      
      // Enhance success message with helpful info
      const skill = player.skills[skillId];
      const maxRanksPerLevel = skill.maxRanksPerLevel || 3;
      const ranksThisLevel = skill.ranksThisLevel || 0;
      const ranksRemaining = maxRanksPerLevel - ranksThisLevel;
      
      if (ranksRemaining > 0) {
        result.message += `\r\nYou can train ${ranksRemaining} more rank(s) in ${skill.name} this level (${ranksThisLevel}/${maxRanksPerLevel} trained).`;
      } else {
        result.message += `\r\nYou have reached the maximum training limit (${maxRanksPerLevel}/${maxRanksPerLevel}) for ${skill.name} this level.`;
        result.message += ` You can train more ranks after you level up.`;
      }
    } else {
      // Enhance error messages with helpful suggestions
      if (result.message.includes('can only train')) {
        result.message += '\r\nTip: Check "skills" to see how many ranks you\'ve trained this level (X/3).';
        result.message += ' When you level up, your training limit resets.';
      } else if (result.message.includes('Not enough training points')) {
        result.message += '\r\nTip: Use "exp" to check your Training Points.';
        result.message += ' TPs can be converted 2:1 if one pool is exhausted.';
      }
    }

    return result;
  }
};
