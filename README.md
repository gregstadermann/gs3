# GS3 - Modern MUD Engine

This is a modern, clean MUD engine built with Node.js.

## Recent Changes

- 2025-10-28: Preserve `player.role` when saving players so admin roles are not lost. HOTFIX reads updated role reliably. Added Zoso's Tower content script. Minor combat updates in `attack.js`.
- 2025-10-28: Major systems update: refined critical rank formula with armor divisors; added cold criticals; corpse creation with SEARCH/SKIN; bank in TSW with WEALTH/currency; encumbrance with weapon/shield weights and recalculation hooks; base armor/shields data; shield DS from left hand only; admin items spawn command; weights for brawling and polearm weapons.

## Architecture

- **Core Engine**: Game loop, event system, command management
- **Systems**: Room, Player, Combat, and other game systems
- **Commands**: Modular command system
- **MongoDB**: All persistent data (accounts, players, rooms, items, NPCs)
- **YAML**: Area import files for game content

## Getting Started

```bash
npm install
npm run dev
```

## Features

- Modern ES6+ JavaScript
- MongoDB for all game data (accounts, players, rooms, items, NPCs)
- YAML data files for area imports
- WebSocket and Telnet support
- Modular command system
- Event-driven architecture

## MongoDB Queries

### Launch MongoDB Shell

```bash
mongosh gs3
```

### Basic Commands
```javascript
// List all collections
show collections

// Count documents
db.players.countDocuments()

// Use a collection
use gs3
```

Useful queries for checking and managing game data:

### Check Collections
```javascript
// List all collections
show collections

// Count documents in collection
db.players.countDocuments()
```

### Players
```javascript
// List all players
db.players.find({})

// Find specific player
db.players.findOne({ name: 'PlayerName' })

// Update player room
db.players.updateOne({ name: 'PlayerName' }, { $set: { room: 'wehnimers-landing-town:tsc' } })

// Delete player
db.players.deleteOne({ name: 'PlayerName' })
```

### NPCs
```javascript
// List all NPCs
db.npcs.find({})

// Find NPCs in area
db.npcs.find({ areaId: 'wehnimers-landing-catacombs' })

// Find specific NPC
db.npcs.findOne({ id: 'wehnimers-landing-catacombs:giantrat' })
```

### Rooms
```javascript
// List all rooms
db.rooms.find({})

// Find rooms in area
db.rooms.find({ areaId: 'wehnimers-landing-town' })

// Find specific room
db.rooms.findOne({ id: 'wehnimers-landing-town:tsc' })

// List room exits
db.rooms.findOne({ id: 'wehnimers-landing-town:tsc' }, { exits: 1 })
```

### Items
```javascript
// List all items
db.items.find({})

// Find items in area
db.items.find({ areaId: 'wehnimers-landing-town' })

// Find specific item
db.items.findOne({ id: 'wehnimers-landing-town:raging-thrak-inn' })
```

### Areas
```javascript
// List all areas
db.areas.find({})

// Find specific area
db.areas.findOne({ id: 'wehnimers-landing-town' })
```

### Run Queries via Node.js Script
```javascript
const { MongoClient } = require('mongodb');

(async () => {
  const client = new MongoClient('mongodb://localhost:27017');
  await client.connect();
  const db = client.db('gs3');
  
  // Your query here
  const result = await db.players.find({}).toArray();
  console.log(result);
  
  await client.close();
})()
```

### Quick MongoDB Shell Examples
```bash
# Connect to gs3 database
mongosh gs3

# List all players
db.players.find({})

# List all NPCs
db.npcs.find({})

# Count rooms
db.rooms.countDocuments()

# Find rooms in catacombs
db.rooms.find({ areaId: 'wehnimers-landing-catacombs' })
```

## Importing Rooms from Movement Logs

The log parser can automatically extract rooms and their connections from game movement logs. This is useful for mapping areas by recording movement commands while playing.

### Basic Usage

```bash
# Import rooms from a log file into an area
node src/scripts/import-rooms-from-log.js --area <area-id> --file <log-file-path>

# Example: Import Wehnimer's Landing rooms
node src/scripts/import-rooms-from-log.js --area wehnimers-landing-town --file /path/to/log.txt
```

### How It Works

The parser extracts:
1. **Room titles** from lines like `[Room Title Here]`
2. **Room descriptions** from text between title and "Obvious paths:"
3. **Movement commands** like `> n`, `> s`, `> go gate`
4. **Exit connections** by tracking movement between rooms
5. **Bidirectional exits** (automatically creates reverse exits)

### Supported Commands

**Direction shortcuts:**
- `> n` = north
- `> s` = south
- `> e` = east
- `> w` = west
- `> ne`, `> nw`, `> se`, `> sw` = diagonals
- `> u` = up
- `> d` = down
- `> out` = out

**Special exits:**
- `> go gate` or `go gate[Room Title]` = gate exit
- `> go door` or `go door[Room Title]` = door exit
- `> go trail` or `go trail[Room Title]` = trail exit
- Any `> go <target>` command

### Log File Format

The parser expects:
- Room titles in brackets: `[Room Title]`
- Room descriptions on separate lines
- "Obvious paths:" line to mark end of description
- Movement commands with `>` prefix (optional for `go` commands)
- Both formats supported: `> go gate` on separate line, or `go gate[Room Title]` on one line

**Example log format:**
```
> n
[Wehnimer's, Town Square]
You stand in the bustling town square.
The cobblestone streets are worn smooth.
Obvious paths: north, south, east, west
> go gate
[Wehnimer's, Outside Gate]
You stand before the great wooden gates.
Obvious paths: go gate, north, east
> s
[Another Room]
Room description here.
Obvious paths: north
```

### Best Practices

1. **Go both ways** - Move back and forth to create bidirectional exits
2. **Use standard commands** - Stick to `> n`, `> s`, etc. (not `> go north`)
3. **Include descriptions** - Complete room descriptions are captured
4. **Always include "Obvious paths:"** - This marks the end of room description
5. **For gates/doors** - Use `> go gate` format, go both ways through gates

### After Importing

1. **Link obvious pairs** - Run the linker to connect related rooms:
   ```bash
   node src/scripts/link-obvious-rooms.js --area wehnimers-landing-town
   ```

2. **Visualize** - Generate visualization to see what was imported:
   ```bash
   node src/scripts/visualize-rooms.js --area wehnimers-landing-town
   ```

3. **Reload in game** - Run `hotfix` command in-game (admin only) to load new rooms

### Features

- **Add-only imports** - Won't overwrite existing rooms, only adds new ones
- **Automatic reverse exits** - Creates bidirectional connections automatically
- **Special exit support** - Handles `go gate`, `go door`, etc.
- **LOOK command support** - Tracks current room from `> l[Room Title]` format
- **Multiple log support** - Can import from multiple log files sequentially

### Troubleshooting

**Rooms not showing in game:**
- Run `hotfix` command in-game to reload rooms
- Or restart the game server

**Rooms missing exits:**
- Make sure you traveled both directions during mapping
- Run the obvious pairs linker: `node src/scripts/link-obvious-rooms.js --area <area-id>`
- Check visualization to see which rooms need connections

**Special exits not working:**
- Ensure you used `> go gate` format (not `> gate`)
- Both `go gate` and `go gate[Room]` formats are supported
- Check that reverse exits were created (gates work both ways)

## Room Visualization

Generate visualizations of imported rooms to see connections, missing exits, and room statistics.

### Generate Visualizations

```bash
# Generate all formats (HTML, text report, DOT graph)
node src/scripts/visualize-rooms.js --area wehnimers-landing-town

# Generate only HTML (interactive web page)
node src/scripts/visualize-rooms.js --area wehnimers-landing-town --format html

# Generate only text report
node src/scripts/visualize-rooms.js --area wehnimers-landing-town --format text

# Generate only DOT graph
node src/scripts/visualize-rooms.js --area wehnimers-landing-town --format dot
```

### Output Files

All files are saved to `/tmp/` directory by default with timestamp:

- **HTML** (`.html`): Interactive web page with filtering
  - Color-coded rooms: 🟢 Green (many exits), 🟡 Yellow (few exits), 🔴 Red (no exits)
  - Filter by room name
  - Show only rooms without exits
  - Show only rooms with special exits (`go gate`, `go door`, etc.)
  - Open in any web browser

- **Text Report** (`.txt`): Detailed statistics and room listing
  - Total rooms, exit counts, averages
  - List of rooms without exits
  - All rooms with their exit connections

- **DOT Graph** (`.dot`): Graphviz format for generating images
  - Generate PNG: `dot -Tpng file.dot -ooutput.png`
  - Generate SVG: `dot -Tsvg file.dot -ooutput.svg`
  - Generate PDF: `dot -Tpdf file.dot -ooutput.pdf`

### Generating PNG from DOT File

To create a PNG image from the DOT graph file:

```bash
# Install Graphviz (if not already installed)
sudo apt-get install graphviz

# Generate PNG from DOT file
cd tmp
LATEST=$(find . -maxdepth 1 -name "room-visualization-*.dot" -printf '%T@ %p\n' | sort -n | tail -1 | cut -d' ' -f2-)
dot -Tpng "$LATEST" -o"room-map.png"
```

Or use the auto-naming option:

```bash
cd tmp
dot -Tpng room-visualization-*.dot -O
# Creates: room-visualization-*.dot.png
```

### What You'll See

- **Statistics**: Total rooms, exit counts, averages
- **Missing Exits**: Rooms with zero exits (highlighted in red)
- **Special Exits**: Rooms connected via `go gate`, `go door`, etc.
- **Room Connections**: All directional and special exits mapped
- **Import Status**: Which rooms came from movement logs vs. YAML imports