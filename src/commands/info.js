'use strict';

const { calculateStatBonus, getRawStat } = require('../utils/statBonus');

/**
 * Info Command (INFO)
 * Displays character information similar to Gemstone3
 */
module.exports = {
  name: 'info',
  aliases: ['stats'],
  description: 'Display character information, stats, and skills',
  usage: 'info',
  
  execute(player, args) {
    const raceName = player.race || 'Unknown';
    const professionName = player.class || player.profession || 'Unknown';
    const genderName = player.gender || 'Unknown';
    
    let message = '';
    
    // Header
    message += `Name: ${player.name}  Race: ${raceName}  Profession: ${professionName}\r\n`;
    message += `Gender: ${genderName}    Age: ${player.age || 0}    Expr: ${player.experience || 0}    Level:  ${player.level || 0}\r\n\r\n`;
    
    // Stats table
    message += '                  Normal (Bonus)  ...  Enhanced (Bonus)\r\n';
    
    const stats = [
      { name: 'Strength', abbr: 'STR', key: 'strength' },
      { name: 'Constitution', abbr: 'CON', key: 'constitution' },
      { name: 'Dexterity', abbr: 'DEX', key: 'dexterity' },
      { name: 'Agility', abbr: 'AGI', key: 'agility' },
      { name: 'Discipline', abbr: 'DIS', key: 'discipline' },
      { name: 'Aura', abbr: 'AUR', key: 'aura' },
      { name: 'Logic', abbr: 'LOG', key: 'logic' },
      { name: 'Intelligence', abbr: 'INT', key: 'intelligence' },
      { name: 'Wisdom', abbr: 'WIS', key: 'wisdom' },
      { name: 'Charisma', abbr: 'CHA', key: 'charisma' }
    ];
    
    if (player.attributes) {
      stats.forEach(stat => {
        const base = getRawStat(player, stat.key);
        const enhanced = base; // For now, enhanced = base (no delta)
        
        // Calculate bonuses using proper formula: ⌊(RawStat - 50)/2⌋ + RaceModifier
        const baseBonus = calculateStatBonus(base, player.race, stat.key);
        const enhancedBonus = calculateStatBonus(enhanced, player.race, stat.key);
        
        const bonusStr = baseBonus >= 0 ? ` +${baseBonus}` : ` ${baseBonus}`;
        const enhancedBonusStr = enhancedBonus >= 0 ? ` +${enhancedBonus}` : ` ${enhancedBonus}`;
        
        message += `${stat.name.padEnd(18)} (${stat.abbr}):    ${String(base).padStart(3)} (${bonusStr.padStart(4)})     ...   ${String(enhanced).padStart(3)} (${enhancedBonusStr.padStart(4)})\r\n`;
      });
    }
    
    message += '\r\n';
    
    // Resources
    const mana = player.attributes?.mana?.base || 0;
    const silver = player.silver || 0;
    message += `Mana: ${String(mana).padStart(3)}   Silver: ${silver}\r\n`;
    
    return { success: true, message: message };
  }
};

