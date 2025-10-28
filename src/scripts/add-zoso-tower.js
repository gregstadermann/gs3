'use strict';

const databaseManager = require('../core/DatabaseManager');

async function addZosoTower() {
  const db = await databaseManager.initialize();
  try {
    // Create area
    const area = {
      id: 'zoso-tower',
      name: "Zoso's Tower",
      respawnInterval: 0,
      instanced: false,
      rooms: 6,
      items: 0,
      importedAt: new Date().toISOString()
    };
    await db.collection('areas').replaceOne({ id: area.id }, area, { upsert: true });

    // Helper to make items quickly
    const createItem = async (id, name, roomMongoId) => {
      const doc = {
        id,
        type: 'DECOR',
        name,
        keywords: name.toLowerCase().split(/\s+/),
        description: name,
        location: String(roomMongoId),
        metadata: { weight: 0 },
        createdAt: new Date()
      };
      await db.collection('items').insertOne(doc);
      return id;
    };

    // Define rooms (without DB _id yet)
    const rooms = {
      grove: {
        id: 'zoso-tower:grove',
        areaId: 'zoso-tower',
        title: "Zoso’s Grove",
        description: "Sunlight dapples through silver leaves, where a stone bench waits beneath an oak that hums with quiet joy. Ivy curls around warm grey stones, and a clay fox blinks on the path. You also see a copper-bound journal, glowing acorns, and the tower’s archway glowing softly in the distance.",
        items: [],
        exits: [
          { direction: 'path', roomId: 'wehnimers-landing-town:tsnw' },
          { direction: 'tower', roomId: 'zoso-tower:entrance', hidden: true }
        ],
        metadata: {}
      },
      entrance: {
        id: 'zoso-tower:entrance',
        areaId: 'zoso-tower',
        title: "Zoso’s Entrance",
        description: "A low arch of warm grey stone opens into a cozy foyer, ivy-draped and lit by lanterns that hum with golden light. A cushioned bench waits beside a steaming teapot, and wind chimes sing softly above. You also see a cloak rack that tidies itself, a welcome mat that reads “Rest a While,” and a door leading north.",
        items: [],
        exits: [
          { direction: 'out', roomId: 'zoso-tower:grove' },
          { direction: 'up', roomId: 'zoso-tower:bedroom' },
          { direction: 'down', roomId: 'zoso-tower:forge' },
          { direction: 'north', roomId: 'zoso-tower:library' }
        ],
        metadata: {}
      },
      bedroom: {
        id: 'zoso-tower:bedroom',
        areaId: 'zoso-tower',
        title: "Zoso’s Bedroom",
        description: "Quilts stitched with constellations cover a canopied bed, and lantern-light dances on walls. A mug steams on the nightstand, and dream-catchers hum soft tunes. You also see an open journal, a blinking clay fox, and a window framing the grove below.",
        items: [],
        exits: [
          { direction: 'up', roomId: 'zoso-tower:workshop' },
          { direction: 'down', roomId: 'zoso-tower:entrance' }
        ],
        metadata: {}
      },
      workshop: {
        id: 'zoso-tower:workshop',
        areaId: 'zoso-tower',
        title: "Zoso’s Workshop",
        description: "Beneath a crystal dome, golden light pools on floating scrolls and a forge of blue flame. The air hums like a lullaby, and tiny clay birds flutter to their shelves. You also see a steaming mug, a self-mending charm, and a window open to starlight.",
        items: [],
        exits: [ { direction: 'down', roomId: 'zoso-tower:bedroom' } ],
        metadata: {}
      },
      library: {
        id: 'zoso-tower:library',
        areaId: 'zoso-tower',
        title: "Zoso’s Library",
        description: "Oak shelves rise like old friends, their glowing books whispering titles to those who pass. Lanterns drift, guiding hands to stories waiting. You also see a floating quill, a self-turning grimoire, and an open arch to the sunlit path.",
        items: [],
        exits: [ { direction: 'south', roomId: 'zoso-tower:entrance' } ],
        metadata: {}
      },
      forge: {
        id: 'zoso-tower:forge',
        areaId: 'zoso-tower',
        title: 'The Forge Below',
        description: "Warm red light pulses from a forge that sings as it shapes iron and mithril. Tools return to racks, and a copper-chest glows faintly. You also see a rack of hammers, a steaming trough, and relics waiting to be whole.",
        items: [],
        exits: [ { direction: 'up', roomId: 'zoso-tower:entrance' } ],
        metadata: {}
      }
    };

    // Upsert rooms in DB
    for (const key of Object.keys(rooms)) {
      await db.collection('rooms').replaceOne({ id: rooms[key].id }, rooms[key], { upsert: true });
    }

    // After rooms exist, create decorative items and attach
    const groveDoc = await db.collection('rooms').findOne({ id: rooms.grove.id });
    const entranceDoc = await db.collection('rooms').findOne({ id: rooms.entrance.id });
    const workshopDoc = await db.collection('rooms').findOne({ id: rooms.workshop.id });
    const bedroomDoc = await db.collection('rooms').findOne({ id: rooms.bedroom.id });
    const libraryDoc = await db.collection('rooms').findOne({ id: rooms.library.id });
    const forgeDoc = await db.collection('rooms').findOne({ id: rooms.forge.id });

    const toAdd = [];
    // Grove items
    toAdd.push(await createItem(`zoso-grove-journal-${Date.now()}`, 'a copper-bound journal', groveDoc._id));
    toAdd.push(await createItem(`zoso-grove-acorns-${Date.now()}`, 'some glowing acorns', groveDoc._id));
    // Entrance items
    toAdd.push(await createItem(`zoso-entrance-bench-${Date.now()}`, 'a cushioned bench', entranceDoc._id));
    // Workshop items
    toAdd.push(await createItem(`zoso-workshop-mug-${Date.now()}`, 'a steaming mug', workshopDoc._id));
    // Bedroom items
    toAdd.push(await createItem(`zoso-bedroom-journal-${Date.now()}`, 'an open journal', bedroomDoc._id));
    // Library items
    toAdd.push(await createItem(`zoso-library-quill-${Date.now()}`, 'a floating quill', libraryDoc._id));
    // Forge items
    toAdd.push(await createItem(`zoso-forge-hammers-${Date.now()}`, 'a rack of hammers', forgeDoc._id));

    // Attach items to rooms
    await db.collection('rooms').updateOne({ id: rooms.grove.id }, { $set: { items: toAdd.filter(id => id.includes('zoso-grove-')) } });
    await db.collection('rooms').updateOne({ id: rooms.entrance.id }, { $set: { items: toAdd.filter(id => id.includes('zoso-entrance-')) } });
    await db.collection('rooms').updateOne({ id: rooms.workshop.id }, { $set: { items: toAdd.filter(id => id.includes('zoso-workshop-')) } });
    await db.collection('rooms').updateOne({ id: rooms.bedroom.id }, { $set: { items: toAdd.filter(id => id.includes('zoso-bedroom-')) } });
    await db.collection('rooms').updateOne({ id: rooms.library.id }, { $set: { items: toAdd.filter(id => id.includes('zoso-library-')) } });
    await db.collection('rooms').updateOne({ id: rooms.forge.id }, { $set: { items: toAdd.filter(id => id.includes('zoso-forge-')) } });

    // Connect TSNW -> Grove if TSNW exists
    const tsnw = await db.collection('rooms').findOne({ id: 'wehnimers-landing-town:tsnw' })
                 || await db.collection('rooms').findOne({ title: /Town Square.*North/i });
    if (tsnw) {
      const exits = Array.isArray(tsnw.exits) ? tsnw.exits.slice() : [];
      if (!exits.find(e => e.direction === 'path')) exits.push({ direction: 'path', roomId: rooms.grove.id });
      await db.collection('rooms').updateOne({ _id: tsnw._id }, { $set: { exits } });
      // Also ensure Grove points back correctly
      await db.collection('rooms').updateOne({ id: rooms.grove.id }, { $set: { exits: [ { direction: 'path', roomId: tsnw.id }, { direction: 'tower', roomId: rooms.entrance.id, hidden: true } ] } });
    }

    console.log("Zoso's Tower added.");
  } catch (e) {
    console.error('Error adding Zoso Tower:', e);
  } finally {
    await databaseManager.client.close();
  }
}

if (require.main === module) addZosoTower();

module.exports = addZosoTower;


