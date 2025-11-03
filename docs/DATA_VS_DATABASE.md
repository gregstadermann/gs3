# Data vs Database - Decision Guide

## The Fundamental Distinction

### Data Files (in `src/data/`)
**Definition**: Static templates and definitions loaded at boot

**Characteristics**:
- **Definitions**, not instances
- **Read-only** at runtime (loaded once)
- **Version-controlled** (in git)
- **Same for all players**
- Edited by designers, deployed with code

**Examples**: Race definitions, item templates, skill lists

---

### Database (MongoDB)
**Definition**: Dynamic runtime instances created during gameplay

**Characteristics**:
- **Instances**, not definitions
- **Read/Write** constantly
- **NOT in git** (persisted separately)
- **Unique per player/game**
- Created by gameplay, not developers

**Examples**: Player characters, spawned items, room state

---

## The Golden Rules

### Rule 1: Templates vs Instances
```
Template (definition)     → data/
Instance (created thing)  → database
```

**Example**:
- Broadsword **template** → `data/items/weapons/broadsword.json`
- Zoso's specific broadsword → Database (items collection)

### Rule 2: Static vs Dynamic
```
Never changes at runtime   → data/
Changes during gameplay    → database
```

**Example**:
- Human race definition → `data/races.json` (static)
- Zoso's character data → Database (players collection)

### Rule 3: Shared vs Unique
```
Shared by all players      → data/
Unique per player/session  → database
```

**Example**:
- Warrior profession → `data/professions.json` (shared)
- Alice's warrior → Database (unique instance)

---

## Decision Matrix

Ask these questions in order:

### 1. **Is it a template or an instance?**
- **Template/Definition** → `data/`
- **Instance/Copy** → Database

### 2. **Does it change during gameplay?**
- **Never** → `data/`
- **Yes** → Database

### 3. **Is it the same for all players?**
- **Same for everyone** → `data/`
- **Unique per player** → Database

### 4. **When is it created?**
- **By developers** → `data/`
- **By players/gameplay** → Database

### 5. **Is it version-controlled?**
- **Yes (in git)** → `data/`
- **No (backed up)** → Database

---

## Examples by Category

### DATA (Templates/Definitions) ✅

#### Race Definitions
```json
// data/races.json
{
  "human": {
    "name": "Human",
    "baseWeight": 90,
    "statModifiers": { "strength": 5 }
  }
}
```
**Why data/?**
- Template used by all human characters
- Never changes at runtime
- Designers define this

#### Item Templates
```json
// data/items/weapons/broadsword.json
{
  "id": "broadsword_base",
  "name": "a broadsword",
  "weight": 4,
  "damageType": "slash",
  "basePrice": 500
}
```
**Why data/?**
- Base definition for all broadswords
- Used to create instances
- Content team maintains

#### Profession Definitions
```json
// data/professions.json
{
  "warrior": {
    "name": "Warrior",
    "primeStats": ["strength", "constitution"],
    "skillCosts": { "weapon": 1, "magic": 10 }
  }
}
```
**Why data/?**
- Class definition, not a character
- Same for all warriors
- Game designers balance

#### Area/Region Data
```json
// data/areas.json
{
  "wl-town": "Wehnimer's Landing - Town"
}
```
**Why data/?**
- World geography is static
- Doesn't change during gameplay

#### NPC Templates
```json
// data/npcs/town_guard.json
{
  "templateId": "town_guard",
  "name": "a town guard",
  "level": 5,
  "baseHealth": 100,
  "behavior": "guard"
}
```
**Why data/?**
- Template for spawning guards
- All guards start from this
- Designers define

---

### DATABASE (Instances/Runtime State) ✅

#### Player Characters
```javascript
// MongoDB: players collection
{
  name: "Zoso",
  race: "human",              // ← References data/races.json
  room: "wl-town:square",
  attributes: {
    strength: { base: 90, bonus: 20 },
    health: { current: 145, max: 150 }
  },
  inventory: ["item_123", "item_456"]
}
```
**Why database?**
- Unique character instance
- Changes every session (location, health, etc.)
- Created by player during character creation

#### Spawned Items
```javascript
// MongoDB: items collection
{
  id: "item_1234567890",
  baseId: "broadsword_base",  // ← References data template
  name: "a broadsword",
  location: { type: "player", id: "Zoso" },
  metadata: {
    condition: 95,            // Degrades over time
    enchantment: 2,           // Modified by gameplay
    owner: "Zoso"
  }
}
```
**Why database?**
- Specific instance created during gameplay
- Condition changes as it's used
- Can be modified/enchanted
- Has unique location/owner

#### Spawned NPCs
```javascript
// MongoDB: npcs collection
{
  id: "npc_guard_001",
  templateId: "town_guard",   // ← References data template
  room: "wl-town:north_gate",
  attributes: {
    health: { current: 85, max: 100 }  // Takes damage
  },
  combat: {
    target: "Bandit_01",      // Currently fighting
    roundtime: 2
  },
  spawnedAt: "2025-11-03T10:30:00Z"
}
```
**Why database?**
- Specific guard instance
- Current state (health, target)
- Can die/despawn
- Unique to this game session

#### Room State
```javascript
// MongoDB: rooms collection
{
  fullId: "wl-town:square",
  title: "[Town Square Central]",
  description: "The heart of...",
  exits: [...],
  // Dynamic state:
  items: ["item_dropped_123"],     // Player dropped items
  npcs: ["npc_guard_001"],         // Spawned NPCs
  lastCleaned: "2025-11-03T09:00:00Z"
}
```
**Why database?**
- Even though room definition is static...
- Dynamic items/NPCs in the room
- State changes during gameplay

#### Player Sessions
```javascript
// MongoDB: sessions collection
{
  sessionId: "sess_abc123",
  playerId: "Zoso",
  loginAt: "2025-11-03T10:00:00Z",
  lastActivity: "2025-11-03T10:45:00Z",
  isActive: true
}
```
**Why database?**
- Created at login
- Expires after logout
- Unique per session

---

## Hybrid Cases (Template + Instance)

### Weapons System
```
Template:  data/items/weapons/broadsword.json
           ↓ (spawn/create)
Instance:  MongoDB items collection
```

**Flow**:
1. Designer creates template in `data/items/weapons/broadsword.json`
2. Game spawns instance: `itemFactory.create('broadsword_base')`
3. Instance stored in database with unique ID
4. Instance can be modified (enchanted, damaged)
5. Instance eventually destroyed/deleted

### NPC System
```
Template:  data/npcs/town_guard.json
           ↓ (spawn)
Instance:  MongoDB npcs collection
           ↓ (despawn/death)
Deleted:   Remove from database
```

**Flow**:
1. Designer defines NPC template
2. System spawns guard in specific room
3. Guard fights, takes damage (instance state)
4. Guard dies → marked for cleanup
5. After decay time → deleted from database

### Room System (Special Case)
```
Definition: data/rooms/*.json (imported once)
            ↓ (import)
Stored:     MongoDB rooms collection
            ↓ (runtime)
State:      Dynamic items/NPCs added to room
```

**Why both?**
- Room *structure* is static (imported from data)
- Room *contents* are dynamic (items, NPCs)
- Stored in DB for fast queries

---

## Loading Strategy

### Boot Sequence
```
1. Load constants/      → Pure mechanics in memory
2. Load data/           → Templates in memory
3. Connect to MongoDB   → Runtime state
4. Cache hot entities   → Performance layer
```

### Example Boot Code
```javascript
// 1. Load constants
const COMBAT = require('./constants/combat');
const ENCUMBRANCE = require('./constants/encumbrance');

// 2. Load data (templates)
const races = require('./data/races.json');
const professions = require('./data/professions.json');
const itemTemplates = loadItemTemplates('./data/items/');

// 3. Connect to database (instances)
await mongoClient.initialize();

// 4. Preload common templates into services
itemFactory.registerTemplates(itemTemplates);
npcSystem.registerTemplates(npcTemplates);

// Now ready to serve players!
```

---

## Anti-Patterns to Avoid

### ❌ BAD: Putting instances in data files
```json
// WRONG: data/players/zoso.json
{
  "name": "Zoso",
  "currentHealth": 145,
  "location": "town_square"
}
```
**Why wrong?** This changes every session!  
**Fix**: Store in MongoDB players collection

### ❌ BAD: Putting templates in database
```javascript
// WRONG: Storing item template in DB
db.collection('item_templates').insertOne({
  type: "broadsword",
  weight: 4,
  damage: 25
});
```
**Why wrong?** Templates should be version-controlled  
**Fix**: Put in `data/items/weapons/broadsword.json`

### ❌ BAD: Hard-coding content in systems
```javascript
// WRONG: system/NPCSystem.js
spawnGuard() {
  return {
    name: "a town guard",  // ← Hard-coded!
    level: 5,
    health: 100
  };
}
```
**Why wrong?** Can't modify without code changes  
**Fix**: Load from `data/npcs/town_guard.json`

### ❌ BAD: Storing static content in database
```javascript
// WRONG: Loading races into DB
await db.collection('races').insertMany([
  { id: "human", name: "Human", ... },
  { id: "elf", name: "Elf", ... }
]);
```
**Why wrong?** Races are static definitions  
**Fix**: Keep in `data/races.json`, load at boot

---

## Edge Cases & Decisions

### Critical Hit Tables: DATA ✅
**Decision**: `data/crit_tables/*.json`  
**Why?**
- Static damage/wound tables
- Never change at runtime
- Used as lookup tables

### Loot Tables: DATA ✅
**Decision**: `data/loot-tables.js`  
**Why?**
- Drop probability templates
- Shared by all players
- Designers balance

### Quest Definitions: DATA ✅
**Decision**: `data/quests/*.json`  
**Why?**
- Quest structure/rewards are static
- Same quest for all players

### Quest Progress: DATABASE ✅
**Decision**: MongoDB `player.quests` field  
**Why?**
- Each player's progress is unique
- Changes as they complete objectives

### World Map/Rooms: HYBRID
**Imported**: `data/rooms/*.json` → MongoDB rooms
**Why?**
- Easier to query from database
- But defined in version-controlled files
- Import script runs on updates

---

## File Formats by Layer

### Data Layer
```
data/
  ├── *.json          # Simple static data
  ├── *.yaml          # Complex nested data
  └── *.js            # Data with computed fields
```

**When to use each**:
- **JSON**: Simple definitions (races, areas)
- **YAML**: Complex hierarchies (quests, dialogue trees)
- **JS**: When you need computed values or imports

### Database Layer
```
MongoDB collections:
  ├── players         # Character instances
  ├── items           # Spawned items
  ├── npcs            # Spawned NPCs
  ├── rooms           # World geography (imported)
  ├── accounts        # User accounts
  ├── sessions        # Active sessions
  └── actions         # Event log
```

---

## Migration Workflow

### Adding New Content Type

**1. Create Template** (if reusable)
```json
// data/items/potions/health_potion.json
{
  "id": "health_potion",
  "name": "a health potion",
  "type": "CONSUMABLE",
  "effect": { "type": "heal", "amount": 50 }
}
```

**2. Register in Factory**
```javascript
// systems/ItemFactory.js
const healthPotion = require('../data/items/potions/health_potion.json');
itemFactory.register('health_potion', healthPotion);
```

**3. Spawn Instance**
```javascript
// Creates instance in database
const potion = await itemFactory.spawn('health_potion', {
  location: { type: 'room', id: roomId }
});
```

---

## Quick Decision Tree

```
┌─────────────────────────────────────┐
│ Does it exist before game starts?   │
├─────────────────────────────────────┤
│ YES → data/                          │
│ NO  → Created during gameplay?       │
│       YES → database                 │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Can players modify it?               │
├─────────────────────────────────────┤
│ NO  → data/                          │
│ YES → database                       │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Is it a template or instance?       │
├─────────────────────────────────────┤
│ Template   → data/                   │
│ Instance   → database                │
└─────────────────────────────────────┘
```

---

## Real-World GS3 Examples

### Currently Correct ✅

**data/**
- `races.json` - Race templates
- `base-weapons.js` - Weapon templates
- `areas.json` - Area definitions
- `crit_tables/` - Damage lookup tables
- `gems.js` - Gem type definitions

**database/**
- Player characters (players collection)
- Spawned items (items collection)
- Active NPCs (npcs collection)
- Imported rooms (rooms collection)
- User sessions (sessions collection)

---

## Summary Table

| Aspect | Data Files | Database |
|--------|------------|----------|
| **What** | Templates/Definitions | Instances/State |
| **When Created** | Development | Runtime |
| **Lifespan** | Permanent | Temporary/Session |
| **Changes** | Version deploys | Gameplay |
| **Ownership** | Designers | Players |
| **Version Control** | Git | Backups |
| **Examples** | Races, items | Characters, loot |
| **Loading** | Boot time | On demand |
| **Format** | JSON/YAML | MongoDB docs |

---

## The Complete Picture

```
┌──────────────────────────────────────────────────┐
│                   GAME LAYERS                     │
├──────────────────────────────────────────────────┤
│                                                   │
│  constants/   ← How the game works (mechanics)   │
│      ↓                                            │
│  data/        ← What exists (templates)          │
│      ↓                                            │
│  services/    ← Pure logic (calculations)        │
│      ↓                                            │
│  database     ← Runtime state (instances)        │
│      ↓                                            │
│  systems/     ← Orchestration (gameplay)         │
│                                                   │
└──────────────────────────────────────────────────┘
```

---

## When in Doubt

**Ask these three questions**:

1. **"Can I git commit this?"**
   - YES → `data/`
   - NO → Database

2. **"Is it a template or a thing?"**
   - Template → `data/`
   - Thing → Database

3. **"Does it exist before anyone plays?"**
   - YES → `data/`
   - NO → Database

**Golden Rule**:
> Data defines what **CAN** exist.  
> Database tracks what **DOES** exist.

---

## See Also
- `CONSTANTS_VS_DATA.md` - Constants vs data distinction
- `ARCHITECTURE.md` - Full system architecture
- `models/` - Database schema definitions
- `data/` - Current template files

