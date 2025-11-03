'use strict';

const databaseManager = require('../adapters/db/mongoClient');
const yaml = require('js-yaml');
const fs = require('fs').promises;
const path = require('path');

/**
 * Give broadsword to Zoso
 * Imports the test broadsword and gives it to player Zoso
 */
async function giveBroadswordToZoso() {
  try {
    const db = await databaseManager.initialize();
    
    // Load the broadsword from YAML
    const broadswordPath = path.join(__dirname, '../data/test-broadsword.yaml');
    const yamlContent = await fs.readFile(broadswordPath, 'utf8');
    const data = yaml.load(yamlContent);
    
    const broadsword = data.items[0];
    console.log('Broadsword loaded:', broadsword);
    
    // Check if item already exists
    const existingItem = await db.collection('items').findOne({ id: broadsword.id });
    
    if (!existingItem) {
      // Insert into items collection
      await db.collection('items').insertOne(broadsword);
      console.log('Broadsword inserted into items collection');
    } else {
      console.log('Broadsword already exists in items collection');
    }
    
    // Get player Zoso from players collection
    const player = await db.collection('players').findOne({ name: 'Zoso' });
    
    if (!player) {
      console.log('Player Zoso not found. Please create the character first.');
      console.log('Item has been added to database. You can GET it from a room later.');
      await databaseManager.client.close();
      return;
    }
    
    // Initialize equipment if needed
    if (!player.equipment) {
      player.equipment = {};
    }
    
    // Give broadsword to player's right hand
    player.equipment.rightHand = broadsword;
    
    // Save player back
    await db.collection('players').updateOne(
      { name: 'Zoso' },
      { $set: { equipment: player.equipment } }
    );
    
    console.log('Broadsword added to Zoso\'s right hand!');
    
    await databaseManager.client.close();
  } catch (error) {
    console.error('Error giving broadsword to Zoso:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  giveBroadswordToZoso();
}

module.exports = giveBroadswordToZoso;

