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
  const name = sanitizeName(rawName);
  return {
    id: makeId(baseKey),
    type: 'WEAPON',
    name,
    roomDesc: baseDef?.roomDesc || name,
    keywords: baseDef?.keywords || keywordsFromName(name),
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
 * Create an armor item document from base definition
 */
function createArmorInstance(armorDef, containedInId) {
  const rawName = armorDef.name || `asg ${armorDef.asg}`;
  const name = sanitizeName(rawName);
  return {
    id: makeId(`armor-${armorDef.asg||'x'}`),
    type: 'ARMOR',
    name,
    roomDesc: name,
    keywords: ['armor', ...keywordsFromName(name)],
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
  createWeaponInstance,
  createArmorInstance
};


