'use strict';

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
    if (args.length < 2) {
      return { 
        success: false, 
        message: 'Usage: train <skill> <ranks>\nExample: train brawling 5 or train 1 5\nType "skills" to see available skills and costs.' 
      };
    }

    const [skillNameOrNumber, ranksStr] = args;
    const ranks = parseInt(ranksStr);

    if (isNaN(ranks) || ranks <= 0) {
      return { success: false, message: 'Please enter a valid number of ranks to train.' };
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
        ['climbing', 'swimming', 'disarm_traps', 'pick_locks', 'stalk_and_hide', 'perception', 'ambush', 'survival', 'first_aid'].includes(id)
      );
      const magicSkills = skills.filter(([id, skill]) =>
        ['spell_aim', 'mana_share', 'magic_item_use', 'scroll_reading', 'harness_power', 'major_elemental', 'minor_elemental', 'major_spiritual', 'minor_spiritual', 'cleric_base', 'wizard_base', 'empath_base', 'sorcerer_base', 'ranger_base', 'paladin_base', 'bard_base'].includes(id)
      );
      
      // Combine in display order
      const allSkillsInOrder = [...combatSkills, ...utilitySkills, ...magicSkills];
      
      if (skillNumber < 1 || skillNumber > allSkillsInOrder.length) {
        return { success: false, message: `Skill number ${skillNumber} not found. Type "skills" to see available skills.` };
      }
      
      skillId = allSkillsInOrder[skillNumber - 1][0];
    } else {
      // Find the skill by name (case insensitive)
      skillId = Object.keys(player.skills).find(id => 
        id.toLowerCase() === skillNameOrNumber.toLowerCase() || 
        player.skills[id].name.toLowerCase() === skillNameOrNumber.toLowerCase()
      );

      if (!skillId) {
        return { success: false, message: `Skill "${skillNameOrNumber}" not found. Type "skills" to see available skills.` };
      }
    }

    // Train the skill
    const result = player.gameEngine.characterCreation.trainSkill(player, skillId, ranks);
    
    if (result.success) {
      // Save the player after training
      player.gameEngine.playerSystem.savePlayer(player.name, player);
    }

    return result;
  }
};
