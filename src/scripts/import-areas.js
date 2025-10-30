'use strict';

const AreaImporter = require('../systems/AreaImporter');

(async () => {
  const ai = new AreaImporter();
  await ai.initialize();
  const wl = await ai.importWehnimersLanding();
  const wc = await ai.importWehnimersLandingCatacombs();
  const areas = await ai.getImportedAreas();
  console.log("Wehnimer's Landing:", wl);
  console.log('Catacombs:', wc);
  console.log('Imported areas:', areas.map(a => a.id));
  process.exit(0);
})().catch(err => { console.error(err); process.exit(1); });


