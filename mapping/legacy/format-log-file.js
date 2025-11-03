'use strict';

const fs = require('fs').promises;
const path = require('path');

/**
 * Format Gemstone log file by adding newline before each '['
 * This makes room titles easier to parse
 */
async function formatLogFile(inputFile) {
  try {
    // Read the input file
    const content = await fs.readFile(inputFile, 'utf8');
    
    // Add newline before each '[' bracket
    const formatted = content.replace(/(.)\[/g, '$1\n[');
    
    // Write back to the same file
    await fs.writeFile(inputFile, formatted, 'utf8');
    
    const lineCount = formatted.split('\n').length;
    console.log(`✅ Formatted log file: ${inputFile}`);
    console.log(`   Lines: ${lineCount}`);
  } catch (error) {
    console.error(`Error formatting file: ${error.message}`);
    process.exit(1);
  }
}

// Command line usage
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.error('Usage: node format-log-file.js <log-file>');
    console.error('Example: node format-log-file.js tmp/Gemstone\\ Log\\ 10-30-2025\\ \\(1\\).Txt');
    process.exit(1);
  }
  
  const inputFile = args[0];
  
  if (!path.isAbsolute(inputFile)) {
    // Resolve relative to project root
    const filePath = path.join(__dirname, '../../', inputFile);
    formatLogFile(filePath);
  } else {
    formatLogFile(inputFile);
  }
}

module.exports = { formatLogFile };

