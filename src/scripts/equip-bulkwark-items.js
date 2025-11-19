'use strict';

const databaseManager = require('../adapters/db/mongoClient');

const PLAYER_NAME = 'Bulwark';

const ITEMS = [
  {
    id: 'bulkwark-pin',
    name: 'a silver pin in the shape of a sword balanced on a crown',
    shortName: 'a silver sword-and-crown pin',
    description: 'The pin’s edges are dulled by years of use; the emblem of a fallen line, worn not for pride but remembrance.',
    type: 'MISC',
    slot: 'general'
  },
  {
    id: 'bulkwark-cloak-back',
    name: 'a long weather-stained cloak of gray-green weave',
    shortName: 'a weather-stained cloak',
    description: 'Its fabric shifts subtly with movement, fading into shadow and stone like mist over old hills.',
    type: 'ARMOR',
    slot: 'back'
  },
  {
    id: 'bulkwark-warbelt',
    name: 'a broad leather warbelt fitted with twin sheaths',
    shortName: 'a broad leather warbelt',
    description: 'The leather is dark and supple, worn smooth by decades of readiness.',
    type: 'MISC',
    slot: 'waist'
  },
  {
    id: 'bulkwark-circlet',
    name: 'a plain circlet of blackened steel etched with runes of vigilance',
    shortName: 'a blackened steel circlet',
    description: 'It bears no gem, only the faint groove of a thousand days beneath a helm.',
    type: 'ARMOR',
    slot: 'head'
  },
  {
    id: 'bulkwark-travel-cloak',
    name: 'a thick wool travel-cloak clasped at the throat by a bronze pin',
    shortName: 'a thick wool travel-cloak',
    description: 'The clasp bears the sigil of no known house. Its owner likely prefers it that way.',
    type: 'ARMOR',
    slot: 'shoulder'
  },
  {
    id: 'bulkwark-mantle',
    name: 'a mantle of wolf-gray fur trimmed with black leather binding',
    shortName: 'a wolf-gray fur mantle',
    description: 'Soft to the touch, but dense — weather armor for cold, northern rain.',
    type: 'ARMOR',
    slot: 'shoulders'
  },
  {
    id: 'bulkwark-greaves',
    name: 'reinforced leather greaves creased from long marches',
    shortName: 'reinforced leather greaves',
    description: 'Scratches along the shins mark the passage of countless roads and battles.',
    type: 'ARMOR',
    slot: 'legsPulled'
  },
  {
    id: 'bulkwark-hauberk',
    name: 'a mail hauberk forged of grayened steel rings',
    shortName: 'a grayened steel mail hauberk',
    description: 'The hauberk gleams dully, not with polish but with the patience of endurance.',
    type: 'ARMOR',
    slot: 'torso'
  },
  {
    id: 'bulkwark-bracers',
    name: 'a pair of steel bracers engraved with the words Duty is heavier than a mountain',
    shortName: 'steel bracers of duty',
    description: 'Each ring of steel bears its own small dent — each one remembered.',
    type: 'ARMOR',
    slot: 'rightWrist'
  },
  {
    id: 'bulkwark-ring',
    name: 'a plain band of silver, worn smooth by time',
    shortName: 'a plain silver band',
    description: 'The kind of ring a man forgets to remove before battle — until it’s all that’s left.',
    type: 'MISC',
    slot: 'rightFinger'
  },
  {
    id: 'bulkwark-boots',
    name: 'black riding boots scarred by spur and stirrup',
    shortName: 'black riding boots',
    description: 'The boots creak with the memory of long rides beneath gray skies.',
    type: 'ARMOR',
    slot: 'feetPutOn'
  },
  {
    id: 'bulkwark-pendant',
    name: 'a corded leather pendant bearing a shard of blue glass',
    shortName: 'a corded pendant with blue glass',
    description: 'It catches faint light even when none should fall upon it — like hope stubbornly unforgotten.',
    type: 'MISC',
    slot: 'neck'
  },
  {
    id: 'bulkwark-utility-belt',
    name: 'a narrow black belt bound with steel buckles and small pouches',
    shortName: 'a narrow black utility belt',
    description: 'The pouches smell faintly of oil, steel, and cold mountain wind.',
    type: 'MISC',
    slot: 'belt'
  },
  {
    id: 'bulkwark-vambraces',
    name: 'leather vambraces reinforced with iron at the forearm',
    shortName: 'reinforced leather vambraces',
    description: 'They bear the faint shape of runic wards, nearly worn away by sweat and steel.',
    type: 'ARMOR',
    slot: 'arms'
  },
  {
    id: 'bulkwark-harness',
    name: 'a looped harness of sword straps and buckles',
    shortName: 'a looped sword harness',
    description: 'Meant to hold both blade and dagger steady through any storm.',
    type: 'MISC',
    slot: 'legsAttached'
  },
  {
    id: 'bulkwark-ear-stud',
    name: 'a single small stud of tempered iron',
    shortName: 'a tempered iron ear stud',
    description: 'Said to have been made from the point of a fallen comrade’s blade.',
    type: 'MISC',
    slot: 'earlobe'
  },
  {
    id: 'bulkwark-ear-rings',
    name: 'paired silver rings shaped like interlocking shields',
    shortName: 'paired interlocking silver rings',
    description: 'Simple and utilitarian, worn by Border men as quiet remembrance.',
    type: 'MISC',
    slot: 'earlobes'
  },
  {
    id: 'bulkwark-ankle-thong',
    name: 'a leather thong tied thrice, each knot representing an oath',
    shortName: 'a thrice-knotted leather thong',
    description: 'The leather is cracked but unbroken. As are the oaths.',
    type: 'MISC',
    slot: 'ankle'
  },
  {
    id: 'bulkwark-gorget',
    name: 'a plain steel gorget protecting the throat',
    shortName: 'a plain steel gorget',
    description: 'The mark of countless parries runs along its edge like forgotten words.',
    type: 'ARMOR',
    slot: 'front'
  },
  {
    id: 'bulkwark-gloves',
    name: 'hardened gloves sewn from black boarhide',
    shortName: 'black boarhide gloves',
    description: 'The fingers move with silent precision — no clink of mail, no wasted motion.',
    type: 'ARMOR',
    slot: 'hands'
  },
  {
    id: 'bulkwark-moccasins',
    name: 'camp moccasins of deerskin',
    shortName: 'deerskin camp moccasins',
    description: 'Soft and silent, made for scouting or quiet watches beside the dying fire.',
    type: 'ARMOR',
    slot: 'feetSlipOn'
  },
  {
    id: 'bulkwark-hair-cord',
    name: 'a tightly wrapped leather cord binding a warrior’s braid',
    shortName: 'a tightly wrapped leather hair cord',
    description: 'Dyed blue with indigo — the color of mourning and resolve.',
    type: 'MISC',
    slot: 'hair'
  },
  {
    id: 'bulkwark-undershirt',
    name: 'a linen undershirt stained with sweat and old smoke',
    shortName: 'a smoke-stained linen undershirt',
    description: 'Its threads hold the scent of campfires, steel oil, and snow.',
    type: 'ARMOR',
    slot: 'undershirt'
  },
  {
    id: 'bulkwark-leggings',
    name: 'wool-lined trousers reinforced at the knees with dark hide',
    shortName: 'wool-lined reinforced trousers',
    description: 'Threadbare in places, but carefully mended — the mark of someone who values what still serves.',
    type: 'ARMOR',
    slot: 'leggings'
  },
  {
    id: 'bulkwark-longsword',
    name: 'a heron-marked longsword with a blue leather grip',
    shortName: 'a heron-marked longsword',
    description: 'The blade hums faintly when drawn — not song, but remembrance.',
    type: 'WEAPON',
    slot: 'rightHand'
  },
  {
    id: 'bulkwark-long-knife',
    name: 'a long knife with a brass hilt wrapped in gray cord',
    shortName: 'a brass-hilted long knife',
    description: 'Balanced for throwing or finishing — a tool more than a trophy.',
    type: 'WEAPON',
    slot: 'leftHand'
  },
  {
    id: 'bulkwark-shield',
    name: 'a small round shield banded in dull iron',
    shortName: 'a dull-iron banded round shield',
    description: 'Its surface shows no sigil, but when light hits it just so, faint runes flare and fade.',
    type: 'SHIELD',
    slot: 'shoulder'
  }
];

async function equipBulkwarkItems() {
  try {
    const db = await databaseManager.initialize();
    const players = db.collection('players');
    const itemsCollection = db.collection('items');

    const player = await players.findOne({ name: PLAYER_NAME });
    if (!player) {
      console.error(`Player ${PLAYER_NAME} not found. Please create the character first.`);
      await databaseManager.client.close();
      return;
    }

    player.equipment = player.equipment || {};

    for (const itemData of ITEMS) {
      const item = {
        id: itemData.id,
        name: itemData.name,
        shortName: itemData.shortName || itemData.name,
        description: itemData.description,
        type: itemData.type,
        location: {
          type: 'player',
          id: PLAYER_NAME,
          slot: itemData.slot
        },
        metadata: {
          slot: itemData.slot,
          weight: 1,
          value: 10
        },
        updatedAt: new Date(),
        createdAt: new Date()
      };

      const existingItem = await itemsCollection.findOne({ id: itemData.id });
      if (existingItem) {
        await itemsCollection.updateOne(
          { id: itemData.id },
          { $set: item }
        );
        console.log(`✓ Updated ${itemData.name}`);
      } else {
        await itemsCollection.insertOne(item);
        console.log(`✓ Created ${itemData.name}`);
      }

      assignEquipmentSlot(player, itemData.slot, itemData.id);
    }

    await players.updateOne(
      { name: PLAYER_NAME },
      { $set: { equipment: player.equipment } }
    );

    console.log('\nEquipment assignment complete. Current equipment:');
    console.log(JSON.stringify(player.equipment, null, 2));

    await databaseManager.client.close();
  } catch (error) {
    console.error('Error equipping items on Bulkwark:', error);
    process.exit(1);
  }
}

function assignEquipmentSlot(player, slot, itemId) {
  const equipment = player.equipment;

  switch (slot) {
    case 'shoulder': {
      if (!equipment.shoulder) {
        equipment.shoulder = [];
      }
      if (typeof equipment.shoulder === 'string') {
        equipment.shoulder = [equipment.shoulder];
      }
      if (!equipment.shoulder.includes(itemId)) {
        if (equipment.shoulder.length >= 2) {
          console.warn(`⚠ Shoulder slot already has two items. Skipping ${itemId}.`);
        } else {
          equipment.shoulder.push(itemId);
        }
      }
      break;
    }
    case 'torso':
      equipment.chest = itemId;
      break;
    case 'legsPulled':
      equipment.legs = itemId;
      break;
    case 'feetPutOn':
      equipment.feet = itemId;
      break;
    case 'hands':
      equipment.gloves = itemId;
      break;
    case 'rightHand':
    case 'leftHand':
      equipment[slot] = itemId;
      break;
    default:
      equipment[slot] = itemId;
      break;
  }
}

if (require.main === module) {
  equipBulkwarkItems();
}

module.exports = equipBulkwarkItems;


