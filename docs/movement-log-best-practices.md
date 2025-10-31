# Best Practices for Creating Movement Log Files

This guide explains how to create effective movement log files that the room importer can parse correctly.

## How the Parser Works

The parser looks for:
1. **Movement commands**: `> n`, `> s`, `> e`, `> w`, `> ne`, `> nw`, `> se`, `> sw`, `> u`, `> d`, `> out`
2. **Room titles**: Lines wrapped in brackets like `[Room Title Here]`
3. **Room descriptions**: Lines after the title until "Obvious paths:" or a blank line
4. **Exit connections**: Automatically links rooms when you move from one to another

## Best Practices

### 1. **Use Standard Direction Commands**
✅ **DO:**
```
> n
> s
> e
> w
> ne
> nw
```

For special exits (gates, doors, etc.):
```
> go gate
> go door
> go entrance
```

❌ **DON'T:**
```
> go north
> walk south
> north
```

The parser recognizes:
- Single-letter or two-letter direction shortcuts (`> n`, `> s`, etc.)
- Special GO commands (`> go gate`, `> go door`, etc.)

### 2. **Go Both Ways When Mapping**
**CRITICAL:** To create bidirectional exits, move back and forth:

✅ **Good Example:**
```
> n
[New Room]
Room description here.
Obvious paths: south
> s
[Original Room]
Room description here.
Obvious paths: north
```

This creates:
- Original Room → north → New Room
- New Room → south → Original Room

❌ **Bad Example (one-way only):**
```
> n
[New Room]
Room description here.
Obvious paths: south
```

This only creates: Original Room → north → New Room  
**Missing:** New Room → south → Original Room

### 3. **Include Complete Room Descriptions**
The parser captures everything between the title and "Obvious paths:" as the description.

✅ **Good:**
```
[Wehnimer's, Town Square]
You stand in the bustling town square. 
The cobblestone streets are worn smooth.
A stone fountain bubbles in the center.
Obvious paths: north, south, east, west
```

❌ **Bad (too short):**
```
[Wehnimer's, Town Square]
Obvious paths: north
```

### 4. **Don't Skip "Obvious paths:" Lines**
The parser uses this to know when a room description ends. Always include it.

✅ **Good:**
```
[Room Name]
Description text here.
Obvious paths: north, south
```

❌ **Bad (missing obvious paths):**
```
[Room Name]
Description text here.
[Next Room]  // Parser might miss the connection
```

### 5. **Travel Patterns That Work Well**

**Pattern A: Grid Mapping**
```
Start at a location, then:
> n    (map north)
> s    (come back)
> e    (map east)
> w    (come back)
> n    (map north again)
> e    (map northeast room)
> s    (map east)
> w    (come back)
```

**Pattern B: Linear Path**
```
> n
[Room 1]
Description
Obvious paths: south
> s
[Start Room]
Description
Obvious paths: north
> n
[Room 1]
Description
Obvious paths: south
> n
[Room 2]
Description
Obvious paths: south
> s
[Room 1]
> s
[Start Room]
> n
[Room 1]
> n
[Room 2]
> n
[Room 3]
...
```

**Pattern C: Hub-and-Spoke**
```
Start at central hub, map each spoke:
> n (explore north area thoroughly, come back)
> s (explore south area thoroughly, come back)
> e (explore east area thoroughly, come back)
> w (explore west area thoroughly, come back)
```

### 6. **What to Avoid**

❌ **Don't include chat/command spam:**
```
> n
[Room Name]
Description here.
> say hello
> look
> inventory
Obvious paths: north
```
The parser will capture the commands as part of the description.

❌ **Don't use non-standard commands:**
```
> go north
> walk south
> teleport somewhere
```
Only standard direction shortcuts work.

❌ **Don't skip rooms:**
If you know a room exists but don't visit it, it won't be imported. Make sure to actually enter each room.

### 7. **Special Movement Commands**

Supported shortcuts:
- `> n` = north
- `> s` = south  
- `> e` = east
- `> w` = west
- `> ne` = northeast
- `> nw` = northwest
- `> se` = southeast
- `> sw` = southwest
- `> u` = up
- `> d` = down
- `> out` = out

**Special exits (requires GO command):**
- `> go gate` = go through gate
- `> go door` = go through door
- `> go entrance` = go through entrance
- `> go <target>` = any other special exit

When you use `> go gate`, the parser will:
1. Create an exit with direction "go gate" 
2. Automatically create a reverse exit (also "go gate") if applicable
3. Link the rooms together

**Example:**
```
> go gate
[Wehnimer's, Outside Gate]
You stand outside the gates of Wehnimer's Landing.
Obvious paths: go gate
> go gate
[Wehnimer's, Land's End Rd.]
The main road leading into Wehnimer's Landing.
Obvious paths: go gate
```
This creates bidirectional "go gate" exits between the two rooms.

### 8. **File Format**

The parser expects plain text files with:
- One line per movement command or room data
- Room titles in brackets on their own line
- Descriptions on separate lines
- "Obvious paths:" line to mark end of room block

### 9. **Tips for Maximum Coverage**

1. **Start at a central location** (like Town Square) and map outward
2. **Go back the way you came** to create reverse exits
3. **Map systematically** - don't jump around randomly
4. **Include hidden rooms** if you find them
5. **Map indoor areas** (shops, buildings) as separate sections
6. **Use LOOK command** between movements to capture room data (the parser will capture it)

### 10. **Example of Good Log Format**

```
[Wehnimer's, Town Square]
You stand in the bustling town square of Wehnimer's Landing.
The cobblestone streets are worn smooth by countless feet.
A large stone fountain bubbles in the center.
Obvious paths: north, south, east, west
> n
[Wehnimer's, Town Square, North]
The northern edge of the town square.
Merchants set up their stalls along the perimeter.
Obvious paths: south
> s
[Wehnimer's, Town Square]
You stand in the bustling town square of Wehnimer's Landing.
The cobblestone streets are worn smooth by countless feet.
A large stone fountain bubbles in the center.
Obvious paths: north, south, east, west
> e
[Wehnimer's, Town Square, East]
The eastern section of the town square.
You can see the entrance to several shops.
Obvious paths: west
> w
[Wehnimer's, Town Square]
You stand in the bustling town square of Wehnimer's Landing.
...
```

### 11. **After Importing**

After importing a log file:
1. Run the obvious pairs linker: `node src/scripts/link-obvious-rooms.js --area <area-id>`
2. Check for zero-exit rooms and map those areas
3. Import additional logs to fill gaps

## Quick Checklist

Before importing a log file, verify:
- [ ] Uses standard direction commands (`> n`, `> s`, etc.)
- [ ] Room titles are in brackets on their own line
- [ ] Descriptions are complete and descriptive
- [ ] "Obvious paths:" lines are present
- [ ] You've gone both ways on important connections
- [ ] File is plain text (not RTF, DOCX, etc.)
- [ ] No excessive command spam in the logs

## Common Issues

**Problem:** Rooms have no exits after import  
**Solution:** Make sure you visit each room from both directions, or run the obvious pairs linker

**Problem:** Rooms have wrong descriptions  
**Solution:** The parser captures everything between title and "Obvious paths:" - make sure that's clean

**Problem:** Exits point to wrong rooms  
**Solution:** Make sure your movement commands match the actual game movement (don't use aliases the parser doesn't understand)

---

**Remember:** The goal is to create a clean log that shows room connections. Think of it like drawing a map - each movement creates a connection between rooms.

