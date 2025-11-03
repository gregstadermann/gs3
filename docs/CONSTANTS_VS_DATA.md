# Constants vs Data - Decision Guide

## The Fundamental Distinction

### Constants (in `src/constants/`)
**Definition**: Game mechanics and formulas that define **HOW** the game works

**Characteristics**:
- Pure lookup tables with no context
- Rarely change (only with major game updates)
- No nested complex structures
- Used for calculations in services
- Represent immutable game rules

**Change Frequency**: Once per major version

**Examples**:
```javascript
// GOOD: Pure mechanical constants
const ENCUMBRANCE = {
  armorBaseWeightByASG: { 1: 0, 2: 8, 5: 10, ... },
  silversPerPound: 160,
  pfReductionRate: 10
};

const COMBAT = {
  stanceModifiers: { offensive: 100, advance: 80, ... },
  endRollThreshold: 100,
  fumbleThreshold: -50
};

const SKILLS = {
  ranksToProfession: { warrior: [2,0,0], ... },
  costMultiplier: { physical: 1.0, weapon: 1.0, ... }
};
```

---

### Data (in `src/data/`)
**Definition**: Content that defines **WHAT** exists in the game world

**Characteristics**:
- Rich, contextual information
- Can change frequently (content patches)
- Complex nested structures
- Describes game entities/templates
- Represents configurable content

**Change Frequency**: Per content patch/balance update

**Examples**:
```json
{
  "human": {
    "name": "Human",
    "description": "Versatile and adaptable...",
    "baseWeight": 90,
    "bodyFactor": 0.90,
    "statModifiers": { "strength": 5, "logic": 5, ... },
    "culturalBonus": "+5 to trading",
    "lifespan": 120
  }
}
```

---

## Decision Matrix

Ask these questions:

### 1. **Is it a formula or calculation rule?**
- ✅ **Constant** → `constants/`
- ❌ **Not a formula** → Consider next question

### 2. **Does it describe an entity or template?**
- ✅ **Entity/Template** → `data/`
- ❌ **Pure number** → Consider next question

### 3. **How often will it change?**
- **Never/Rarely** → `constants/`
- **Per content patch** → `data/`
- **Per session** → Database

### 4. **Does it have rich metadata (name, description, lore)?**
- ✅ **Rich metadata** → `data/`
- ❌ **Just numbers** → `constants/`

### 5. **Is it used for calculation or description?**
- **Calculation** → `constants/`
- **Description** → `data/`

---

## Examples by Category

### CONSTANTS Examples ✅

#### Combat Mechanics
```javascript
// constants/combat.js
const COMBAT = {
  // Stance attack/defense modifiers
  stanceModifiers: {
    offensive: { AS: 100, DS: 80 },
    advance: { AS: 80, DS: 90 },
    forward: { AS: 60, DS: 100 },
    guard: { AS: 40, DS: 120 },
    defensive: { AS: 20, DS: 140 }
  },
  
  // End roll thresholds (pure mechanics)
  endRollThreshold: 100,
  fumbleThreshold: -50,
  criticalMultiplier: 1.5,
  
  // Roundtime by action (seconds)
  baseRoundtime: {
    attack: 3,
    spell: 3,
    movement: 1,
    search: 5
  }
};
```

#### Skill System
```javascript
// constants/skills.js
const SKILLS = {
  // Training cost multipliers by category
  costMultiplier: {
    physical: 1.0,
    weapon: 1.0,
    armor: 2.0,
    magic: 3.0
  },
  
  // Ranks needed per level
  ranksPerLevel: 3,
  
  // Bonus calculation: ranks * X
  bonusPerRank: 5
};
```

#### Stat Bonus Formula
```javascript
// constants/stats.js
const STATS = {
  // Formula constants
  statBase: 50,
  bonusDivisor: 2,
  
  // Growth rates by stat
  growthRates: {
    physical: 1.0,  // STR, CON, DEX, AGI
    mental: 0.8,    // INT, WIS, LOG
    hybrid: 0.9     // DIS, AUR, CHA
  }
};
```

#### Encumbrance Mechanics
```javascript
// constants/encumbrance.js (CURRENT - GOOD)
const ENCUMBRANCE = {
  armorBaseWeightByASG: { 1: 0, 2: 8, ... },
  silversPerPound: 160,
  pfReductionRate: 10
};
```

---

### DATA Examples ✅

#### Races
```json
// data/races.json (CURRENT - GOOD)
{
  "human": {
    "name": "Human",
    "description": "Versatile and adaptable race...",
    "baseWeight": 90,
    "bodyFactor": 0.90,
    "encumbranceFactor": 1.0,
    "statModifiers": { "strength": 5, ... },
    "culturalBonus": "Trading expertise",
    "startingCity": "wehnimers_landing"
  }
}
```

#### Professions/Classes
```json
// data/professions.json
{
  "warrior": {
    "name": "Warrior",
    "description": "Masters of physical combat...",
    "primeStats": ["strength", "constitution"],
    "skillCosts": {
      "armor": 1,
      "weapon": 1,
      "combat_maneuvers": 2,
      "magic": 10
    },
    "startingSkills": {
      "weapon_training": 5,
      "armor_training": 5
    },
    "abilities": ["berserk", "tackle", "disarm"]
  }
}
```

#### Item Templates
```json
// data/items/weapons/broadsword.json
{
  "id": "broadsword_basic",
  "name": "a broadsword",
  "type": "WEAPON",
  "description": "A well-balanced steel blade...",
  "weaponType": "sword",
  "damageType": "slash",
  "weight": 4,
  "value": 500,
  "attackStrength": 25,
  "defenseStrength": 5,
  "requiredSkill": "edged_weapons",
  "materials": ["steel"],
  "craftable": true
}
```

#### Areas/Regions
```json
// data/areas.json (CURRENT - GOOD)
{
  "wl-town": "Wehnimer's Landing - Town",
  "wl-northern": "Wehnimer's Landing - Northern Section"
}
```

#### Critical Tables
```javascript
// data/crit_tables/slash.json
// This is BORDERLINE - could argue for constants/
// But includes descriptive text, so DATA is correct
{
  "head": [
    {
      "rank": 1,
      "damage": 5,
      "message": "Minor cut to the head. Looks bloody but superficial.",
      "wounds": 1,
      "stun": 0
    }
  ]
}
```

---

## Edge Cases & Decisions

### Critical Tables: DATA ✅
**Why?**
- Includes descriptive flavor text (messages)
- Content team may tweak messages
- Damage values might be rebalanced frequently

**Alternative**: Could split into:
- `constants/critMechanics.js` - damage formulas
- `data/critMessages.json` - flavor text

### Armor Weights: CONSTANT ✅ (Current)
**Why?**
- Pure mechanical lookup (ASG → weight)
- Never changes (tied to ASG system)
- No context, just numbers

### Race Definitions: DATA ✅ (Current)
**Why?**
- Rich metadata (names, descriptions)
- Stat modifiers are *part of race identity*, not pure mechanics
- May add new races via content patches

### Skill Costs per Profession: DATA ✅
**Why?**
- Defines profession identity
- Frequently rebalanced
- Part of profession template

### Base Roundtimes: CONSTANT ✅
**Why?**
- Core combat mechanic
- Same for all professions
- Rarely changes

---

## Anti-Patterns to Avoid

### ❌ BAD: Putting entity templates in constants
```javascript
// WRONG: constants/weapons.js
const WEAPONS = {
  broadsword: {
    name: "a broadsword",
    description: "A well-balanced blade...",  // ← Rich content
    weight: 4,
    value: 500
  }
};
```
**Fix**: Move to `data/items/weapons.json`

### ❌ BAD: Putting formulas in data
```json
// WRONG: data/combat.json
{
  "stanceModifiers": { "offensive": 100 },
  "endRollFormula": "(AS - DS) + d100"
}
```
**Fix**: Move to `constants/combat.js`

### ❌ BAD: Mixing mechanics with content
```javascript
// WRONG: constants/races.js
const RACE_MECHANICS = {
  human: {
    description: "Versatile...",  // ← Content
    bodyFactor: 0.90              // ← Mechanic
  }
};
```
**Fix**: 
- Mechanics → `constants/raceMechanics.js` (if needed)
- Full definitions → `data/races.json`

---

## Real-World Examples from GS3

### Current Organization (GOOD ✅)

#### Constants
```
constants/
  └── encumbrance.js    # Pure mechanics: ASG weights, conversion rates
```

#### Data
```
data/
  ├── areas.json               # Area definitions
  ├── races.json               # Race templates
  ├── crit_tables/             # Critical hit tables
  │   ├── slash.json
  │   ├── crush.json
  │   └── puncture.json
  ├── base-weapons.js          # Weapon templates
  ├── base-armor.js            # Armor templates
  ├── gems.js                  # Gem definitions
  └── experience-levels.js     # Level progression table
```

### Experience Levels: Should be CONSTANT ⚠️
```javascript
// Currently in data/experience-levels.js
// Should move to constants/progression.js

const PROGRESSION = {
  experienceLevels: [
    { level: 0, experience: 0 },
    { level: 1, experience: 2500 },
    { level: 2, experience: 5000 },
    // ...
  ]
};
```
**Why?** Pure mechanical progression curve, no content

---

## Summary Table

| Aspect | Constants | Data |
|--------|-----------|------|
| **Purpose** | Game mechanics | Game content |
| **Structure** | Flat lookups | Rich entities |
| **Metadata** | None | Names, descriptions |
| **Change Freq** | Rarely | Often |
| **Owner** | Engineers | Designers |
| **Examples** | Formulas, rates | Templates, definitions |
| **Used By** | Services | Systems, DB |

---

## Decision Tree

```
Is it a number or formula?
├─ Yes → Is it tied to an entity?
│  ├─ Yes → DATA (part of entity template)
│  └─ No → CONSTANT (pure mechanic)
└─ No → Does it have name/description?
   ├─ Yes → DATA (rich content)
   └─ No → CONSTANT (lookup table)
```

---

## Migration Recommendations

### Move TO constants/:
1. ✅ `experience-levels.js` → `constants/progression.js`
2. Consider: `critical-tables.js` (damage values only) → `constants/critDamage.js`

### Move TO data/:
Nothing currently misplaced!

### Keep as-is:
- ✅ `constants/encumbrance.js` (perfect)
- ✅ `data/races.json` (perfect)
- ✅ `data/areas.json` (perfect)
- ✅ `data/crit_tables/*.json` (acceptable - has flavor text)

---

## When in Doubt

**Ask**: "If a game designer wanted to tweak this, would they need to understand code or just edit JSON?"

- **Just edit JSON** → `data/`
- **Needs code understanding** → `constants/`

**Golden Rule**: 
> Constants define the rules of the game.  
> Data defines the content of the game.


