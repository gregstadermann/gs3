'use strict';

const AreaImporter = require('../systems/AreaImporter');

/**
 * Import Command
 * Imports areas from Gemstone3 reference
 */
module.exports = {
  name: 'import',
  aliases: ['importarea'],
  description: 'Import areas from Gemstone3 reference',
  usage: 'import <area_name>',
  
  async execute(player, args) {
    if (args.length < 1) {
      return { 
        success: false, 
        message: 'Usage: import <area_name>\nAvailable areas: wehnimers-landing, wehnimers-landing-catacombs' 
      };
    }

    const areaName = args[0].toLowerCase();
    
    try {
      const importer = new AreaImporter();
      await importer.initialize();
      
      let result;
      switch (areaName) {
        case 'wehnimers-landing':
        case 'wl':
          result = await importer.importWehnimersLanding();
          break;
        case 'wehnimers-landing-catacombs':
        case 'wl-catacombs':
        case 'catacombs':
          result = await importer.importWehnimersLandingCatacombs();
          break;
        default:
          return { 
            success: false, 
            message: `Unknown area: ${areaName}\nAvailable areas: wehnimers-landing, wehnimers-landing-catacombs` 
          };
      }
      
      return { 
        success: true, 
        message: `Successfully imported ${areaName}!\nRooms: ${result.rooms}\nItems: ${result.items}` 
      };
    } catch (error) {
      return { 
        success: false, 
        message: `Error importing area: ${error.message}` 
      };
    }
  }
};
