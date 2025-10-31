'use strict';

/**
 * Valid Game Areas
 * Map of area ID to display name
 * All areas must be registered here before they can be imported or used
 */
const VALID_AREAS = {
  // Wehnimer's Landing areas
  'wl-town': "Wehnimer's Landing Town",
  'wl-catacombs': "Wehnimer's Landing Catacombs",
  'wl-gates': "Wehnimer's Landing Outside Gates",
  'wl-broken': "Wehnimer's Landing Broken Lands",
  'wl-cavernhold': "Wehnimer's Landing Cavernhold",
  'wl-cliffs': "Wehnimer's Landing Cliffs",
  'wl-danjirland': "Wehnimer's Landing Danjirland",
  'wl-darkstone': "Wehnimer's Landing Darkstone",
  'wl-graveyard': "Wehnimer's Landing Graveyard",
  'wl-lysierian': "Wehnimer's Landing Lysierian",
  'wl-mineroad': "Wehnimer's Landing Mineroad",
  'wl-spidertemple': "Wehnimer's Landing Spider Temple",
  'wl-stronghold': "Wehnimer's Landing Stronghold",
  'wl-trollfang': "Wehnimer's Landing Trollfang",
  'wl-wehntoph': "Wehnimer's Landing Wehntoph",
  
  // Teras Isle areas
  'ti-teras': 'Teras Isle',
  'ti-vtull': 'Teras Isle Vtull',
  
  // River's Rest areas
  'rr-citadel': "River's Rest Citadel",
  'rr-maelstrom': "River's Rest Maelstrom",
  'rr-riversrest': "River's Rest",
  
  // Solhaven/Vaialor areas
  'vo-caravansary': 'Solhaven Caravansary',
  'vo-foggy-valley': 'Solhaven Foggy Valley',
  'vo-north-beach': 'Solhaven North Beach',
  'vo-outlands': 'Solhaven Outlands',
  'vo-solhaven': 'Solhaven',
  'vo-trail': 'Solhaven Trail',
  
  // Icemule Trace areas
  'imt-icemule': 'Icemule Trace',
  'imt-trail': 'Icemule Trace Trail',
  'imt-underground': 'Icemule Trace Underground',
  'imt-east-west-north-gates': 'Icemule Trace East/West/North Gates',
  'imt-south-gate-2021': 'Icemule Trace South Gate',
  
  // North Elanith areas
  'en-cemetery': 'Elanith Cemetery',
  'en-cysaegir': 'Elanith Cysaegir',
  'en-fearling': 'Elanith Fearling',
  'en-gyldemar': 'Elanith Gyldemar',
  'en-old-tafaendryl': 'Elanith Old Tafaendryl',
  'en-ravelin': 'Elanith Ravelin',
  'en-sapphire': 'Elanith Sapphire',
  'en-skull': 'Elanith Skull',
  'en-sylvarraend': 'Elanith Sylvarraend',
  'en-taillistim': 'Elanith Taillistim',
  'en-tavaalor': 'Elanith Tavaalor',
  'en-tower': 'Elanith Tower',
  'en-trail': 'Elanith Trail',
  'en-victory': 'Elanith Victory',
  'en-whistlers-pass': 'Elanith Whistlers Pass',
  'en-zul-logoth': 'Elanith Zul Logoth',
  
  // Other areas
  'fearling_pass': 'Fearling Pass',
  'global': 'Global Map',
  'juggernaut-00-11': 'Juggernaut',
  
  // Special areas
  'zoso-tower': "Zoso's Tower",
  'limbo': 'Limbo',
  'default': 'Default Area' // Fallback for emergency room creation
};

/**
 * Check if an area ID is valid
 * @param {string} areaId - The area ID to check
 * @returns {boolean} - True if the area is valid
 */
function isValidArea(areaId) {
  return areaId && VALID_AREAS.hasOwnProperty(areaId);
}

/**
 * Get the display name for an area
 * @param {string} areaId - The area ID
 * @returns {string|null} - The display name or null if invalid
 */
function getAreaName(areaId) {
  return VALID_AREAS[areaId] || null;
}

/**
 * Get all valid area IDs
 * @returns {string[]} - Array of all valid area IDs
 */
function getAllAreaIds() {
  return Object.keys(VALID_AREAS);
}

module.exports = {
  VALID_AREAS,
  isValidArea,
  getAreaName,
  getAllAreaIds
};

