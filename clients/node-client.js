// gs3-client.js
const WebSocket = require('ws');
const readline = require('readline');

const ws = new WebSocket('ws://localhost:4000');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

ws.on('open', () => {
  console.log('Connected to GS3!\n');
  promptUser();
});

ws.on('message', (data) => {
  console.log('\n' + data.toString());
  promptUser();
});

ws.on('close', () => {
  console.log('\nDisconnected from server');
  process.exit(0);
});

ws.on('error', (error) => {
  console.error('WebSocket error:', error);
});

function promptUser() {
  rl.question('> ', (input) => {
    if (input.trim().toLowerCase() === 'quit') {
      ws.close();
      return;
    }
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(input);
    }
  });
}
