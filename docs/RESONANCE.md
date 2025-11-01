# Resonance Forge – Core Systems Design Document
*An economic and entropy-driven fantasy MUD inspired by GemStone III & IV*

---

## 1. Foundational Design Philosophy

The world of *Resonance Forge* operates under a single universal law:
> **All things decay, and all power has a cost.**

This principle governs economy, combat, magic, and player progression alike.  
There are no infinite loops — every source is tied to a sink, every gain requires upkeep.

The design ensures that:
- **New players** can still enter the economy years later without being priced out.  
- **Veteran players** find ongoing reasons to reinvest and participate.  
- **Inflation** and **item permanence** are controlled through entropy-based systems.

---

## 2. Economic Framework

### 2.1 Core Economy Loop

| Type | Source | Sink |
|------|---------|------|
| **Coin** | Loot, quests, trade | Repairs, taxes, decay, services |
| **Items** | Crafting, discovery | Wear, decay, enchant degradation |
| **Resources** | Gathering, trade | Consumption in crafting or spellcasting |

A soft equilibrium (e.g. 90–95 % retention) allows some hoarding without breaking balance.  
Slight surplus over time provides satisfaction but still fuels the economy through maintenance.

---

### 2.2 Coin Regulation

- **All coin inflow** (loot, bounties, quests) is balanced against **repair and upkeep** outflow.  
- **No pure “money printing” events** exist; even large treasure hauls tie into decay, guild dues, or upkeep.  
- **Tax systems** on player shops and markets act as natural stabilizers.

---

### 2.3 Item Sinks and Maintenance

Each repair, enchant upkeep, and item restoration drains silver and materials, reintroducing circulation.  
Decay systems are designed to be **immersive**, not punitive — players *see* and *feel* the cost of long-term use.

---

## 3. Enchanting and Materials

### 3.1 Simplified Enchantment Model

Only **Attack Strength (AS)** bonuses are granted by enchantment or material tier.  
No additional passive effects exist unless uniquely crafted.

| Enchant Tier | AS Bonus | Example Material |
|---------------|-----------|------------------|
| +5 (1x) | +5 | Mithril |
| +10 (2x) | +10 | Steel |
| +20 (4x) | +20 | Vultite |

### 3.2 Material Behavior

Materials imply base enchant equivalence (e.g., Vultite = +20, Mithril = +5).  
Wizards may increase enchant levels through channeling and focus, up to a natural maximum (+25).  
Materials do not stack their bonus with enchant — they simply define the starting tier.

---

## 4. Encumbrance System

Encumbrance models realistic weight-to-strength interaction and integrates directly with combat.

Penalties affect:
- Movement speed  
- Initiative  
- Dodge and parry efficiency  
- Fatigue accumulation rate  

---

## 5. Player Inventory Structure

Inventory slots reflect physical placement and visibility:

1. General (Pin)
2. Back
3. Waist
4. Head
5. Shoulder (Slung Over)
6. Shoulders (Draped From)
7. Legs (Pulled Over)
8. Torso
9. Wrist
10. Finger
11. Feet (Put On)
12. Neck
13. Belt
14. Arms
15. Legs (Attached To)
16. Earlobe
17. Earlobes
18. Ankle
19. Front
20. Hands
21. Feet (Slip On)
22. Hair
23. Undershirt
24. Leggings

Items equipped or stored in these slots contribute to encumbrance weight and decay exposure.

---

## 6. Hunger, Thirst, and Fatigue

Players must manage three survival stats:
- **Hunger** — affects stamina recovery and strength.  
- **Thirst** — impacts mana regeneration and concentration.  
- **Fatigue** — reduces combat efficiency and accuracy.

Regeneration bonuses apply when all three are well-maintained, creating a steady upkeep rhythm.

---

## 7. Dormant Player System

Inactive player accounts are reintroduced as **AI-driven NPCs**, echoing their former selves.  
These NPCs:
- Retain simplified versions of their old gear and behavior.  
- Wander known regions or perform basic trades.  
- Can permanently die through normal world mechanics — removing their data and items.  

Optional “cold storage” zones preserve long-idle characters for lore or memorial purposes.

This system recycles idle data into living content and introduces organic world decay.

---

## 8. Universal Stats Overview

| Stat | Function |
|------|-----------|
| **Strength (STR)** | Carry capacity, melee power |
| **Dexterity (DEX)** | Accuracy, reflex |
| **Agility (AGI)** | Initiative, dodge |
| **Constitution (CON)** | Health pool, stamina regen |
| **Intelligence (INT)** | Mana capacity |
| **Wisdom (WIS)** | Mana regen, resistance |
| **Arcane Knowledge (ARC)** | Magic success rate |
| **Charisma (CHA)** | Trade, persuasion, social rolls |

---

## 9. Economy Balancing Philosophy

A perfectly balanced (1:1) coin source-to-sink ratio would feel too restrictive.  
A slight surplus (~20 %) is targeted — enough to allow player savings, but not wealth hoarding.  
Luxury goods, repairs, and enchant costs serve as long-term stabilizers rather than punishment.

---

## 16. Magic & Spell System Framework

### 16.1 Core Philosophy

Magic is finite and costly — a manifestation of entropy.  
Every spell leaves a mark; every enchant consumes something.

Magic should feel powerful, but never free.

---

### 16.2 Mana Economy

| Stat | Function |
|------|-----------|
| **INT** | Determines max mana |
| **WIS** | Affects mana regen |
| **ARC** | Increases efficiency |

 of Section 16*

---

## 17. Item Decay & Maintenance Systems

### 17.1 Concept

All items decay through use or time, fueling the repair economy and preventing permanence.

---

### 17.2 Durability

| Event | Avg DV Loss |
|--------|--------------|
| Attack/parry | 0.1–0.3 |
| Armor block | 0.3–1.0 |
| Elemental exposure | 1–3 |
| Shattering blow | 5–10 |

At **DV ≤ 25**, item bonuses halve.  
At **DV ≤ 0**, items break until repaired.

| Repair Type | Materials | Craft |
|--------------|------------|--------|
| Weapon | grindstone, oil | Smith |
| Armor | rivets, leather | Armorsmith |
| Magic | mana crystal | Wizard |

---

### 17.4 Material Durability

| Material | Decay Rate | Notes |
|-----------|-------------|-------|
| Iron | 1.0 | Basic |
| Steel | 0.8 | Standard |
| Mithril | 0.5 | Light, stable |
| Vultite | 0.4 | High-tier |
| Glaes | 0.3 | Arcane resonance |
| Eonake | 0.2 | Divine alloy |

---

### 17.5 Environment

Regions affect decay speed:
- Humidity: faster rust.  
- Cold: brittleness.  
- Heat: leather damage.  
- Magical fields: unpredictable effects.

---

### 17.6 Feedback

Descriptive cues warn of wear:
> “Your armor’s buckle strains under the weight.”  
> “The sword’s edge dulls slightly.”

---

### 17.7 Economic Link

Repairs consume:
- Coin  
- Crafting supplies  
- Artisan time  

Creating an infinite loop of demand and trade.

---

### 17.8 Developer Notes

- 10–20 % global silver deficit target.  
- Masterwork gear decays slower but costs more to maintain.  
- No permanent destruction unless neglected long-term.

---

*End of Section 17*

---

## 18. Combat & Damage Resolution

### 18.1 Philosophy

Combat is tactical and comprehensible, integrating physical realism with entropy mechanics.

---

### 18.2 Steps

1. **Action Declaration**  
2. **Initiative Calculation**

# Resonance Forge Design Document
*A persistent fantasy text-based world inspired by the systemic depth of GemStone III/IV.*

---

## 1. Economic Philosophy and Coin Sink System

The economy is intentionally **tightly managed** from day one. All coin sources have corresponding sinks to ensure a sustainable loop.  
No player-generated wealth exists in isolation; each faucet is mirrored by a meaningful drain.

### Principles
- **Conservation of Coin** — Every silver entering circulation has an eventual exit (repairs, taxes, crafting costs).
- **Organic Inflation Control** — By regulating item introduction and controlling maintenance requirements, inflation remains moderate and predictable.
- **Opportunity Protection** — Late-joining players still have avenues for meaningful wealth generation and advancement.

### Implementation
- **Earning:** Combat loot, quest payments, and crafting sales feed coins into circulation.
- **Sinks:** Maintenance, repair, lodging, consumables, spell components, and player taxes pull silvers out.
- **Tracking:** A 1:1 balance is monitored globally; a 10–20% surplus margin is tolerated to encourage minor hoarding.

This ensures that even a decade later, new players can engage in a functioning economy without old wealth dominance.

---

## 2. Itemization and Enchantment Framework

Items define character growth and player progression but must not outpace systemic balance.

### Enchantment
- Enchantment affects **Attack Strength (AS)** only.
- Enchantment levels mirror traditional “x” terminology (1x = +5 AS).
- Materials (mithril, vultite, etc.) infer enchant equivalence but no stacking bonuses.
- Wizards may **raise enchant levels** through a long-term enchantment process (days to weeks depending on tier).

### Goals
- Eliminate runaway power creep.
- Preserve material identity and progression.
- Keep player-driven enchantment a viable, rewarding pursuit.

---

## 3. Encumbrance and Inventory Model

The encumbrance system directly ties **item weight** to **player Strength**, creating tangible decision-making around loadouts.

### System Overview
Each character has inventory slots:

| Slot Type | Examples |
|------------|-----------|
| General (Pin) | Brooches, badges |
| Back | Cloaks, packs |
| Waist | Belts, pouches |
| Shoulder | Slung gear |
| Torso | Armor |
| Wrist | Bracers |
| Finger | Rings |
| Neck | Amulets |
| Feet | Boots |
| Hands | Gloves |
| Head | Helms |
| Undershirt | Gambeson |
| Leggings | Pants, greaves |

### Encumbrance Rules
- Each item has **weight** and **bulk** scores.
- Total encumbrance = `Σ(weight × bulk) / Strength modifier`.
- Encumbrance affects **attack speed**, **stamina recovery**, and **travel time**.
- Excess encumbrance can cause **fatigue penalties** and **movement failure**.

Encumbrance keeps equipment meaningful and ensures physical stats stay relevant.

---

## 4. Dormant Player NPC Conversion System

Inactive players become **NPC echoes** — living relics of the world’s history.

### Mechanic
- When an account is inactive for a defined period, their character transitions into an **AI-driven NPC**.
- NPCs retain name, appearance, and limited memory fragments (quotes, habits).
- Upon NPC death, they are **permanently removed** from the world.
- Exception: Cryogenic or magical “ice storage” preserves select figures for lore integration.

### Benefits
- Keeps the world feeling inhabited.
- Creates emotional continuity and emergent history.
- Prevents database bloat without lore loss.

---

## 5. Player Conditions: Hunger, Thirst, and Fatigue

Every character’s physical needs influence gameplay pacing and immersion.

### Hunger and Thirst
- Decrease gradually over playtime.
- Affect **stamina regen**, **spell focus**, and **encumbrance tolerance**.
- Easily maintained through consumables (bread, water, ale).
- Neglect results in stat penalties and exhaustion.

### Fatigue
- Increases with combat, travel, or crafting.
- Reduces combat precision and success rates.
- Can be reduced by **resting**, **sleeping**, or **consuming stamina elixirs**.
- Prevents infinite grind loops and reinforces natural pacing.

---

## 6. Universal Stat System

Every entity—player, creature, or NPC—uses a shared stat framework:

- **Strength (STR)** — Physical power, carrying capacity.
- **Dexterity (DEX)** — Accuracy, reflexes.
- **Constitution (CON)** — Endurance, resistances.
- **Intelligence (INT)** — Spellcraft, lore, identification.
- **Wisdom (WIS)** — Spirit strength, willpower.
- **Charisma (CHA)** — Social influence, merchant bonuses.
- **Luck (LCK)** — Minor impact across all rolls.

---

## 7. Item Decay and Maintenance System

Durability maintains a functioning sink for items and materials.

### Mechanics
- Each item has **Durability (0–100%)**.
- Decay occurs with **use**, **environmental exposure**, and **time**.
- Below 25% durability, item performance suffers (AS and DS penalties).
- At 0%, item breaks permanently unless repaired.

### Repairs
- Performed by **craftsmen or NPC smiths**.
- Repair costs scale with **item tier** and **enchant level**.
- Some rare materials require **specialized reagents**.
- This ensures the wealthiest players continually cycle currency into maintenance.

### Decay Curve
Decay rates vary by item type:
| Type | Typical Lifespan |
|------|------------------|
| Weapons | 2–6 months of active use |
| Armor | 4–8 months |
| Tools | 6–12 months |

---

## 8. Combat and Damage Resolution Framework

Combat blends **skill**, **equipment**, and **situational modifiers** into each outcome.

### Resolution Steps
1. **Attack Roll:**  
   `Attack Rating (AS + random[1–100]) vs Defense Rating (DS + random[1–100])`
2. **Hit Determination:**  
   Success = Attacker’s total exceeds Defender’s by threshold.
3. **Damage Calculation:**  
   Base Damage × (Weapon Tier × Strength Modifier).
4. **Criticals:**  
   Occur on natural rolls above threshold; scaling based on weapon type.

### Contributing Factors
- **Encumbrance** reduces attack speed and reaction time.
- **Fatigue** introduces penalties to both attack and defense.
- **Weapon durability** directly impacts AS.

---

## 9. World Persistence & Economy Evolution

The economic layer is **self-correcting** through decay, taxes, and repair loops.  
Coin and item inflation are controlled by limiting power-creep and enforcing periodic resets through natural degradation.

### NPC Economies
- NPC traders dynamically adjust prices based on material scarcity.
- City treasuries collect taxes from crafting and trade.
- Global silver volume tracked for balancing events and adjustments.

---

## 10. Design Ethos

Resonance Forge’s systems exist to **preserve player meaning over time.**  
No character, item, or coin is permanent—only reputation, memory, and legacy endure.

### Inspirations
- **GemStone III/IV**: For its evocative text-first immersion and player-driven economy.
- **Ultima Online**: For emergent player stories and open systems.
- **Dwarf Fortress**: For persistent consequence and world decay.

---

## 11. Next Steps

Future expansions may include:
- Full magic circle breakdown (Elemental, Spiritual, Mental, Sorcery).
- Crafting and trade specialization loops.
- Player-run towns and economies.
- Dynamic political and social reputation mechanics.

---

*Document Version: v0.9 – Consolidated Draft for Resonance Forge World System*
