'use strict';

/**
 * Inventory Slot System
 * Manages the Gemstone3-style inventory system with specific slots and limits
 */
class InventorySlotSystem {
  constructor() {
    this.slots = {
      alongside: {
        name: 'Alongside (At Feet)',
        functionalSlots: 1,
        totalSlots: 1,
        canTuck: false,
        messaging: 'placed alongside you',
        items: []
      },
      general: {
        name: 'General (Pin-worn)',
        functionalSlots: 8,
        totalSlots: 20,
        canTuck: true,
        messaging: 'put on',
        items: []
      },
      back: {
        name: 'Back',
        functionalSlots: 1,
        totalSlots: 2,
        canTuck: true,
        messaging: 'put on',
        items: []
      },
      waist: {
        name: 'Waist',
        functionalSlots: 1,
        totalSlots: 3,
        canTuck: false,
        messaging: 'put around',
        items: []
      },
      head: {
        name: 'Head',
        functionalSlots: 1,
        totalSlots: 2,
        canTuck: false,
        messaging: 'put on',
        items: []
      },
      shoulder: {
        name: 'Shoulder (Slung Over)',
        functionalSlots: 2,
        totalSlots: 2,
        canTuck: true,
        messaging: 'slung over',
        items: []
      },
      shoulders: {
        name: 'Shoulders (Draped From)',
        functionalSlots: 1,
        totalSlots: 2,
        canTuck: false,
        messaging: 'draped from',
        items: []
      },
      legsPulled: {
        name: 'Legs (Pulled Over)',
        functionalSlots: 1,
        totalSlots: 1,
        canTuck: false,
        messaging: 'pulled over',
        items: []
      },
      torso: {
        name: 'Torso',
        functionalSlots: 1,
        totalSlots: 3,
        canTuck: false,
        messaging: 'worked into',
        items: []
      },
      wrist: {
        name: 'Wrist',
        functionalSlots: 4,
        totalSlots: 8,
        canTuck: true,
        messaging: 'attached to',
        items: []
      },
      finger: {
        name: 'Finger',
        functionalSlots: 4,
        totalSlots: 10,
        canTuck: true,
        messaging: 'slid onto',
        items: []
      },
      feetPutOn: {
        name: 'Feet (Put On)',
        functionalSlots: 1,
        totalSlots: 1,
        canTuck: false,
        messaging: 'put on',
        items: []
      },
      neck: {
        name: 'Neck',
        functionalSlots: 5,
        totalSlots: 10,
        canTuck: true,
        messaging: 'hung around',
        items: []
      },
      belt: {
        name: 'Belt',
        functionalSlots: 3,
        totalSlots: 5,
        canTuck: false,
        messaging: 'attached to',
        items: []
      },
      arms: {
        name: 'Arms',
        functionalSlots: 1,
        totalSlots: 2,
        canTuck: false,
        messaging: 'attached to',
        items: []
      },
      legsAttached: {
        name: 'Legs (Attached To)',
        functionalSlots: 1,
        totalSlots: 2,
        canTuck: false,
        messaging: 'attached to',
        items: []
      },
      earlobe: {
        name: 'Earlobe',
        functionalSlots: 1,
        totalSlots: 3,
        canTuck: true,
        messaging: 'hung from',
        items: []
      },
      earlobes: {
        name: 'Earlobes',
        functionalSlots: 1,
        totalSlots: 3,
        canTuck: true,
        messaging: 'hung from',
        items: []
      },
      ankle: {
        name: 'Ankle',
        functionalSlots: 1,
        totalSlots: 3,
        canTuck: true,
        messaging: 'attached to',
        items: []
      },
      front: {
        name: 'Front',
        functionalSlots: 1,
        totalSlots: 2,
        canTuck: false,
        messaging: 'put over',
        items: []
      },
      hands: {
        name: 'Hands',
        functionalSlots: 1,
        totalSlots: 2,
        canTuck: false,
        messaging: 'slipped over',
        items: []
      },
      feetSlipOn: {
        name: 'Feet (Slip On)',
        functionalSlots: 1,
        totalSlots: 3,
        canTuck: true,
        messaging: 'slip on',
        items: []
      },
      hair: {
        name: 'Hair',
        functionalSlots: 1,
        totalSlots: 2,
        canTuck: true,
        messaging: 'put in',
        items: []
      },
      undershirt: {
        name: 'Undershirt',
        functionalSlots: 1,
        totalSlots: 1,
        canTuck: true,
        messaging: 'slips into',
        items: []
      },
      leggings: {
        name: 'Leggings',
        functionalSlots: 1,
        totalSlots: 1,
        canTuck: true,
        messaging: 'slips into',
        items: []
      }
    };
    
    // Hands (held items)
    this.hands = {
      right: null,
      left: null
    };
  }

  /**
   * Get slot information
   */
  getSlot(slotName) {
    return this.slots[slotName];
  }

  /**
   * Get all slots
   */
  getAllSlots() {
    return this.slots;
  }

  /**
   * Check if an item can be worn in a slot
   */
  canWear(slotName, item, isFunctional = true) {
    const slot = this.slots[slotName];
    if (!slot) return false;

    if (isFunctional) {
      const functionalCount = slot.items.filter(item => !item.tucked).length;
      return functionalCount < slot.functionalSlots;
    } else {
      return slot.items.length < slot.totalSlots;
    }
  }

  /**
   * Wear an item
   */
  wear(slotName, item, isFunctional = true) {
    const slot = this.slots[slotName];
    if (!slot) return { success: false, message: 'Invalid slot' };

    if (!this.canWear(slotName, item, isFunctional)) {
      return { success: false, message: 'Cannot wear item in that slot' };
    }

    const itemData = {
      id: item.id,
      name: item.name,
      type: item.type || 'misc',
      functional: isFunctional,
      tucked: false,
      metadata: item.metadata || {}
    };

    slot.items.push(itemData);
    return { success: true, message: `You ${slot.messaging} ${item.name}.` };
  }

  /**
   * Remove an item from a slot
   */
  remove(slotName, itemId) {
    const slot = this.slots[slotName];
    if (!slot) return { success: false, message: 'Invalid slot' };

    const index = slot.items.findIndex(item => item.id === itemId);
    if (index === -1) {
      return { success: false, message: 'Item not found' };
    }

    const item = slot.items.splice(index, 1)[0];
    return { success: true, message: `You remove ${item.name}.`, item };
  }

  /**
   * Get all worn items
   */
  getWornItems() {
    const worn = [];
    for (const slotName in this.slots) {
      const slot = this.slots[slotName];
      worn.push(...slot.items.map(item => ({
        ...item,
        slot: slotName,
        slotName: slot.name
      })));
    }
    return worn;
  }

  /**
   * Get held items
   */
  getHeldItems() {
    const held = [];
    if (this.hands.right) {
      held.push({ ...this.hands.right, hand: 'right' });
    }
    if (this.hands.left) {
      held.push({ ...this.hands.left, hand: 'left' });
    }
    return held;
  }

  /**
   * Hold an item
   */
  hold(item, hand = 'right') {
    if (this.hands[hand]) {
      return { success: false, message: `Your ${hand} hand is already holding something.` };
    }

    this.hands[hand] = {
      id: item.id,
      name: item.name,
      type: item.type || 'misc',
      metadata: item.metadata || {}
    };

    return { success: true, message: `You hold ${item.name} in your ${hand} hand.` };
  }

  /**
   * Drop an item from hands
   */
  drop(hand) {
    if (!this.hands[hand]) {
      return { success: false, message: `Your ${hand} hand is empty.` };
    }

    const item = this.hands[hand];
    this.hands[hand] = null;

    return { success: true, message: `You drop ${item.name}.`, item };
  }

  /**
   * Get total item count
   */
  getTotalCount() {
    let count = 0;
    
    // Count worn items
    for (const slotName in this.slots) {
      count += this.slots[slotName].items.length;
    }
    
    // Count held items
    if (this.hands.right) count++;
    if (this.hands.left) count++;
    
    return count;
  }

  /**
   * Check if 500 item limit is reached
   */
  isFull() {
    return this.getTotalCount() >= 500;
  }

  /**
   * Get inventory display in head-to-toe order
   */
  getInventoryDisplay(options = {}) {
    const { location = false, notuck = false, full = false, type = null } = options;
    
    const display = [];
    
    if (location) {
      // Display by location
      display.push('Inventory by Location:');
      display.push('');
      
      const order = [
        'head', 'hair', 'earlobe', 'earlobes',
        'shoulders', 'shoulder', 'neck',
        'torso', 'undershirt', 'front', 'back',
        'arms', 'hands', 'wrist',
        'belt', 'waist', 'back',
        'legsPulled', 'leggings', 'legsAttached', 'feetSlipOn', 'feetPutOn', 'ankle',
        'general', 'finger', 'alongside'
      ];
      
      for (const slotName of order) {
        const slot = this.slots[slotName];
        if (slot && slot.items.length > 0) {
          display.push(`${slot.name}:`);
          for (const item of slot.items) {
            if (notuck && item.tucked) continue;
            if (type && item.type !== type) continue;
            
            const prefix = item.tucked ? '  [tucked]' : '  ';
            let itemLine = `${prefix}${item.name}`;
            
            if (full && item.contents && item.contents.length > 0) {
              itemLine += ` (${item.contents.length} items)`;
            }
            
            display.push(itemLine);
          }
        }
      }
    } else {
      // Standard display
      const worn = this.getWornItems();
      const held = this.getHeldItems();
      
      if (worn.length > 0) {
        display.push('Worn:');
        for (const item of worn) {
          if (notuck && item.tucked) continue;
          if (type && item.type !== type) continue;
          
          const prefix = item.tucked ? '  [tucked]' : '';
          let itemLine = `${prefix}${item.name}`;
          
          if (full && item.contents && item.contents.length > 0) {
            itemLine += ` (${item.contents.length} items)`;
          }
          
          display.push(itemLine);
        }
      }
      
      if (held.length > 0) {
        display.push('');
        display.push('Held:');
        for (const item of held) {
          display.push(`  ${item.name} (${item.hand} hand)`);
        }
      }
    }
    
    return display.join('\r\n');
  }
}

module.exports = InventorySlotSystem;
