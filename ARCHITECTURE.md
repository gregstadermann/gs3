# GS3 Architecture - MongoDB-Aware Refactor

## Overview

This document describes the MongoDB-aware architecture refactor implementing clean separation of concerns, repository pattern, caching layer, and deterministic services.

## Directory Structure

```
src/
├── constants/              # SSOT Constants (no logic)
│   └── encumbrance.js     # Armor weights, thresholds
│
├── data/                   # JSON Content (design-owned)
│   ├── areas.json         # Area definitions
│   ├── races.json         # Race definitions with stats
│   └── crit_tables/       # Critical hit tables
│
├── schemas/                # Validation & Type Definitions
│   └── room.js            # Room schema validation
│
├── models/                 # MongoDB Schema Definitions
│   ├── playerModel.js     # Player document schema
│   ├── roomModel.js       # Room document schema
│   ├── itemModel.js       # Item document schema
│   └── npcModel.js        # NPC document schema
│
├── services/               # Pure Domain Logic (no DB/IO)
│   ├── statBonus.js       # Stat bonus calculations
│   └── encumbrance.js     # Encumbrance calculations
│
├── cache/                  # Caching Layer
│   ├── memoryCache.js     # LRU cache implementation
│   ├── cachePolicy.js     # Cache policies by entity type
│   └── index.js           # Cache manager (singleton)
│
├── adapters/               # Side-Effect Boundaries
│   ├── db/
│   │   ├── mongoClient.js           # MongoDB connection (singleton)
│   │   ├── baseRepository.js        # Abstract CRUD operations
│   │   └── repositories/
│   │       ├── playerRepository.js  # Player-specific queries
│   │       ├── roomRepository.js    # Room-specific queries
│   │       ├── itemRepository.js    # Item-specific queries
│   │       └── npcRepository.js     # NPC-specific queries
│   ├── importers/                   # Data importers
│   │   ├── import-rooms.js
│   │   ├── import-critical-tables.js
│   │   └── import-rooms-from-log.js
│   └── analytics/                   # (Coming soon)
│
├── systems/                # Stateful Game Systems
│   ├── CombatSystem.js
│   ├── CharacterCreation.js
│   ├── NPCSystem.js
│   └── ...
│
├── commands/               # Game Commands
│   ├── attack.js
│   ├── look.js
│   └── ...
│
├── utils/                  # Utility Adapters (with DB deps)
│   └── encumbrance.js     # Encumbrance with DB queries
│
├── admin/                  # Builder/Admin Tools
│   ├── commands/
│   └── dashboards/
│
├── scripts/                # CLI Tasks
│   └── ...
│
└── core/                   # Core Game Engine
    ├── GameEngine.js
    ├── CommandManager.js
    └── ...
```

## Architecture Layers

### 1. Constants Layer
**Purpose**: Single Source of Truth for game mechanics  
**Rules**: 
- Pure data, no logic
- Never imported from DB
- Consumed by services

**Example**: `constants/encumbrance.js`
```javascript
const ENCUMBRANCE = {
  armorBaseWeightByASG: { 1: 0, 2: 8, ... },
  silversPerPound: 160,
  pfReductionRate: 10
};
```

### 2. Data Layer
**Purpose**: JSON content owned by design  
**Rules**:
- Configuration data (races, classes, etc.)
- Loaded at boot
- Can be hot-reloaded

**Example**: `data/races.json`
```json
{
  "human": {
    "baseWeight": 90,
    "bodyFactor": 0.90,
    "statModifiers": { "strength": 5, ... }
  }
}
```

### 3. Models Layer
**Purpose**: MongoDB schema definitions  
**Rules**:
- Defines document structure
- Includes validation logic
- Specifies indexes
- No business logic

**Example**: `models/playerModel.js`
```javascript
const PLAYER_SCHEMA = {
  name: { type: String, required: true, unique: true },
  race: { type: String, required: true },
  attributes: { ... }
};
const PLAYER_INDEXES = [
  { keys: { name: 1 }, options: { unique: true } },
  ...
];
```

### 4. Services Layer
**Purpose**: Pure domain logic  
**Rules**:
- Deterministic functions only
- No DB or IO dependencies
- Consume constants and data
- Easily unit-testable

**Example**: `services/encumbrance.js`
```javascript
function bodyWeight(raceKey, STR, CON) {
  const race = races[raceKey];
  return Math.min(
    race.baseWeight * 3,
    race.baseWeight + ((evenStat(STR) + evenStat(CON)) * race.bodyFactor)
  );
}
```

### 5. Cache Layer
**Purpose**: Hot-path performance optimization  
**Features**:
- LRU eviction policy
- Entity-specific TTLs
- Cache-aside pattern
- Hit/miss statistics

**Usage**:
```javascript
const player = await cache.getOrFetch('player', playerId, 
  () => playerRepo.findById(playerId)
);
```

**Cache Policies**:
- **Players**: 5 min TTL, 500 max entries
- **Rooms**: 30 min TTL, 1000 max entries (rarely change)
- **NPCs**: 2 min TTL, 300 max entries (combat-heavy)
- **Items**: 10 min TTL, 500 max entries
- **Combat State**: 30 sec TTL, 200 max entries

### 6. Repository Layer
**Purpose**: Clean DB abstraction  
**Features**:
- Extends BaseRepository
- Returns plain DTOs (no ObjectId leaks)
- Projection and pagination support
- Bulk write operations
- Domain-specific queries

**Example**: `repositories/playerRepository.js`
```javascript
class PlayerRepository extends BaseRepository {
  async findByName(name) { ... }
  async findByRoom(roomId) { ... }
  async updateLocation(playerId, roomId) { ... }
  async bulkUpdateRoundtimes(updates) { ... }
}
```

### 7. Systems Layer
**Purpose**: Stateful game systems  
**Rules**:
- Inject repositories and services
- Orchestrate game logic
- Emit events
- Manage state transitions

**Pattern**:
```javascript
class CombatSystem {
  constructor(playerRepo, npcRepo, combatService) {
    this.playerRepo = playerRepo;
    this.npcRepo = npcRepo;
    this.combatService = combatService;
  }
  
  async attack(attacker, defender) {
    // Use services for calculations
    // Use repos for persistence
  }
}
```

## Data Flow

### Read Path (Hot Path - Combat, Movement)
```
Command → System → Cache.getOrFetch → Repository → MongoDB
                       ↓ (cache hit)
                    Pure Services
                       ↓
                    Response
```

### Write Path (State Changes)
```
Command → System → Service (validation)
            ↓
        Repository → MongoDB
            ↓
        Cache.invalidate
```

### Event Path (Async Logging)
```
System → EventBus → ActionRecorder → MongoDB (batched)
```

## Key Principles

### 1. Definitions in Constants, Instances in DB
- **Constants**: Skills, races, formulas, tables
- **Database**: Players, rooms, items, NPCs (instances)

### 2. No ObjectId Leaks
- Repositories sanitize documents
- Domain uses string IDs only
- MongoDB _id is internal only

### 3. Cache Invalidation
- Explicit invalidation on writes
- TTL-based expiration
- Event-driven invalidation

### 4. Bulk Operations for Tick Processing
- Use `bulkWrite()` for roundtime updates
- Batch NPC AI updates
- Aggregate telemetry writes

## Performance Considerations

### Hot Paths (< 10ms target)
- **Player lookups**: Cached (5 min TTL)
- **Room lookups**: Cached (30 min TTL)
- **Combat calculations**: Pure functions (no I/O)
- **Encumbrance checks**: Services + cached player data

### Cold Paths (< 100ms acceptable)
- **Character creation**: Direct DB writes
- **Item spawning**: Batched inserts
- **NPC spawning**: Batched inserts

### Batch Operations (run on tick)
- **Roundtime updates**: `bulkUpdateRoundtimes()`
- **NPC AI**: Batch NPC state changes
- **Event logging**: Flush action buffer

## Database Collections

### Core Collections
- **players**: Character instances
- **rooms**: World geography
- **items**: Item instances
- **npcs**: NPC instances
- **accounts**: User accounts

### Telemetry Collections
- **actions**: Player action log (TTL: 30 days)
- **combat_logs**: Combat events (TTL: 7 days)
- **economy_metrics**: Daily aggregates (permanent)

### Admin Collections
- **sessions**: Active sessions (TTL: 1 hour)
- **admin_logs**: Admin actions (permanent)

## Testing Strategy

### Unit Tests
- **Services**: Pure functions, easy to test
- **Repositories**: Mock MongoDB
- **Cache**: In-memory, deterministic

### Integration Tests
- **Systems**: Test with real repos + test DB
- **Commands**: End-to-end command flow

### Performance Tests
- **Cache hit rates**: Monitor in production
- **Query performance**: Index usage analysis
- **Bulk operations**: Measure throughput

## Migration Path

### Phase 1: Core Infrastructure ✅
- [x] Models layer
- [x] Base repository
- [x] Specific repositories
- [x] Cache subsystem
- [x] Pure services

### Phase 2: System Integration (In Progress)
- [ ] Event bus refactor
- [ ] System dependency injection
- [ ] Analytics read models

### Phase 3: Performance Optimization
- [ ] Hot path profiling
- [ ] Cache tuning
- [ ] Index optimization
- [ ] Bulk operation implementation

### Phase 4: Observability
- [ ] Cache metrics dashboard
- [ ] Query performance monitoring
- [ ] Event bus telemetry
- [ ] Repository usage analytics

## Next Steps

1. **Refactor EventBus and ActionRecorder** for async writes
2. **Create analytics read models** for admin dashboards
3. **Update existing systems** to use repository pattern
4. **Add service hydrators** for computed fields
5. **Profile hot paths** and optimize cache policies

---

**Last Updated**: 2025-11-03  
**Architecture Version**: v2.0 (MongoDB-Aware)

