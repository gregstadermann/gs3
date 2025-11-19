<!-- gs3: Copilot / AI agent instructions -->
# Quick guide for AI code contributors

Be concise and make minimal, well-scoped changes. This repo is a modern re-build of the Gemstone3 MUD. Below are the project-specific conventions, architecture touchpoints, and examples you should use when making edits or suggesting code.

- Big picture
  - Core loop: `src/core/GameEngine.js` — single-threaded tick loop (default 1s tick). Many systems are initialized on start (player, room, NPC, account, action recorder) and some systems (combat, NPC combat behavior) are lazily required inside the loop.
  - Systems live in `src/systems/*`. Many systems have MongoDB-backed implementations (e.g. `RoomSystemMongoDB`, `PlayerSystemMongoDB`). Expect DB calls in system initialization and loads.
  - Commands: commands are plain JS modules under `src/commands/*.js`. They are loaded/registered by `src/core/CommandManager.js` (see `loadCommands` and `register`).

- Important patterns & conventions
  - Commands export an object: { name, aliases, description, usage, execute } and `execute(player, args)` returns { success, message } (see `src/commands/attack.js`). Use `command.permission` (an object with level) for basic permission checks.
  - Player shape: see `src/models/playerModel.js`. There are 10 canonical stats (strength, intelligence, wisdom, constitution, dexterity, charisma, agility, logic, discipline, aura). These are authoritative — do not rename or reorder them (see `.cursorrules` which lists the FINAL stat names and defaults).
  - Movement & parsing: `src/core/CommandParser.js` handles movement shortcuts (`l`, `i`) and delegates to `ArgParser` for direction canonicalization. Fuzzy command matching lives in `CommandManager.findCommand` and requires >=3 chars for abbreviation.
  - Roundtime/lag & combat: roundtime (lag) is managed in combat systems; use `combatSystem.addLag()` / `tickLag()` and respect existing conventions for weapon/armor/encumbrance RT calculation (see `src/commands/attack.js`). Combat systems are often lazily required (look for `require('../systems/CombatSystem')` inside methods).
  - DB/indexes: models expose schema and index helpers (e.g., `ensureIndexes`) — prefer to use existing helpers to create indexes rather than ad-hoc DB calls.

- Developer workflows (what works locally)
  - There is no centralized test harness in the repo; changes should be small and validated by running the game loop where applicable.
  - Start point for running the engine: `src/core/GameEngine.js` is instantiated by higher-level scripts in `src/` or tooling under project root; search for the environment you use locally (developer notes in `.cursorrules` reference the original Gemstone3 locations). If you need a start script, prefer adding `scripts` to `package.json` rather than creating new top-level runners.

- What AI agents should do (practical rules)
  1. Search for existing patterns before adding code — mimic style (callbacks vs async/await), file layout, and lazy `require` usage.
  2. When modifying combat/attributes/roundtime, reference `src/commands/attack.js`, `src/core/GameEngine.js`, and `src/models/playerModel.js` for formulas and side-effects (health regen pulse, experience absorption pulses).
  3. For commands: add new `src/commands/<name>.js` with the same export shape and update no other files — `CommandManager.loadCommands` will pick it up. If wiring is needed, register via `gameEngine.commandManager.register(...)` in initialization code.
  4. Preserve the 10-player-stat names and default values found in `.cursorrules` — these are critical and labelled FINAL.

- Quick examples
  - Minimal new command module:

    - Create `src/commands/hello.js` exporting { name: 'hello', execute: async (player,args) => ({ success: true, message: 'Hi\r\n' }) }

  - To debug combat math, examine `src/commands/attack.js` (AS/DS calculation), and use the game loop in `GameEngine.processTick` to run pulses and see lazy-loading behavior.

If anything above is ambiguous or you need local-run commands (start script, DB connection examples), tell me which environment you use and I will add a short runnable section. Ready to iterate — what else should I include or clarify? 
