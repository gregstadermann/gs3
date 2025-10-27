'use strict';

/**
 * Argument Parser
 * Handles parsing of command arguments with dot notation
 * 
 * Examples:
 *   "sword" - finds first item matching "sword"
 *   "2.sword" - finds second item matching "sword"
 *   "room_items.123" - finds item by UUID
 */
class ArgParser {
  /**
   * Parse dot notation from user input
   * @param {string} search - Input like "2.sword" or "sword"
   * @param {Array|Iterable} list - Collection to search in
   * @param {boolean} returnKey - If list is a Map, return [key, value] tuple instead of just value
   * @return {*|null} Found item or null
   */
  static parseDot(search, list, returnKey = false) {
    if (!list || !search) {
      return null;
    }

    const parts = search.split('.');
    
    // Invalid if more than 2 parts (e.g., "2.3.4.sword")
    if (parts.length > 2) {
      return null;
    }

    let findNth = 1; // Which occurrence to find (e.g., 2 in "2.sword")
    let keyword = null;

    if (parts.length === 1) {
      // No dot notation - just search for keyword
      keyword = parts[0];
    } else {
      // Dot notation - parse number and keyword
      findNth = parseInt(parts[0], 10);
      if (isNaN(findNth) || findNth < 1) {
        return null;
      }
      keyword = parts[1];
    }

    let encountered = 0;

    // Convert to array if it's not
    const listArray = Array.isArray(list) ? list : Array.from(list);

    for (const entity of listArray) {
      let key, entry;
      
      // Handle Map entries [key, value]
      if (Array.isArray(entity) && entity.length === 2) {
        [key, entry] = entity;
      } else {
        entry = entity;
      }

      // Skip if entry doesn't have name or keywords
      if (!entry || (!entry.keywords && !entry.name)) {
        continue;
      }

      // Check keywords first (UUID or keyword match)
      if (entry.keywords) {
        if (entry.keywords.includes(keyword) || entry.uuid === keyword) {
          encountered++;
          if (encountered === findNth) {
            return returnKey ? [key, entry] : entry;
          }
          continue; // Don't double-count
        }
      }

      // Check name match (case-insensitive)
      if (entry.name && entry.name.toLowerCase().includes(keyword.toLowerCase())) {
        encountered++;
        if (encountered === findNth) {
          return returnKey ? [key, entry] : entry;
        }
      }
    }

    return null;
  }

  /**
   * Parse numeric arguments
   * @param {string} input - Input string like "3" or "all"
   * @return {number|null} Parsed number or null
   */
  static parseNumber(input) {
    if (!input || input.length === 0) {
      return null;
    }

    const lower = input.toLowerCase();
    
    // Check for "all"
    if (lower === 'all') {
      return Infinity;
    }

    // Try to parse as integer
    const num = parseInt(input, 10);
    return isNaN(num) ? null : num;
  }

  /**
   * Match an input string against multiple possible values
   * @param {string} input - User input
   * @param {Array|string} matches - Array of strings to match against or single string
   * @return {boolean}
   */
  static match(input, matches) {
    if (!input) {
      return false;
    }

    const lowerInput = input.toLowerCase();

    if (typeof matches === 'string') {
      return matches.toLowerCase() === lowerInput;
    }

    if (!Array.isArray(matches)) {
      return false;
    }

    return matches.some(m => {
      if (typeof m === 'string') {
        return m.toLowerCase() === lowerInput;
      }
      return false;
    });
  }

  /**
   * Parse direction from input
   * @param {string} input - Direction input
   * @return {string|null} Canonical direction name or null
   */
  static parseDirection(input) {
    if (!input) {
      return null;
    }

    const lower = input.toLowerCase();

    const directions = {
      // Primary directions
      'n': 'north',
      's': 'south',
      'e': 'east',
      'w': 'west',
      'u': 'up',
      'd': 'down',
      
      // Secondary directions
      'ne': 'northeast',
      'nw': 'northwest',
      'se': 'southeast',
      'sw': 'southwest',
      
      // Full names
      'north': 'north',
      'south': 'south',
      'east': 'east',
      'west': 'west',
      'up': 'up',
      'down': 'down',
      'northeast': 'northeast',
      'northwest': 'northwest',
      'southeast': 'southeast',
      'southwest': 'southwest'
    };

    return directions[lower] || null;
  }

  /**
   * Find partial match in list (fuzzy matching)
   * @param {string} search - Search term
   * @param {Array} list - List to search
   * @param {Function} nameExtractor - Function to extract name from item
   * @return {*} Matching item or null
   */
  static findPartial(search, list, nameExtractor = (item) => item.name || item) {
    if (!search || !list) {
      return null;
    }

    const lowerSearch = search.toLowerCase();

    // First try exact match
    for (const item of list) {
      const name = nameExtractor(item);
      if (name && name.toLowerCase() === lowerSearch) {
        return item;
      }
    }

    // Then try starts with
    for (const item of list) {
      const name = nameExtractor(item);
      if (name && name.toLowerCase().startsWith(lowerSearch)) {
        return item;
      }
    }

    // Finally try contains
    for (const item of list) {
      const name = nameExtractor(item);
      if (name && name.toLowerCase().includes(lowerSearch)) {
        return item;
      }
    }

    return null;
  }
}

module.exports = ArgParser;

