'use strict';

const CombatSystem = require('../systems/CombatSystem');
const DamageSystem = require('../systems/DamageSystem');
const WoundSystem = require('../systems/WoundSystem');
const { checkRoundtime } = require('../utils/roundtimeChecker');
const { calculateStatBonus, getRawStat } = require('../utils/statBonus');

let combatSystem = null;
let damageSystem = null;

/**
 * Get stance information
 */
function getStanceInfo(stance) {
  const stances = {
    'offensive': { percent: 0 },
    'advance': { percent: 20 },
    'forward': { percent: 40 },
    'neutral': { percent: 60 },
    'guarded': { percent: 80 },
    'defensive': { percent: 100 }
  };
  return stances[stance] || stances['neutral'];
}

/**
 * Find a target in the same room
 */
function findTarget(player, searchTerm) {
  const room = player.gameEngine.roomSystem.getRoom(player.room);
  if (!room) {
    return null;
  }

  if (!searchTerm || searchTerm.length === 0) {
    // No target specified, continue attacking current target
    if (player.combatants && player.combatants.size > 0) {
      return Array.from(player.combatants)[0];
    }
    return null;
  }

  const searchLower = searchTerm.toLowerCase();

  // Search NPCs in room
  if (player.gameEngine && player.gameEngine.npcSystem) {
    const npcsInRoom = player.gameEngine.npcSystem.getNPCsInRoom(player.room);
    const npc = npcsInRoom.find(npc => {
      const name = npc.name || npc.npcId;
      if (name.toLowerCase().includes(searchLower)) {
        return true;
      }
      if (npc.keywords && npc.keywords.some(kw => kw.toLowerCase().includes(searchLower))) {
        return true;
      }
      return false;
    });

    if (npc) {
      return npc;
    }
  }

  // Search other players
  const playersInRoom = player.gameEngine.roomSystem.getPlayersInRoom(player.room);
  const targetPlayer = playersInRoom.find(p => 
    p.name.toLowerCase().includes(searchLower) && p.name !== player.name
  );

  return targetPlayer || null;
}

/**
 * Calculate skill bonus with diminishing returns
 * Ranks 1-10: +5 per rank
 * Ranks 11-20: +4 per rank
 * Ranks 21-30: +3 per rank
 * Ranks 31-40: +2 per rank
 * Ranks 41+: +1 per rank
 */
function calculateSkillBonus(ranks) {
  let bonus = 0;
  let remainingRanks = ranks;
  
  if (remainingRanks > 40) {
    bonus += (remainingRanks - 40) * 1;
    remainingRanks = 40;
  }
  if (remainingRanks > 30) {
    bonus += (remainingRanks - 30) * 2;
    remainingRanks = 30;
  }
  if (remainingRanks > 20) {
    bonus += (remainingRanks - 20) * 3;
    remainingRanks = 20;
  }
  if (remainingRanks > 10) {
    bonus += (remainingRanks - 10) * 4;
    remainingRanks = 10;
  }
  if (remainingRanks > 0) {
    bonus += remainingRanks * 5;
  }
  
  return bonus;
}

/**
 * Attack Command
 * Allows players to attack NPCs or other players
 */
module.exports = {
  name: 'attack',
  aliases: ['kill'],
  description: 'Attack a target',
  usage: 'attack <target> or kill <target>',
  
  async execute(player, args) {
    // Initialize systems if needed
    if (!combatSystem) {
      combatSystem = new CombatSystem();
    }
    if (!damageSystem) {
      damageSystem = new DamageSystem();
    }
    
    // Check roundtime/lag
    const roundtimeCheck = checkRoundtime(player);
    if (roundtimeCheck) {
      return roundtimeCheck;
    }

    // Check wound penalties
    const woundPenalties = WoundSystem.getWoundPenalties(player);
    
    // Prevent ranged attacks if arms/hands are wounded
    if (!woundPenalties.canRangeAttack) {
      return { 
        success: false, 
        message: 'Your wounded arms prevent you from making ranged attacks!\r\n'
      };
    }

    // Get combat system from game engine
    const gameCombat = player.gameEngine?.combatSystem || combatSystem;

    // Find target
    const searchTerm = args.length > 0 ? args.join(' ') : '';
    const target = findTarget(player, searchTerm);

    if (!target) {
      return { 
        success: false, 
        message: "You don't see that here.\r\n" 
      };
    }

    // Check if attacking self
    if (target === player || target.name === player.name) {
      return { 
        success: false, 
        message: "You can't attack yourself!\r\n" 
      };
    }

    // Get equipped weapon
    const weapon = await damageSystem.getEquippedWeapon(player);

    // Calculate Attack Strength (AS) using proper formula:
    // AS = STR Bonus + Weapon Skill Bonus + [Combat Maneuvers Ranks / 2] + Weapon Enchantment + Modifiers
    const strRaw = getRawStat(player, 'strength');
    const strBonus = calculateStatBonus(strRaw, player.race, 'strength');
    
    // Weapon Skill Bonus (get from one_handed_edged for broadsword)
    let weaponSkillBonus = 0;
    let combatManeuversBonus = 0;
    if (weapon && player.skills) {
      console.log(`[AS CALC] Weapon metadata:`, weapon.metadata);
      
      // Check weapon type to use correct skill
      const weaponType = weapon.metadata?.weapon_type || weapon.metadata?.baseWeapon || '';
      console.log(`[AS CALC] Weapon type: ${weaponType}`);
      
      const weaponSkill = weaponType.includes('edged') ? player.skills.one_handed_edged : 
                         weaponType.includes('blunt') ? player.skills.one_handed_blunt : null;
      
      console.log(`[AS CALC] Weapon skill object:`, weaponSkill);
      
      if (weaponSkill) {
        const ranks = weaponSkill.ranks || 0;
        // Calculate weapon skill bonus with diminishing returns
        // Ranks 1-10: +5 per rank
        // Ranks 11-20: +4 per rank
        // Ranks 21-30: +3 per rank
        // Ranks 31-40: +2 per rank
        // Ranks 41+: +1 per rank
        weaponSkillBonus = calculateSkillBonus(ranks);
        console.log(`[AS CALC] Weapon skill ranks: ${ranks}, bonus: ${weaponSkillBonus}`);
      }
      
      // Combat Maneuvers bonus
      if (player.skills.combat_maneuvers) {
        const cmRanks = player.skills.combat_maneuvers.ranks || 0;
        combatManeuversBonus = Math.floor(cmRanks / 2);
      }
    }
    
    // Get stance modifier for AS (50% to 100% multiplier)
    const stance = player.combatStance || 'neutral';
    const stanceInfo = getStanceInfo(stance);
    // stanceInfo.percent: 0% (offensive) to 100% (defensive)
    // We want: offensive = 100% multiplier, defensive = 50% multiplier
    // So: multiplier = 100% - (percent / 2)
    const stanceMultiplier = 100 - (stanceInfo.percent / 2);
    const stanceMultiplierDecimal = stanceMultiplier / 100;
    
    // Calculate base AS without stance
    const baseAS = strBonus + weaponSkillBonus + combatManeuversBonus;

    // Apply Low Spirit penalty to AS based on current/max spirit percentage
    // Max spirit = round(Aura / 10), capped at 13
    function getSpiritInfo(p) {
      const auraRaw = getRawStat(p, 'aura') || 50;
      const computedMax = Math.min(13, Math.round(auraRaw / 10));
      const spiritObj = p.attributes && p.attributes.spirit ? p.attributes.spirit : {};
      const current = typeof spiritObj.current === 'number' ? spiritObj.current : computedMax;
      const max = typeof spiritObj.base === 'number' ? Math.min(13, spiritObj.base) : computedMax;
      return { current, max };
    }
    const { current: spiritCurrent, max: spiritMax } = getSpiritInfo(player);
    const spiritPct = spiritMax > 0 ? (spiritCurrent / spiritMax) : 1;
    let spiritMultiplier = 1.0;
    if (spiritPct >= 0.75) {
      spiritMultiplier = 1.0;
    } else if (spiritPct >= 0.50) {
      spiritMultiplier = 0.80; // -20%
    } else if (spiritPct >= 0.25) {
      spiritMultiplier = 0.65; // -35%
    } else {
      spiritMultiplier = 0.50; // -50%
    }
    
    // Debug logging
    console.log(`[AS CALC] STR raw: ${strRaw}, STR bonus: ${strBonus}`);
    console.log(`[AS CALC] Weapon skill bonus: ${weaponSkillBonus}, CM bonus: ${combatManeuversBonus}`);
    console.log(`[AS CALC] Base AS: ${baseAS}, Stance multiplier: ${stanceMultiplierDecimal}, Spirit: ${spiritCurrent}/${spiritMax} (${Math.round(spiritPct*100)}%), Spirit multiplier: ${spiritMultiplier}, Final AS: ${Math.floor(baseAS * stanceMultiplierDecimal * spiritMultiplier)}`);
    
    // Apply stance and spirit multipliers
    const as = Math.floor(baseAS * stanceMultiplierDecimal * spiritMultiplier);
    
    // Calculate target's DS
    const targetStance = target.combatStance || 'neutral';
    const targetStanceInfo = getStanceInfo(targetStance);
    const targetDSModifier = targetStanceInfo.percent;
    let ds = 25 + Math.floor(targetDSModifier / 4);
    // Add shield DS if target has a shield
    try { const Shield = require('../utils/shield'); ds += Shield.computeShieldDS(target); } catch(_) {}

    // Get damage calculation (this provides AvD and damage factor)
    const damageResult = damageSystem.calculateWeaponDamage(player, weapon, target);
    const avd = damageResult.avd;
    const d100Roll = Math.floor(Math.random() * 100) + 1;
    const endRoll = as - ds + avd + d100Roll;
    
    // Calculate raw damage if hit using GS4 formula: (endroll - 100) * damageFactor
    let rawDamage = 0;
    if (endRoll > 100) {
      // Raw damage = (end roll - 100) * damage factor
      const damageFactor = damageResult.damageFactor || 0.45;
      const endrollSuccessMargin = endRoll - 100;
      rawDamage = Math.floor(endrollSuccessMargin * damageFactor);
    }
    
    // Apply damage with critical hits (using raw damage)
    const damageApplied = await damageSystem.applyDamageWithCritical(player, target, rawDamage, weapon);

    // Determine armor roundtime penalty if wearing armor
    function getArmorRoundtimeMs(p) {
      try {
        const wornArmor = p.equipment && (p.equipment.chest || p.equipment.torso);
        if (!wornArmor || (wornArmor.type !== 'ARMOR' && wornArmor.type !== 'CLOTHING')) return 0;
        const meta = wornArmor.metadata || {};
        const baseRtSec = typeof meta.rt === 'number' ? meta.rt : 0;
        // Armor Use reduction: 1s per 20 ranks
        const armorRanks = p.skills?.armor_use?.ranks || 0;
        const reductionSec = Math.floor(armorRanks / 20);
        const effRtSec = Math.max(0, baseRtSec - reductionSec);
        return effRtSec * 1000;
      } catch (_) { return 0; }
    }

    // Get weapon roundtime from weapon definition
    function getWeaponRoundtimeMs(w, p) {
      try {
        const baseWeaponType = w?.metadata?.baseWeapon;
        const baseWeapon = damageSystem.baseWeapons[baseWeaponType];
        if (baseWeapon && typeof baseWeapon.roundtime === 'number') {
          // Weapon RT is in seconds (5 = 5s, 3 = 3s, etc)
          const rtMs = baseWeapon.roundtime * 1000;
          
          // Only apply Two-Handed skill reduction if weapon is two-handed
          const weaponType = baseWeapon.type || '';
          const isTwoHanded = weaponType.includes('two_handed');
          
          if (isTwoHanded) {
            // Two-Handed Weapon skill reduces RT: 1s per 20 ranks
            const twoHandedRanks = p.skills?.two_handed?.ranks || 0;
            const reductionMs = Math.floor((twoHandedRanks / 20) * 1000);
            return Math.max(500, rtMs - reductionMs); // Minimum 0.5s
          }
          
          return rtMs;
        }
        return 10000; // Default 10s for unknown weapons
      } catch (_) { return 10000; }
    }

    // Get encumbrance roundtime penalty
    function getEncumbranceRoundtimeMs(p) {
      try {
        const enc = p.attributes?.encumbrance;
        if (!enc || enc.percent <= 0) return 0;
        
        // Encumbrance penalty: 0.5s per 10% encumbrance
        const penaltySec = (enc.percent / 10) * 0.5;
        return penaltySec * 1000;
      } catch (_) { return 0; }
    }

    // Initiate or continue combat
    const wasInCombat = gameCombat.isInCombat(player);
    gameCombat.initiateCombat(player, target, 0);
    const weaponRtMs = getWeaponRoundtimeMs(weapon, player);
    const armorRtMs = getArmorRoundtimeMs(player);
    const encumbranceRtMs = getEncumbranceRoundtimeMs(player);
    const totalRtMs = weaponRtMs + armorRtMs + encumbranceRtMs;
    gameCombat.addLag(player, totalRtMs);

    // Create combat messages
    let message = '';

    const weaponName = weapon ? weapon.name : 'your fists';
    
    message += `You swing ${weaponName} at ${target.name}!\r\n`;
    
    // Show attack roll
    message += `AS: +${as} vs DS: +${ds} with AvD: +${avd} + d100 roll: +${d100Roll} = +${endRoll}\r\n`;
    
    // Check if hit (need to exceed 100)
    const hit = endRoll > 100;
    
    if (!hit) {
      message += `  ... and misses!\r\n`;
      message += `Roundtime: 2.5 sec.\r\n`;
      return { success: true, message: message };
    }
    
    message += `  ... and hit for ${damageApplied.damage} points of damage!\r\n`;
    
    // Every hit gets a critical message
    if (damageApplied.critical && damageApplied.critical.message) {
      const critMessage = damageApplied.critical.message.replace(/\[target\]/gi, target.name);
      message += critMessage + '\r\n';
    }
    // Show stun messaging if stunned by critical effects
    if (damageApplied.critical && Array.isArray(damageApplied.critical.effects)) {
      const hasStun = damageApplied.critical.effects.some(e => typeof e === 'string' && /^S\d+$/i.test(e));
      if (hasStun) {
        message += `${target.name} is stunned!\r\n`;
      }
    }
    
    message += `Roundtime: ${(totalRtMs/1000).toFixed(1)} sec.\r\n`;

    // Check if target died
    if (damageApplied.targetDead) {
      message += `${target.name} collapses and dies!\r\n`;
      gameCombat.removeFromCombat(player);
    }

    // TODO: Send message to target if it's a player
    // TODO: Send messages to others in the room (room-wide combat announcements)

    return { 
      success: true, 
      message: message 
    };
  }
};

