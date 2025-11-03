# Direction Validation - What Gets Filtered

## Valid Ordinal Directions

### Full Names
```
north, south, east, west
northeast, southeast, northwest, southwest  
up, down, out
```

### Abbreviations (auto-normalized)
```
n  → north
s  → south
e  → east
w  → west
ne → northeast
se → southeast
nw → northwest
sw → southwest
u  → up
d  → down
```

---

## Invalid Directions (Auto-Skipped)

### Double-Key Typos ❌
```
nn, ss, ee, ww
nnn, eee, etc.
```
**Why**: Player accidentally hit key twice  
**Action**: Skipped with warning

### Commands That Aren't Movement ❌
```
look, exit, quit, glance, peer
```
**Why**: Game commands, not directions  
**Action**: Skipped with warning

### Typos ❌
```
nort, sout, esst
```
**Why**: Misspelled  
**Action**: Skipped with warning

### Non-Ordinal Exits (Future Feature) ⏳
```
go gate, go door, climb ladder, enter building
```
**Why**: Not implemented yet  
**Status**: Planned for future iteration  
**Current Action**: Skipped with warning

---

## Examples from Real Logs

### From more-wl-town-rooms.txt

**Caught and skipped**:
```
>look     ← Command, not movement ❌
>ee       ← Double-key typo ❌
>nn       ← Double-key typo ❌
>exit     ← Command, not movement ❌
```

**Accepted**:
```
>n        ← Valid (north) ✅
>s        ← Valid (south) ✅
>ne       ← Valid (northeast) ✅
>southwest ← Valid ✅
```

---

## Validation Logic

```python
def is_valid_direction(direction: str) -> bool:
    # Normalize abbreviations (n → north)
    normalized = DIRECTION_ABBREV.get(direction, direction)
    
    # Check against valid ordinals
    return normalized in VALID_ORDINALS

# Valid ordinals (SSOT)
VALID_ORDINALS = {
    'north', 'south', 'east', 'west',
    'northeast', 'southeast', 'northwest', 'southwest',
    'up', 'down', 'out'
}
```

**Result**:
- `n` → normalized to `north` → **Valid** ✅
- `nn` → no abbreviation match → stays `nn` → not in VALID_ORDINALS → **Invalid** ❌
- `look` → stays `look` → not in VALID_ORDINALS → **Invalid** ❌

---

## Future: Non-Ordinal Exits

### Planned Implementation

**Phase 2 will handle**:
```
go gate      → Special exit type
go door      → Special exit type
climb ladder → Special exit type
enter shop   → Special exit type
```

**How it will work**:
- Separate `special_exits` array in room schema
- Parser recognizes `>go <target>` pattern
- Links to target object/room
- Requires manual confirmation (can't auto-link)

**Example room with special exits**:
```json
{
  "id": "town_square_central",
  "exits": [
    {"direction": "north", "roomId": "..."},
    {"direction": "south", "roomId": "..."}
  ],
  "special_exits": [
    {"action": "go gate", "target": "outside_gate", "hidden": false},
    {"action": "climb ladder", "target": "tower_top", "hidden": true}
  ]
}
```

---

## Why Validate?

### Problem: Invalid data corrupts map
```
Town Square --[nn]--> ???
```
- Creates broken exit
- Can't reverse (what's reverse of 'nn'?)
- Players get confused

### Solution: Validate early
```
⚠️  Skipping invalid direction: 'nn' (typo or non-ordinal)
```
- Prevents corrupt data
- Logs issue for review
- Map stays clean

---

## Summary

### Currently Supported ✅
- 11 ordinal directions (n, s, e, w, ne, nw, se, sw, up, down, out)
- Abbreviations auto-normalized
- Invalid directions auto-skipped

### Currently Rejected ❌
- Double-key typos (nn, ee, ss, ww)
- Game commands (look, exit, quit)
- Non-ordinal movements (go, climb, enter)

### Future Enhancement ⏳
- Non-ordinal exits as separate field
- Manual confirmation workflow
- Hidden/secret exits support

---

**Current Status**: Ordinal-only validation complete  
**Next Iteration**: Non-ordinal exit support

