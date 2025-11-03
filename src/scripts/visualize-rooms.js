'use strict';

const fs = require('fs').promises;
const path = require('path');
const databaseManager = require('../adapters/db/mongoClient');

/**
 * Generate a DOT graph file for visualization
 */
async function generateDotGraph(areaId, outputPath, db) {
  if (!db) {
    db = await databaseManager.initialize();
  }
  
  const rooms = await db.collection('rooms')
    .find({ areaId })
    .project({ id: 1, title: 1, exits: 1, 'metadata.originalFormat': 1, _id: 0 })
    .toArray();

  const roomMap = new Map(rooms.map(r => [r.id, r]));
  
  let dotContent = 'digraph RoomMap {\n';
  dotContent += '  rankdir=LR;\n';
  dotContent += '  node [shape=box, style=rounded];\n';
  dotContent += '  edge [arrowhead=vee];\n\n';

  // Group rooms by exit count for better layout
  const roomsWithExits = [];
  const roomsWithoutExits = [];
  
  for (const room of rooms) {
    const exitCount = room.exits ? room.exits.length : 0;
    const roomLabel = room.title.replace(/"/g, '\\"');
    const roomId = room.id.replace(/[^a-zA-Z0-9]/g, '_');
    
    // Color code by exit count
    let color = '#lightblue';
    if (exitCount === 0) {
      color = '#ffcccc';
      roomsWithoutExits.push(room);
    } else if (exitCount < 2) {
      color = '#ffffcc';
    } else {
      color = '#ccffcc';
      roomsWithExits.push(room);
    }
    
    dotContent += `  "${roomId}" [label="${roomLabel}\\n(${exitCount} exits)", fillcolor="${color}", style="rounded,filled"];\n`;
  }

  // Add edges
  for (const room of rooms) {
    const fromId = room.id.replace(/[^a-zA-Z0-9]/g, '_');
    
    if (room.exits && room.exits.length > 0) {
      for (const exit of room.exits) {
        if (!exit.roomId || !exit.direction) continue;
        const toRoom = roomMap.get(exit.roomId);
        if (toRoom) {
          const toId = exit.roomId.replace(/[^a-zA-Z0-9]/g, '_');
          const dirLabel = (exit.direction || '').replace(/"/g, '\\"');
          dotContent += `  "${fromId}" -> "${toId}" [label="${dirLabel}"];\n`;
        }
      }
    }
  }

  dotContent += '}\n';

  await fs.writeFile(outputPath, dotContent, 'utf8');
  console.log(`DOT graph written to: ${outputPath}`);
  console.log(`Generate visualization with: dot -Tpng ${outputPath} -o ${outputPath.replace('.dot', '.png')}`);
}

/**
 * Generate a text report
 */
async function generateTextReport(areaId, outputPath, db) {
  if (!db) {
    db = await databaseManager.initialize();
  }
  
  const rooms = await db.collection('rooms')
    .find({ areaId })
    .project({ id: 1, title: 1, exits: 1, 'metadata.originalFormat': 1, _id: 0 })
    .sort({ title: 1 })
    .toArray();

  const roomMap = new Map(rooms.map(r => [r.id, r]));
  
  let report = `Room Import Report for: ${areaId}\n`;
  report += `Generated: ${new Date().toISOString()}\n`;
  report += `\n${'='.repeat(80)}\n\n`;
  
  // Statistics
  const totalRooms = rooms.length;
  const roomsWithExits = rooms.filter(r => r.exits && r.exits.length > 0);
  const roomsWithoutExits = rooms.filter(r => !r.exits || r.exits.length === 0);
  const movementLogRooms = rooms.filter(r => r.metadata?.originalFormat === 'movement-log');
  const totalExits = rooms.reduce((sum, r) => sum + (r.exits?.length || 0), 0);
  
  report += `STATISTICS\n`;
  report += `${'-'.repeat(80)}\n`;
  report += `Total Rooms: ${totalRooms}\n`;
  report += `Rooms with Exits: ${roomsWithExits.length} (${((roomsWithExits.length/totalRooms)*100).toFixed(1)}%)\n`;
  report += `Rooms without Exits: ${roomsWithoutExits.length} (${((roomsWithoutExits.length/totalRooms)*100).toFixed(1)}%)\n`;
  report += `Movement-Log Rooms: ${movementLogRooms.length}\n`;
  report += `Total Exits: ${totalExits}\n`;
  report += `Average Exits per Room: ${(totalExits / totalRooms).toFixed(2)}\n`;
  report += `\n${'='.repeat(80)}\n\n`;

  // Rooms without exits
  if (roomsWithoutExits.length > 0) {
    report += `ROOMS WITHOUT EXITS (${roomsWithoutExits.length})\n`;
    report += `${'-'.repeat(80)}\n`;
    for (const room of roomsWithoutExits) {
      report += `  - ${room.title}\n`;
      report += `    ID: ${room.id}\n`;
    }
    report += `\n${'='.repeat(80)}\n\n`;
  }

  // Rooms with special exits
  const roomsWithSpecialExits = rooms.filter(r => 
    r.exits && r.exits.some(e => e.direction && e.direction.startsWith('go '))
  );
  
  if (roomsWithSpecialExits.length > 0) {
    report += `ROOMS WITH SPECIAL EXITS (${roomsWithSpecialExits.length})\n`;
    report += `${'-'.repeat(80)}\n`;
    for (const room of roomsWithSpecialExits) {
      const specialExits = room.exits.filter(e => e.direction && e.direction.startsWith('go '));
      report += `  ${room.title}\n`;
      for (const exit of specialExits) {
        const toRoom = roomMap.get(exit.roomId);
        report += `    ${exit.direction} -> ${toRoom ? toRoom.title : exit.roomId}\n`;
      }
    }
    report += `\n${'='.repeat(80)}\n\n`;
  }

  // All rooms with their exits
  report += `ALL ROOMS AND EXITS\n`;
  report += `${'-'.repeat(80)}\n`;
  
  for (const room of rooms) {
    report += `\n[${room.title}]\n`;
    report += `  ID: ${room.id}\n`;
    
    if (room.exits && room.exits.length > 0) {
      report += `  Exits (${room.exits.length}):\n`;
      for (const exit of room.exits) {
        if (!exit.roomId || !exit.direction) continue;
        const toRoom = roomMap.get(exit.roomId);
        const toTitle = toRoom ? toRoom.title : exit.roomId;
        report += `    ${(exit.direction || 'unknown').padEnd(15)} -> ${toTitle}\n`;
      }
    } else {
      report += `  Exits: NONE ⚠️\n`;
    }
  }

  await fs.writeFile(outputPath, report, 'utf8');
  console.log(`Text report written to: ${outputPath}`);
}

/**
 * Generate HTML visualization
 */
async function generateHtmlVisualization(areaId, outputPath, db) {
  if (!db) {
    db = await databaseManager.initialize();
  }
  
  const rooms = await db.collection('rooms')
    .find({ areaId })
    .project({ id: 1, title: 1, exits: 1, 'metadata.originalFormat': 1, _id: 0 })
    .toArray();

  const roomMap = new Map(rooms.map(r => [r.id, r]));
  
  const totalRooms = rooms.length;
  const roomsWithExits = rooms.filter(r => r.exits && r.exits.length > 0);
  const roomsWithoutExits = rooms.filter(r => !r.exits || r.exits.length === 0);
  const totalExits = rooms.reduce((sum, r) => sum + (r.exits?.length || 0), 0);

  let html = `<!DOCTYPE html>
<html>
<head>
  <title>Room Map: ${areaId}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 20px;
      background: #f5f5f5;
    }
    .stats {
      background: white;
      padding: 15px;
      border-radius: 5px;
      margin-bottom: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .stat {
      display: inline-block;
      margin-right: 30px;
    }
    .stat-value {
      font-size: 24px;
      font-weight: bold;
      color: #2196F3;
    }
    .stat-label {
      font-size: 12px;
      color: #666;
    }
    .room {
      background: white;
      border: 2px solid #ddd;
      border-radius: 5px;
      padding: 15px;
      margin-bottom: 15px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .room.no-exits {
      border-color: #f44336;
      background: #ffebee;
    }
    .room.few-exits {
      border-color: #ff9800;
      background: #fff3e0;
    }
    .room.many-exits {
      border-color: #4caf50;
      background: #e8f5e9;
    }
    .room-title {
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 10px;
      color: #333;
    }
    .room-id {
      font-size: 12px;
      color: #666;
      margin-bottom: 10px;
    }
    .exits {
      margin-top: 10px;
    }
    .exit {
      display: inline-block;
      background: #e3f2fd;
      border: 1px solid #90caf9;
      border-radius: 3px;
      padding: 5px 10px;
      margin: 5px;
      font-size: 13px;
    }
    .exit.special {
      background: #fff9c4;
      border-color: #fbc02d;
    }
    .no-exits {
      color: #f44336;
      font-weight: bold;
    }
    .filter {
      margin-bottom: 20px;
      background: white;
      padding: 15px;
      border-radius: 5px;
    }
    input[type="text"] {
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 3px;
      width: 300px;
    }
  </style>
</head>
<body>
  <h1>Room Map: ${areaId}</h1>
  
  <div class="stats">
    <div class="stat">
      <div class="stat-value">${totalRooms}</div>
      <div class="stat-label">Total Rooms</div>
    </div>
    <div class="stat">
      <div class="stat-value">${roomsWithExits.length}</div>
      <div class="stat-label">With Exits</div>
    </div>
    <div class="stat">
      <div class="stat-value">${roomsWithoutExits.length}</div>
      <div class="stat-label">Without Exits</div>
    </div>
    <div class="stat">
      <div class="stat-value">${totalExits}</div>
      <div class="stat-label">Total Exits</div>
    </div>
    <div class="stat">
      <div class="stat-value">${(totalExits / totalRooms).toFixed(2)}</div>
      <div class="stat-label">Avg Exits/Room</div>
    </div>
  </div>

  <div class="filter">
    <input type="text" id="filterInput" placeholder="Filter rooms by name..." onkeyup="filterRooms()">
    <button onclick="showAll()">Show All</button>
    <button onclick="showNoExits()">Show Only No Exits</button>
    <button onclick="showSpecialExits()">Show Only Special Exits</button>
  </div>

  <div id="rooms">
`;

  for (const room of rooms) {
    const exitCount = room.exits ? room.exits.length : 0;
    let roomClass = 'room ';
    if (exitCount === 0) {
      roomClass += 'no-exits';
    } else if (exitCount < 2) {
      roomClass += 'few-exits';
    } else {
      roomClass += 'many-exits';
    }

    html += `    <div class="${roomClass}" data-title="${room.title.toLowerCase()}">\n`;
    html += `      <div class="room-title">${room.title}</div>\n`;
    html += `      <div class="room-id">${room.id}</div>\n`;
    
    if (room.exits && room.exits.length > 0) {
      html += `      <div class="exits">\n`;
      for (const exit of room.exits) {
        const toRoom = roomMap.get(exit.roomId);
        const toTitle = toRoom ? toRoom.title : exit.roomId;
        const isSpecial = exit.direction && exit.direction.startsWith('go ');
        const exitClass = isSpecial ? 'exit special' : 'exit';
        html += `        <span class="${exitClass}" title="To: ${toTitle}">${exit.direction}</span>\n`;
      }
      html += `      </div>\n`;
    } else {
      html += `      <div class="no-exits">⚠️ No Exits</div>\n`;
    }
    
    html += `    </div>\n`;
  }

  html += `  </div>

  <script>
    function filterRooms() {
      const input = document.getElementById('filterInput');
      const filter = input.value.toLowerCase();
      const rooms = document.querySelectorAll('.room');
      
      rooms.forEach(room => {
        const title = room.getAttribute('data-title');
        if (title.includes(filter)) {
          room.style.display = 'block';
        } else {
          room.style.display = 'none';
        }
      });
    }
    
    function showAll() {
      document.querySelectorAll('.room').forEach(r => r.style.display = 'block');
      document.getElementById('filterInput').value = '';
    }
    
    function showNoExits() {
      document.querySelectorAll('.room').forEach(r => {
        if (r.classList.contains('no-exits')) {
          r.style.display = 'block';
        } else {
          r.style.display = 'none';
        }
      });
      document.getElementById('filterInput').value = '';
    }
    
    function showSpecialExits() {
      document.querySelectorAll('.room').forEach(r => {
        const hasSpecial = r.querySelector('.exit.special');
        if (hasSpecial) {
          r.style.display = 'block';
        } else {
          r.style.display = 'none';
        }
      });
      document.getElementById('filterInput').value = '';
    }
  </script>
</body>
</html>`;

  await fs.writeFile(outputPath, html, 'utf8');
  console.log(`HTML visualization written to: ${outputPath}`);
  console.log(`Open in browser: ${outputPath}`);
}

async function main() {
  const argv = process.argv.slice(2);
  const areaIdx = argv.indexOf('--area');
  const formatIdx = argv.indexOf('--format');
  const outputIdx = argv.indexOf('--output');

  if (areaIdx === -1 || !argv[areaIdx + 1]) {
    console.error('Usage: node src/scripts/visualize-rooms.js --area <area-id> [--format dot|html|text|all] [--output <path>]');
    process.exit(1);
  }

  const areaId = argv[areaIdx + 1];
  const format = formatIdx >= 0 && argv[formatIdx + 1] ? argv[formatIdx + 1] : 'all';
  const outputDir = outputIdx >= 0 && argv[outputIdx + 1] ? argv[outputIdx + 1] : '/home/greg/gs3/tmp';

  await fs.mkdir(outputDir, { recursive: true });

  const basePath = path.join(outputDir, `room-visualization-${areaId}-${Date.now()}`);

  // Initialize database once for all formats
  const db = await databaseManager.initialize();

  try {
    if (format === 'all' || format === 'dot') {
      await generateDotGraph(areaId, `${basePath}.dot`, db);
    }

    if (format === 'all' || format === 'html') {
      await generateHtmlVisualization(areaId, `${basePath}.html`, db);
    }

    if (format === 'all' || format === 'text') {
      await generateTextReport(areaId, `${basePath}.txt`, db);
    }

    console.log('\n✅ Visualization complete!');
  } finally {
    await databaseManager.client.close();
  }
}

if (require.main === module) {
  main().catch(err => { console.error(err); process.exit(1); });
}

module.exports = { generateDotGraph, generateTextReport, generateHtmlVisualization };

