'use strict';

/**
 * List Command (Admin Only)
 * Lists available item templates
 * Usage: LIST WEAPONS | LIST ARMOR | LIST SHIELDS | LIST CONTAINERS
 */
const BASE_WEAPONS = require('../data/base-weapons');
const BASE_ARMOR = require('../data/base-armor');
const BASE_SHIELDS = require('../data/base-shields');
const BASE_CONTAINERS = require('../data/base-containers');

module.exports = {
  name: 'list',
  aliases: ['ls'],
  description: 'List available item templates (Admin only)',
  usage: 'list <type>',
  
  execute(player, args) {
    // Check admin access
    if (player.role !== 'admin') {
      return { 
        success: false, 
        message: 'You are not authorized to use this command.\r\n' 
      };
    }
    
    const listType = args.trim().toLowerCase();
    
    let items = [];
    let title = '';
    
    if (listType === 'weapons' || listType === 'weapon') {
      title = 'Available Weapon Templates:';
      items = Object.entries(BASE_WEAPONS).map(([key, def]) => ({
        name: def.name,
        key: key.replace(/^weapon_/, ''),
        type: def.type
      }));
    } else if (listType === 'armor' || listType === 'armors') {
      title = 'Available Armor Templates:';
      items = Object.entries(BASE_ARMOR).map(([key, def]) => ({
        name: def.name,
        key: key.replace(/^armor_/, ''),
        asg: def.asg
      }));
    } else if (listType === 'shields' || listType === 'shield') {
      title = 'Available Shield Templates:';
      items = Object.entries(BASE_SHIELDS).map(([key, def]) => ({
        name: def.name,
        key: key.replace(/^shield_/, ''),
        size: def.size
      }));
    } else if (listType === 'containers' || listType === 'container') {
      title = 'Available Container Templates:';
      items = Object.entries(BASE_CONTAINERS).map(([key, def]) => ({
        name: def.name,
        key: key
      }));
    } else {
      return {
        success: false,
        message: 'Usage: LIST <type>\r\nTypes: weapon, armor, shield, container\r\n'
      };
    }
    
    let output = `${title}\r\n\r\n`;
    
    items.forEach((item, idx) => {
      let line = `${idx + 1}. ${item.name}`;
      if (item.key) {
        line += ` (${item.key})`;
      }
      if (item.type) {
        line += ` [${item.type}]`;
      }
      if (item.asg) {
        line += ` ASG:${item.asg}`;
      }
      if (item.size) {
        line += ` [${item.size}]`;
      }
      line += '\r\n';
      output += line;
    });
    
    return {
      success: true,
      message: output
    };
  }
};
