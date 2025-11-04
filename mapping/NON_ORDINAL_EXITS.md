# Non-Ordinal Exits - Implementation Guide

## What Are Non-Ordinal Exits?

**Ordinal**: Standard compass directions
```
north, south, east, west, ne, nw, se, sw, up, down
```

**Non-Ordinal**: Context-specific movements
```
go gate, go door, go furrier, go house, climb ladder, enter building
```

---

## Current Implementation (Simple)

### Pattern Recognition

The parser recognizes:
```
>go <target>
```

**Examples**:
- `>go furrier` → Creates exit "furrier"
- `>go gate` → Creates exit "gate"
- `>go door` → Creates exit "door"

### Exit Creation Rules

**For Non-Ordinal Exits**:
1. ✅ **Create forward exit** (go furrier → destination)
2. ❌ **NO automatic reverse** (destination doesn't get "furrier" back)

**Why no reverse?**
- Different contexts use different return methods
- `go furrier` might return via `out`
- `go house` might return via `out`
- `go gate` might return via different gate name

---

## Example: Furrier Shop

### Movement Log
```
[Wehnimer's, North Ring Rd.]
...shop of Dakris the Furrier.
Obvious paths: north, east, west
>go furrier

[Dakris's Furs, Front Room]
...
Obvious exits: out
>out

[Wehnimer's, North Ring Rd.]
...
```

### Resulting Exits

**North Ring Rd.**:
```json
{
  "exits": [
    {"direction": "furrier", "roomId": "dakris_s_furs_front_room"}
  ]
}
```
✅ Has "furrier" exit  
❌ No "out" exit (correct!)

**Dakris's Furs, Front Room**:
```json
{
  "exits": [
    {"direction": "out", "roomId": "wehnimer_s_north_ring_rd"}
  ]
}
```
✅ Has "out" exit  
❌ No "furrier" exit (correct!)

---

## Special Case: "out"

### Out is Ordinal BUT No Reverse

"out" is in VALID_ORDINALS (so it's accepted), but:
- **No entry in REVERSE_DIRECTION**
- **No automatic reverse created**
- Must be manually linked

**Why?**
- "out" is context-dependent
- Many rooms might have "out" to same exterior
- Can't assume reverse direction

**Example**:
```
Shop --[out]--> Street
Street does NOT get automatic reverse
```

---

## Exit Types in System

### Type 1: Bidirectional Ordinals
```python
north ↔ south
east ↔ west
northeast ↔ southwest
up ↔ down
```
**Auto-creates reverse**: YES ✅

### Type 2: Non-Reversible Ordinals
```python
out → (no automatic reverse)
```
**Auto-creates reverse**: NO ❌

### Type 3: Non-Ordinal (go <target>)
```python
go furrier → (no automatic reverse)
go gate → (no automatic reverse)
go door → (no automatic reverse)
```
**Auto-creates reverse**: NO ❌

---

## How Parser Handles This

### Detection
```python
# Pattern 1: >go <target>
>go furrier  → direction = "furrier" (non-ordinal)

# Pattern 2: Standard direction
>out         → direction = "out" (ordinal, no reverse)
>north       → direction = "north" (ordinal, has reverse)
```

### Linking Logic
```python
# Always create forward link
current_room.exits.append({
    'direction': direction_used,
    'roomId': target_room
})

# Check if ordinal AND has reverse mapping
if is_valid_direction(direction_used) and direction_used in REVERSE_DIRECTION:
    # Create reverse link
    target_room.exits.append({
        'direction': REVERSE_DIRECTION[direction_used],
        'roomId': current_room
    })
else:
    # No reverse (non-ordinal or special like "out")
    pass
```

---

## Common Non-Ordinal Patterns

### Shops & Buildings
```
go furrier   → Enter Dakris's Furs
go armory    → Enter armory
go bank      → Enter bank
go inn       → Enter inn

Return: out (manually linked)
```

### Gates & Portals
```
go gate      → Pass through gate
go portal    → Enter portal
go arch      → Pass through arch

Return: Often different gate/portal name
```

### Special Movements
```
climb ladder → Go up ladder
climb tree   → Climb into tree
enter cave   → Enter cave opening

Return: down, descend, out (varies)
```

---

## Validation Status

### Currently Accepted ✅

**Ordinal with reverse**:
- north, south, east, west
- ne, nw, se, sw
- up, down

**Ordinal without reverse**:
- out

**Non-ordinal** (via `>go <target>`):
- go furrier
- go gate
- go door
- go <anything>

### Currently Rejected ❌

**Invalid typos**:
- nn, ee, ss, ww
- look, exit, quit

---

## Future Enhancements

### Phase 2: Special Exit Syntax (Planned)

Store non-ordinal exits separately:

```json
{
  "id": "north_ring_rd",
  "exits": [
    {"direction": "north", "roomId": "..."},
    {"direction": "south", "roomId": "..."}
  ],
  "special_exits": [
    {"verb": "go", "target": "furrier", "roomId": "furriers_shop"}
  ]
}
```

**Benefits**:
- Distinguishes ordinal vs non-ordinal
- Game engine can display separately
- "Obvious paths: n, s, e" vs "Obvious exits: furrier"

### Phase 3: Return Path Hints (Planned)

Manual confirmation of return paths:

```json
{
  "special_exits": [
    {
      "verb": "go",
      "target": "furrier",
      "roomId": "furriers_shop",
      "return_hint": "out"  // Suggested return direction
    }
  ]
}
```

---

## Testing

### Test Case: Furrier Shop ✅

**Input**:
```
North Ring Rd >go furrier→ Furrier Shop >out→ North Ring Rd
```

**Expected Result**:
```
North Ring Rd:
  - furrier → Furrier Shop

Furrier Shop:
  - out → North Ring Rd
```

**Actual Result**: ✅ Correct!

---

## Usage in Game

### How It Works at Runtime

**Player in North Ring Rd.**:
```
> exits
Obvious paths: north, east, west
Obvious exits: furrier

> go furrier
[You enter the furrier's shop]
[Dakris's Furs, Front Room]
```

**Player in Furrier Shop**:
```
> exits
Obvious exits: out

> out
[Wehnimer's, North Ring Rd.]
```

### Display Logic (Game Engine)

```javascript
// Separate ordinal from non-ordinal
const ordinalExits = room.exits.filter(e => 
  VALID_ORDINALS.includes(e.direction)
);
const nonOrdinalExits = room.exits.filter(e => 
  !VALID_ORDINALS.includes(e.direction)
);

// Display
if (ordinalExits.length > 0) {
  send(`Obvious paths: ${ordinalExits.map(e => e.direction).join(', ')}`);
}
if (nonOrdinalExits.length > 0) {
  send(`Obvious exits: ${nonOrdinalExits.map(e => e.direction).join(', ')}`);
}
```

---

## Summary

### Current Behavior ✅

**Ordinal directions** (n, s, e, w, ne, nw, se, sw, up, down):
- Create forward exit
- Create reverse exit automatically
- Bidirectional linking

**"out" direction**:
- Create forward exit
- NO reverse (special case)

**Non-ordinal** (go <target>):
- Create forward exit
- NO reverse (manual linking needed)

### Simple Implementation ✅

- Parse `>go <target>` commands
- Store as exit direction (e.g., "furrier", "gate")
- No automatic reverse
- Destination must have own exit back (usually "out")

**Perfect for incremental implementation!**

