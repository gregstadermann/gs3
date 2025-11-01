# Equipment System Implementation Summary

## Changes Made

### 1. Updated GET Command ✅
**File**: `src/commands/get.js`

**Changes**:
- Modified message to always show which hand picked up the item
- Changed from: `"You pick up <item>."`
- Changed to: `"You pick up <item> with your <right/left> hand."`

**Behavior**:
- Checks for free hand in order: right hand first, then left hand
- If both hands are full, shows: `"Your hands are full.\r\n"`
- Item is stored in `player.equipment.rightHand` or `player.equipment.leftHand`

### 2. Created WEAR Command ✅
**File**: `src/commands/wear.js` (NEW)

**Features**:
- Moves items from hands to appropriate equipment slots
- Determines target slot based on:
  - Item metadata (`metadata.slot` or `metadata.wearLocation`)
  - Item type (ARMOR, CLOTHING, CONTAINER)
  - Item name keywords (backpack -> back, robe -> torso, etc.)

**Slot Mapping**:
- `backpack` -> `back` slot
- `robe`/`cloak` -> `torso` slot
- `helmet`/`cap`/`hood` -> `head` slot
- `boots`/`shoes` -> `feet` slot
- `gloves`/`gauntlets` -> `hands` slot
- Default -> `general` slot

**Behavior**:
1. Searches player's hands for the item
2. Determines appropriate equipment slot
3. Checks if slot is available
4. Moves item from hand to equipment slot
5. Shows message: `"You equip <item>."`

**Example Flow**:
```
> get backpack
You pick up a heavy backpack with your right hand.

> get broadsword  
You pick up a broadsword with your left hand.

> get robe
Your hands are full.

> wear backpack
You equip a heavy backpack.
(Backpack moves from right hand to back slot)
```

### 3. Hand Management ✅

**Right Hand Priority**:
- When picking up items, right hand is used first
- Left hand is used if right hand is occupied
- Message explicitly states which hand was used

**Hand Capacity**:
- Two hands maximum
- `player.equipment.rightHand` - Primary hand
- `player.equipment.leftHand` - Secondary hand
- Both can be occupied simultaneously

**Equipment Slots**:
- Back (for backpacks, cloaks, etc.)
- Chest/Torso (for robes, tunics, etc.)
- Head (for helmets, caps, etc.)
- Feet (for boots, shoes, etc.)
- Hands (for gloves, gauntlets, etc.)
- Many more slots available via InventorySlotSystem

---

## Usage Examples

### Example 1: Basic Pickup and Wear
```
> get backpack
You pick up a heavy backpack with your right hand.

> get sword
You pick up a broadsword with your left hand.

> wear backpack
You equip a heavy backpack.
```

**Result**: 
- Right hand: (empty, backpack moved to back slot)
- Left hand: broadsword
- Back slot: heavy backpack

### Example 2: Hand Full Warning
```
> get backpack
You pick up a heavy backpack with your right hand.

> get sword
You pick up a broadsword with your left hand.

> get robe
Your hands are full.
```

### Example 3: Both Hands Occupied
```
> get backpack
You pick up a heavy backpack with your right hand.

> get sword
You pick up a broadsword with your left hand.

> get robe
Your hands are full.

> wear backpack
You equip a heavy backpack.

> get robe
You pick up a black robe with your right hand.
```

---

## Technical Details

### Equipment Object Structure
```javascript
player.equipment = {
  rightHand: { id, name, type, metadata },
  leftHand: { id, name, type, metadata },
  back: { id, name, type, metadata },
  chest: { id, name, type, metadata },
  head: { id, name, type, metadata },
  // ... other slots
};
```

### InventorySlotSystem Integration
The WEAR command uses the existing `InventorySlotSystem` to manage equipment slots:
- Tracks functional vs total slots
- Supports tucking items
- Maintains proper slot limits
- Provides messaging for each slot

### Item Metadata
Items can specify their target slot via metadata:
```javascript
{
  id: 'backpack',
  name: 'a heavy backpack',
  type: 'CONTAINER',
  metadata: {
    slot: 'back',
    wearLocation: 'back',
    location: 'back'
  }
}
```

---

## Commands

### GET Command
- **Syntax**: `get <item>`
- **Aliases**: `take`, `grab`
- **Function**: Pick up an item from the ground into a free hand

### WEAR Command
- **Syntax**: `wear <item>`
- **Aliases**: `equip`, `don`
- **Function**: Equip an item from your hands to an appropriate slot

### Other Related Commands
- `inventory` - View all equipment
- `remove` - Unequip items
- `drop` - Drop items from hands

---

## Notes

- The system enforces two-hand limit for held items
- Equipment slots have functional and total slot limits
- Items can be tucked to save functional slots
- Messages are consistent with Gemstone3 style
- Hand management is automatic (right hand first)
- WEAR command is auto-loaded by CommandManager

