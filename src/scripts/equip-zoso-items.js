'use strict';

const databaseManager = require('../adapters/db/mongoClient');

/**
 * Create and equip items on Zoso player
 */
async function equipZosoItems() {
  try {
    const db = await databaseManager.initialize();
    
    // Get player Zoso
    const player = await db.collection('players').findOne({ name: 'Zoso' });
    
    if (!player) {
      console.log('Player Zoso not found. Please create the character first.');
      await databaseManager.client.close();
      return;
    }
    
    // Initialize equipment if needed
    if (!player.equipment) {
      player.equipment = {};
    }
    
    // Define all items with their slot mappings
    const items = [
      {
        id: 'zoso-pin',
        name: 'a silver pin shaped like a juggling knife and harp entwined',
        shortName: 'a silver pin',
        description: 'Once the mark of a court-bard, now dulled and bent from years on the road.',
        type: 'MISC',
        slot: 'general'
      },
      {
        id: 'zoso-patchcloak',
        name: 'a gleeman\'s patchcloak of a hundred bright colors',
        shortName: 'a gleeman\'s patchcloak',
        description: 'Its squares of red, blue, and gold catch every flicker of firelight; frayed edges whisper with old applause.',
        type: 'ARMOR',
        slot: 'back'
      },
      {
        id: 'zoso-belt',
        name: 'a tooled leather belt weighted with coin-pouches and hidden knives',
        shortName: 'a tooled leather belt',
        description: 'The jingle of coin can distract; the knives, misdirect.',
        type: 'MISC',
        slot: 'waist'
      },
      {
        id: 'zoso-hat',
        name: 'a wide-brimmed hat with a blue feather tucked in the band',
        shortName: 'a wide-brimmed hat',
        description: 'It shadows his sharp eyes and conceals one of a dozen small tricks.',
        type: 'ARMOR',
        slot: 'head'
      },
      {
        id: 'zoso-lute-case',
        name: 'a battered lute case scarred by travel',
        shortName: 'a battered lute case',
        description: 'Its surface is carved with faint maps of every place he\'s played.',
        type: 'CONTAINER',
        slot: 'shoulder' // Array slot
      },
      {
        id: 'zoso-cape',
        name: 'a velvet half-cape the color of old wine',
        shortName: 'a velvet half-cape',
        description: 'Once fine, now faded — still hangs with theatrical flourish when he bows.',
        type: 'ARMOR',
        slot: 'shoulders'
      },
      {
        id: 'zoso-breeches',
        name: 'dark wool breeches patched at the knees',
        shortName: 'dark wool breeches',
        description: 'The patches are deliberate, each sewn with thread of a different color, more story than mending.',
        type: 'ARMOR',
        slot: 'legsPulled'
      },
      {
        id: 'zoso-coat',
        name: 'a high-collared blue coat with silver piping',
        shortName: 'a high-collared blue coat',
        description: 'Tailored decades ago, adjusted a hundred times; the cut still carries courtly grace.',
        type: 'ARMOR',
        slot: 'torso'
      },
      {
        id: 'zoso-wristlets',
        name: 'polished brass wristlets etched with tiny runes of rhythm',
        shortName: 'polished brass wristlets',
        description: 'Each tap of his fingers makes the faintest ring, the echo of a chord.',
        type: 'MISC',
        slot: 'rightWrist'
      },
      {
        id: 'zoso-signet',
        name: 'a gold signet worn thin and smooth',
        shortName: 'a gold signet',
        description: 'Its crest long unrecognizable; perhaps forgotten on purpose.',
        type: 'MISC',
        slot: 'rightFinger'
      },
      {
        id: 'zoso-boots',
        name: 'high boots of soft red leather',
        shortName: 'high boots',
        description: 'The kind made for stages and ballrooms, but sturdy enough for gravel roads.',
        type: 'ARMOR',
        slot: 'feetPutOn'
      },
      {
        id: 'zoso-cravat',
        name: 'a silk cravat tied just so',
        shortName: 'a silk cravat',
        description: 'Smells faintly of pipe smoke and rosewater; rumor says it hides a scar.',
        type: 'MISC',
        slot: 'neck'
      },
      {
        id: 'zoso-sash',
        name: 'a thin sash of woven silver thread',
        shortName: 'a thin sash',
        description: 'Used once to tie scrolls of verse; now serves to cinch the waistcoat.',
        type: 'MISC',
        slot: 'belt'
      },
      {
        id: 'zoso-sleeves',
        name: 'fitted sleeves laced with crimson cord',
        shortName: 'fitted sleeves',
        description: 'Their inner seams conceal thin slivers of steel wire — for juggling or survival.',
        type: 'ARMOR',
        slot: 'arms'
      },
      {
        id: 'zoso-garter-knife',
        name: 'a garter knife sheathed in soft leather',
        shortName: 'a garter knife',
        description: 'The last defense of a man who prefers words to blades.',
        type: 'WEAPON',
        slot: 'legsAttached'
      },
      {
        id: 'zoso-earring',
        name: 'a single gold hoop earring',
        shortName: 'a gold hoop earring',
        description: 'Glints when he smiles; distracts when he lies.',
        type: 'MISC',
        slot: 'earlobe'
      },
      {
        id: 'zoso-ear-studs',
        name: 'twin studs of polished jet',
        shortName: 'twin studs of polished jet',
        description: 'Small enough to go unnoticed, but always shining when lamplight hits.',
        type: 'MISC',
        slot: 'earlobes'
      },
      {
        id: 'zoso-bell',
        name: 'a brass bell tied with blue ribbon',
        shortName: 'a brass bell',
        description: 'Its chime rings once every dozen steps — never quite predictably.',
        type: 'MISC',
        slot: 'ankle'
      },
      {
        id: 'zoso-medallion',
        name: 'a silver medallion engraved with a harp and dagger',
        shortName: 'a silver medallion',
        description: 'A token from a queen\'s favor — or her regret.',
        type: 'MISC',
        slot: 'front'
      },
      {
        id: 'zoso-gloves',
        name: 'fingerless gloves of black lambskin',
        shortName: 'fingerless gloves',
        description: 'They give grip to knife or lute string alike, but keep fingertips free for sleight of hand.',
        type: 'ARMOR',
        slot: 'hands'
      },
      {
        id: 'zoso-slippers',
        name: 'soft house slippers wrapped in red cloth',
        shortName: 'soft house slippers',
        description: 'For the rare nights when he performs beneath noble ceilings rather than stars.',
        type: 'ARMOR',
        slot: 'feetSlipOn'
      },
      {
        id: 'zoso-hair',
        name: 'silver-white curls swept back with a touch of pomade',
        shortName: 'silver-white curls',
        description: 'Still handsome in defiance of the years, silver catching every bit of lamplight.',
        type: 'MISC',
        slot: 'hair'
      },
      {
        id: 'zoso-undershirt',
        name: 'a cream-colored linen shirt open at the throat',
        shortName: 'a cream-colored linen shirt',
        description: 'Frayed cuffs, loose fit — practical for movement and sudden flights.',
        type: 'ARMOR',
        slot: 'undershirt'
      },
      {
        id: 'zoso-hose',
        name: 'finely woven hose, one red, one blue',
        shortName: 'finely woven hose',
        description: '"For symmetry," he always claims, and grins at the puzzled looks.',
        type: 'ARMOR',
        slot: 'leggings'
      }
    ];
    
    console.log(`Creating ${items.length} items and equipping them on Zoso...\n`);
    
    // Create items and equip them
    for (const itemData of items) {
      // Check if item already exists
      const existingItem = await db.collection('items').findOne({ id: itemData.id });
      
      const item = {
        id: itemData.id,
        name: itemData.name,
        shortName: itemData.shortName || itemData.name,
        description: itemData.description,
        type: itemData.type,
        location: {
          type: 'player',
          id: 'Zoso',
          slot: itemData.slot
        },
        metadata: {
          weight: 1, // Default weight
          value: 10 // Default value
        },
        createdAt: new Date()
      };
      
      if (!existingItem) {
        await db.collection('items').insertOne(item);
        console.log(`✓ Created: ${itemData.name}`);
      } else {
        // Update existing item
        await db.collection('items').updateOne(
          { id: itemData.id },
          { $set: item }
        );
        console.log(`✓ Updated: ${itemData.name}`);
      }
      
      // Equip item on player
      const slot = itemData.slot;
      
      // Handle special slots
      if (slot === 'shoulder') {
        // Shoulder is an array that can hold up to 2 items
        if (!player.equipment.shoulder) {
          player.equipment.shoulder = [];
        }
        if (typeof player.equipment.shoulder === 'string') {
          player.equipment.shoulder = [player.equipment.shoulder];
        }
        if (!player.equipment.shoulder.includes(itemData.id)) {
          if (player.equipment.shoulder.length < 2) {
            player.equipment.shoulder.push(itemData.id);
          } else {
            console.log(`  ⚠ Warning: Shoulder slot full, skipping ${itemData.name}`);
            continue;
          }
        }
      } else if (slot === 'rightWrist' || slot === 'leftWrist') {
        // Map to player model slots
        const playerSlot = slot === 'rightWrist' ? 'rightWrist' : 'leftWrist';
        player.equipment[playerSlot] = itemData.id;
      } else if (slot === 'rightFinger' || slot === 'leftFinger') {
        // Map to player model slots
        const playerSlot = slot === 'rightFinger' ? 'rightFinger' : 'leftFinger';
        player.equipment[playerSlot] = itemData.id;
      } else if (slot === 'neck') {
        // Neck can hold multiple items, but player model only has one slot
        // Store as string for now, could be enhanced later
        player.equipment.neck = itemData.id;
      } else if (slot === 'feetPutOn') {
        // Map to feet slot
        player.equipment.feet = itemData.id;
      } else if (slot === 'legsPulled') {
        // Map to legs slot
        player.equipment.legs = itemData.id;
      } else if (slot === 'torso') {
        // Map to chest slot
        player.equipment.chest = itemData.id;
      } else {
        // For other slots, store directly in equipment
        // These may not be in the standard player model but can be stored
        player.equipment[slot] = itemData.id;
      }
    }
    
    // Save player equipment
    await db.collection('players').updateOne(
      { name: 'Zoso' },
      { $set: { equipment: player.equipment } }
    );
    
    console.log(`\n✓ All items created and equipped on Zoso!`);
    console.log(`\nEquipment summary:`);
    console.log(JSON.stringify(player.equipment, null, 2));
    
    await databaseManager.client.close();
  } catch (error) {
    console.error('Error equipping items on Zoso:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  equipZosoItems();
}

module.exports = equipZosoItems;

