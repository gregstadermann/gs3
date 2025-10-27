'use strict';

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
      
      const skills = Object.entries(player.skills || {});
      
      if (skills.length === 0) {
        message += 'No skills available. This character was created before the skills system was implemented.\n';
        message += 'Please create a new character to use the skills system.';
        return { success: true, message: message };
      }
      
      // Group skills by category
      const combatSkills = skills.filter(([id, skill]) => 
        ['brawling', 'one_handed_edged', 'one_handed_blunt', 'two_handed', 'polearm', 'ranged', 'thrown', 'combat_maneuvers', 'shield_use', 'armor_use'].includes(id)
      );
      
      const utilitySkills = skills.filter(([id, skill]) => 
        ['climbing', 'swimming', 'survival', 'disarm_traps', 'pick_locks', 'stalk_and_hide', 'perception', 'ambush', 'first_aid'].includes(id)
      );
      
      const magicSkills = skills.filter(([id, skill]) => 
        ['spell_aim', 'mana_share', 'magic_item_use', 'scroll_reading', 'harness_power', 'wizard_base', 'cleric_base', 'empath_base', 'sorcerer_base', 'ranger_base', 'paladin_base', 'bard_base'].includes(id)
      );
      
      const trainingSkills = skills.filter(([id, skill]) => 
        ['physical_training'].includes(id)
      );

      let skillNumber = 1;
      const formatSkill = (name, ranks, cost, number, maxTotal, maxPerLevel) => {
        // Format: Number) Current_Ranks Max/Max_Per_Level (Base_Cost) Skill_Name
        // Base cost is the first rank cost (second rank costs double)
        const baseCost = cost[0] + cost[1]; // Sum of physical and mental costs
        return `${number}) ${ranks} ${maxTotal}/${maxPerLevel} (${baseCost}) ${name}`;
      };
      
      // Define max ranks for each skill type
      const getSkillMaxRanks = (skillId) => {
        const maxRanks = {
          // Weapon Skills
          one_handed_edged: [6, 1], // 6 total, 1 per level
          one_handed_blunt: [6, 1],
          two_handed: [14, 3],
          polearm: [14, 3],
          ranged: [14, 3],
          thrown: [8, 2],
          brawling: [10, 2],
          // Combat Skills
          combat_maneuvers: [12, 8],
          shield_use: [13, 0],
          armor_use: [14, 0],
          // General Skills
          climbing: [4, 0],
          swimming: [3, 0],
          survival: [3, 2],
          disarm_traps: [2, 6],
          pick_locks: [2, 4],
          stalk_and_hide: [5, 4],
          perception: [0, 3],
          ambush: [15, 10],
          first_aid: [2, 1],
          // Magic Skills
          spell_aim: [2, 1],
          mana_share: [0, 3],
          magic_item_use: [0, 1],
          scroll_reading: [0, 2],
          major_elemental: [0, 8],
          minor_elemental: [0, 8],
          wizard_base: [0, 8],
          cleric_base: [0, 8],
          empath_base: [0, 8],
          sorcerer_base: [0, 8],
          ranger_base: [0, 8],
          paladin_base: [0, 8],
          bard_base: [0, 8]
        };
        return maxRanks[skillId] || [10, 2]; // Default if not found
      };
      
      if (combatSkills.length > 0) {
        message += 'Combat Skills\r\n';
        combatSkills.forEach(([id, skill]) => {
          const [maxTotal, maxPerLevel] = getSkillMaxRanks(id);
          message += formatSkill(skill.name, skill.ranks, skill.cost, skillNumber++, maxTotal, maxPerLevel) + '\r\n';
        });
        message += '\r\n';
      }

      if (utilitySkills.length > 0) {
        message += 'General Skills\r\n';
        utilitySkills.forEach(([id, skill]) => {
          const [maxTotal, maxPerLevel] = getSkillMaxRanks(id);
          message += formatSkill(skill.name, skill.ranks, skill.cost, skillNumber++, maxTotal, maxPerLevel) + '\r\n';
        });
        message += '\r\n';
      }

      if (magicSkills.length > 0) {
        message += 'Magic Skills\r\n';
        magicSkills.forEach(([id, skill]) => {
          const [maxTotal, maxPerLevel] = getSkillMaxRanks(id);
          message += formatSkill(skill.name, skill.ranks, skill.cost, skillNumber++, maxTotal, maxPerLevel) + '\r\n';
        });
        message += '\r\n';
      }

      if (trainingSkills.length > 0) {
        message += 'Training Skills\r\n';
        trainingSkills.forEach(([id, skill]) => {
          const [maxTotal, maxPerLevel] = getSkillMaxRanks(id);
          message += formatSkill(skill.name, skill.ranks, skill.cost, skillNumber++, maxTotal, maxPerLevel) + '\r\n';
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
