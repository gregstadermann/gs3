'use strict';

/**
 * Script to convert Bulwark's items to containers
 * Updates: cloak, warbelt, utility belt, and trousers
 */

const databaseManager = require('../adapters/db/mongoClient');

async function convertBulkwarkContainers() {
  try {
    const db = await databaseManager.initialize();
    const collection = db.collection('items');

    const containerUpdates = [
      {
        id: 'bulkwark-cloak-back',
        name: 'a long weather-stained cloak of gray-green weave',
        capacity: 40,  // Slightly Large (40-49 lbs) - like a knapsack
        maxItems: 30,
        description: 'A cloak with hidden pockets and inner compartments, perfect for carrying supplies.'
      },
      {
        id: 'bulkwark-warbelt',
        name: 'a broad leather warbelt fitted with twin sheaths',
        capacity: 15,  // Somewhat Small (12-15 lbs) - has sheaths for weapons
        maxItems: 8,
        description: 'A sturdy warbelt with multiple pouches and sheaths for weapons and supplies.'
      },
      {
        id: 'bulkwark-utility-belt',
        name: 'a narrow black belt bound with steel buckles and small pouches',
        capacity: 8,  // Fairly Small (8-11 lbs) - small pouches
        maxItems: 10,
        description: 'A utility belt with several small pouches for tools and small items.'
      },
      {
        id: 'bulkwark-leggings',
        name: 'wool-lined trousers reinforced at the knees with dark hide',
        capacity: 6,  // Small (5-7 lbs) - pockets in trousers
        maxItems: 8,
        description: 'Trousers with deep pockets reinforced for carrying small items.'
      },
      {
        id: 'bulkwark-travel-cloak',
        name: 'a thick wool travel-cloak clasped at the throat by a bronze pin',
        capacity: 35,  // Medium (20-39 lbs) - travel cloak with pockets
        maxItems: 25,
        description: 'A travel cloak with inner pockets and compartments for storing supplies on long journeys.'
      },
      {
        id: 'bulkwark-mantle',
        name: 'a mantle of wolf-gray fur trimmed with black leather binding',
        capacity: 25,  // Medium (20-39 lbs) - mantle with hidden compartments
        maxItems: 20,
        description: 'A heavy mantle with deep pockets and hidden compartments for storing items.'
      },
      {
        id: 'bulkwark-harness',
        name: 'a looped harness of sword straps and buckles',
        capacity: 12,  // Somewhat Small (12-15 lbs) - harness with pouches
        maxItems: 6,
        description: 'A harness with multiple straps and small pouches for carrying tools and small items.'
      },
      {
        id: 'bulkwark-boots',
        name: 'black riding boots scarred by spur and stirrup',
        capacity: 5,  // Small (5-7 lbs) - boot compartments
        maxItems: 5,
        description: 'Riding boots with small hidden compartments in the heels and sides.'
      },
      {
        id: 'bulkwark-vambraces',
        name: 'leather vambraces reinforced with iron at the forearm',
        capacity: 4,  // Very Small (0-4 lbs) - small pouches on vambraces
        maxItems: 4,
        description: 'Vambraces with small pouches attached for storing small tools or items.'
      }
    ];

    console.log('Converting Bulwark items to containers...\n');

    for (const item of containerUpdates) {
      const result = await collection.updateOne(
        { id: item.id },
        {
          $set: {
            type: 'CONTAINER',
            'metadata.container': {
              capacity: item.capacity
            },
            'metadata.items': [],
            'metadata.maxItems': item.maxItems
          }
        }
      );

      if (result.matchedCount === 0) {
        console.log(`  ⚠ Warning: Item "${item.id}" not found in database`);
      } else if (result.modifiedCount === 0) {
        console.log(`  ✓ Item "${item.id}" already configured as container`);
      } else {
        console.log(`  ✓ Converted "${item.name}" to container:`);
        console.log(`    - Capacity: ${item.capacity} lbs`);
        console.log(`    - Max Items: ${item.maxItems}`);
      }
    }

    // Verify the updates
    console.log('\nVerifying container updates:');
    const itemIds = containerUpdates.map(u => u.id);
    const items = await collection.find(
      { id: { $in: itemIds } },
      { id: 1, name: 1, type: 1, 'metadata.container': 1 }
    ).toArray();

    for (const item of items) {
      const container = item.metadata?.container;
      if (container) {
        console.log(`  ${item.name}:`);
        console.log(`    Type: ${item.type}`);
        console.log(`    Capacity: ${container.capacity} lbs`);
        console.log(`    Items: ${(container.items || []).length} items stored`);
      } else {
        console.log(`  ⚠ ${item.name}: Not configured as container`);
      }
    }

    console.log('\n✓ Container conversion complete!');
    process.exit(0);
  } catch (error) {
    console.error('Error converting items to containers:', error);
    process.exit(1);
  }
}

convertBulkwarkContainers();

