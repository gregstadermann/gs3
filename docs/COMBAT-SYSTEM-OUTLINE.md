# Combat System Implementation Outline

## Overview
This document outlines the implementation plan for the combat system in GS3, heavily influenced by the Gemstone3/Ranvier architecture. The implementation will be incremental, touching multiple existing systems and adding new core functionality.

---

## Reference Architecture (Gemstone3/Ranvier)

### Key Components Found
1. **Damage.js** - Core damage calculation and application system
2. **WeaponManager.js** - Weapon lookup and management
3. **WeaponType.js** - Weapon type enumeration
4. **Character.js** - Combat state management, combat initiation, damage evaluation
5. **Skill System** - Special combat abilities (lunge, smite, rend, etc.)
6. **Effect System** - Temporary modifiers, buffs/debuffs
7. **Combat State** - `combatants` Set, `combatData`, lag management

### Core Concepts
- Damage is evaluated before being applied (effects modify both incoming and outgoing)
- Combat uses a `Set` of combatants with bidirectional references
- Lag system controls combat timing
- Skills can initiate combat and have cooldowns
- Effects provide damage modification hooks

---

## Critical Hit Tables & Weapon Lookup Tables

### MongoDB Collections for Combat Data

The Gemstone3 system uses lookup tables for weapon results and critical hit results based on roll ranges. These need to be imported into MongoDB.

#### 1. Critical Hit Tables Collection (`crits`)

**Purpose**: Define critical hit messages and damage multipliers based on roll values

**Schema**:
```javascript
{
  RollRangeStart: Number,  // Lower bound of roll value
  RollRangeEnd: Number,    // Upper bound of roll value
  severity: String,        // 'minor', 'major', 'devastating'
  multiplier: Number,      // Damage multiplier (1.5, 2.0, 3.0)
  message: String          // Description text for the crit
}
```

**Example Documents**:
```javascript
// Minor Crit
{
  RollRangeStart: 100,
  RollRangeEnd: 130,
  severity: 'minor',
  multiplier: 1.5,
  message: "You strike a glancing blow!"
}

// Major Crit  
{
  RollRangeStart: 131,
  RollRangeEnd: 160,
  severity: 'major',
  multiplier: 2.0,
  message: "You land a solid critical hit!"
}

// Devastating Crit
{
  RollRangeStart: 161,
  RollRangeEnd: 200,
  severity: 'devastating',
  multiplier: 3.0,
  message: "You deliver a DEVASTATING CRITICAL BLOW!"
}
```

**Usage**: When a critical hit occurs, the system looks up the crit table based on the roll value to determine severity, multiplier, and message.

---

#### 2. Weapon Result Tables Collection (`weapons`)

**Purpose**: Define weapon attack result messages and flavor text based on roll ranges

**Schema**:
```javascript
{
  weaponType: String,      // 'one_handed_edged', 'two_handed', etc.
  RollRangeStart: Number,   // Lower bound of roll value  
  RollRangeEnd: Number,    // Upper bound of roll value
  result: String,          // "You strike true!", "Your attack glances off!", etc.
  damageBonus: Number      // Optional damage bonus for this roll range
}
```

**Example Documents**:
```javascript
// One-Handed Edged Weapon Results
{
  weaponType: 'one_handed_edged',
  RollRangeStart: 50,
  RollRangeEnd: 70,
  result: "Your blade slices cleanly through!"
}

{
  weaponType: 'one_handed_edged',
  RollRangeStart: 71,
  RollRangeEnd: 90,
  result: "Your weapon finds a weak spot in your opponent's defenses!"
}

{
  weaponType: 'one_handed_edged',
  RollRangeStart: 91,
  RollRangeEnd: 110,
  result: "You deliver a precise, deadly strike!"
}

// Miss/Mishap Results
{
  weaponType: 'one_handed_edged',
  RollRangeStart: 1,
  RollRangeEnd: 30,
  result: "Your swing goes wide, missing completely."
}

// Two-Handed Weapon Results
{
  weaponType: 'two_handed',
  RollRangeStart: 50,
  RollRangeEnd: 70,
  result: "Your powerful swing connects with crushing force!"
}

// Unarmed/Brawling Results
{
  weaponType: 'brawling',
  RollRangeStart: 50,
  RollRangeEnd: 70,
  result: "Your fist connects with a solid thud!"
}
```

**Usage**: After calculating a weapon roll, the system looks up the appropriate result message from the `weapons` collection matching the weapon type and roll range.

---

#### 3. Importing Lookup Tables

**Script**: `src/scripts/import-combat-tables.js`

```javascript
const mongoose = require('mongoose');
const critTables = require('../data/crit-tables.json');
const weaponTables = require('../data/weapon-tables.json');

async function importCombatTables() {
  // Import crit tables
  for (const crit of critTables) {
    await db.collection('crits').insertOne(crit);
  }
  
  // Import weapon tables
  for (const weapon of weaponTables) {
    await db.collection('weapons').insertOne(weapon);
  }
}
```

**Data Files Needed**:
- `src/data/crit-tables.json` - Critical hit definitions
- `src/data/weapon-tables.json` - Weapon result definitions

---

## Implementation Phases

### Phase 1: Core Combat Infrastructure

#### 1.1 Combat State Management (`src/systems/CombatSystem.js`)
**Purpose**: Manage combat state, combatants, and combat lifecycle

**Key Features**:
- Track active combatants per character
- Combat initiation and termination
- Combat round management
- **Roundtime/lag system** - prevent actions until lag expires
- Command queue management during roundtime

**Methods Needed**:
```javascript
class CombatSystem {
  initiateCombat(attacker, target, lag = 0)
  isInCombat(character, target)
  addCombatant(attacker, target)
  removeCombatant(attacker, target)
  removeFromCombat(character)
  getCombatants(character)
  updateCombat(character, deltaTime)
  
  // Roundtime/Lag methods
  addLag(character, amount)           // Add roundtime in seconds
  getLag(character)                   // Get remaining lag
  canAct(character)                   // Check if lag has expired
  tickLag(character, deltaTime)       // Decrement lag each tick
}
```

**Roundtime/Lag System**:
- Each character has a `combatData` object with `lag` (milliseconds) and `roundStarted` (timestamp)
- Actions have associated roundtime (RT) costs
- Character cannot act until `lag <= 0`
- Lag decrements each game tick
- Default RT varies by action type (basic attack = 2.5s, skills = skill-specific)

**Database Requirements**:
- Store combat state in memory (temporary)
- No persistent storage needed for combat state

**Integration Points**:
- `GameEngine.js` - Combat tick integration
- `PlayerSystemMongoDB.js` - Add combat state to player objects
- `NPCSystem.js` - NPC combat behavior

---

#### 1.2 Damage Calculation System (`src/systems/DamageSystem.js`)
**Purpose**: Calculate and apply damage based on stats, weapons, armor, and effects

**Key Features**:
- Base damage calculation from weapons
- Stat modifiers (strength, dexterity, agility)
- Skill rank modifiers
- Armor/resistance calculations
- Critical hit system
- Damage type variations (physical, magical, elemental)

**Methods Needed**:
```javascript
class DamageSystem {
  calculateWeaponDamage(attacker, weapon, target)
  calculateSkillDamage(attacker, skill, target)
  applyDamage(attacker, target, damageAmount, damageType)
  evaluateIncomingDamage(damage, target, amount)
  evaluateOutgoingDamage(damage, attacker, amount, target)
  calculateCritical(attacker, target, baseDamage)
}
```

**Damage Formula (Reference from Character.js)**:
```javascript
// Base: weapon damage
// Modifiers: 
//   - Attacker stats (STR, DEX, AGI, weapon skill ranks)
//   - Weapon quality/bonus
//   - Target defenses (CON, armor, effects)
//   - Critical hit chance (AGI, WIS, LOG)
```

**Integration Points**:
- Weapon/Item system (damage bonuses)
- Skill ranks (accuracy and damage modifiers)
- Armor/Equipment system (defensive calculations)
- Effect system (damage buffs/debuffs)

---

#### 1.3 Combat Commands (`src/commands/attack.js`, `src/commands/cast.js`)
**Purpose**: Player commands that can initiate and continue combat

**Primary Combat Command**: `attack.js`
- `attack <target>` - Primary command to initiate combat with a target
- `kill <target>` - Acceptable alias for attack (Gemstone3 compatibility)
- `attack` (no target) - Continue attacking current target
- `kill` (no target) - Continue attacking current target (alias)
- Combat messaging (who attacks whom)
- Target lookup (player/NPC)
- **Roundtime enforcement** - Block if player has lag remaining
- Add 2.5 seconds roundtime after each attack

**Combat-Initiating Commands**:
- `attack <target>` or `kill <target>` - Physical weapon attack
- `cast <spell> at <target>` - Spell-casting that harms target
- `skill <skill> on <target>` - Combat skill usage
- Any command with `initiatesCombat: true` flag

**NPC Initiated Combat**:
- Aggressive NPCs (`aggressive: true` in definition) auto-attack players
- NPCs check every game tick for players in the same room
- NPC uses hardcoded `roundtime` value (not calculated like players)
- No manual command needed - NPC initiates automatically

**Roundtime Behavior**:
- Check if player `canAct()` before allowing attack
- If lag exists, respond: "You're still recovering from your last action."
- After successful attack, add skill/spell-specific roundtime to player's lag
- Multiple attacks queue up if done during lag (player can spam attack)
- First attack in combat has 5 second delay

**Integration Points**:
- `CombatSystem.js` - Combat initiation, lag checking
- `CommandManager.js` - Command registration, KILL alias registration
- Room system - Finding targets in same room
- NPC system - NPC reactions
- Spell system - CAST can trigger combat
- Skill system - Skill usage can trigger combat

**Command Manager Alias Setup**:
```javascript
// In CommandManager or attack.js
commandManager.registerAlias('attack', 'kill');  // 'kill' alias for 'attack'
```

---

### Phase 2: Weapon & Equipment System

#### 2.1 Equipment Manager (`src/systems/EquipmentSystem.js`)
**Purpose**: Manage weapon and armor equipping/unequipping

**Key Features**:
- Equipment slots (wield, held, wear locations)
- Weapon types (edged, blunt, two-handed, etc.)
- Equipment bonuses to stats and combat
- Weapon quality and condition
- Multiple wield support

**Methods Needed**:
```javascript
class EquipmentSystem {
  equip(player, item, slot)
  unequip(player, slot)
  getEquippedWeapon(player)
  getEquippedArmor(player)
  calculateWeaponBonus(player)
  calculateArmorBonus(player)
}
```

**Integration Points**:
- Player inventory system (move item in/out of inventory)
- Damage calculations (weapon bonuses)
- Defense calculations (armor bonuses)
- Room descriptions (worn equipment)

---

#### 2.2 Weapon System (`src/systems/WeaponSystem.js`)
**Purpose**: Define weapon properties, lookup, and damage calculation using MongoDB weapon tables

**Key Features**:
- Weapon types (from WeaponType.js reference)
- Weapon quality tiers
- Weapon condition/degradation
- Weapon-specific damage formulas
- **Weapon result lookup from MongoDB** `weapons` collection

**Weapon Types**:
- Brawling (unarmed)
- One-handed edged
- One-handed blunt
- Two-handed
- Polearm
- Ranged
- Thrown

**Methods Needed**:
```javascript
class WeaponSystem {
  constructor(db) {
    this.db = db;
    this.weaponsCollection = db.collection('weapons');
  }
  
  getWeaponType(weapon)
  calculateBaseDamage(weapon, attacker)
  getWeaponBonus(weapon)
  async lookupWeaponResult(roll, weaponType)  // NEW - looks up weapon result from MongoDB
}
```

**MongoDB Integration**:
```javascript
async lookupWeaponResult(roll, weaponType) {
  const weaponResult = await this.weaponsCollection.findOne({
    weaponType: weaponType,
    RollRangeStart: { $lte: roll },
    RollRangeEnd: { $gte: roll }
  });
  return weaponResult;
}
```

**Integration Points**:
- Item system (weapon properties)
- Equipment system (wielded weapons)
- Damage system (base damage calculation)
- MongoDB `weapons` collection (lookup result messages by roll range)
- Combat messaging (display weapon-specific attack messages)

---

### Phase 3: Skill-Based Abilities

#### 3.1 Combat Skills Framework (`src/systems/SkillSystem.js`)
**Purpose**: Special combat abilities beyond basic attacks

**Key Features**:
- Skill definitions (cooldowns, resource costs)
- Skill execution (combat actions)
- Skill activation requirements
- Skill messaging

**Combat Skills to Implement**:
- **Lunge** - Warrior basic attack (250% weapon damage, energy cost, RT: 2.5s + cooldown)
- **Smite** - Paladin holy attack (350% weapon damage, favor cost, RT: 2.5s + cooldown)
- **Rend** - Bleed attack (damage over time, RT: 3s + cooldown)
- **Shield Block** - Defensive ability (RT: varies)
- **Judge** - High-cost, high-damage attack (RT: 5s + cooldown)
- **Lightning** - Mage electric attack (RT: 3s + cooldown)

**Skills Structure**:
```javascript
{
  name: 'Lunge',
  requiresTarget: true,
  initiatesCombat: true,
  resource: { attribute: 'energy', cost: 20 },
  cooldown: 6,                    // Skill-specific cooldown
  roundtime: 2.5,                   // Base roundtime in seconds (2.5s standard)
  damagePercent: 250,
  type: 'physical'
}
```

**Roundtime + Cooldown**:
- Skills add roundtime (typically 2.5s for attack skills)
- Skills also have cooldowns (defined in cooldown property, typically 6-10 seconds)
- Both must expire before skill can be used again
- `canAct()` checks roundtime, `canUseSkill()` checks cooldown

**Methods Needed**:
```javascript
class SkillSystem {
  canUseSkill(player, skill)
  useSkill(player, skill, target)
  checkCooldown(player, skill)
  checkResources(player, skill)
  executeSkill(player, skill, target)
}
```

**Integration Points**:
- Player skills (already existing in CharacterCreation.js)
- Damage system (skill damage calculations)
- Resource system (energy, mana, favor)
- Combat system (skill can initiate combat)

---

#### 3.2 Resource Management (`src/systems/ResourceSystem.js`)
**Purpose**: Manage combat resources (energy, mana, favor)

**Key Features**:
- Energy regeneration (passive)
- Mana/spell power management
- Favor (for paladin abilities)
- Resource costs for abilities
- Regen rate calculations based on stats

**Resources**:
- **Energy** - Physical combat ability resource
- **Mana** - Spell-casting resource
- **Favor** - Paladin/holy resource (if implemented)
- **Health** - Already exists, used in combat

**Methods Needed**:
```javascript
class ResourceSystem {
  consumeResource(player, resource, amount)
  checkResource(player, resource, amount)
  regenResources(player, deltaTime)
  getResourceRate(player, resource)
}
```

**Integration Points**:
- Character stats (affect regen rates)
- Skill system (resource costs)
- Combat system (regen during combat pauses)
- Effect system (modify regen rates)

---

### Phase 4: Advanced Combat Features

#### 4.1 Effect System (`src/systems/EffectSystem.js`)
**Purpose**: Temporary modifiers affecting combat

**Key Features**:
- Buffs (strength boost, damage bonus)
- Debuffs (weakness, damage vulnerability)
- Damage over time (poison, bleed)
- Status conditions (stunned, slowed)
- Effect stacking and priority

**Effect Types** (Combat-Relevant):
- Damage modifiers (outgoing/incoming)
- Stat bonuses (temporary STR, DEX boosts)
- Defense modifiers (damage reduction)
- Speed modifiers (attack speed, regen rate)
- Status effects (stun, blind, silence)

#### 4.1.1 Status Effect Systems (From Critical Hits)
**Purpose**: Handle status effects resulting from critical hit rolls

**Critical Hit Status Effects** (from MongoDB `crits` collection):
- **A** - Amputation (limb loss)
  - Disables use of affected limb (weapon arm, shield arm, leg)
  - Reduces combat effectiveness
  - Requires healing/cure effects to restore functionality
  - Affected limbs: RIGHT_ARM, LEFT_ARM, RIGHT_HAND, LEFT_HAND, RIGHT_LEG, LEFT_LEG

- **F** - Fatal critical
  - Instant death when damage brings target to 0 HP or below
  - Triggers death handling in combat system
  - May be prevented by defensive effects or high CON
  - Higher ranks (8-9) are typically fatal

- **K** - Knockdown
  - Character falls prone
  - Affected by modifiers (AGI, balance skill)
  - Player must use `stand` command to recover
  - Penalties to defense while prone
  - Duration: Instant effect requiring recovery action

- **R** - Injury level (rank 1, 2, or 3)
  - R1, R2, R3 represent increasing wound severity
  - Affects health regeneration
  - May cause bleeding/health loss over time
  - Requires healing to reduce injury level
  - Tracked per body part

- **S** - Stun with number of rounds (S1, S2, S3, etc.)
  - Player cannot act for X rounds of combat
  - Rounds count down with each combat tick
  - Stunned players skip their turn
  - Higher stun durations require more recovery time
  - May be reduced by CON or special abilities

**Methods Needed**:
```javascript
class EffectSystem {
  // Core effect management
  addEffect(player, effect)
  removeEffect(player, effect)
  evaluateIncomingDamage(damage, player, amount)
  evaluateOutgoingDamage(damage, player, amount, target)
  evaluateAttribute(attribute, player, baseValue)
  tickEffects(player, deltaTime)
  
  // Status effect handlers (from criticals)
  applyStun(player, rounds)  // S1, S2, S3, etc. - prevent actions for N rounds
  applyKnockdown(player)     // K - knock player prone, require stand command
  applyAmputation(player, limb)  // A - disable limb (weapon arm, leg, etc.)
  applyInjury(player, bodyPart, level)  // R1, R2, R3 - wounds on body part
  checkFatal(damage, target)  // F - determine if crit is fatal
  reduceStun(player, amount) // Reduce stun duration by amount
  processStatusEffects(player, deltaTime)  // Process all status effects each tick
  hasStatusEffect(player, effectType)  // Check if player has specific status
  canAct(player)  // Check if player can act (not stunned, can use arms, etc.)
}
```

**Integration Points**:
- Damage system (effect hooks)
- Stats system (temporary modifiers)
- Skills (buff/debuff abilities)
- Combat system (periodic effect ticking)

---

#### 4.2 Critical Hit System (`src/systems/CriticalSystem.js`)
**Purpose**: Critical hit chance and severity calculation using MongoDB crit tables

**Key Features**:
- Critical chance based on stats (AGI, WIS, LOG)
- Critical severity lookup from `crits` MongoDB collection
- Critical hit types (normal, major, devastating)
- Critical messaging from database

**Critical Tiers** (defined in MongoDB):
- Minor: 1.5x damage (RollRangeStart-RollRangeEnd: 100-130)
- Major: 2.0x damage (RollRangeStart-RollRangeEnd: 131-160)
- Devastating: 3.0x damage (RollRangeStart-RollRangeEnd: 161-200)

**Methods Needed**:
```javascript
class CriticalSystem {
  constructor(db) {
    this.db = db;
    this.critsCollection = db.collection('crits');
  }
  
  async calculateCritChance(attacker, target)
  async rollCritical(attacker, target)
  async lookupCriticalResult(critRoll)  // NEW - looks up crit from MongoDB
  async getCriticalSeverity(critRoll, attacker)
  applyCritical(damage, severity)
}
```

**MongoDB Integration**:
```javascript
async lookupCriticalResult(critRoll) {
  const critResult = await this.critsCollection.findOne({
    RollRangeStart: { $lte: critRoll },
    RollRangeEnd: { $gte: critRoll }
  });
  return critResult;
}
```

**Integration Points**:
- Damage system (multiply damage using crit result)
- MongoDB `crits` collection (lookup crit results by roll range)
- Stats (affect crit chance)
- Combat messaging (display crit message from database)

---

#### 4.3 Defense System (`src/systems/DefenseSystem.js`)
**Purpose**: Armor, shields, and defensive calculations

**Key Features**:
- Armor damage reduction
- Shield blocking (chance and mitigation)
- Evasion (AGI-based dodge)
- Damage type defenses (slashing, piercing, crushing, magical)

**Methods Needed**:
```javascript
class DefenseSystem {
  calculateArmorMitigation(target)
  calculateShieldBlock(target, incomingDamage)
  calculateEvasionChance(target)
  applyDefense(damage, target)
}
```

**Integration Points**:
- Damage system (apply reductions)
- Equipment system (armor values)
- Stats (CON for tankiness, AGI for dodge)

---

### Phase 5: NPC Combat Behavior

#### 5.1 NPC AI for Combat (`src/systems/NPCCombatBehavior.js`)
**Purpose**: NPC combat decision-making with aggressive behavior

**Key Features**:
- **Aggressive NPCs** - Attack players without being provoked
- Attack decision logic (when to attack)
- Target selection (player vs. threat assessment)
- Retreat logic (flee when low health)
- Combat skill usage (NPCs can use skills)
- **Hardcoded roundtime** - NPCs use fixed RT values, not calculated

**NPC Definition Additions**:
```yaml
# In NPC YAML definition
- id: "giant-rat"
  name: "a giant rat"
  aggressive: true        # Triggers combat with players in same room
  roundtime: 2500        # Hardcoded RT in milliseconds (2.5 seconds)
  attackChance: 0.8      # Probability of attacking each round
  skills:                # Optional: skills NPC can use
    - lunge
    - rend
```

**Methods Needed**:
```javascript
class NPCCombatBehavior {
  isAggressive(npc)                    // Check if NPC has aggressive flag
  shouldAttack(npc, target)           // Check attack conditions
  selectTarget(npc)                    // Choose target in room
  decideAction(npc)                    // Choose action (attack, skill, etc.)
  useCombatSkill(npc, target)          // Use NPC skills
  shouldRetreat(npc)                    // Check retreat conditions
  getNPCRoundtime(npc)                 // Return hardcoded RT
}
```

**Aggressive NPC Behavior Flow**:
1. **Combat Initiation**:
   - Every game tick, check NPCs with `aggressive: true` flag
   - If NPC not in combat and has no combatants, find players in same room
   - Select a random player target (or closest/first available)
   - Initiate combat: `npc.initiateCombat(player, 0)` - no initial delay
   - Set NPC lag to their hardcoded roundtime value

2. **Combat Actions**:
   - When `npc.combatData.lag === 0` (timer expired), NPC acts
   - Perform attack on current combatant target
   - Apply damage using NPC's damage values
   - Set NPC lag back to hardcoded roundtime value
   - Repeat until target dead or NPC killed

3. **Aggressive Flag Behavior**:
   - `aggressive: true` - NPC will attack players without provocation
   - `aggressive: false` - NPC only attacks if attacked first (defensive)
   - `attackChance: 0.8` - Optional probability (80% chance to attack when conditions met)

4. **Roundtime Implementation**:
   - NPC roundtime is hardcoded in NPC definition (no calculation)
   - Fast NPC: `roundtime: 2000` (2 seconds)
   - Normal NPC: `roundtime: 2500` (2.5 seconds)
   - Slow NPC: `roundtime: 3000` (3 seconds)
   - No weapon/stats needed - uses fixed value

**Integration Points**:
- NPC system (combat behavior triggers, aggressive flag checking)
- Room system (targets available, NPC location checks)
- Combat system (NPC enters combat, RT management)
- Stats system (NPC vs player power assessment)
- GameEngine tick (trigger aggressive NPC checks)

---

### Phase 6: Combat UI & Messaging

#### 6.1 Combat Messaging (`src/systems/CombatMessaging.js`)
**Purpose**: Rich, descriptive combat messages

**Features**:
- Attack messages ("You swing your sword at the goblin!")
- Hit messages ("Your attack lands a critical blow!")
- Miss messages ("Your attack misses completely.")
- Skill messages (ability-specific flavor)
- Room-wide combat announcements
- Personal combat updates

**Message Templates**:
```javascript
{
  attack: "You attack {target} with your {weapon}.",
  hit: "You strike {target} for {damage} points of damage!",
  critical: "You CRITICALLY strike {target} for {damage} points!",
  miss: "Your attack misses {target}.",
  skill_use: "You perform {skill} on {target}.",
  target_dead: "{target} collapses and dies."
}
```

**Integration Points**:
- Combat system (message triggers)
- Broadcast system (room announcements)
- Player connections (send messages)

---

#### 6.2 Combat Status (`src/commands/combat.js`)
**Purpose**: Player commands to check combat state

**Features**:
- `combat` or `combat info` - Show current combat status
- List combatants
- Show health of targets
- Show own combat stats

**Integration Points**:
- Combat system (state queries)
- Player system (status display)

---

### Phase 7: Database Schema Updates

#### 7.1 Combat Data in Player Documents
**No persistent combat storage** - Combat is ephemeral, managed in-memory

**Player Document Updates**:
- `combatants` (ephemeral, not saved) - Active combat targets
- `combatData` (ephemeral, not saved) - Round timing, lag  
  - `combatData.lag` - Current roundtime in milliseconds
  - `combatData.roundStarted` - Timestamp when round started
- Equipment already exists
- Skills already exist
- Stats already exist

**Roundtime Implementation**:
- Each combat action has an associated roundtime (RT) cost
- **Basic attacks** (`attack`/`kill`): 2.5 seconds (2500ms)
- **Spells** (`cast`): Varies by spell (typically 3-5 seconds)
- **Skills** (`skill`): Varies by skill (from `roundtime` property or skill-specific RT)
  - Attack skills: 2.5s standard
  - Powerful skills: 3-5s
  - Defensive skills: Varies
- While `lag > 0`, character cannot perform combat actions
- Non-combat actions (say, emote, look) still allowed during lag
- Lag decrements on every game tick (1000ms = subtract 1000 from lag)
- First action in combat has initial lag delay (5000ms in Gemstone3)

**Action-Specific Roundtime**:
```javascript
// Different commands add different roundtime
attack: 2500ms    // Standard weapon attack
cast fireball: 4000ms   // Spell casting
skill lunge: 2500ms      // Combat skill
skill rend: 3000ms       // Combat skill (longer)
skill judge: 5000ms      // Powerful skill
```

**NPC Document Updates**:
- `aggressive` (boolean) - If true, NPC attacks players without provocation
- `roundtime` (number) - Hardcoded roundtime in milliseconds (e.g., 2500 = 2.5s)
- `attackChance` (number, 0-1) - Probability of attacking each round (optional)
- `skills` (array) - List of combat skills NPC can use (optional)
- `combatData` (ephemeral, not saved) - Combat state, roundtime lag
- Health, stats, etc. already exist

**Example Aggressive NPC**:
```yaml
- id: "giant-rat"
  name: "a giant rat"
  aggressive: true
  roundtime: 2500
  attackChance: 0.8
  health: 50
  level: 1
  skills: []
```

**New MongoDB Collections Required**:

1. **`crits` collection** - Critical hit lookup tables
   - Defines crit severity, multipliers, and messages by roll range
   - Indexed by `RollRangeStart` and `RollRangeEnd`
   
2. **`weapons` collection** - Weapon result lookup tables  
   - Defines weapon-specific attack result messages by roll range
   - Indexed by `weaponType`, `RollRangeStart`, and `RollRangeEnd`
   
3. **Import Script**: `src/scripts/import-combat-tables.js`
   - Loads crit and weapon tables into MongoDB from JSON files
   - Should be run during initial setup

---

#### 7.2 Item Enhancements for Combat
**Item Document Updates**:
```javascript
{
  // ... existing item fields ...
  weaponType: 'one_handed_edged',  // or null if not a weapon
  baseWeapon: 'weapon_broadsword',  // Base weapon class for damage factors
  damage: { min: 10, max: 25 },
  speed: 2.5,                       // Attack speed modifier
  quality: 'masterwork',
  condition: 100,
  bonuses: {
    damageBonus: 5,
    accuracyBonus: 3
  }
}
```

**Damage vs Armor Types**:
- Different weapon types (edged, blunt, two-handed, etc.) have different effectiveness against armor types
- Edged weapons (swords) are less effective vs heavy plate armor
- Blunt weapons (maces) are effective vs plate armor
- Different `baseWeapon` classes have damage modifiers vs different armor types
- Example: `weapon_broadsword` (edged) has penalties vs heavy plate, bonuses vs leather
- Example: `weapon_mace` (blunt) has bonuses vs heavy armor, penalties vs cloth

**Armor Properties**:
```javascript
{
  // ... existing item fields ...
  armorType: 'leather',
  defenseBonus: 15,
  mitigation: 0.10, // 10% damage reduction
  quality: 'fine',
  condition: 100
}
```

---

## Implementation Order (Recommended)

### Pre-Implementation: MongoDB Setup
0. **Import Combat Tables** - Run import script to populate MongoDB collections
   - Create `src/data/crit-tables.json` with crit definitions
   - Create `src/data/weapon-tables.json` with weapon results  
   - Run `src/scripts/import-combat-tables.js` to import into MongoDB
   - Verify collections exist: `db.crits.find()` and `db.weapons.find()`

### Week 1-2: Core Infrastructure
1. Implement `CombatSystem.js` (Phase 1.1)
2. Implement `DamageSystem.js` (Phase 1.2)
3. Implement `attack.js` command with `kill` alias (Phase 1.3)
   - `attack <target>` and `kill <target>` both work
   - Continue attacking same target on repeat
4. Basic combat testing (hit, damage, death, roundtime)

### Week 3-4: Equipment & Weapons
5. Implement `EquipmentSystem.js` (Phase 2.1)
6. Implement `WeaponSystem.js` (Phase 2.2)
7. Update items with combat properties
8. **Import test broadsword** - `src/data/test-broadsword.yaml` for combat testing
   - Contains a standard broadsword with `weapon_type: one_handed_edged`
   - Base weapon class: `weapon_broadsword` 
   - Damage: 8-16 (minDamage/maxDamage)
   - Speed: 2.5
9. Test weapon damage variations

### Week 5-6: Skills & Resources
9. Implement `SkillSystem.js` (Phase 3.1)
10. Implement `ResourceSystem.js` (Phase 3.2)
11. Add 2-3 combat skills (Lunge, Smite)
12. Test skill usage and resource management
13. Note: Skills can initiate combat via `initiatesCombat: true` flag

### Week 7-8: Advanced Features
13. Implement `EffectSystem.js` (Phase 4.1)
14. Implement `CriticalSystem.js` (Phase 4.2)
15. Implement `DefenseSystem.js` (Phase 4.3)
16. Test advanced combat mechanics

### Week 9-10: NPC Behavior & Polish
17. Implement `NPCCombatBehavior.js` (Phase 5)
   - Aggressive NPCs attack players in same room
   - Hardcoded NPC roundtime system
   - NPC combat actions when lag expires
18. Implement `CombatMessaging.js` (Phase 6.1)
19. Implement `combat` command (Phase 6.2)
20. Test aggressive NPCs with players
21. Polish, balance, and testing

---

## Key Files to Create/Modify

### New Files to Create
```
src/systems/
  - CombatSystem.js              (NEW)
  - DamageSystem.js               (NEW)
  - EquipmentSystem.js            (NEW)
  - WeaponSystem.js               (NEW)
  - SkillSystem.js                (NEW)
  - ResourceSystem.js             (NEW)
  - EffectSystem.js               (NEW)
  - CriticalSystem.js             (NEW)
  - DefenseSystem.js              (NEW)
  - NPCCombatBehavior.js          (NEW)
  - CombatMessaging.js            (NEW)

src/commands/
  - attack.js                     (NEW - primary ATTACK command)
  - combat.js                     (NEW - COMBAT status command)

src/scripts/
  - import-combat-tables.js       (NEW - imports crit and weapon tables)

src/data/
  - crit-tables.json              (NEW - crit lookup data)
  - weapon-tables.json            (NEW - weapon result data)
  - test-broadsword.yaml          (NEW - test weapon for combat testing)
```

### Files to Modify
```
src/core/
  - GameEngine.js                 (MODIFY - add combat system, combat tick, roundtime tick)
  
src/systems/
  - PlayerSystemMongoDB.js         (MODIFY - add combat state, equipment methods)
  - NPCSystem.js                   (MODIFY - add combat AI, reactions)
  
Existing commands/
  - skills.js                      (MODIFY - add combat skill viewing)
  - info.js                        (MODIFY - show combat stats)
```

---

## Game Engine Integration

### Roundtime Tick System (`src/core/GameEngine.js`)

**What needs to be added**:
- In the main game loop, after each tick (1 second), update roundtime for all players AND NPCs in combat
- Decrement each player's `combatData.lag` by 1000ms (1 second)
- Decrement each NPC's `combatData.lag` by 1000ms (1 second) using hardcoded RT values
- When lag reaches 0, player/NPC can act again
- **Aggressive NPC checking**: Check if aggressive NPCs should attack players in same room

**Implementation**:
```javascript
// In GameEngine.tick() method
if (this.isRunning) {
  this.tickCount++;
  
  // Process roundtime for combatants (players)
  for (const [name, player] of this.players) {
    if (player.combatData && player.combatData.lag > 0) {
      player.combatData.lag = Math.max(0, player.combatData.lag - 1000);
    }
  }
  
  // Process roundtime for combatants (NPCs)
  for (const [npcId, npc] of this.npcSystem.npcs) {
    if (npc.combatData && npc.combatData.lag > 0) {
      npc.combatData.lag = Math.max(0, npc.combatData.lag - 1000);
    }
    
    // Check aggressive NPCs (non-combat NPCs that should attack)
    if (!npc.isInCombat() && npc.aggressive && npc.room) {
      this.npcCombatBehavior.checkAggressiveAttack(npc);
    }
    
    // NPCs in combat attack when lag expires
    if (npc.isInCombat() && npc.combatData.lag === 0) {
      this.npcCombatBehavior.performCombatAction(npc);
      // Add NPC's hardcoded roundtime back
      npc.combatData.lag = npc.roundtime || 2500;
    }
  }
  
  // ... rest of game loop
}
```

**NPC Roundtime System**:
- NPCs have a `roundtime` property in their definition (hardcoded, not calculated)
- When NPC acts in combat, sets `npc.combatData.lag = npc.roundtime`
- No weapon/stats calculation needed - just uses the hardcoded value
- Different NPCs can have different RT values (fast vs slow attackers)

---

## Technical Considerations

### Performance
- Combat tick should run efficiently (avoid heavy calculations per tick)
- Cache combat state lookups
- Batch damage application
- Limit active combat instances per room

### Scalability
- Support multiple simultaneous combats in same room
- Handle large numbers of NPCs in combat
- Efficient combatant tracking (Set-based)

### Balance
- Damage formulas must be tested thoroughly
- Skill cooldowns and costs must be balanced
- Resource regeneration rates need tuning
- NPC power scaling must work

### Testing Strategy
1. Unit tests for damage calculations
2. Integration tests for combat flow
3. Load testing with many combats
4. PvP balance testing (if implemented)
5. Monster combat testing

---

## Dependencies on Existing Systems

### Already Implemented
- ✅ Player stats (STR, DEX, AGI, etc.)
- ✅ Skills system (skill ranks)
- ✅ Player/NPC systems (existence)
- ✅ Room system (location)
- ✅ Commands framework

### Need to Implement/Enhance
- ⚠️ Equipment system (basic exists, needs combat properties)
- ⚠️ Item properties (need weapon/armor data)
- ⚠️ NPC behaviors (need AI)
- ⚠️ Resource management (energy, mana)

---

## References

### Gemstone3 Files
- `/home/greg/gemstone3-core/src/Damage.js` - Damage system
- `/home/greg/gemstone3-core/src/WeaponManager.js` - Weapon management
- `/home/greg/gemstone3-core/src/WeaponType.js` - Weapon types
- `/home/greg/gemstone3-core/src/Character.js` - Combat state management
- `/home/greg/gemstone3/bundles/classes/player-events.js` - Combat hooks
- `/home/greg/gemstone3/bundles/classes/skills/lunge.js` - Skill example
- `/home/greg/gemstone3/bundles/classes/skills/smite.js` - Skill example

### GS3 Files
- `src/systems/CharacterCreation.js` - Skill definitions
- `src/systems/PlayerSystemMongoDB.js` - Player structure
- `src/core/GameEngine.js` - Engine integration point

---

## Notes

- Combat should feel **responsive** - fast rounds, clear feedback
- Damage should be **balanced** - not too high, not too low
- Skills should be **unique** - different classes have different feels
- Messaging should be **immersion** - descriptive, flavorful
- NPCs should be **intelligent** - appropriate aggression, tactics
- System should be **extensible** - easy to add new skills/effects

---

**End of Outline**

