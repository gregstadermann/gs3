# Room Schema Documentation

This document defines the standardized schema for rooms in the GS3 MUD engine.

## Core Room Schema

A room in the MongoDB database follows this structure:

```javascript
{
  // Required fields
  id: "area-id:room-slug",              // UNIQUE identifier: area:room (PRIMARY KEY)
  areaId: "area-id",                     // Area this room belongs to
  roomId: "room-slug",                   // Room identifier within the area
  title: "Room Title",                   // Display title (NOT UNIQUE - many rooms can share same title)
  description: "Full room description...", // Detailed description text
  
  // Arrays
  exits: [/* exit objects */],           // Array of exit definitions
  npcs: [/* NPC references */],          // Array of NPC IDs or objects
  items: [/* item references */],        // Array of item IDs or objects
  
  // Metadata
  metadata: {
    importedAt: "2025-10-31T18:30:37.796Z", // ISO timestamp
    originalFormat: "movement-log"          // Import source: movement-log | default
  }
}
```

## Identity vs. Display

**CRITICAL**: The `id` field is the **ONLY** unique identifier for a room. The `title` field is **NOT UNIQUE** - multiple rooms can have identical titles (e.g., "Wehnimer's Landing, Storm Street" appears many times).

- **Use `id` for**: Database lookups, room references, game logic
- **Use `title` for**: Player-visible display, room descriptions

This is by design: the same street name appears at different locations throughout the game world.

## ID Naming Conventions

When multiple rooms share the same title, use **sequential numbered suffixes** to make them unique:

### Standard Pattern
```javascript
// Street rooms with same title
wl-west-ring-road-01  → "Wehnimer's, West Ring Rd."
wl-west-ring-road-02  → "Wehnimer's, West Ring Rd."
wl-west-ring-road-03  → "Wehnimer's, West Ring Rd."
wl-west-ring-road-05  → "Wehnimer's, West Ring Rd."  // (04 skipped if removed)

// Special named rooms can break the pattern
observation-tower  → "Wehnimer's, West Ring Rd."  // Has unique function
```

### Import Handling
- **Manual Creation**: Follow the pattern `base-name-01`, `base-name-02`, etc.
- **Log Import**: Auto-appends `-2`, `-3`, etc. for collisions via `slugify()` + collision detection

## Exit Schema

Each exit in the `exits` array follows this structure:

```javascript
{
  direction: "north",                    // Direction string (required)
  roomId: "area-id:destination-room",    // Target room ID (required)
  hidden: true,                          // Optional: hide from "Obvious paths" display
  leaveMessage: " steps away",           // Optional: custom leave message
  arriveMessage: " enters the area"      // Optional: custom arrive message
}
```

### Direction Values

**Cardinal directions:**
- `north`, `south`, `east`, `west`
- `northeast`, `northwest`, `southeast`, `southwest`

**Vertical directions:**
- `up`, `down`

**Special exits:**
- `gate`, `door`, `path`, `rope`, `out`, `in`
- Any custom string (treated as hidden unless explicitly marked)

### Hidden Exits

Hidden exits (`hidden: true`) do NOT appear in the "Obvious paths:" display but can still be accessed via `go <direction>`. This is useful for:
- Gates and doors (e.g., `go gate`, `go door`)
- Secret passages
- Interactive exits

## NPC References

NPCs can be stored in two formats:

### Simple Format (String)
```javascript
npcs: ["area-id:npc-id"]
```

### Respawn Format (Object)
```javascript
npcs: [{
  id: "area-id:npc-id",
  respawnChance: 50,     // Percentage chance to respawn
  maxLoad: 5             // Maximum instances of this NPC
}]
```

## Item References

Items can be stored in two formats:

### Simple Format (String)
```javascript
items: ["area-id:item-id"]
```

### Respawn Format (Object)
```javascript
items: [{
  id: "area-id:item-id",
  respawnChance: 20,             // Percentage chance to respawn
  replaceOnRespawn: true         // Replace instead of add on respawn
}]
```

## Example Room

```javascript
{
  id: "limbo:white",
  areaId: "limbo",
  roomId: "white",
  title: "White Room",
  description: "A featureless white room. A pitch black void in the shape of archway can be seen on the east side of the room.",
  npcs: ["limbo:rat"],
  items: [
    {
      id: "limbo:woodenchest",
      respawnChance: 20,
      replaceOnRespawn: true
    }
  ],
  exits: [
    {
      direction: "east",
      roomId: "limbo:black",
      leaveMessage: " steps into the void and disappears."
    },
    {
      direction: "down",
      roomId: "limbo:ancientwayshrine"
    },
    {
      direction: "west",
      roomId: "limbo:wallys"
    },
    {
      direction: "north",
      roomId: "start"
    },
    {
      direction: "up",
      roomId: "wl-catacombs:sewers-nexus"
    }
  ],
  metadata: {
    importedAt: "2025-10-31T18:30:37.796Z",
    originalFormat: "movement-log"
  }
}
```

## Validation Rules

1. **Unique Room IDs**: Every room MUST have a unique `id` (area:room-slug). This is the PRIMARY KEY.
2. **Unique Directions**: Each room can only have ONE exit per direction
3. **No Self-Loops**: An exit cannot point to the same room (`roomId` cannot equal the room's own `id`)
4. **Valid Area IDs**: All `areaId` values must be registered in `src/constants/areas.js`
5. **Required Fields**: `id`, `areaId`, `roomId`, `title`, `description` are mandatory
6. **Array Defaults**: `exits`, `npcs`, `items` default to empty arrays if not provided
7. **Non-Unique Titles**: Room `title` is **NOT** required to be unique (many rooms share titles)

## Database Enforcement

The `RoomSystemMongoDB.addRoom()` and `updateRoom()` methods automatically enforce:
- Unique direction validation (filters duplicates)
- Self-loop prevention
- Array normalization

## Import Sources

Rooms can be imported from these sources:

### 1. Movement Logs (`originalFormat: "movement-log"`)
Import via `import-rooms-from-log.js` from player movement logs

### 2. Default Fallback (`originalFormat: "default"`)
Created automatically when no rooms exist in the database

## See Also

- `src/constants/areas.js` - Valid area IDs
- `src/systems/RoomSystemMongoDB.js` - Room management
- `src/scripts/import-rooms-from-log.js` - Log import system

