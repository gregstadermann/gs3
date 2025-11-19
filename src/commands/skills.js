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
    if (args.length === 0) {
      // Show all skills
      let message = 'Available Skills:\n';
      message += `Training Points: ${player.tps ? player.tps[0] : 0} physical, ${player.tps ? player.tps[1] : 0} mental\n\n`;

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
          maxRanksPerLevel: classPhysicalFitness?.maxRanksPerLevel ?? 3
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
      const formatSkill = (name, ranks, cost, number, maxPerLevel, skillId) => {
        console.log(`[SKILLS DEBUG] Formatting skill ${number}: ${name} with ${ranks} ranks`);
        // Format: Number) Ranks_This_Level/Max_Per_Level (Next_Rank_Cost) Skill_Name (Total_Ranks)
        // Calculate ranks trained this level
        const ranksThisLevel = maxPerLevel > 0 ? ranks % maxPerLevel : 0;
        
        // Calculate what the next rank would cost based on current ranks
        let costMultiplier;
        
        if (maxPerLevel === 1) {
          costMultiplier = 1; // Always 1x for 1 rank per level
        } else if (maxPerLevel === 2) {
          if (ranksThisLevel === 0) costMultiplier = 1;      // Next is 1st rank
          else costMultiplier = 2;                        // Next is 2nd rank
        } else {
          // Default to 3 ranks per level
          if (ranksThisLevel === 0) costMultiplier = 1;      // Next is 1st rank
          else if (ranksThisLevel === 1) costMultiplier = 2; // Next is 2nd rank  
        else costMultiplier = 4;                        // Next is 3rd rank
        }
        
        const nextPhysicalCost = cost[0] * costMultiplier;
        const nextMentalCost = cost[1] * costMultiplier;
        
        return `${number}) ${ranksThisLevel}/${maxPerLevel} (${nextPhysicalCost}/${nextMentalCost}) ${name}`;
      };
      
      // Define max ranks for each skill type
      const getSkillMaxRanks = (skillId) => {
        // Get max ranks per level from skill definition if available
        const skill = player.skills[skillId];
        if (skill && skill.maxRanksPerLevel !== undefined) {
          return skill.maxRanksPerLevel;
        }
        
        // Fallback to hardcoded values for skills that don't have maxRanksPerLevel defined
        const maxRanks = {
          // Weapon Skills
          one_handed_edged: 1,
          one_handed_blunt: 1,
          two_handed: 3,
          polearm: 3,
          ranged: 3,
          thrown: 2,
          brawling: 2,
          // Combat Skills
          combat_maneuvers: 8,
          shield_use: 0,
          armor_use: 0,
          // General Skills
          climbing: 0,
          swimming: 0,
          disarm_traps: 6,
          pick_locks: 4,
          stalk_and_hide: 4,
          perception: 3,
          ambush: 10,
          first_aid: 1,
          // Magic Skills
          spell_aim: 1,
          mana_share: 3,
          magic_item_use: 1,
          scroll_reading: 2,
          major_elemental: 8,
          minor_elemental: 8,
          wizard_base: 8,
          cleric_base: 8,
          empath_base: 8,
          sorcerer_base: 8,
          ranger_base: 8,
          paladin_base: 8,
          bard_base: 8
        };
        return maxRanks[skillId] || 2; // Default if not found
      };
      
      if (combatSkills.length > 0) {
        message += 'Combat Skills\r\n';
        combatSkills.forEach(([id, skill]) => {
          const maxPerLevel = getSkillMaxRanks(id);
          console.log(`[SKILLS DEBUG] Displaying ${id}: ranks=${skill.ranks}, maxPerLevel=${maxPerLevel}`);
          message += formatSkill(skill.name, skill.ranks, skill.cost, skillNumber++, maxPerLevel, id) + '\r\n';
        });
        message += '\r\n';
      }

      if (utilitySkills.length > 0) {
        message += 'General Skills\r\n';
        utilitySkills.forEach(([id, skill]) => {
          const maxPerLevel = getSkillMaxRanks(id);
          message += formatSkill(skill.name, skill.ranks, skill.cost, skillNumber++, maxPerLevel, id) + '\r\n';
        });
        message += '\r\n';
      }

      if (magicSkills.length > 0) {
        message += 'Magic Skills\r\n';
        magicSkills.forEach(([id, skill]) => {
          const maxPerLevel = getSkillMaxRanks(id);
          message += formatSkill(skill.name, skill.ranks, skill.cost, skillNumber++, maxPerLevel, id) + '\r\n';
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
        return { success: false, message: `Skill "${skillName}" not found.` };
      }

      const skill = player.skills[skillId];
      const message = `${skill.name}:\n` +
        `Cost: ${skill.cost[0]} physical TPs, ${skill.cost[1]} mental TPs per rank\n` +
        `Current Ranks: ${skill.ranks}\n` +
        `Available TPs: ${player.tps[0]} physical, ${player.tps[1]} mental\n` +
        `Max affordable ranks: ${Math.floor(Math.min(player.tps[0] / skill.cost[0], player.tps[1] / skill.cost[1]))}`;

      return { success: true, message: message };
    }
  }
};
