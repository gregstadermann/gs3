'use strict';

/**
 * Gem definitions for treasure system
 * Schema:
 * - key: stable id (kebab-case)
 * - name: canonical gem family name (singular)
 * - varieties: [{ name, valueMin, valueMax, locations: [areaId|string], notes }]
 *   - values can be null when unknown
 *   - locations accept human strings for now (mapping optional in loot tables)
 */

const asRange = (val) => {
  if (val == null || val === '') return [null, null];
  if (typeof val === 'number') return [val, val];
  const m = String(val).match(/^(\d+)\s*-\s*(\d+)$/);
  if (m) return [parseInt(m[1], 10), parseInt(m[2], 10)];
  const n = parseInt(val, 10);
  return Number.isFinite(n) ? [n, n] : [null, null];
};

const V = (name, value, locations = [], notes = undefined) => {
  const [valueMin, valueMax] = asRange(value);
  return { name, valueMin, valueMax, locations, notes };
};

const GEMS = [
  {
    key: 'aetherstone',
    name: 'aetherstone',
    varieties: [
      V('a swirling aetherstone', null, ['The Rift'])
    ]
  },
  {
    key: 'agate',
    name: 'agate',
    varieties: [
      V('a banded agate', 10),
      V('a blue lace agate', null, ['Icemule Trace']),
      V('a chameleon agate', 4000, ['Teras Isle']),
      V('a cloud agate', null, ['Zul Logoth']),
      V('a fire agate', '120-180', ['Any']),
      V('a frost agate', 15),
      V('a moss agate', null),
      V('a mottled agate', '25-75'),
      V('a tigereye agate', null, ['Elven Nations'])
    ]
  },
  {
    key: 'agita',
    name: 'agita',
    varieties: [
      V('a teardrop of aura agita', null),
      V('a teardrop of dawn agita', null),
      V('a teardrop of dusk agita', null),
      V('a teardrop of ocean agita', null),
      V('a teardrop of storm agita', null),
      V('a teardrop of summit agita', null)
    ]
  },
  {
    key: 'amber',
    name: 'amber',
    varieties: [
      V('a droplet of honey amber', null, ['Sanctum of Scales']),
      V('a piece of blood amber', 1900, ['Hinterwilds']),
      V('a piece of golden amber', '105-750', ['Any']),
      V('a teardrop of green amber', null, ['Mist Harbor']),
      V('some polished dark blue amber', null, ['Mist Harbor'])
    ]
  },
  {
    key: 'amethyst',
    name: 'amethyst',
    varieties: [
      V("a brilliant wyrm's-tooth amethyst", '2000-4500', ['The Rift']),
      V('a deep purple amethyst', '200-300', ['Any']),
      V('a frosted pale violet amethyst', 275, ['Hinterwilds']),
      V('a shadow amethyst', null, ['Sanctum of Scales']),
      V('a smoky amethyst', '500-1000', ['Settlement of Reim'])
    ]
  },
  {
    key: 'aquamarine',
    name: 'aquamarine',
    varieties: [
      V('a flawless aquamarine gem', null, ['Sanctum of Scales']),
      V('an aquamarine gem', '500-1000', ['Any'])
    ]
  },
  {
    key: 'aranthium-bloom',
    name: 'aranthium-bloom',
    varieties: [
      V('a dark ivory aranthium-bloom', 5100, ['Hinterwilds'])
    ]
  },
  {
    key: 'azurite',
    name: 'azurite',
    varieties: [
      V('a piece of azurite', null),
      V('a spar of pocked azurite', null, ['Sanctum of Scales'])
    ]
  },
  {
    key: 'baystone',
    name: 'baystone',
    varieties: [
      V('baystone', null, ["Wehnimer's Landing"])
    ]
  },
  {
    key: 'beryl',
    name: 'beryl',
    varieties: [
      V('a cylindrical red beryl', 2400, ['Hinterwilds']),
      V('a Kezmonian honey beryl', '1750-3750', ['Solhaven', "River's Rest"])
    ]
  }
];

module.exports = GEMS;


