'use strict';

const databaseManager = require('../core/DatabaseManager');
const BASE_WEAPONS = require('../data/base-weapons');

const WEAPON_LIST = [
  'arrow',
  'dagger',
  'main_gauche',
  'rapier',
  'whip_blade',
  'katar',
  'short_sword',
  'scimitar',
  'estoc',
  'longsword',
  'handaxe',
  'backsword',
  'broadsword',
  'falchion',
  'katana',
  'bastard_sword'
];

async function addWeaponsToTSC() {
  try {
    const db = await databaseManager.initialize();
    
    console.log('Adding weapons to Town Square Central...');
    
    // Get the TSC room
    const room = await db.collection('rooms').findOne({ id: 'wehnimers-landing-town:tsc' });
    
    if (!room) {
      console.log('TSC room not found!');
      await db.client.close();
      return;
    }
    
    const weapons = [];
    
    for (const weaponName of WEAPON_LIST) {
      const baseWeaponKey = `weapon_${weaponName}`;
      const baseWeapon = BASE_WEAPONS[baseWeaponKey];
      
      if (!baseWeapon) {
        console.log(`Skipping ${weaponName} - no base weapon definition`);
        continue;
      }
      
      const weaponItem = {
        id: `${weaponName}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: `a ${weaponName.replace(/_/g, ' ')}`,
        type: 'WEAPON',
        keywords: [weaponName.replace(/_/g, ' '), weaponName],
        description: `A ${baseWeapon.name}.`,
        location: room._id.toString(),
        metadata: {
          baseWeapon: baseWeaponKey,
          weapon_type: baseWeapon.type,
          damageType: baseWeapon.damageType,
          roundtime: baseWeapon.roundtime,
          minRoundtime: baseWeapon.minRoundtime,
          slot: 'wield',
          itemLevel: 1,
          quality: 'common'
        },
        createdAt: new Date()
      };
      
      // Add damage factors for different armor types
      if (baseWeapon.damageFactors) {
        weaponItem.metadata.damageFactors = baseWeapon.damageFactors;
      }
      
      // Add AvD values
      if (baseWeapon.attackVsDefense) {
        weaponItem.metadata.attackVsDefense = baseWeapon.attackVsDefense;
      }
      // Add weight if defined
      if (typeof baseWeapon.weight === 'number') {
        weaponItem.metadata.weight = baseWeapon.weight;
      }
      
      weapons.push(weaponItem);
    }
    
    // Insert all weapons
    if (weapons.length > 0) {
      const result = await db.collection('items').insertMany(weapons);
      console.log(`Added ${result.insertedCount} weapons to Town Square Central:`);
      
      for (const weapon of weapons) {
        console.log(`  - ${weapon.name}`);
      }
    }
    
    await db.client.close();
    console.log('Done!');
    
  } catch (error) {
    console.error('Error adding weapons:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  addWeaponsToTSC();
}

module.exports = addWeaponsToTSC;

