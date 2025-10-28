'use strict';

/**
 * Item Factory
 * Centralized helpers to create sanitized item instances
 */

function sanitizeName(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function keywordsFromName(name) {
  return sanitizeName(name).split('-').filter(Boolean);
}

function makeId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
}

/**
 * Create a weapon item document from base definition
 */
function createWeaponInstance(baseKey, baseDef, roomMongoId) {
  const rawName = baseDef?.name || baseKey.replace(/^weapon_/, '').replace(/[_-]+/g, ' ');
  // Keep raw name with spaces, add article
  const baseName = rawName.toLowerCase();
  const name = addArticle(baseName);
  
  return {
    id: makeId(baseKey),
    type: 'WEAPON',
    name,
    roomDesc: baseDef?.roomDesc || name,
    keywords: baseDef?.keywords || baseName.split(/\s+/).filter(Boolean),
    description: baseDef?.description || name,
    location: roomMongoId ? String(roomMongoId) : undefined,
    metadata: {
      baseWeapon: baseKey,
      weapon_type: baseDef?.weapon_type || baseDef?.category || 'one_handed_edged',
      weight: baseDef?.weight || 3,
      slot: 'wield',
      level: 0
    },
    createdAt: new Date()
  };
}

/**
 * Add article (a/an/some) to an item name
 */
function addArticle(name, itemType = null) {
  // Don't modify the name - just check if it needs an article
  const lowerName = name.toLowerCase().trim();
  
  // If it already starts with an article, return as-is
  if (lowerName.match(/^(a|an|some|the)\s+/)) {
    return name;
  }
  
  // Armor and plate armor use "some"
  if (itemType === 'ARMOR' || lowerName.includes('plate') || lowerName.includes('armor') || 
      lowerName.includes('leather') || lowerName.includes('chain') || lowerName.includes('breastplate')) {
    return `some ${name}`;
  }
  
  // Determine which article to use based on first letter
  const firstChar = lowerName[0];
  const useAn = /[aeiou]/.test(firstChar);
  
  // Prepend the appropriate article
  return `${useAn ? 'an' : 'a'} ${name}`;
}

/**
 * Create an armor item document from base definition
 */
function createArmorInstance(armorDef, containedInId) {
  const rawName = armorDef.name || `asg ${armorDef.asg}`;
  // Keep original readable name with spaces (don't sanitize) and add article
  const baseName = rawName.toLowerCase();
  const name = addArticle(baseName, 'ARMOR');
  
  return {
    id: makeId(`armor-${armorDef.asg||'x'}`),
    type: 'ARMOR',
    name,
    roomDesc: name,
    keywords: ['armor', ...baseName.split(/\s+/).filter(Boolean)],
    description: name,
    metadata: {
      asg: armorDef.asg,
      ag: armorDef.ag,
      baseWeight: armorDef.baseWeight,
      rt: armorDef.rt,
      ap: armorDef.ap,
      cva: armorDef.cva,
      spellHindrance: armorDef.spellHindrance,
      container: false
    },
    containedIn: containedInId,
    createdAt: new Date()
  };
}

module.exports = {
  sanitizeName,
  keywordsFromName,
  makeId,
  addArticle,
  createWeaponInstance,
  createArmorInstance
};


