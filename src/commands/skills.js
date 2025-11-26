'use strict';

const CharacterCreation = require('../systems/CharacterCreation');
const characterCreation = new CharacterCreation();

/**
 * Skills Command
 * Shows available skills and their training costs
 */
module.exports = {
  name: 'skills',
  aliases: ['skilllist'],
  description: 'Show available skills and training costs',
  usage: 'skills [skill]',
  
  execute(player, args) {
    // Handle help request
    if (args.length > 0 && (args[0].toLowerCase() === 'help' || args[0].toLowerCase() === '?')) {
      return {
        success: true,
        message: 'SKILLS Command Help\r\n' +
                 '==================\r\n\r\n' +
                 'Usage:\r\n' +
                 '  skills              - Show all your skills and training costs\r\n' +
                 '  skills <skill>      - Show detailed information about a specific skill\r\n' +
                 '  skills help         - Show this help message\r\n\r\n' +
                 'Skill Display Format:\r\n' +
                 '  Number) Ranks_This_Level/Max_Per_Level (Cost) Skill_Name (Total_Ranks)\r\n\r\n' +
                 'Example:\r\n' +
                 '  1) 2/3 (4/2) Edged Weapons (17)\r\n' +
                 '     ^  ^ ^    ^^^^              ^^\r\n' +
                 '     |  | |    ||||              ||\r\n' +
                 '     |  | |    ||||              |+-- Total ranks trained across all levels\r\n' +
                 '     |  | |    ||||              +--- (always shown)\r\n' +
                 '     |  | |    |||+-- Mental TP cost for next rank\r\n' +
                 '     |  | |    ||+--- Physical TP cost for next rank\r\n' +
                 '     |  | |    |+---- Cost in parentheses\r\n' +
                 '     |  | +----+----- Max ranks you can train per level (always 3)\r\n' +
                 '     |  +------------- Ranks trained at your current level\r\n' +
                 '     +---------------- Skill number (use with TRAIN command)\r\n\r\n' +
                 'Training Limits:\r\n' +
                 '  - You can train up to 3 ranks per skill per level\r\n' +
                 '  - When you level up, your "ranks this level" resets to 0/3\r\n' +
                 '  - Training costs increase: 1st rank = 1x, 2nd rank = 2x, 3rd rank = 4x\r\n\r\n' +
                 'Training Points (TPs):\r\n' +
                 '  - Physical TPs are used for combat and physical skills\r\n' +
                 '  - Mental TPs are used for magic and mental skills\r\n' +
                 '  - TPs can be converted 2:1 if one pool is exhausted\r\n' +
                 '  - Check your TPs with the EXP command\r\n\r\n' +
                 'Examples:\r\n' +
                 '  skills                    - List all skills\r\n' +
                 '  skills edged              - Show details for Edged Weapons\r\n' +
                 '  skills physical fitness   - Show details for Physical Fitness\r\n\r\n' +
                 'To train a skill, use the TRAIN command:\r\n' +
                 '  train <skill> <ranks>     - Train a skill by name\r\n' +
                 '  train <number> <ranks>     - Train a skill by number from skills list\r\n' +
                 '  Example: train edged 2    - Train 2 ranks of Edged Weapons\r\n' +
                 '  Example: train 1 3        - Train 3 ranks of skill #1\r\n\r\n' +
                 'Note: Skill training may be restricted to certain locations.\r\n' +
                 '      Look for innkeepers or trainers who can help you improve your skills.\r\n'
      };
    }

    if (args.length === 0) {
      // Show all skills
      let message = 'Available Skills:\r\n';
      message += `Training Points: ${player.tps ? player.tps[0] : 0} physical, ${player.tps ? player.tps[1] : 0} mental\r\n`;
      message += 'Format: Number) Ranks_This_Level/Max_Per_Level (Physical/Mental Cost) Skill_Name (Total_Ranks)\r\n';
      message += 'Type "skills help" for detailed help and examples.\r\n\r\n';

      // Ensure skills container exists
      player.skills = player.skills || {};

      // Legacy characters may be missing Physical Fitness. Inject it so the command stays consistent.
      if (!player.skills.physical_fitness) {
        const legacyPTRanks = player.skills.physical_training?.ranks || 0;
        const classKey = (
          player.class ||
          player.playerClass ||
          player.profession ||
          ''
        ).toLowerCase();

        const classData = characterCreation.classes?.[classKey];
        const classPhysicalFitness = classData?.skills?.physical_fitness;

        player.skills.physical_fitness = {
          name: classPhysicalFitness?.name || 'Physical Fitness',
          cost: classPhysicalFitness?.cost || [3, 0],
          ranks: legacyPTRanks || classPhysicalFitness?.ranks || 0,
          maxRanksPerLevel: 3  // All skills now have maxRanksPerLevel: 3 universally
        };
      }
      
      console.log(`[SKILLS DEBUG] Player: ${player.name}`);
      console.log(`[SKILLS DEBUG] Skills object:`, JSON.stringify(player.skills, null, 2));
      
      const skills = Object.entries(player.skills || {});
      console.log(`[SKILLS DEBUG] Skills entries:`, skills.length);
      
      if (skills.length === 0) {
        message += 'No skills available. This character was created before the skills system was implemented.\n';
        message += 'Please create a new character to use the skills system.';
        return { success: true, message: message };
      }
      
      // Group skills by category
      const combatSkills = skills.filter(([id, skill]) => 
        ['brawling', 'one_handed_edged', 'one_handed_blunt', 'two_handed', 'polearm', 'ranged', 'thrown', 'combat_maneuvers', 'shield_use', 'armor_use'].includes(id)
      );
      
      console.log(`[SKILLS DEBUG] Combat skills:`, combatSkills.map(([id, skill]) => `${id}: rank ${skill.ranks}`));
      
      const utilitySkills = skills.filter(([id, skill]) => 
        ['climbing', 'swimming', 'disarm_traps', 'pick_locks', 'stalk_and_hide', 'perception', 'ambush', 'first_aid', 'physical_fitness'].includes(id)
      );
      
      const magicSkills = skills.filter(([id, skill]) => 
        ['spell_aim', 'mana_share', 'magic_item_use', 'scroll_reading', 'harness_power', 'wizard_base', 'cleric_base', 'empath_base', 'sorcerer_base', 'ranger_base', 'paladin_base', 'bard_base'].includes(id)
      );

      let skillNumber = 1;
      const formatSkill = (name, ranks, cost, number, maxPerLevel, skillId, skillObj) => {
        console.log(`[SKILLS DEBUG] Formatting skill ${number}: ${name} with ${ranks} ranks`);
        // Format: Number) Ranks_This_Level/Max_Per_Level (Next_Rank_Cost) Skill_Name (Total_Ranks)
        // Get ranks trained this level from skill object (count of times trained at current level)
        // This is NOT a calculation - it's a stored count that should never exceed maxPerLevel
        let ranksThisLevel = skillObj?.ranksThisLevel !== undefined ? skillObj.ranksThisLevel : (maxPerLevel > 0 ? ranks % maxPerLevel : 0);
        
        // Safety cap: ranksThisLevel should never exceed maxPerLevel
        if (ranksThisLevel > maxPerLevel) {
          console.warn(`[SKILLS] Invalid ranksThisLevel for ${skillId}: ${ranksThisLevel} > ${maxPerLevel}, capping to ${maxPerLevel}`);
          ranksThisLevel = maxPerLevel;
        }
        
        // Calculate what the next rank would cost based on current ranks
        // All skills now have 3 ranks per level
        let costMultiplier;
        if (ranksThisLevel === 0) costMultiplier = 1;      // Next is 1st rank
        else if (ranksThisLevel === 1) costMultiplier = 2; // Next is 2nd rank  
        else costMultiplier = 4;                        // Next is 3rd rank
        
        const nextPhysicalCost = cost[0] * costMultiplier;
        const nextMentalCost = cost[1] * costMultiplier;
        
        // Show total ranks in parentheses at the end
        return `${number}) ${ranksThisLevel}/${maxPerLevel} (${nextPhysicalCost}/${nextMentalCost}) ${name} (${ranks})`;
      };
      
      // Define max ranks for each skill type
      const getSkillMaxRanks = (skillId) => {
        // Get max ranks per level from skill definition if available
        const skill = player.skills[skillId];
        if (skill && skill.maxRanksPerLevel !== undefined) {
          return skill.maxRanksPerLevel;
        }
        
        // All skills now have maxRanksPerLevel: 3 universally
        return 3;
      };
      
      if (combatSkills.length > 0) {
        message += 'Combat Skills\r\n';
        combatSkills.forEach(([id, skill]) => {
          const maxPerLevel = getSkillMaxRanks(id);
          console.log(`[SKILLS DEBUG] Displaying ${id}: ranks=${skill.ranks}, maxPerLevel=${maxPerLevel}`);
          message += formatSkill(skill.name, skill.ranks, skill.cost, skillNumber++, maxPerLevel, id, skill) + '\r\n';
        });
        message += '\r\n';
      }

      if (utilitySkills.length > 0) {
        message += 'General Skills\r\n';
        utilitySkills.forEach(([id, skill]) => {
          const maxPerLevel = getSkillMaxRanks(id);
          message += formatSkill(skill.name, skill.ranks, skill.cost, skillNumber++, maxPerLevel, id, skill) + '\r\n';
        });
        message += '\r\n';
      }

      if (magicSkills.length > 0) {
        message += 'Magic Skills\r\n';
        magicSkills.forEach(([id, skill]) => {
          const maxPerLevel = getSkillMaxRanks(id);
          message += formatSkill(skill.name, skill.ranks, skill.cost, skillNumber++, maxPerLevel, id, skill) + '\r\n';
        });
        message += '\r\n';
      }

      return { success: true, message: message };
    } else {
      // Show specific skill
      const skillName = args.join(' ');
      const skillId = Object.keys(player.skills).find(id => 
        id.toLowerCase() === skillName.toLowerCase() || 
        player.skills[id].name.toLowerCase() === skillName.toLowerCase()
      );

      if (!skillId) {
        return { 
          success: false, 
          message: `Skill "${skillName}" not found.\r\n` +
                   'Type "skills" to see all available skills.\r\n' +
                   'Type "skills help" for detailed help and examples.\r\n' +
                   'Tip: Skill names can be partial matches (e.g., "edged" for "Edged Weapons").\r\n'
        };
      }

      const skill = player.skills[skillId];
      const maxRanksPerLevel = skill.maxRanksPerLevel || 3;
      const ranksThisLevel = skill.ranksThisLevel !== undefined ? skill.ranksThisLevel : (skill.ranks % maxRanksPerLevel);
      const ranksRemaining = maxRanksPerLevel - ranksThisLevel;
      
      // Calculate cost for next rank
      let costMultiplier;
      if (ranksThisLevel === 0) costMultiplier = 1;
      else if (ranksThisLevel === 1) costMultiplier = 2;
      else costMultiplier = 4;
      
      const nextPhysicalCost = skill.cost[0] * costMultiplier;
      const nextMentalCost = skill.cost[1] * costMultiplier;
      
      // Calculate how many ranks they can afford (simplified estimate)
      const availablePhysical = player.tps ? player.tps[0] : 0;
      const availableMental = player.tps ? player.tps[1] : 0;
      
      // Calculate max affordable considering cost scaling and TP conversion
      // This is an estimate - actual cost depends on which rank in the level
      let affordableRanks = 0;
      let testPhysical = availablePhysical;
      let testMental = availableMental;
      
      for (let i = 0; i < ranksRemaining; i++) {
        const rankNum = (ranksThisLevel + i) % maxRanksPerLevel;
        let mult = 1;
        if (rankNum === 0) mult = 1;
        else if (rankNum === 1) mult = 2;
        else mult = 4;
        
        const neededPhysical = skill.cost[0] * mult;
        const neededMental = skill.cost[1] * mult;
        
        // Handle zero cost cases
        if (neededPhysical === 0 && neededMental === 0) {
          affordableRanks++;
          continue;
        }
        
        // Check if we have enough, considering 2:1 conversion
        let remainingPhysical = testPhysical;
        let remainingMental = testMental;
        let canAfford = true;
        
        // Try to pay with available TPs
        const physicalSpent = Math.min(neededPhysical, remainingPhysical);
        remainingPhysical -= physicalSpent;
        const physicalNeeded = neededPhysical - physicalSpent;
        
        const mentalSpent = Math.min(neededMental, remainingMental);
        remainingMental -= mentalSpent;
        const mentalNeeded = neededMental - mentalSpent;
        
        // Try conversion if needed (2:1 ratio)
        if (mentalNeeded > 0 && remainingPhysical >= mentalNeeded * 2) {
          remainingPhysical -= mentalNeeded * 2;
        } else if (physicalNeeded > 0 && remainingMental >= physicalNeeded * 2) {
          remainingMental -= physicalNeeded * 2;
        } else if (physicalNeeded > 0 || mentalNeeded > 0) {
          canAfford = false;
        }
        
        if (!canAfford) break;
        
        affordableRanks++;
        testPhysical = remainingPhysical;
        testMental = remainingMental;
      }
      
      const message = `${skill.name}\r\n` +
        `${'='.repeat(skill.name.length)}\r\n\r\n` +
        `Current Ranks: ${skill.ranks} total\r\n` +
        `Ranks This Level: ${ranksThisLevel}/${maxRanksPerLevel}\r\n` +
        `Ranks Remaining This Level: ${ranksRemaining}\r\n\r\n` +
        `Base Cost: ${skill.cost[0]} physical, ${skill.cost[1]} mental per rank\r\n` +
        `Next Rank Cost: ${nextPhysicalCost} physical, ${nextMentalCost} mental\r\n` +
        `  (Cost multiplier: ${costMultiplier}x - ${ranksThisLevel === 0 ? '1st' : ranksThisLevel === 1 ? '2nd' : '3rd'} rank this level)\r\n\r\n` +
        `Your Training Points: ${availablePhysical} physical, ${availableMental} mental\r\n` +
        `Estimated Ranks You Can Afford: ${Math.min(affordableRanks, ranksRemaining)} (considering TP conversion)\r\n\r\n` +
        `Training Examples:\r\n` +
        `  train ${skillId} 1        - Train 1 rank (costs ${nextPhysicalCost}/${nextMentalCost} TPs)\r\n` +
        `  train "${skill.name}" 2   - Train 2 ranks (if you have enough TPs)\r\n\r\n` +
        `Note: You can train up to ${maxRanksPerLevel} ranks per skill per level.\r\n` +
        `      When you level up, your "ranks this level" resets to 0/${maxRanksPerLevel}.\r\n`;

      return { success: true, message: message };
    }
  }
};
