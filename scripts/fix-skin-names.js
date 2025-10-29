/**
 * Fix existing skin item names - remove quality from name, ensure quality is in metadata
 * 
 * Usage: mongosh "mongodb://localhost:27017/gs3" scripts/fix-skin-names.js
 */

const db = db.getSiblingDB('gs3');

// Find all skin items with quality prefixes
const skins = db.items.find({ 
  type: 'SKIN',
  name: { $regex: /^(crude|poor|fair|fine|exceptional|outstanding|superb|magnificent)\s+/i }
}).toArray();

print(`Found ${skins.length} skin items to fix...`);

let fixed = 0;
let skipped = 0;

for (const skin of skins) {
  try {
    // Extract quality and base name using regex
    const nameMatch = skin.name.match(/^(crude|poor|fair|fine|exceptional|outstanding|superb|magnificent)\s+(.+)$/i);
    
    if (!nameMatch) {
      print(`Skipping ${skin.name} - couldn't parse quality`);
      skipped++;
      continue;
    }
    
    const quality = nameMatch[1].toLowerCase();
    const baseName = nameMatch[2].trim();
    
    // Build update: always set name, conditionally set quality
    const update = {
      $set: {
        name: baseName
      }
    };
    
    // Set quality in metadata (overwrite if exists, create if doesn't)
    update.$set['metadata.quality'] = quality;
    
    // Update the item
    const result = db.items.updateOne(
      { _id: skin._id },
      update
    );
    
    if (result.modifiedCount > 0) {
      print(`Fixed: "${skin.name}" -> "${baseName}" (quality: ${quality})`);
      fixed++;
    } else {
      print(`No change needed for ${skin.name}`);
      skipped++;
    }
  } catch (error) {
    print(`Error processing ${skin.name}: ${error.message}`);
    skipped++;
  }
}

print(`\nDone! Fixed: ${fixed}, Skipped: ${skipped}`);

