# Container System Reference

## Overview

The GS3 container system uses a two-tier approach:
1. **Constants** (`src/constants/containers.js`) - Standard capacity ranges
2. **Base Definitions** (`src/data/base-containers.js`) - Actual container templates

---

## Capacity Ranges

### Weight Capacity Chart

| Description        | Min (lbs) | Max (lbs) | Examples                    |
|-------------------|-----------|-----------|------------------------------|
| Very Small        | 0         | 4         | —                           |
| Small             | 5         | 7         | small sack, herb pouch      |
| Fairly Small      | 8         | 11        | small chest (10 lbs)        |
| Somewhat Small    | 12        | 15        | scabbard, sheath            |
| Slightly Small    | 16        | 19        | —                           |
| Medium            | 20        | 39        | large sack                  |
| Slightly Large    | 40        | 49        | knapsack, rucksack          |
| Fairly Large      | 50        | 59        | —                           |
| Large             | 60        | 69        | —                           |
| Particularly Large| 70        | 79        | —                           |
| Very Large        | 80        | 99        | small chest (80 lbs)        |
| Significant       | 100       | 119       | backpack                    |
| Exceptional       | 120       | 139       | —                           |
| Huge              | 140       | 159       | —                           |
| Incredible        | 160       | 179       | —                           |
| Enormous          | 180       | 199       | —                           |
| Gigantic          | 200       | 1000      | treasure system boxes       |

### Item Quantity Descriptions

| Description        | Min Items | Max Items |
|-------------------|-----------|-----------|
| one item          | 1         | 1         |
| a couple of items | 2         | 2         |
| a few items       | 3         | 3         |
| several items     | 4         | 6         |
| a number of items | 7         | 9         |
| any number of items| 10       | ∞         |

---

## Available Containers

### Small Containers (5-7 lbs capacity)

**Small Sack**
```javascript
container_small_sack
- Capacity: 5 lbs (10 items max)
- Weight: 1 lb
- Slot: belt
```

**Herb Pouch**
```javascript
container_herb_pouch
- Capacity: 5 lbs (15 items max)
- Weight: 0.5 lb
- Slot: belt
```

### Fairly Small (8-11 lbs capacity)

**Small Chest**
```javascript
container_small_chest
- Capacity: 10 lbs (8 items max)
- Weight: 6 lbs
- Portable (not worn)
```

### Somewhat Small (12-15 lbs capacity)

**Scabbard**
```javascript
container_scabbard
- Capacity: 15 lbs (1 weapon)
- Weight: 2 lbs
- Slot: belt
```

**Sheath**
```javascript
container_sheath
- Capacity: 15 lbs (1 weapon)
- Weight: 1 lb
- Slot: belt
```

### Medium (20-39 lbs capacity)

**Large Sack**
```javascript
container_large_sack
- Capacity: 20 lbs (20 items max)
- Weight: 2 lbs
- Slot: shoulder
```

### Slightly Large (40-49 lbs capacity)

**Knapsack**
```javascript
container_knapsack
- Capacity: 40 lbs (30 items max)
- Weight: 5 lbs
- Slot: back
```

**Rucksack**
```javascript
container_rucksack
- Capacity: 40 lbs (30 items max)
- Weight: 5 lbs
- Slot: back
```

### Very Large (80-99 lbs capacity)

**Reinforced Small Chest**
```javascript
container_small_chest_heavy
- Internal Capacity: 80 lbs (40 items max)
- Surface Capacity: 10 lbs (fairly small)
- Weight: 6 lbs
- Portable (not worn)
- Note: Can store items INSIDE and ON the surface
```

### Significant (100-119 lbs capacity)

**Heavy Backpack**
```javascript
container_backpack
- Capacity: 100 lbs (50 items max)
- Weight: 8 lbs
- Slot: back
```

### Gigantic (200-1000 lbs capacity)

**Treasure Box**
```javascript
container_treasure_box
- Capacity: 500 lbs (100 items max)
- Weight: 10 lbs
- Portable (not worn)
- Source: Treasure system
```

---

## Specialized Containers

### Gem Pouch
```javascript
container_gem_pouch
- Capacity: 5 lbs (50 items max)
- Weight: 0.5 lb
- Slot: belt
- Restriction: gems only
```

### Coin Purse
```javascript
container_coin_purse
- Capacity: 3 lbs (coins as single item)
- Weight: 0.3 lb
- Slot: belt
- Restriction: coins only
```

### Quiver
```javascript
container_quiver
- Capacity: 10 lbs (30 items max)
- Weight: 1 lb
- Slot: shoulder
- Restriction: ammunition only
```

---

## Usage in Code

### Get capacity description from weight:

```javascript
const { getCapacityDescription } = require('../constants/containers');

const capacity = 100;
const desc = getCapacityDescription(capacity);
// Returns: "Significant"
```

### Get item count description:

```javascript
const { getItemQuantityDescription } = require('../constants/containers');

const itemCount = 5;
const desc = getItemQuantityDescription(itemCount);
// Returns: "several items"
```

### Check if item fits:

```javascript
const { canFitWeight, canFitItem } = require('../constants/containers');

// Check weight
const fits = canFitWeight(
  currentWeight: 45,
  maxCapacity: 100,
  additionalWeight: 10
);
// Returns: true (45 + 10 = 55 <= 100)

// Check item count
const fits = canFitItem(currentItems: 48, maxItems: 50);
// Returns: true (48 < 50)
```

### Create container instance:

```javascript
const BASE_CONTAINERS = require('../data/base-containers');

// Get template
const template = BASE_CONTAINERS.container_backpack;

// Create instance
const backpack = {
  id: `backpack-${Date.now()}`,
  ...template,
  location: { type: 'player', id: 'Zoso', slot: 'back' },
  metadata: {
    container: {
      items: [],  // Currently empty
      currentWeight: 0
    }
  }
};

await db.collection('items').insertOne(backpack);
```

---

## Helper Functions Available

From `src/constants/containers.js`:

```javascript
// Get description from weight capacity
getCapacityDescription(100)  // → "Significant"

// Get description from item count
getItemQuantityDescription(5)  // → "several items"

// Get capacity range from description
getCapacityRange("Medium")  // → {minCapacity: 20, maxCapacity: 39}

// Validate weight fits
canFitWeight(currentWeight, maxCapacity, additionalWeight)  // → boolean

// Validate item count fits
canFitItem(currentItems, maxItems)  // → boolean
```

---

## Container Messaging Examples

### When examining container:

```javascript
const itemCount = container.metadata.container.items.length;
const quantityDesc = getItemQuantityDescription(itemCount);

// Output: "The backpack contains several items."
// or: "The backpack contains a few items."
```

### When checking capacity:

```javascript
const capacity = container.container.weightCapacity;
const capacityDesc = getCapacityDescription(capacity);

// Output: "The backpack has significant carrying capacity."
```

### When container is full:

```javascript
if (!canFitItem(container.metadata.container.items.length, container.container.maxItems)) {
  return "The backpack is full.";
}

if (!canFitWeight(currentWeight, maxCapacity, itemWeight)) {
  return "The backpack can't hold any more weight.";
}
```

---

## Database Queries

### Find all containers in game:
```bash
mongosh gs3 --eval 'db.items.find({type: "CONTAINER"})'
```

### Find containers in player inventory:
```bash
mongosh gs3 --eval 'db.items.find({
  type: "CONTAINER",
  "location.type": "player",
  "location.id": "Zoso"
})'
```

### Find backpacks specifically:
```bash
mongosh gs3 --eval 'db.items.find({
  baseId: "container_backpack"
})'
```

### Find what's inside a specific container:
```bash
mongosh gs3 --eval '
  var container = db.items.findOne({id: "backpack-123"});
  var itemIds = container.metadata.container.items || [];
  db.items.find({id: {$in: itemIds}})
'
```

---

## Notes

### Small Chest Special Case

Small chests have **dual capacity**:
- **Internal**: 10 lbs (fairly small) OR 80 lbs (very large) depending on variant
- **Surface**: 10 lbs (fairly small) - items can be placed ON the chest
- Empty chest weight: 6 lbs
- **Max total weight**: 96 lbs (6 empty + 80 inside + 10 on surface)

### Container Weight

The `weight` field is the **empty container's weight**.

Total encumbrance = container weight + contents weight:
```javascript
totalWeight = container.weight + container.metadata.container.currentWeight
```

### Restrictions

Some containers only accept specific item types:
- `gem_pouch`: Only gems
- `coin_purse`: Only coins
- `quiver`: Only ammunition (arrows, bolts)

Check `container.restriction` field when adding items.

---

## See Also

- `src/constants/containers.js` - Capacity constants and helper functions
- `src/data/base-containers.js` - Container template definitions
- `src/models/itemModel.js` - Item schema
- `src/commands/put.js` - Container storage command
- `src/commands/get.js` - Item retrieval command

