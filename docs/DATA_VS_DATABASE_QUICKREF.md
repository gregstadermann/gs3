# Data vs Database - Quick Reference Card

## 🎯 The 3-Second Test

**Ask yourself**: "TEMPLATE or INSTANCE?"

- **TEMPLATE** (definition) → `data/`
- **INSTANCE** (created thing) → Database

---

## ⚡ Quick Decision Checklist

```
[ ] Exists before gameplay?             → data/
[ ] Created during gameplay?            → database
[ ] Same for all players?               → data/
[ ] Unique per player?                  → database
[ ] Version controlled (git)?           → data/
[ ] Changes at runtime?                 → database
[ ] Template/definition?                → data/
[ ] Instance/copy?                      → database
```

---

## 📊 Common Patterns

### DATA (Templates)

| Type | Example | Location |
|------|---------|----------|
| **Race Definitions** | Human, Elf, Dwarf | `data/races.json` |
| **Class Definitions** | Warrior, Wizard | `data/professions.json` |
| **Item Templates** | Broadsword base | `data/items/weapons/` |
| **NPC Templates** | Town guard | `data/npcs/` |
| **Area Data** | World geography | `data/areas.json` |
| **Loot Tables** | Drop rates | `data/loot-tables.js` |

### DATABASE (Instances)

| Type | Example | Collection |
|------|---------|------------|
| **Characters** | Zoso (level 15 human) | `players` |
| **Spawned Items** | Zoso's broadsword | `items` |
| **Spawned NPCs** | Guard #001 (health: 85) | `npcs` |
| **Room State** | Items/NPCs in room | `rooms` |
| **Sessions** | Active logins | `sessions` |
| **Quest Progress** | Player's quest state | `players.quests` |

---

## 🔥 The Classic Example

### Broadsword

```
TEMPLATE (data/)
├─ data/items/weapons/broadsword.json
│  {
│    "id": "broadsword_base",
│    "name": "a broadsword",
│    "weight": 4,
│    "damage": 25
│  }
│
└─ SPAWNED → INSTANCE (database)
             ├─ Item #1234 (Zoso's, condition: 95%)
             ├─ Item #5678 (Alice's, condition: 100%)
             └─ Item #9012 (shop, enchanted +2)
```

---

## 🎨 Flow Diagram

```
Development Time          Runtime
─────────────────        ─────────────
                         
Designer creates         Player logs in
     ↓                        ↓
data/races.json          Character select
     ↓                        ↓
Git commit               Load from DB
     ↓                        ↓
Deploy                   Update state
                              ↓
                         Save to DB
```

---

## ✅ Correct Placement Examples

### Race System
```
✅ data/races.json
{
  "human": {
    "name": "Human",
    "baseWeight": 90
  }
}

✅ MongoDB players
{
  name: "Zoso",
  race: "human"  ← references template
}
```

### Item System
```
✅ data/items/weapons/broadsword.json
{
  "id": "broadsword_base",
  "weight": 4
}

✅ MongoDB items
{
  id: "item_123",
  baseId: "broadsword_base",  ← references template
  location: { type: "player", id: "Zoso" },
  condition: 95  ← runtime state
}
```

### NPC System
```
✅ data/npcs/town_guard.json
{
  "templateId": "town_guard",
  "baseHealth": 100
}

✅ MongoDB npcs
{
  id: "npc_001",
  templateId: "town_guard",  ← references template
  health: { current: 85, max: 100 },  ← runtime state
  room: "wl-town:gate"  ← current location
}
```

---

## 🚫 Anti-Patterns

### ❌ DON'T: Put instances in data/
```javascript
// WRONG: data/players/zoso.json
{
  "name": "Zoso",
  "currentHealth": 145  ← Changes every session!
}
```

### ❌ DON'T: Put templates in database
```javascript
// WRONG: Storing template in DB
db.races.insertOne({
  id: "human",
  name: "Human"  ← Should be in data/
});
```

### ❌ DON'T: Hard-code in systems
```javascript
// WRONG: Hard-coded content
function createGuard() {
  return {
    name: "a town guard",  ← Should be in data/
    health: 100
  };
}
```

---

## 🎓 The Three Questions

Before placing content, ask:

### 1. Can I commit this to git?
- **YES** → `data/`
- **NO** → Database

### 2. Is it a template or instance?
- **Template** → `data/`
- **Instance** → Database

### 3. Does it exist before gameplay?
- **YES** → `data/`
- **NO** → Database

**If all three answers are the same → You're right!**

---

## 💡 Hybrid Pattern: Rooms

Rooms are **imported from data/ into database**:

```
1. Define:  data/rooms/town_square.json
            ↓
2. Import:  node scripts/import-rooms.js
            ↓
3. Store:   MongoDB rooms collection
            ↓
4. Runtime: Dynamic items/NPCs added
```

**Why?**
- Room structure is static (from data)
- Room contents are dynamic (in database)
- Database allows fast spatial queries

---

## 📋 Typical Workflow

### Adding a New Item Type

```bash
# 1. Designer creates template
echo '{
  "id": "health_potion",
  "name": "a health potion",
  "weight": 0.2
}' > data/items/potions/health_potion.json

# 2. Commit to git
git add data/items/potions/health_potion.json
git commit -m "Add health potion template"

# 3. Deploy
git push

# 4. Runtime - player finds potion
# System spawns instance:
const potion = itemFactory.spawn('health_potion');
# → Stored in MongoDB items collection

# 5. Player uses potion
# → Instance deleted from database
```

---

## 🗂️ File Organization

```
src/
├── constants/           # Pure mechanics
│   └── encumbrance.js
│
├── data/                # Templates (git)
│   ├── races.json      ← All races
│   ├── items/
│   │   └── weapons/
│   │       └── broadsword.json  ← One template
│   └── npcs/
│       └── town_guard.json      ← NPC template
│
└── MongoDB              # Instances (backup)
    ├── players          ← All characters
    ├── items            ← All spawned items
    │   ├── item_123    ← Zoso's sword
    │   ├── item_456    ← Alice's sword
    │   └── item_789    ← Bob's sword
    └── npcs             ← All spawned NPCs
```

---

## 🎮 Complete Picture

```
┌────────────────────────────────────┐
│ constants/  → How game works       │
│      ↓                              │
│ data/       → What can exist       │
│      ↓                              │
│ services/   → Pure calculations    │
│      ↓                              │
│ database    → What does exist      │
│      ↓                              │
│ systems/    → Gameplay logic       │
└────────────────────────────────────┘
```

---

## 📞 Quick Reference Card

Keep this by your desk:

```
┌─────────────────────────────────────┐
│  DATA vs DATABASE                   │
├─────────────────────────────────────┤
│  Template?          → data/         │
│  Instance?          → database      │
│  Pre-gameplay?      → data/         │
│  Created at runtime? → database     │
│  In git?            → data/         │
│  Player-modified?   → database      │
│  Same for all?      → data/         │
│  Unique per player? → database      │
└─────────────────────────────────────┘
```

---

## 🔗 Related Docs

- `CONSTANTS_VS_DATA.md` - Constants layer explained
- `DATA_VS_DATABASE.md` - Full guide (this quick ref)
- `ARCHITECTURE.md` - Complete system architecture

---

## 💭 Remember

> **data/** = What **CAN** exist in the game  
> **database** = What **DOES** exist right now

If players can modify it → Database  
If designers define it → Data

**One line rule**: "Is it a blueprint or a building?"
- Blueprint → `data/`
- Building → Database

