# Constants vs Data - Quick Reference Card

## 🎯 The 5-Second Test

**Ask yourself**: "Is this a RULE or CONTENT?"

- **RULE** (how the game works) → `constants/`
- **CONTENT** (what exists in the game) → `data/`

---

## ⚡ Quick Decision Checklist

```
[ ] Has name/description/lore?          → DATA
[ ] Pure numbers/formula?               → CONSTANT
[ ] Game designer would edit?           → DATA
[ ] Changes per content patch?          → DATA
[ ] Same for all entities?              → CONSTANT
[ ] Calculation input?                  → CONSTANT
[ ] Entity template/definition?         → DATA
```

---

## 📊 Common Patterns

### CONSTANTS (Game Mechanics)

| Type | Example | Location |
|------|---------|----------|
| **Formulas** | `(stat - 50) / 2` | `constants/stats.js` |
| **Rates** | `160 silvers per pound` | `constants/currency.js` |
| **Thresholds** | `endRoll > 100 = hit` | `constants/combat.js` |
| **Conversion Tables** | `ASG → weight` | `constants/encumbrance.js` |
| **Progression Curves** | `level → exp needed` | `constants/progression.js` |
| **Base Timings** | `attack = 3s roundtime` | `constants/roundtime.js` |

### DATA (Game Content)

| Type | Example | Location |
|------|---------|----------|
| **Races** | Human definition | `data/races.json` |
| **Classes** | Warrior template | `data/professions.json` |
| **Items** | Broadsword stats | `data/items/weapons/` |
| **Areas** | Town definitions | `data/areas.json` |
| **NPCs** | Creature templates | `data/npcs/` |
| **Loot** | Drop tables | `data/loot-tables.js` |

---

## 🔥 Hot Takes (Edge Cases)

### Race Stat Modifiers → **DATA** ✅
```json
// data/races.json
{ "human": { "statModifiers": { "strength": 5 } } }
```
**Why?** Part of race *identity*, not pure formula

### Armor Weights by ASG → **CONSTANT** ✅
```javascript
// constants/encumbrance.js
{ armorBaseWeightByASG: { 1: 0, 2: 8 } }
```
**Why?** Pure mechanical lookup, no context

### Critical Hit Tables → **DATA** ✅
```json
// data/crit_tables/slash.json
{ "damage": 5, "message": "Minor cut..." }
```
**Why?** Includes flavor text, despite being mechanical

### Experience Levels → **CONSTANT** ⚠️
```javascript
// Should be: constants/progression.js
{ experienceLevels: [{ level: 1, exp: 2500 }] }
```
**Why?** Pure progression curve, no content

---

## 🎨 Ownership

| Layer | Owner | Changes Via |
|-------|-------|-------------|
| **constants/** | Engineers | Code review |
| **data/** | Designers | JSON editing |
| **Database** | Runtime | Gameplay |

---

## 🚫 Red Flags

### ❌ DON'T put in constants/:
- Entity templates
- Flavor text / descriptions
- Item definitions
- NPC stats

### ❌ DON'T put in data/:
- Math formulas
- Conversion rates
- Core game rules
- System thresholds

---

## ✅ Your Current Setup (Analysis)

### Correctly Placed ✅

**constants/**
- `encumbrance.js` - Perfect! Pure mechanics

**data/**
- `races.json` - Perfect! Rich entity definitions
- `areas.json` - Perfect! Area metadata
- `base-weapons.js` - Correct (item templates)
- `base-armor.js` - Correct (item templates)
- `gems.js` - Correct (gem definitions)
- `loot-tables.js` - Correct (content tables)
- `crit_tables/` - Acceptable (has flavor text)

### Consider Moving ⚠️

**data/** → **constants/**
- `experience-levels.js` → `constants/progression.js`
  - Pure progression curve
  - No descriptive content
  - Core game mechanic

---

## 💡 Examples in Practice

### Adding a New Weapon

```json
// ✅ data/items/weapons/longsword.json
{
  "name": "a longsword",
  "description": "A fine steel blade...",
  "weight": 4,
  "value": 600,
  "weaponType": "sword",
  "damageType": "slash"
}
```

### Adding Combat Formula

```javascript
// ✅ constants/combat.js
const COMBAT = {
  // Attack success formula: (AS - DS) + d100
  endRollBase: 100,
  criticalThreshold: 150,
  fumbleThreshold: -50
};
```

### Adding a New Race

```json
// ✅ data/races.json
{
  "dwarf": {
    "name": "Dwarf",
    "description": "Stout mountain folk...",
    "baseWeight": 77.67,
    "bodyFactor": 0.7767,
    "statModifiers": { "strength": 10, "constitution": 15 }
  }
}
```

---

## 🎓 Remember

> **Constants** = The physics of your game world  
> **Data** = The inhabitants of your game world

When in doubt: If a content designer needs to see it, it's **DATA**.

---

## 📞 Quick Reference Card

Keep this by your desk:

```
┌─────────────────────────────────────┐
│  CONSTANTS vs DATA                  │
├─────────────────────────────────────┤
│  Pure mechanic?     → constants/    │
│  Has description?   → data/         │
│  Part of template?  → data/         │
│  Math formula?      → constants/    │
│  Flat lookup?       → constants/    │
│  Rich entity?       → data/         │
│  Designer edits?    → data/         │
│  Code-level rule?   → constants/    │
└─────────────────────────────────────┘
```

