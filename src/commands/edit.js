'use strict';

/**
 * Edit Command (Admin Only)
 * Edits properties of the item in the admin's right hand
 * 
 * Usage:
 *   edit name "new name"
 *   edit desc "new description"
 *   edit type CONTAINER
 *   edit container capacity <number>
 *   edit container maxItems <number>
 *   edit metadata <key> <value>
 *   edit keywords add <keyword>
 *   edit keywords remove <keyword>
 */
module.exports = {
  name: 'edit',
  aliases: ['modify'],
  description: 'Edit properties of the item in your right hand (Admin only)',
  usage: 'edit <property> <value>\r\nExamples:\r\n  edit name "new name"\r\n  edit desc "new description"\r\n  edit type CONTAINER\r\n  edit container capacity 50\r\n  edit container maxItems 20',
  
  async execute(player, args) {
    if (!player.gameEngine || !player.gameEngine.roomSystem || !player.gameEngine.roomSystem.db) {
      return { success: false, message: 'Database not available.\r\n' };
    }

    const db = player.gameEngine.roomSystem.db;
    
    // Always refresh player from DB first so role changes take effect immediately
    try {
      let fresh = await db.collection('players').findOne({ name: player.name });
      if (!fresh) {
        fresh = await db.collection('players').findOne({ name: { $regex: `^${player.name}$`, $options: 'i' } });
      }
      if (!fresh && player.id) {
        fresh = await db.collection('players').findOne({ id: player.id });
      }
      if (fresh && fresh.role) {
        player.role = fresh.role;
      }
    } catch (e) {
      // ignore reload errors; fall back to in-memory role
    }

    // Permission check after refresh
    if (player.role !== 'admin') {
      return { success: false, message: 'You are not authorized to use this command.\r\n' };
    }

    // Check if player has an item in right hand
    const itemId = player.equipment?.rightHand;
    if (!itemId) {
      return { success: false, message: 'You must be holding an item in your right hand to edit it.\r\n' };
    }

    // Fetch the item from database
    const item = await db.collection('items').findOne({ id: itemId });
    if (!item) {
      return { success: false, message: `Item not found in database: ${itemId}\r\n` };
    }

    if (args.length === 0) {
      return {
        success: false,
        message: '╔══════════════════════════════════════════════════════════════╗\r\n' +
                 '║                    EDIT COMMAND HELP                        ║\r\n' +
                 '╚══════════════════════════════════════════════════════════════╝\r\n' +
                 `Currently editing: ${item.name || itemId}\r\n` +
                 `Item ID: ${itemId}\r\n` +
                 `Current type: ${item.type || 'UNKNOWN'}\r\n\r\n` +
                 'Available properties to edit:\r\n\r\n' +
                 '  NAME & DESCRIPTION:\r\n' +
                 '    edit name "new item name"\r\n' +
                 '    edit desc "new description text"\r\n\r\n' +
                 '  TYPE:\r\n' +
                 '    edit type CONTAINER\r\n' +
                 '    edit type WEAPON\r\n' +
                 '    edit type ARMOR\r\n' +
                 '    (Valid: WEAPON, ARMOR, SHIELD, CONTAINER, CONSUMABLE, MISC, TREASURE, EXIT)\r\n\r\n' +
                 '  CONTAINER PROPERTIES:\r\n' +
                 '    edit container capacity <number>     (weight capacity in lbs)\r\n' +
                 '    edit container maxItems <number>     (max number of items)\r\n' +
                 '    Example: edit container capacity 50\r\n' +
                 '    Example: edit container maxItems 25\r\n\r\n' +
                 '  METADATA:\r\n' +
                 '    edit metadata <key> <value>\r\n' +
                 '    Example: edit metadata weight 5\r\n' +
                 '    Example: edit metadata value 100\r\n' +
                 '    Example: edit metadata material "steel"\r\n\r\n' +
                 '  KEYWORDS:\r\n' +
                 '    edit keywords add <keyword>\r\n' +
                 '    edit keywords remove <keyword>\r\n' +
                 '    Example: edit keywords add "magical"\r\n' +
                 '    Example: edit keywords remove "old"\r\n\r\n' +
                 'Note: You must be holding the item in your RIGHT HAND.\r\n\r\n' +
                 'IMPORTANT: This is NOT an interactive mode. Each "edit" command executes\r\n' +
                 'immediately and returns. You can use other commands (like "look", "inv", etc.)\r\n' +
                 'normally after editing. There is no "edit mode" to exit from.\r\n'
      };
    }

    const property = args[0].toLowerCase();
    
    // Handle common "exit mode" attempts
    if (property === 'done' || property === 'exit' || property === 'quit' || property === 'cancel') {
      return {
        success: false,
        message: 'There is no "edit mode" to exit from. The edit command executes immediately\r\n' +
                 'and returns. You can use other commands normally after editing.\r\n' +
                 'Type "edit" without arguments to see help, or just use other commands.\r\n'
      };
    }
    
    const update = {};
    let message = '';

    try {
      if (property === 'name') {
        // edit name "new name"
        const newName = args.slice(1).join(' ').trim();
        if (!newName) {
          return { 
            success: false, 
            message: 'Usage: edit name "new name"\r\n' +
                     'Example: edit name "a magical sword"\r\n' +
                     'Example: edit name "a leather backpack"\r\n' +
                     'Note: Quotes are optional but recommended for multi-word names.\r\n'
          };
        }
        // Remove quotes if present
        const cleanName = newName.replace(/^["']|["']$/g, '');
        update.name = cleanName;
        message = `Updated name to: ${cleanName}\r\n`;

      } else if (property === 'desc' || property === 'description') {
        // edit desc "new description"
        const newDesc = args.slice(1).join(' ').trim();
        if (!newDesc) {
          return { 
            success: false, 
            message: 'Usage: edit desc "new description"\r\n' +
                     'Example: edit desc "A sword that glows with inner light."\r\n' +
                     'Example: edit desc "This backpack has many hidden compartments."\r\n' +
                     'Note: Quotes are optional but recommended for multi-word descriptions.\r\n'
          };
        }
        // Remove quotes if present
        const cleanDesc = newDesc.replace(/^["']|["']$/g, '');
        update.description = cleanDesc;
        message = `Updated description.\r\n`;

      } else if (property === 'type') {
        // edit type CONTAINER
        const newType = args[1]?.toUpperCase();
        const validTypes = ['WEAPON', 'ARMOR', 'SHIELD', 'CONTAINER', 'CONSUMABLE', 'MISC', 'TREASURE', 'EXIT'];
        if (!newType || !validTypes.includes(newType)) {
          return { 
            success: false, 
            message: `Usage: edit type <TYPE>\r\n\r\n` +
                     `Valid types: ${validTypes.join(', ')}\r\n\r\n` +
                     'Examples:\r\n' +
                     '  edit type CONTAINER\r\n' +
                     '  edit type WEAPON\r\n' +
                     '  edit type ARMOR\r\n' +
                     '  edit type MISC\r\n\r\n' +
                     `Current type: ${item.type || 'UNKNOWN'}\r\n`
          };
        }
        update.type = newType;
        message = `Updated type to: ${newType}\r\n`;

      } else if (property === 'container' && args[1]) {
        const containerProp = args[1].toLowerCase();
        
        if (containerProp === 'capacity') {
          // edit container capacity <number>
          const capacity = parseInt(args[2], 10);
          if (isNaN(capacity) || capacity < 0) {
            return { 
              success: false, 
              message: 'Usage: edit container capacity <number>\r\n\r\n' +
                       'Examples:\r\n' +
                       '  edit container capacity 50    (50 lbs capacity)\r\n' +
                       '  edit container capacity 100   (100 lbs capacity)\r\n' +
                       '  edit container capacity 5     (5 lbs capacity)\r\n\r\n' +
                       'Note: Capacity is the maximum weight (in pounds) the container can hold.\r\n' +
                       `Current capacity: ${item.metadata?.container?.capacity || 'not set'}\r\n`
            };
          }
          update['metadata.container'] = {
            ...(item.metadata?.container || {}),
            capacity: capacity
          };
          // Also ensure container flag is set
          if (!item.metadata?.container) {
            update['metadata.container'] = { capacity: capacity };
          }
          message = `Updated container capacity to: ${capacity} lbs\r\n`;

        } else if (containerProp === 'maxitems' || containerProp === 'max_items') {
          // edit container maxItems <number>
          const maxItems = parseInt(args[2], 10);
          if (isNaN(maxItems) || maxItems < 0) {
            return { 
              success: false, 
              message: 'Usage: edit container maxItems <number>\r\n\r\n' +
                       'Examples:\r\n' +
                       '  edit container maxItems 25    (can hold 25 items)\r\n' +
                       '  edit container maxItems 10    (can hold 10 items)\r\n' +
                       '  edit container maxItems 50    (can hold 50 items)\r\n\r\n' +
                       'Note: maxItems is the maximum number of items the container can hold.\r\n' +
                       `Current maxItems: ${item.metadata?.maxItems || 'not set'}\r\n`
            };
          }
          update['metadata.maxItems'] = maxItems;
          message = `Updated container maxItems to: ${maxItems}\r\n`;

        } else {
          return { 
            success: false, 
            message: 'Usage: edit container <property> <value>\r\n\r\n' +
                     'Valid container properties:\r\n' +
                     '  • capacity <number> - Set weight capacity in pounds\r\n' +
                     '    Example: edit container capacity 50\r\n\r\n' +
                     '  • maxItems <number> - Set maximum number of items\r\n' +
                     '    Example: edit container maxItems 25\r\n\r\n' +
                     'Note: The item must be type CONTAINER for these properties to work.\r\n'
          };
        }

      } else if (property === 'metadata' && args.length >= 3) {
        // edit metadata <key> <value>
        const key = args[1];
        const value = args.slice(2).join(' ');
        
        if (!key) {
          return { 
            success: false, 
            message: 'Usage: edit metadata <key> <value>\r\n\r\n' +
                     'Examples:\r\n' +
                     '  edit metadata weight 5\r\n' +
                     '  edit metadata value 100\r\n' +
                     '  edit metadata material "steel"\r\n' +
                     '  edit metadata condition 100\r\n\r\n' +
                     'Note: Numbers and booleans are automatically detected.\r\n'
          };
        }
        
        // Try to parse as number if it looks like one
        let parsedValue = value;
        if (/^-?\d+$/.test(value)) {
          parsedValue = parseInt(value, 10);
        } else if (/^-?\d*\.\d+$/.test(value)) {
          parsedValue = parseFloat(value);
        } else if (value.toLowerCase() === 'true') {
          parsedValue = true;
        } else if (value.toLowerCase() === 'false') {
          parsedValue = false;
        }
        
        update[`metadata.${key}`] = parsedValue;
        message = `Updated metadata.${key} to: ${parsedValue} (${typeof parsedValue})\r\n`;

      } else if (property === 'keywords') {
        // edit keywords add <keyword> OR edit keywords remove <keyword>
        if (args.length < 3) {
          return { 
            success: false, 
            message: 'Usage: edit keywords <action> <keyword>\r\n\r\n' +
                     'Actions:\r\n' +
                     '  • add <keyword> - Add a new keyword\r\n' +
                     '    Example: edit keywords add "magical"\r\n' +
                     '    Example: edit keywords add "sword"\r\n\r\n' +
                     '  • remove <keyword> - Remove an existing keyword\r\n' +
                     '    Example: edit keywords remove "old"\r\n\r\n' +
                     `Current keywords: ${(item.keywords || []).length > 0 ? item.keywords.join(', ') : 'none'}\r\n`
          };
        }
        
        const action = args[1].toLowerCase();
        const keyword = args.slice(2).join(' ');
        
        const currentKeywords = item.keywords || [];
        
        if (action === 'add') {
          if (currentKeywords.includes(keyword)) {
            return { 
              success: false, 
              message: `Keyword "${keyword}" already exists.\r\n` +
                       `Current keywords: ${currentKeywords.join(', ')}\r\n`
            };
          }
          update.keywords = [...currentKeywords, keyword];
          message = `Added keyword: ${keyword}\r\n` +
                    `All keywords: ${update.keywords.join(', ')}\r\n`;
        } else if (action === 'remove') {
          if (!currentKeywords.includes(keyword)) {
            return { 
              success: false, 
              message: `Keyword "${keyword}" not found.\r\n` +
                       `Current keywords: ${currentKeywords.length > 0 ? currentKeywords.join(', ') : 'none'}\r\n`
            };
          }
          update.keywords = currentKeywords.filter(k => k !== keyword);
          message = `Removed keyword: ${keyword}\r\n` +
                    `Remaining keywords: ${update.keywords.length > 0 ? update.keywords.join(', ') : 'none'}\r\n`;
        } else {
          return { 
            success: false, 
            message: 'Usage: edit keywords <action> <keyword>\r\n\r\n' +
                     'Valid actions: add, remove\r\n' +
                     'Examples:\r\n' +
                     '  edit keywords add "magical"\r\n' +
                     '  edit keywords remove "old"\r\n'
          };
        }

      } else {
        return {
          success: false,
          message: `Unknown property: "${property}"\r\n\r\n` +
                   'Valid properties:\r\n' +
                   '  • name - Change item name\r\n' +
                   '    Example: edit name "a magical sword"\r\n\r\n' +
                   '  • desc - Change item description\r\n' +
                   '    Example: edit desc "A sword that glows in the dark."\r\n\r\n' +
                   '  • type - Change item type\r\n' +
                   '    Example: edit type CONTAINER\r\n' +
                   '    Valid types: WEAPON, ARMOR, SHIELD, CONTAINER, CONSUMABLE, MISC, TREASURE, EXIT\r\n\r\n' +
                   '  • container capacity - Set container weight capacity\r\n' +
                   '    Example: edit container capacity 50\r\n\r\n' +
                   '  • container maxItems - Set container max item count\r\n' +
                   '    Example: edit container maxItems 25\r\n\r\n' +
                   '  • metadata <key> <value> - Set metadata field\r\n' +
                   '    Example: edit metadata weight 5\r\n' +
                   '    Example: edit metadata material "steel"\r\n\r\n' +
                   '  • keywords add <keyword> - Add a keyword\r\n' +
                   '    Example: edit keywords add "magical"\r\n\r\n' +
                   '  • keywords remove <keyword> - Remove a keyword\r\n' +
                   '    Example: edit keywords remove "old"\r\n\r\n' +
                   `Type "edit" without arguments to see full help.\r\n`
        };
      }

      // Apply the update to the database
      if (Object.keys(update).length > 0) {
        await db.collection('items').updateOne(
          { id: itemId },
          { $set: update }
        );
        
        // Reload the item to show current state
        const updatedItem = await db.collection('items').findOne({ id: itemId });
        
        return {
          success: true,
          message: message + `Item updated: ${updatedItem.name || itemId}\r\n`
        };
      }

    } catch (error) {
      console.error('Edit command error:', error);
      return { success: false, message: `Error updating item: ${error.message}\r\n` };
    }

    return { success: false, message: 'No changes made.\r\n' };
  }
};

