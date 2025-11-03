'use strict';

const { readFileSync } = require('fs');
const { MongoClient } = require('mongodb');

function stripTags(html) {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function decodeEntities(text) {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

function parseValue(text) {
  if (!text) return [null, null];
  const t = text.replace(/[^0-9\-]/g, '').trim();
  if (!t) return [null, null];
  const m = t.match(/^(\d+)\s*-\s*(\d+)$/);
  if (m) return [parseInt(m[1], 10), parseInt(m[2], 10)];
  const n = parseInt(t, 10);
  return Number.isFinite(n) ? [n, n] : [null, null];
}

function toKey(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function parseGems(html) {
  // Split rows crudely; we rely on <tr> ... </tr>
  const rows = html.split(/<tr[\s\S]*?>|<\/tr>/gi).filter(Boolean);
  const gemsMap = new Map();
  let currentGem = null;

  for (const chunk of rows) {
    const tds = chunk.split(/<td[\s\S]*?>/gi).slice(1).map(td => td.split(/<\/td>/i)[0]);
    if (tds.length < 2) continue;

    const gemCell = stripTags(tds[0]);
    const varietyCell = stripTags(tds[1]);
    const valueCell = stripTags(tds[2] || '');
    const locationCellRaw = (tds[3] || '');

    // Extract linked location names if present; else plain text
    const linkTexts = Array.from(locationCellRaw.matchAll(/<a [^>]*>([\s\S]*?)<\/a>/gi)).map(m => stripTags(m[0]));
    const locations = linkTexts.length ? linkTexts : (stripTags(locationCellRaw) ? [stripTags(locationCellRaw)] : []);

    if (gemCell) {
      currentGem = gemCell.toLowerCase();
      if (!gemsMap.has(currentGem)) {
        gemsMap.set(currentGem, { key: toKey(currentGem), name: currentGem, varieties: [] });
      }
    }
    if (!currentGem) continue;
    if (!varietyCell) continue;

    const [valueMin, valueMax] = parseValue(decodeEntities(valueCell));
    gemsMap.get(currentGem).varieties.push({
      name: decodeEntities(varietyCell),
      valueMin,
      valueMax,
      locations: locations.map(decodeEntities)
    });
  }

  return Array.from(gemsMap.values());
}

async function main() {
  const inputPath = process.argv[2];
  if (!inputPath) {
    console.error('Usage: node src/scripts/import-gems-from-html.js <path-to-wiki-html>');
    process.exit(1);
  }
  const html = readFileSync(inputPath, 'utf8');
  const parsed = parseGems(html);

  // Filter to C-Z by first letter of name
  const filtered = parsed.filter(g => {
    const c = (g.name[0] || '').toUpperCase();
    return c >= 'C' && c <= 'Z';
  });

  const client = await MongoClient.connect('mongodb://localhost:27017');
  const db = client.db('gs3');
  const coll = db.collection('gems');

  let count = 0;
  for (const gem of filtered) {
    await coll.updateOne(
      { key: gem.key },
      { $set: { name: gem.name, varieties: gem.varieties } },
      { upsert: true }
    );
    count++;
  }

  console.log(`Upserted ${count} gem families (C–Z).`);
  await client.close();
}

main().catch(err => { console.error(err); process.exit(1); });


