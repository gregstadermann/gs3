# GS3 - Modern MUD Engine

This is a modern, clean MUD engine built with Node.js.

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