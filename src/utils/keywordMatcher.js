'use strict';

/**
 * Matches an item search term against item names and keywords
 * Supports partial matches and multi-word search terms
 * 
 * @param {Array} searchTerms - Array of search keywords (e.g., ['iron', 'chest'])
 * @param {Object} item - Item with name, keywords fields
 * @returns {boolean} - True if all search terms match
 */
function matchItemKeywords(searchTerms, item) {
  if (!searchTerms || searchTerms.length === 0) return false;
  
  const itemName = (item.name || '').toLowerCase();
  const itemKeywords = (item.keywords || []).map(k => k.toLowerCase());
  const allItemText = [itemName, ...itemKeywords].join(' ');
  
  // Check if all search terms appear somewhere in the item's text
  return searchTerms.every(term => {
    const searchLower = term.toLowerCase();
    return itemName.includes(searchLower) || 
           itemKeywords.some(kw => kw.includes(searchLower) || searchLower.includes(kw));
  });
}

/**
 * Filters a list of items to those that match the search keywords
 * 
 * @param {Array} items - List of items to filter
 * @param {string} searchTerm - User's search string (e.g., "iron chest")
 * @returns {Array} - Matching items
 */
function filterItemsByKeywords(items, searchTerm) {
  if (!searchTerm || !items) return [];
  
  const searchTerms = searchTerm.toLowerCase().split(/\s+/);
  
  return items.filter(item => matchItemKeywords(searchTerms, item));
}

/**
 * Handles "OTHER" keyword to reference the second item in a list
 * If OTHER is in the search term, it returns the second matching item instead of the first
 * 
 * @param {string} searchTerm - User's search string
 * @param {Array} items - List of items to search
 * @returns {Object|null} - The matching item, or null if not found
 */
function findItemWithOther(searchTerm, items) {
  if (!searchTerm || !items) return null;
  
  const searchLower = searchTerm.toLowerCase();
  const isOther = searchLower.includes(' other');
  
  // Remove "other" from search term if present
  const cleanSearchTerm = isOther ? searchTerm.replace(/\s*other\s*/i, '').trim() : searchTerm;
  
  // Filter matching items
  const searchTerms = cleanSearchTerm.toLowerCase().split(/\s+/);
  const matches = items.filter(item => matchItemKeywords(searchTerms, item));
  
  if (matches.length === 0) return null;
  
  // If "other" was used and we have at least 2 matches, return the second one
  // Otherwise return the first match
  if (isOther && matches.length >= 2) {
    return matches[1];
  }
  
  return matches[0];
}

module.exports = {
  matchItemKeywords,
  filterItemsByKeywords,
  findItemWithOther
};

