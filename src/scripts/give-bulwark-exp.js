/**
 * MongoDB script to give Bulwark 1000 experience
 * Run with: mongosh <database_name> src/scripts/give-bulwark-exp.js
 * Or paste the queries into mongosh manually
 */

const playerName = "Bulwark";
const expToAdd = 1000;

print("=== Giving " + expToAdd + " experience to " + playerName + " ===\n");

// First, check if player exists
const player = db.players.findOne({ name: playerName });
if (!player) {
  print("ERROR: Player '" + playerName + "' not found!");
  print("\nAvailable players:");
  db.players.find({}, { name: 1 }).forEach(p => print("  - " + p.name));
  quit(1);
}

print("Found player: " + player.name);
print("Current level: " + (player.level || 0));
const currentExp = player.attributes?.experience?.total || 0;
const currentField = player.attributes?.experience?.field || 0;
print("Current experience - Total: " + currentExp + ", Field: " + currentField);
print("");

// Update with aggregation pipeline (safest - handles missing structure)
const result = db.players.updateOne(
  { name: playerName },
  [
    {
      $set: {
        "attributes.experience.total": {
          $add: [
            { $ifNull: ["$attributes.experience.total", 0] },
            expToAdd
          ]
        },
        "attributes.experience.field": {
          $ifNull: ["$attributes.experience.field", 0]
        }
      }
    }
  ]
);

print("Update result:");
print("  Matched: " + result.matchedCount);
print("  Modified: " + result.modifiedCount);

if (result.matchedCount === 0) {
  print("\nERROR: No player matched. Check the name is correct.");
  quit(1);
}

if (result.modifiedCount === 0) {
  print("\nWARNING: Player found but no changes made. The experience value may already be correct.");
}

// Verify the update
const updated = db.players.findOne({ name: playerName }, { "attributes.experience": 1, level: 1 });
const newExp = updated.attributes?.experience?.total || 0;
const newField = updated.attributes?.experience?.field || 0;

print("\nUpdated experience:");
print("  Total: " + newExp + " (was " + currentExp + ", added " + expToAdd + ")");
print("  Field: " + newField);

if (newExp === currentExp + expToAdd) {
  print("\n✓ Success! Experience updated correctly.");
} else {
  print("\n✗ WARNING: Experience may not have updated as expected.");
  print("  Expected: " + (currentExp + expToAdd));
  print("  Actual: " + newExp);
}

