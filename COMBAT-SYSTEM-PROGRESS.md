# Combat System Progress

## Recently Completed Features

### 1. Critical Hit System Integration ✅
- **DamageSystem.js**: Added `calculateCriticalDamage()` and `applyDamageWithCritical()` methods
- **Critical Hit Chance**: Based on AGI, WIS, LOG stats (10% base + stat bonus)
- **Critical Damage**: Adds bonus damage from critical hit lookup tables
- **Critical Messages**: Shows descriptive messages from MongoDB crits collection

**Files Modified:**
- `src/systems/DamageSystem.js` - Integrated CriticalSystem
- `src/commands/attack.js` - Uses new critical damage methods
- `src/systems/NPCCombatBehavior.js` - NPCs can also land critical hits

### 2. Enhanced Combat Messages ✅
- **Critical Hit Indicators**: Shows "*** CRITICAL HIT! ***" header
- **Critical Messages**: Displays descriptive damage messages (e.g., "You broke the target's nose!")
- **Damage Breakdown**: Shows bonus damage from critical hits
- **NPC Criticals**: NPCs can land critical hits with descriptive messages

### 3. Combat Status Command ✅
- **New Command**: `combat` or `fight` or `status`
- **Combat Information**: Shows current combatants and their health
- **Roundtime Display**: Shows remaining lag/roundtime
- **Combat Data**: Displays combat initiation timestamp

**File Created:**
- `src/commands/combat.js`

### 4. Weapon System ✅
- **WeaponSystem.js**: Complete weapon management system
- **Weapon Types**: Supports brawling, one_handed_edged, two_handed, etc.
- **Weapon Requirements**: Checks STR/DIS requirements for weapons
- **Damage Calculation**: Rolls weapon damage with stat bonuses
- **Speed Calculation**: Determines roundtime from weapon speed
- **Generic Results**: Provides weapon-specific attack messages

**File Created:**
- `src/systems/WeaponSystem.js`

### 5. NPC Combat Improvements ✅
- **Async Combat Actions**: NPC combat actions are now async
- **Critical Hit Support**: NPCs can land critical hits
- **Better Messages**: NPCs show critical hit indicators and messages
- **GameEngine Integration**: Properly handles async NPC combat in game loop

**Files Modified:**
- `src/core/GameEngine.js` - Added async error handling for NPC combat
- `src/systems/NPCCombatBehavior.js` - Async combat actions with critical support

---

## Critical Hit System Details

### How It Works
1. **Calculates Critical Chance**: Uses (AGI + WIS + LOG) / 3 - 50 / 200 for base crit chance
2. **Rolls for Critical**: Random 0-100 roll against crit chance
3. **Looks Up Result**: Queries MongoDB `crits` collection for damage type and rank
4. **Adds Bonus Damage**: Critical damage added to base weapon damage
5. **Shows Message**: Displays descriptive critical hit message

### Critical Hit Types Supported
- **Slash**: Edge weapons (swords, daggers, etc.)
- **Crush**: Blunt weapons (maces, clubs, etc.)
- **Puncture**: Piercing weapons (spears, daggers, etc.)
- **Fire**: Fire-based attacks
- **Lightning**: Electrical attacks
- **Impact**: Physical impact attacks
- **Grapple**: Unarmed/grappling attacks
- **Non-Corporeal**: Special attacks

### Example Critical Hit Output
```
You attack the goblin!
*** CRITICAL HIT! ***
You broke the goblin's nose!
You deal 25 bonus damage on top of your normal attack!
You strike with your broadsword for 42 points of damage.
The goblin collapses and dies!
```

---

## System Architecture

### Combat Flow
1. Player uses `attack <target>` command
2. **Roundtime Check**: Verify player can act (lag expired)
3. **Target Selection**: Find target in same room
4. **Damage Calculation**: Calculate base weapon damage
5. **Critical Check**: Roll for critical hit chance
6. **Apply Damage**: Apply damage + critical bonus
7. **Armor Mitigation**: Reduce damage by armor
8. **Update Health**: Update target's health
9. **Show Messages**: Display combat messages
10. **Add Lag**: Add 2.5s roundtime to player
11. **Combat Initiation**: Initiate combat state

### Critical System Flow
1. Calculate critical chance from stats (AGI, WIS, LOG)
2. Roll random number (0-100)
3. Check if roll exceeds crit chance + base (10%)
4. If critical: Look up result in MongoDB by damage type and rank
5. Get critical damage, message, effects
6. Apply critical damage to total
7. Display critical message and bonus damage

---

## Existing Systems Enhanced

### DamageSystem.js
**New Methods:**
- `initializeCriticalSystem()` - Lazy loads CriticalSystem
- `calculateCriticalDamage()` - Calculates critical hits
- `applyDamageWithCritical()` - Applies damage with critical support

**Features:**
- Async critical lookups
- Stat-based critical chance
- Damage type support (slash, crush, puncture, etc.)
- Returns full critical information (message, effects, wounds)

### Attack Command
**Enhancements:**
- Uses `applyDamageWithCritical()` for damage
- Shows critical hit indicators
- Displays critical messages
- Shows bonus damage from crits

### NPC Combat Behavior
**Enhancements:**
- Async combat actions
- Critical hit support for NPCs
- Better combat messaging
- Async error handling in GameEngine

### GameEngine
**Enhancements:**
- Async NPC combat action handling
- Error catching for NPC combat failures
- Non-blocking async calls

---

## Data Files Available

Critical hit data files (ready for MongoDB import):
- `src/data/slash-criticals-json.js` - Slashing damage criticals
- `src/data/crush-criticals-json.js` - Crushing damage criticals
- `src/data/puncture-criticals-json.js` - Piercing damage criticals
- `src/data/fire-criticals-json.js` - Fire damage criticals
- `src/data/lightning-criticals-json.js` - Lightning damage criticals
- `src/data/impact-criticals-json.js` - Impact damage criticals
- `src/data/grapple-criticals-json.js` - Grappling criticals
- `src/data/noncorporeal-criticals-json.js` - Special damage criticals

**Import Script:**
- `src/scripts/import-critical-tables.js` - Imports all critical tables to MongoDB

---

## Next Steps

### High Priority
1. **Import Critical Tables**: Run import script to populate MongoDB
2. **Test Combat**: Test critical hits work with all damage types
3. **Add More Critical Messages**: Expand critical message variety
4. **Balance Critical Chance**: Adjust critical hit probability

### Medium Priority
1. **Status Effects**: Implement stun, knockdown, amputation effects
2. **Wound System**: Implement injury levels (R1, R2, R3)
3. **Combat Animations**: Add more visual combat feedback
4. **Room-Wide Combat Messages**: Announce combat to others in room

### Low Priority
1. **Combat Logging**: Log combat actions for analysis
2. **Combat Statistics**: Track crit rate, damage dealt
3. **Combat Achievements**: Award achievements for combat milestones
4. **PvP Combat**: Enhanced PvP combat features

---

## Testing Checklist

- [ ] Test basic attack command
- [ ] Test critical hit appearance
- [ ] Test critical hit messages for each damage type
- [ ] Test NPC critical hits
- [ ] Test combat status command
- [ ] Test roundtime blocking
- [ ] Test multiple combatants
- [ ] Test death in combat
- [ ] Test equipment affects on damage
- [ ] Test stat requirements for weapons

---

## Notes

- Critical hit system is fully integrated but needs MongoDB import
- All damage types have critical support
- Critical messages are descriptive and flavorful
- System is async-aware and handles errors gracefully
- NPCs can land critical hits just like players
- Critical chance scales with AGI, WIS, LOG stats
- Base critical chance is 10% (can be tuned)

