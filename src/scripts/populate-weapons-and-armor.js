'use strict';

const dbm = require('../core/DatabaseManager');
const BASE_WEAPONS = require('../data/base-weapons');
const { createWeaponInstance, createArmorInstance } = require('../utils/itemFactory');
let BASE_ARMOR;
try { BASE_ARMOR = require('../data/base-armor'); } catch (_) { BASE_ARMOR = {}; }

function toNameFromKey(key){
  return key.replace(/^weapon_/, '').replace(/[_-]+/g, ' ').replace(/\b\w/g, c=>c.toUpperCase());
}

function sanitize(str){
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

async function populate(){
  const db = await dbm.initialize();
  try{
    // Find TSC for weapons and glowing chest for armor
    const tsc = await db.collection('rooms').findOne({ id: 'wehnimers-landing-town:tsc' })
             || await db.collection('rooms').findOne({ title: /Town Square.*Central/i });
    const bedroom = await db.collection('rooms').findOne({ id: 'zoso-tower:bedroom' });
    if(!tsc){ console.log('TSC room not found'); }
    if(!bedroom){ console.log('Zoso bedroom not found'); }

    let chest = null;
    if (bedroom) {
      // Look for chest by exact name in bedroom or by container flag
      chest = await db.collection('items').findOne({ name: 'a glowing wooden chest', location: String(bedroom._id) })
           || await db.collection('items').findOne({ name: 'a glowing wooden chest' })
           || await db.collection('items').findOne({ type: 'CONTAINER', 'metadata.noWeightLimit': true });
    }

    // Optional cleanup: remove existing weapon instances from TSC and armor from chest
    if (tsc) {
      const ids = Array.isArray(tsc.items)? tsc.items.map(x=> typeof x==='string'? x: (x.id||x)) : [];
      if (ids.length) {
        const weaponsInRoom = await db.collection('items').find({ id: { $in: ids }, type: 'WEAPON' }).project({ id:1 }).toArray();
        const rmIds = weaponsInRoom.map(x=> x.id);
        if (rmIds.length) {
          await db.collection('items').deleteMany({ id: { $in: rmIds } });
          const remaining = ids.filter(id=> !rmIds.includes(id));
          await db.collection('rooms').updateOne({ _id: tsc._id }, { $set: { items: remaining } });
          console.log('Cleaned weapons from TSC:', rmIds.length);
        }
      }
    }
    if (chest) {
      await db.collection('items').deleteMany({ containedIn: chest.id, type: 'ARMOR' });
      await db.collection('items').updateOne({ id: chest.id }, { $set: { 'metadata.items': [] } });
      console.log('Cleaned armor from chest');
    }

    // 1) Create one instance of each base weapon, place in TSC
    let createdWeapons = 0;
    if (tsc) {
      const roomItems = Array.isArray(tsc.items)? tsc.items.slice() : [];
      for (const key of Object.keys(BASE_WEAPONS)) {
        try{
          const base = BASE_WEAPONS[key];
          const doc = createWeaponInstance(key, base, tsc._id);
          await db.collection('items').insertOne(doc);
          roomItems.push(doc.id);
          createdWeapons++;
        }catch(e){ /* skip problematic entries */ }
      }
      await db.collection('rooms').updateOne({ _id: tsc._id }, { $set: { items: roomItems } });
      console.log('Created weapon instances:', createdWeapons);
    }

    // 2) Create armor for each ASG and put into chest
    let createdArmor = 0;
    if (chest) {
      const chestItems = Array.isArray(chest.metadata?.items)? chest.metadata.items.slice() : [];
      const armorList = Object.values(BASE_ARMOR);
      for (const armor of armorList) {
        try{
          const doc = createArmorInstance(armor, chest.id);
          await db.collection('items').insertOne(doc);
          chestItems.push(doc.id);
          createdArmor++;
        }catch(e){ /* skip */ }
      }
      await db.collection('items').updateOne({ id: chest.id }, { $set: { 'metadata.items': chestItems } });
      console.log('Created armor pieces:', createdArmor);
    } else {
      console.log('Glowing chest not found; armor not created.');
    }

    console.log('Populate script complete.');
  }catch(e){
    console.error('Populate error:', e);
  }finally{
    await dbm.client.close();
  }
}

if (require.main === module) populate();

module.exports = populate;


