'use strict';

/**
 * Character Creation Manager
 * Handles step-by-step character creation process like gemstone3
 */
class CharacterCreationManager {
  constructor(characterCreation, playerSystem, accountManager) {
    this.characterCreation = characterCreation;
    this.playerSystem = playerSystem;
    this.accountManager = accountManager;
    this.creationStates = new Map(); // connection -> creation state
  }

  /**
   * Start character creation process
   */
  startCharacterCreation(connection, account) {
    this.creationStates.set(connection, {
      step: 'name',
      account: account,
      characterData: {
        name: '',
        gender: '',
        profession: '',
        race: '',
        attributes: {},
        skills: {},
        tps: [0, 0]
      }
    });

    this.showNameInput(connection);
  }

  /**
   * Process character creation input
   */
  async processCreationInput(connection, input) {
    const state = this.creationStates.get(connection);
    if (!state) {
      return { success: false, message: 'No character creation session found' };
    }

    const trimmedInput = input.trim();
    if (!trimmedInput) {
      return { success: false, message: 'Please enter a valid response' };
    }

    switch (state.step) {
      case 'name':
        return await this.handleNameInput(connection, trimmedInput);
      
      case 'name_confirm':
        return await this.handleNameConfirmation(connection, trimmedInput);
      
      case 'gender':
        return await this.handleGenderSelection(connection, trimmedInput);
      
      case 'gender_confirm':
        return await this.handleGenderConfirmation(connection, trimmedInput);
      
      case 'profession':
        return await this.handleProfessionSelection(connection, trimmedInput);
      
      case 'profession_confirm':
        return await this.handleProfessionConfirmation(connection, trimmedInput);
      
      case 'race':
        return await this.handleRaceSelection(connection, trimmedInput);
      
      case 'race_confirm':
        return await this.handleRaceConfirmation(connection, trimmedInput);
      
      case 'attributes':
        return await this.handleAttributeRolls(connection, trimmedInput);
      
      case 'stat_assignment':
        return await this.handleStatAssignment(connection, trimmedInput);
      
      case 'skills':
        return await this.handleSkillTraining(connection, trimmedInput);
      
      case 'finalize':
        return await this.handleFinalization(connection, trimmedInput);
      
      default:
        return { success: false, message: 'Invalid creation state' };
    }
  }

  /**
   * Show name input
   */
  showNameInput(connection) {
    this.sendMessage(connection, '\r\nCHOOSE NAME\r\n\r\n');
    this.sendMessage(connection, 'Enter your character name (3-20 characters):\r\n');
    this.sendMessage(connection, '>');
  }

  /**
   * Handle name input
   */
  async handleNameInput(connection, input) {
    const state = this.creationStates.get(connection);
    const name = input.trim();
    
    if (name.length < 3 || name.length > 20) {
      this.sendMessage(connection, 'Name must be between 3 and 20 characters. Try again:\r\n');
      this.sendMessage(connection, '>');
      return { success: false, message: 'Invalid name length' };
    }
    
    // Check if character name already exists in /data/player directory
    const existingPlayer = await this.playerSystem.loadPlayer(name);
    if (existingPlayer) {
      this.sendMessage(connection, `Character name '${name}' is already taken. Choose another:\r\n`);
      this.sendMessage(connection, '>');
      return { success: false, message: 'Name already taken' };
    }
    
    // Check if character already exists on this account
    if (state.account.hasCharacter(name)) {
      this.sendMessage(connection, `Character name '${name}' is already taken on this account. Choose another:\r\n`);
      this.sendMessage(connection, '>');
      return { success: false, message: 'Name already taken on account' };
    }
    
    state.characterData.name = name;
    state.step = 'name_confirm';
    this.showNameConfirmation(connection);
    
    return { success: true, message: `Name set: ${name}` };
  }

  /**
   * Show name confirmation
   */
  showNameConfirmation(connection) {
    const state = this.creationStates.get(connection);
    this.sendMessage(connection, `\r\nNAME CONFIRMATION\r\n\r\n`);
    this.sendMessage(connection, `You have chosen the name: ${state.characterData.name}\r\n\r\n`);
    this.sendMessage(connection, 'Is this correct? (yes/no):\r\n');
    this.sendMessage(connection, '>');
  }

  /**
   * Handle name confirmation
   */
  async handleNameConfirmation(connection, input) {
    const state = this.creationStates.get(connection);
    
    if (input.toLowerCase() === 'yes' || input.toLowerCase() === 'y') {
      state.step = 'gender';
      this.showGenderSelection(connection);
      return { success: true, message: 'Name confirmed' };
    } else if (input.toLowerCase() === 'no' || input.toLowerCase() === 'n') {
      state.step = 'name';
      this.showNameInput(connection);
      return { success: true, message: 'Name rejected, returning to name input' };
    } else {
      this.sendMessage(connection, 'Please answer yes or no:\r\n');
      this.sendMessage(connection, '>');
      return { success: false, message: 'Invalid response' };
    }
  }

  /**
   * Show gender selection
   */
  showGenderSelection(connection) {
    this.sendMessage(connection, '\r\nCHOOSE GENDER\r\n\r\n');
    this.sendMessage(connection, '1. Male\r\n');
    this.sendMessage(connection, '2. Female\r\n\r\n');
    this.sendMessage(connection, 'Enter 1 - 2 to choose your gender:\r\n');
    this.sendMessage(connection, '>');
  }

  /**
   * Handle gender selection
   */
  async handleGenderSelection(connection, input) {
    const state = this.creationStates.get(connection);
    const choice = parseInt(input);

    if (choice === 1) {
      state.characterData.gender = 'Male';
      state.step = 'gender_confirm';
      this.showGenderConfirmation(connection);
      return { success: true, message: 'Gender selected: Male' };
    } else if (choice === 2) {
      state.characterData.gender = 'Female';
      state.step = 'gender_confirm';
      this.showGenderConfirmation(connection);
      return { success: true, message: 'Gender selected: Female' };
    } else {
      this.sendMessage(connection, 'Invalid choice. Please enter 1 or 2:\r\n');
      this.sendMessage(connection, '>');
      return { success: false, message: 'Invalid gender selection' };
    }
  }

  /**
   * Show gender confirmation
   */
  showGenderConfirmation(connection) {
    const state = this.creationStates.get(connection);
    this.sendMessage(connection, `\r\nGENDER CONFIRMATION\r\n\r\n`);
    this.sendMessage(connection, `You have chosen: ${state.characterData.gender}\r\n\r\n`);
    this.sendMessage(connection, 'Is this correct? (yes/no):\r\n');
    this.sendMessage(connection, '>');
  }

  /**
   * Handle gender confirmation
   */
  async handleGenderConfirmation(connection, input) {
    const state = this.creationStates.get(connection);
    
    if (input.toLowerCase() === 'yes' || input.toLowerCase() === 'y') {
      state.step = 'profession';
      this.showProfessionSelection(connection);
      return { success: true, message: 'Gender confirmed' };
    } else if (input.toLowerCase() === 'no' || input.toLowerCase() === 'n') {
      state.step = 'gender';
      this.showGenderSelection(connection);
      return { success: true, message: 'Gender rejected, returning to gender selection' };
    } else {
      this.sendMessage(connection, 'Please answer yes or no:\r\n');
      this.sendMessage(connection, '>');
      return { success: false, message: 'Invalid response' };
    }
  }

  /**
   * Show profession selection
   */
  showProfessionSelection(connection) {
    this.sendMessage(connection, '\r\nCHOOSE YOUR PROFESSION\r\n\r\n');
    this.sendMessage(connection, '1. Warrior\r\n');
    this.sendMessage(connection, '2. Rogue\r\n');
    this.sendMessage(connection, '3. Wizard\r\n');
    this.sendMessage(connection, '4. Cleric\r\n');
    this.sendMessage(connection, '5. Empath\r\n');
    this.sendMessage(connection, '6. Ranger\r\n');
    this.sendMessage(connection, '7. Bard\r\n');
    this.sendMessage(connection, '8. Sorcerer\r\n\r\n');
    this.sendMessage(connection, 'Enter 1 - 8 to choose a profession, P for the previous menu, or H for help:\r\n');
    this.sendMessage(connection, '>');
  }

  /**
   * Handle profession selection
   */
  async handleProfessionSelection(connection, input) {
    const state = this.creationStates.get(connection);
    
    if (input.toLowerCase() === 'p') {
      state.step = 'gender';
      this.showGenderSelection(connection);
      return { success: true, message: 'Returned to gender selection' };
    }
    
    if (input.toLowerCase() === 'h') {
      this.showProfessionHelp(connection);
      return { success: true, message: 'Profession help shown' };
    }

    const choice = parseInt(input);
    const professions = ['warrior', 'rogue', 'wizard', 'cleric', 'empath', 'ranger', 'bard', 'sorcerer'];
    
    if (choice >= 1 && choice <= 8) {
      const profession = professions[choice - 1];
      state.characterData.profession = profession;
      
      // Show profession bonuses
      this.showProfessionBonuses(connection, profession);
      
      state.step = 'profession_confirm';
      setTimeout(() => this.showProfessionConfirmation(connection), 2000);
      
      return { success: true, message: `Profession selected: ${profession}` };
    } else {
      this.sendMessage(connection, 'Invalid choice. Please enter 1 - 8, P for previous, or H for help:\r\n');
      this.sendMessage(connection, '>');
      return { success: false, message: 'Invalid profession selection' };
    }
  }

  /**
   * Show profession bonuses
   */
  showProfessionBonuses(connection, profession) {
    const bonuses = {
      warrior: 'As a Warrior, Strength (STR) and Constitution (CON) gain +10 bonus. (max 100)',
      rogue: 'As a Rogue, Reflexes (REF) and Dexterity (DEX) gain +10 bonus. (max 100)',
      wizard: 'As a Wizard, Aura (AUR) and Logic (LOG) gain +10 bonus. (max 100)',
      cleric: 'As a Cleric, Wisdom (WIS) and Discipline (DIS) gain +10 bonus. (max 100)',
      empath: 'As an Empath, Wisdom (WIS) and Charisma (CHA) gain +10 bonus. (max 100)',
      ranger: 'As a Ranger, Reflexes (REF) and Constitution (CON) gain +10 bonus. (max 100)',
      bard: 'As a Bard, Charisma (CHA) and Dexterity (DEX) gain +10 bonus. (max 100)',
      sorcerer: 'As a Sorcerer, Intelligence (INT) and Aura (AUR) gain +10 bonus. (max 100)'
    };
    
    this.sendMessage(connection, `\r\n${bonuses[profession]}\r\n\r\n`);
  }

  /**
   * Show profession help
   */
  showProfessionHelp(connection) {
    this.sendMessage(connection, '\r\nPROFESSION HELP:\r\n');
    this.sendMessage(connection, 'Warrior: Combat-focused class with high physical stats\r\n');
    this.sendMessage(connection, 'Rogue: Stealth and agility focused class\r\n');
    this.sendMessage(connection, 'Wizard: Magic-focused class with high mental stats\r\n');
    this.sendMessage(connection, 'Cleric: Divine magic and healing focused\r\n');
    this.sendMessage(connection, 'Empath: Emotional magic and empathy focused\r\n');
    this.sendMessage(connection, 'Ranger: Nature and survival focused\r\n');
    this.sendMessage(connection, 'Bard: Performance and charisma focused\r\n');
    this.sendMessage(connection, 'Sorcerer: Raw magical power focused\r\n\r\n');
    this.showProfessionSelection(connection);
  }

  /**
   * Show profession confirmation
   */
  showProfessionConfirmation(connection) {
    const state = this.creationStates.get(connection);
    this.sendMessage(connection, `\r\nPROFESSION CONFIRMATION\r\n\r\n`);
    this.sendMessage(connection, `You have chosen: ${state.characterData.profession}\r\n\r\n`);
    this.sendMessage(connection, 'Is this correct? (yes/no):\r\n');
    this.sendMessage(connection, '>');
  }

  /**
   * Handle profession confirmation
   */
  async handleProfessionConfirmation(connection, input) {
    const state = this.creationStates.get(connection);
    
    if (input.toLowerCase() === 'yes' || input.toLowerCase() === 'y') {
      state.step = 'race';
      this.showRaceSelection(connection);
      return { success: true, message: 'Profession confirmed' };
    } else if (input.toLowerCase() === 'no' || input.toLowerCase() === 'n') {
      state.step = 'profession';
      this.showProfessionSelection(connection);
      return { success: true, message: 'Profession rejected, returning to profession selection' };
    } else {
      this.sendMessage(connection, 'Please answer yes or no:\r\n');
      this.sendMessage(connection, '>');
      return { success: false, message: 'Invalid response' };
    }
  }

  /**
   * Show race selection
   */
  showRaceSelection(connection) {
    this.sendMessage(connection, '\r\nCHOOSE YOUR RACE\r\n\r\n');
    this.sendMessage(connection, '1. Human\r\n');
    this.sendMessage(connection, '2. Giantman\r\n');
    this.sendMessage(connection, '3. Half-Elf\r\n');
    this.sendMessage(connection, '4. Sylvankind\r\n');
    this.sendMessage(connection, '5. Dark Elf\r\n');
    this.sendMessage(connection, '6. Elf\r\n');
    this.sendMessage(connection, '7. Dwarf\r\n');
    this.sendMessage(connection, '8. Halfling\r\n\r\n');
    this.sendMessage(connection, 'Enter 1 - 8 to choose your race, P for the previous menu, or H for help:\r\n');
    this.sendMessage(connection, '>');
  }

  /**
   * Handle race selection
   */
  async handleRaceSelection(connection, input) {
    const state = this.creationStates.get(connection);
    
    if (input.toLowerCase() === 'p') {
      state.step = 'profession';
      this.showProfessionSelection(connection);
      return { success: true, message: 'Returned to profession selection' };
    }
    
    if (input.toLowerCase() === 'h') {
      this.showRaceHelp(connection);
      return { success: true, message: 'Race help shown' };
    }

    const choice = parseInt(input);
    const races = ['human', 'giantman', 'half-elf', 'sylvankind', 'dark-elf', 'elf', 'dwarf', 'halfling'];
    
    if (choice >= 1 && choice <= 8) {
      const race = races[choice - 1];
      state.characterData.race = race;
      
      // Show race bonuses
      this.showRaceBonuses(connection, race);
      
      state.step = 'race_confirm';
      setTimeout(() => this.showRaceConfirmation(connection), 2000);
      
      return { success: true, message: `Race selected: ${race}` };
    } else {
      this.sendMessage(connection, 'Invalid choice. Please enter 1 - 8, P for previous, or H for help:\r\n');
      this.sendMessage(connection, '>');
      return { success: false, message: 'Invalid race selection' };
    }
  }

  /**
   * Show race bonuses
   */
  showRaceBonuses(connection, race) {
    const bonuses = {
      human: 'Humans have balanced stats with no penalties or bonuses.',
      giantman: 'Giantmen gain +2 Strength and Constitution, but -1 Dexterity and Reflexes.',
      'half-elf': 'Half-Elves gain +1 Intelligence and Charisma, but -1 Constitution.',
      sylvankind: 'Sylvankind gain +1 Dexterity and Reflexes, but -1 Strength.',
      'dark-elf': 'Dark Elves gain +1 Intelligence and Reflexes, but -1 Constitution and Charisma.',
      elf: 'Elves gain +1 Intelligence and Dexterity, but -1 Strength and Constitution.',
      dwarf: 'Dwarves gain +1 Strength and Constitution, but -1 Dexterity and Charisma.',
      halfling: 'Halflings gain +1 Dexterity and Charisma, but -1 Strength.'
    };
    
    this.sendMessage(connection, `\r\n${bonuses[race]}\r\n\r\n`);
  }

  /**
   * Show race help
   */
  showRaceHelp(connection) {
    this.sendMessage(connection, '\r\nRACE HELP:\r\n');
    this.sendMessage(connection, 'Each race has different stat bonuses and penalties.\r\n');
    this.sendMessage(connection, 'Choose the race that best fits your character concept.\r\n\r\n');
    this.showRaceSelection(connection);
  }

  /**
   * Show race confirmation
   */
  showRaceConfirmation(connection) {
    const state = this.creationStates.get(connection);
    this.sendMessage(connection, `\r\nRACE CONFIRMATION\r\n\r\n`);
    this.sendMessage(connection, `You have chosen: ${state.characterData.race}\r\n\r\n`);
    this.sendMessage(connection, 'Is this correct? (yes/no):\r\n');
    this.sendMessage(connection, '>');
  }

  /**
   * Handle race confirmation
   */
  async handleRaceConfirmation(connection, input) {
    const state = this.creationStates.get(connection);
    
    if (input.toLowerCase() === 'yes' || input.toLowerCase() === 'y') {
      state.step = 'attributes';
      this.showAttributeRolls(connection);
      return { success: true, message: 'Race confirmed' };
    } else if (input.toLowerCase() === 'no' || input.toLowerCase() === 'n') {
      state.step = 'race';
      this.showRaceSelection(connection);
      return { success: true, message: 'Race rejected, returning to race selection' };
    } else {
      this.sendMessage(connection, 'Please answer yes or no:\r\n');
      this.sendMessage(connection, '>');
      return { success: false, message: 'Invalid response' };
    }
  }

  /**
   * Show attribute rolls
   */
  showAttributeRolls(connection) {
    this.sendMessage(connection, '\r\nATTRIBUTE ROLLS\r\n\r\n');
    this.sendMessage(connection, 'Rolling 10 dice with specific ranges:\r\n');
    this.sendMessage(connection, '- First 3 rolls: 50-90 (high stats)\r\n');
    this.sendMessage(connection, '- Next 3 rolls: 40-60 (medium stats)\r\n');
    this.sendMessage(connection, '- Next 3 rolls: 20-50 (low stats)\r\n');
    this.sendMessage(connection, '- Last roll: 20-100 (wild card)\r\n\r\n');
    
    // Roll 10 d100 dice
    const state = this.creationStates.get(connection);
    state.characterData.rolls = this.rollD100Dice();
    state.characterData.statAssignment = {};
    
    // Display the rolls
    this.displayRolls(connection);
    
    // Ask if they want to keep these rolls
    this.sendMessage(connection, '\r\nDo you want to keep these rolls? (yes/no):\r\n');
    this.sendMessage(connection, '>');
  }

  /**
   * Roll 10 d100 dice with specific ranges
   */
  rollD100Dice() {
    const rolls = [];
    
    // First 3 rolls: 50-90
    for (let i = 0; i < 3; i++) {
      rolls.push(Math.floor(Math.random() * 41) + 50); // 50-90
    }
    
    // Next 3 rolls: 40-60
    for (let i = 0; i < 3; i++) {
      rolls.push(Math.floor(Math.random() * 21) + 40); // 40-60
    }
    
    // Next 3 rolls: 20-50
    for (let i = 0; i < 3; i++) {
      rolls.push(Math.floor(Math.random() * 31) + 20); // 20-50
    }
    
    // Last roll: 20-100
    rolls.push(Math.floor(Math.random() * 81) + 20); // 20-100
    
    return rolls.sort((a, b) => b - a); // Sort descending
  }

  /**
   * Display the rolls
   */
  displayRolls(connection) {
    const state = this.creationStates.get(connection);
    const rolls = state.characterData.rolls;
    const total = rolls.reduce((sum, roll) => sum + roll, 0);
    
    this.sendMessage(connection, 'Your rolls:\r\n');
    rolls.forEach((roll, index) => {
      this.sendMessage(connection, `${index + 1}. ${roll}\r\n`);
    });
    this.sendMessage(connection, `\r\nTotal: ${total}\r\n`);
  }

  /**
   * Roll attributes for character
   */
  rollAttributes(race, profession) {
    const baseAttributes = {
      strength: { base: 0, delta: 0 },
      intelligence: { base: 0, delta: 0 },
      wisdom: { base: 0, delta: 0 },
      constitution: { base: 0, delta: 0 },
      dexterity: { base: 0, delta: 0 },
      charisma: { base: 0, delta: 0 },
      reflexes: { base: 0, delta: 0 },
      logic: { base: 0, delta: 0 },
      quickness: { base: 0, delta: 0 },
      discipline: { base: 0, delta: 0 },
      aura: { base: 0, delta: 0 },
      health: { base: 100, delta: 0 },
      mana: { base: 50, delta: 0 },
      experience: { base: 0, delta: 0 }
    };

    // Roll 3d6 for each stat
    for (const stat in baseAttributes) {
      if (stat !== 'health' && stat !== 'mana' && stat !== 'experience') {
        baseAttributes[stat].base = this.roll3d6();
      }
    }

    // Apply race bonuses
    this.applyRaceBonuses(baseAttributes, race);
    
    // Apply profession bonuses
    this.applyProfessionBonuses(baseAttributes, profession);

    return baseAttributes;
  }

  /**
   * Roll 3d6
   */
  roll3d6() {
    return Math.floor(Math.random() * 6) + 1 +
           Math.floor(Math.random() * 6) + 1 +
           Math.floor(Math.random() * 6) + 1;
  }

  /**
   * Apply race bonuses
   */
  applyRaceBonuses(attributes, race) {
    const bonuses = {
      human: {},
      giantman: { strength: 2, constitution: 2, dexterity: -1, reflexes: -1 },
      'half-elf': { intelligence: 1, charisma: 1, constitution: -1 },
      sylvankind: { dexterity: 1, reflexes: 1, strength: -1 },
      'dark-elf': { intelligence: 1, reflexes: 1, constitution: -1, charisma: -1 },
      elf: { intelligence: 1, dexterity: 1, strength: -1, constitution: -1 },
      dwarf: { strength: 1, constitution: 1, dexterity: -1, charisma: -1 },
      halfling: { dexterity: 1, charisma: 1, strength: -1 }
    };

    const raceBonus = bonuses[race] || {};
    for (const stat in raceBonus) {
      attributes[stat].base = Math.max(3, Math.min(100, attributes[stat].base + raceBonus[stat]));
    }
  }

  /**
   * Apply profession bonuses
   */
  applyProfessionBonuses(attributes, profession) {
    const bonuses = {
      warrior: { strength: 10, constitution: 10 },
      rogue: { reflexes: 10, dexterity: 10 },
      wizard: { aura: 10, logic: 10 },
      cleric: { wisdom: 10, discipline: 10 },
      empath: { wisdom: 10, charisma: 10 },
      ranger: { reflexes: 10, constitution: 10 },
      bard: { charisma: 10, dexterity: 10 },
      sorcerer: { intelligence: 10, aura: 10 }
    };

    const profBonus = bonuses[profession] || {};
    for (const stat in profBonus) {
      attributes[stat].base = Math.max(3, Math.min(100, attributes[stat].base + profBonus[stat]));
    }
  }

  /**
   * Handle attribute rolls
   */
  async handleAttributeRolls(connection, input) {
    const state = this.creationStates.get(connection);
    
    if (input.toLowerCase() === 'no' || input.toLowerCase() === 'n') {
      // Reroll dice
      this.sendMessage(connection, '\r\nRerolling dice...\r\n\r\n');
      state.characterData.rolls = this.rollD100Dice();
      this.displayRolls(connection);
      this.sendMessage(connection, '\r\nDo you want to keep these rolls? (yes/no):\r\n');
      this.sendMessage(connection, '>');
      return { success: true, message: 'Rerolled dice' };
    }
    
    if (input.toLowerCase() === 'yes' || input.toLowerCase() === 'y') {
      // Move to stat assignment
      state.step = 'stat_assignment';
      this.showStatAssignment(connection);
      return { success: true, message: 'Moving to stat assignment' };
    }
    
    // Invalid response
    this.sendMessage(connection, 'Please answer yes or no:\r\n');
    this.sendMessage(connection, '>');
    return { success: false, message: 'Invalid response' };
  }

  /**
   * Show stat assignment interface
   */
  showStatAssignment(connection) {
    const state = this.creationStates.get(connection);
    const rolls = state.characterData.rolls;
    const assigned = state.characterData.statAssignment;
    
    this.sendMessage(connection, '\r\nSTAT ASSIGNMENT\r\n\r\n');
    this.sendMessage(connection, 'Available stats:\r\n');
    
    const statNames = ['strength', 'intelligence', 'wisdom', 'constitution', 'dexterity', 'charisma', 'agility', 'logic', 'discipline', 'aura'];
    const statAbbreviations = ['STR', 'INT', 'WIS', 'CON', 'DEX', 'CHA', 'AGI', 'LOG', 'DIS', 'AUR'];
    
    statNames.forEach((stat, index) => {
      const assignedRoll = assigned[stat];
      const rollText = assignedRoll ? ` (${assignedRoll})` : '';
      this.sendMessage(connection, `${index + 1}. ${statAbbreviations[index]}${rollText}\r\n`);
    });
    
    this.sendMessage(connection, '\r\n');
    
    // Show available rolls with assignment status
    // Track used roll values (not instances, to handle duplicates correctly)
    const usedRollValues = new Set(Object.values(assigned));
    
    // For each unique roll value, count available instances
    const rollCounts = {};
    for (const roll of rolls) {
      rollCounts[roll] = (rollCounts[roll] || 0) + 1;
    }
    
    // Count how many times each assigned value was in the original rolls
    const assignedCounts = {};
    for (const assignedRoll of Object.values(assigned)) {
      assignedCounts[assignedRoll] = (assignedCounts[assignedRoll] || 0) + 1;
    }
    
    // Available rolls are those where we have more instances than assigned
    const availableRollsList = [];
    for (const roll of rolls) {
      const available = rollCounts[roll] - (assignedCounts[roll] || 0);
      if (available > 0 && !availableRollsList.includes(roll)) {
        for (let i = 0; i < available; i++) {
          availableRollsList.push(roll);
        }
      }
    }
    
    // Build assigned rolls list
    const assignedRollsList = Object.values(assigned);
    
    if (availableRollsList.length > 0) {
      this.sendMessage(connection, `Available rolls: ${availableRollsList.join(', ')}\r\n`);
    }
    
    if (assignedRollsList.length > 0) {
      this.sendMessage(connection, `Assigned rolls: ${assignedRollsList.join(', ')}\r\n`);
    }
    
    this.sendMessage(connection, '\r\n');
    
    this.sendMessage(connection, 'Usage: Either <STR 90> or <1 90> would assign 90 to strength.\r\n');
    this.sendMessage(connection, 'Example: 1 90 (assigns roll 90 to Strength)\r\n');
    this.sendMessage(connection, 'Type "done" when all stats are assigned:\r\n');
    this.sendMessage(connection, '>');
  }

  /**
   * Get which stat a roll is assigned to
   */
  getAssignedStat(assigned, roll) {
    for (const stat in assigned) {
      if (assigned[stat] === roll) {
        return stat.toUpperCase();
      }
    }
    return null;
  }

  /**
   * Handle stat assignment
   */
  async handleStatAssignment(connection, input) {
    const state = this.creationStates.get(connection);
    
    if (input.toLowerCase() === 'done') {
      // Check if all stats are assigned
      const assignedCount = Object.keys(state.characterData.statAssignment).length;
      if (assignedCount < 10) {
        this.sendMessage(connection, `You have only assigned ${assignedCount} stats. You need to assign all 10 stats.\r\n`);
        this.sendMessage(connection, '>');
        return { success: false, message: 'Not all stats assigned' };
      }
      
      // Calculate final attributes with bonuses
      const finalAttributes = this.calculateFinalAttributes(state.characterData);
      state.characterData.attributes = finalAttributes;
      
      // Calculate TPs
      const ptps = 25 + Math.floor((((finalAttributes.aura.base + finalAttributes.discipline.base) / 2) + (finalAttributes.strength.base + finalAttributes.constitution.base + finalAttributes.dexterity.base + finalAttributes.agility.base)) / 20);
      const mtps = 25 + Math.floor((((finalAttributes.aura.base + finalAttributes.discipline.base) / 2) + (finalAttributes.intelligence.base + finalAttributes.wisdom.base + finalAttributes.logic.base + finalAttributes.charisma.base)) / 20);
      
      state.characterData.tps = [ptps, mtps];
      
      // Initialize skills for the profession
      state.characterData.skills = this.initializeSkills(state.characterData.profession);
      
      // Show final attributes
      this.showFinalAttributes(connection, finalAttributes, ptps, mtps);
      
      state.step = 'skills';
      setTimeout(() => this.showSkillTraining(connection), 3000);
      
      return { success: true, message: 'Moving to skill training' };
    }
    
    const parts = input.trim().split(' ');
    if (parts.length !== 2) {
      this.sendMessage(connection, 'Usage: Either <STR 90> or <1 90> would assign 90 to strength.\r\n');
      this.sendMessage(connection, 'Example: 1 90 (assigns roll 90 to Strength)\r\n');
      this.sendMessage(connection, '>');
      return { success: false, message: 'Invalid command' };
    }
    
    let statName, roll;
    
    // Check if first part is a stat abbreviation (STR, INT, etc.)
    const statAbbreviations = {
      'STR': 'strength',
      'INT': 'intelligence', 
      'WIS': 'wisdom',
      'CON': 'constitution',
      'DEX': 'dexterity',
      'CHA': 'charisma',
      'AGI': 'agility',
      'LOG': 'logic',
      'DIS': 'discipline',
      'AUR': 'aura'
    };
    
    if (statAbbreviations[parts[0].toUpperCase()]) {
      statName = statAbbreviations[parts[0].toUpperCase()];
      roll = parseInt(parts[1]);
    } else {
      // Check if first part is a number (1-10)
      const statNum = parseInt(parts[0]);
      if (isNaN(statNum) || statNum < 1 || statNum > 10) {
        this.sendMessage(connection, 'Stat must be either a number (1-10) or abbreviation (STR, INT, etc.).\r\n');
      this.sendMessage(connection, '>');
        return { success: false, message: 'Invalid stat identifier' };
      }
      
      const statNames = ['strength', 'intelligence', 'wisdom', 'constitution', 'dexterity', 'charisma', 'agility', 'logic', 'discipline', 'aura'];
      statName = statNames[statNum - 1];
      roll = parseInt(parts[1]);
    }
    
    if (isNaN(roll) || roll < 1 || roll > 100) {
      this.sendMessage(connection, 'Roll value must be between 1 and 100.\r\n');
      this.sendMessage(connection, '>');
      return { success: false, message: 'Invalid roll value' };
    }
    
    // Check if roll exists in the available rolls
    if (!state.characterData.rolls.includes(roll)) {
      this.sendMessage(connection, `Roll ${roll} does not exist in your available rolls. Please check your available rolls and try again.\r\n`);
      this.sendMessage(connection, '>');
      return { success: false, message: 'Roll does not exist' };
    }
    
    // Count how many times this roll value is available (total - already assigned)
    const totalInstances = state.characterData.rolls.filter(r => r === roll).length;
    const assignedInstances = Object.values(state.characterData.statAssignment).filter(r => r === roll).length;
    const availableInstances = totalInstances - assignedInstances;
    
    if (availableInstances === 0) {
      this.sendMessage(connection, `All instances of roll ${roll} have already been assigned.\r\n`);
      this.sendMessage(connection, '>');
      return { success: false, message: 'All instances of roll already assigned' };
    }
    
    // Check if stat is already assigned
    if (state.characterData.statAssignment[statName]) {
      this.sendMessage(connection, `${statName.toUpperCase()} already has a roll assigned.\r\n`);
      this.sendMessage(connection, '>');
      return { success: false, message: 'Stat already assigned' };
    }
    
    // Assign the roll
    state.characterData.statAssignment[statName] = roll;
    
    this.sendMessage(connection, `Assigned ${roll} to ${statName.toUpperCase()}.\r\n`);
    
    // Refresh the stat assignment display
    this.showStatAssignment(connection);
    
    return { success: true, message: `Assigned ${roll} to ${statName}` };
  }

  /**
   * Calculate final attributes with bonuses
   */
  calculateFinalAttributes(characterData) {
    const attributes = {
      strength: { base: 0, delta: 0 },
      intelligence: { base: 0, delta: 0 },
      wisdom: { base: 0, delta: 0 },
      constitution: { base: 0, delta: 0 },
      dexterity: { base: 0, delta: 0 },
      charisma: { base: 0, delta: 0 },
      agility: { base: 0, delta: 0 },
      logic: { base: 0, delta: 0 },
      discipline: { base: 0, delta: 0 },
      aura: { base: 0, delta: 0 },
      health: { base: 100, delta: 0 },
      mana: { base: 50, delta: 0 },
      experience: { base: 0, delta: 0 }
    };
    
    // Assign base values from rolls
    for (const stat in characterData.statAssignment) {
      if (stat !== 'health' && stat !== 'mana' && stat !== 'experience') {
        attributes[stat].base = characterData.statAssignment[stat];
      }
    }
    
    // Apply race bonuses
    this.applyRaceBonuses(attributes, characterData.race);
    
    // Apply profession bonuses
    this.applyProfessionBonuses(attributes, characterData.profession);
    
    return attributes;
  }

  /**
   * Show final attributes
   */
  showFinalAttributes(connection, attributes, ptps, mtps) {
    this.sendMessage(connection, '\r\nFINAL ATTRIBUTES\r\n\r\n');
    this.sendMessage(connection, `Strength (STR): ${attributes.strength.base}\r\n`);
    this.sendMessage(connection, `Intelligence (INT): ${attributes.intelligence.base}\r\n`);
    this.sendMessage(connection, `Wisdom (WIS): ${attributes.wisdom.base}\r\n`);
    this.sendMessage(connection, `Constitution (CON): ${attributes.constitution.base}\r\n`);
    this.sendMessage(connection, `Dexterity (DEX): ${attributes.dexterity.base}\r\n`);
    this.sendMessage(connection, `Charisma (CHA): ${attributes.charisma.base}\r\n`);
    this.sendMessage(connection, `Agility (AGI): ${attributes.agility.base}\r\n`);
    this.sendMessage(connection, `Logic (LOG): ${attributes.logic.base}\r\n`);
    this.sendMessage(connection, `Discipline (DIS): ${attributes.discipline.base}\r\n`);
    this.sendMessage(connection, `Aura (AUR): ${attributes.aura.base}\r\n\r\n`);
    this.sendMessage(connection, `Training Points: ${ptps} Physical, ${mtps} Mental\r\n\r\n`);
  }

  /**
   * Show skill training
   */
  showSkillTraining(connection) {
    const state = this.creationStates.get(connection);
    
    this.sendMessage(connection, '\r\nSKILL TRAINING\r\n\r\n');
    this.sendMessage(connection, `Training Points: ${state.characterData.tps[0]} physical, ${state.characterData.tps[1]} mental\r\n\r\n`);
    
    // Show skills if initialized
    if (state.characterData.skills) {
      const skills = Object.entries(state.characterData.skills);
      
      if (skills.length > 0) {
        // Group skills by category
        const combatSkills = skills.filter(([id, skill]) =>
          ['brawling', 'one_handed_edged', 'one_handed_blunt', 'two_handed', 'polearm', 'ranged', 'thrown', 'combat_maneuvers', 'shield_use', 'armor_use'].includes(id)
        );
        const utilitySkills = skills.filter(([id, skill]) =>
          ['climbing', 'swimming', 'disarm_traps', 'pick_locks', 'stalk_and_hide', 'perception', 'ambush', 'survival', 'first_aid'].includes(id)
        );
        const magicSkills = skills.filter(([id, skill]) =>
          ['spell_aim', 'mana_share', 'magic_item_use', 'scroll_reading', 'harness_power', 'major_elemental', 'minor_elemental', 'major_spiritual', 'minor_spiritual', 'cleric_base', 'wizard_base', 'empath_base', 'sorcerer_base', 'ranger_base', 'paladin_base', 'bard_base'].includes(id)
        );
        
        let skillNumber = 1;
        
        // Define max ranks for each skill type
        const getSkillMaxRanks = (skillId) => {
          const maxRanks = {
            // Weapon Skills
            one_handed_edged: [6, 1], // 6 total, 1 per level
            one_handed_blunt: [6, 1],
            two_handed: [14, 3],
            polearm: [14, 3],
            ranged: [14, 3],
            thrown: [8, 2],
            brawling: [10, 2],
            // Combat Skills
            combat_maneuvers: [12, 8],
            shield_use: [13, 0],
            armor_use: [14, 0],
            // General Skills
            climbing: [4, 0],
            swimming: [3, 0],
            survival: [3, 2],
            disarm_traps: [2, 6],
            pick_locks: [2, 4],
            stalk_and_hide: [5, 4],
            perception: [0, 3],
            ambush: [15, 10],
            first_aid: [2, 1],
            // Magic Skills
            spell_aim: [2, 1],
            mana_share: [0, 3],
            magic_item_use: [0, 1],
            scroll_reading: [0, 2],
            major_elemental: [0, 8],
            minor_elemental: [0, 8],
            wizard_base: [0, 8],
            cleric_base: [0, 8],
            empath_base: [0, 8],
            sorcerer_base: [0, 8],
            ranger_base: [0, 8],
            paladin_base: [0, 8],
            bard_base: [0, 8]
          };
          return maxRanks[skillId] || [10, 2]; // Default if not found
        };
        
        const formatSkill = (name, ranks, cost, number, maxTotal, maxPerLevel) => {
          // Format: Number) Current_Ranks Max/Max_Per_Level (Base_Cost) Skill_Name
          // Base cost is the first rank cost (second rank costs double)
          const baseCost = cost[0] + cost[1]; // Sum of physical and mental costs
          return `${number}) ${ranks} ${maxTotal}/${maxPerLevel} (${baseCost}) ${name}`;
        };
        
        if (combatSkills.length > 0) {
          this.sendMessage(connection, 'Combat Skills\r\n');
          combatSkills.forEach(([id, skill]) => {
            const [maxTotal, maxPerLevel] = getSkillMaxRanks(id);
            this.sendMessage(connection, formatSkill(skill.name, skill.ranks, skill.cost, skillNumber++, maxTotal, maxPerLevel) + '\r\n');
          });
          this.sendMessage(connection, '\r\n');
        }
        
        if (utilitySkills.length > 0) {
          this.sendMessage(connection, 'General Skills\r\n');
          utilitySkills.forEach(([id, skill]) => {
            const [maxTotal, maxPerLevel] = getSkillMaxRanks(id);
            this.sendMessage(connection, formatSkill(skill.name, skill.ranks, skill.cost, skillNumber++, maxTotal, maxPerLevel) + '\r\n');
          });
          this.sendMessage(connection, '\r\n');
        }
        
        if (magicSkills.length > 0) {
          this.sendMessage(connection, 'Magic Skills\r\n');
          magicSkills.forEach(([id, skill]) => {
            const [maxTotal, maxPerLevel] = getSkillMaxRanks(id);
            this.sendMessage(connection, formatSkill(skill.name, skill.ranks, skill.cost, skillNumber++, maxTotal, maxPerLevel) + '\r\n');
          });
          this.sendMessage(connection, '\r\n');
        }
      }
    }
    
    this.sendMessage(connection, 'Type "train <skill> <ranks>" to train a skill.\r\n');
    this.sendMessage(connection, 'Type "done" when finished training.\r\n\r\n');
    this.sendMessage(connection, '>');
  }

  /**
   * Handle skill training
   */
  async handleSkillTraining(connection, input) {
    const state = this.creationStates.get(connection);
    
    if (input.toLowerCase() === 'done') {
      state.step = 'finalize';
      this.showFinalization(connection);
      return { success: true, message: 'Moving to finalization' };
    }
    
    if (input.toLowerCase() === 'skills') {
      this.showSkillsList(connection);
      return { success: true, message: 'Skills list shown' };
    }
    
    const parts = input.split(' ');
    if (parts[0].toLowerCase() === 'train' && parts.length >= 3) {
      const skillNameOrNumber = parts[1];
      const ranks = parseInt(parts[2]);
      
      if (isNaN(ranks) || ranks <= 0) {
        this.sendMessage(connection, 'Please enter a valid number of ranks.\r\n');
        this.sendMessage(connection, '>');
        return { success: false, message: 'Invalid ranks' };
      }
      
      // Initialize skills if not done yet
      if (!state.characterData.skills || Object.keys(state.characterData.skills).length === 0) {
        state.characterData.skills = this.initializeSkills(state.characterData.profession);
      }
      
      // Check if skillNameOrNumber is a number
      const skillNumber = parseInt(skillNameOrNumber);
      let actualSkillName = skillNameOrNumber;
      
      if (!isNaN(skillNumber)) {
        // Map number to skill name using the same order as display
        const skills = Object.entries(state.characterData.skills || {});
        
        const combatSkills = skills.filter(([id, skill]) =>
          ['brawling', 'one_handed_edged', 'one_handed_blunt', 'two_handed', 'polearm', 'ranged', 'thrown', 'combat_maneuvers', 'shield_use', 'armor_use'].includes(id)
        );
        const utilitySkills = skills.filter(([id, skill]) =>
          ['climbing', 'swimming', 'disarm_traps', 'pick_locks', 'stalk_and_hide', 'perception', 'ambush', 'survival', 'first_aid'].includes(id)
        );
        const magicSkills = skills.filter(([id, skill]) =>
          ['spell_aim', 'mana_share', 'magic_item_use', 'scroll_reading', 'harness_power', 'major_elemental', 'minor_elemental', 'major_spiritual', 'minor_spiritual', 'cleric_base', 'wizard_base', 'empath_base', 'sorcerer_base', 'ranger_base', 'paladin_base', 'bard_base'].includes(id)
        );
        
        const allSkillsInOrder = [...combatSkills, ...utilitySkills, ...magicSkills];
        
        if (skillNumber < 1 || skillNumber > allSkillsInOrder.length) {
          this.sendMessage(connection, `Skill number ${skillNumber} not found.\r\n`);
          this.sendMessage(connection, '>');
          return { success: false, message: `Skill number ${skillNumber} not found` };
        }
        
        actualSkillName = allSkillsInOrder[skillNumber - 1][1].name;
      }
      
      const result = this.trainSkill(state.characterData, actualSkillName, ranks);
      this.sendMessage(connection, result.message + '\r\n');
      this.sendMessage(connection, '>');
      return { success: result.success, message: result.message };
    }
    
    this.sendMessage(connection, 'Invalid command. Type "skills", "train <skill> <ranks>", or "done":\r\n');
    this.sendMessage(connection, '>');
    return { success: false, message: 'Invalid command' };
  }

  /**
   * Initialize skills for profession
   */
  initializeSkills(profession) {
    const skills = {};
    const classSkills = this.characterCreation.classes[profession].skills;
    
    if (!classSkills) {
      return skills;
    }
    
    for (const skillId in classSkills) {
      skills[skillId] = {
        name: classSkills[skillId].name,
        cost: classSkills[skillId].cost,
        ranks: 0
      };
    }
    
    return skills;
  }

  /**
   * Train a skill
   * Cost increases based on current ranks
   */
  trainSkill(characterData, skillName, ranksToTrain) {
    const skillId = Object.keys(characterData.skills).find(id =>
      id.toLowerCase() === skillName.toLowerCase() ||
      characterData.skills[id].name.toLowerCase() === skillName.toLowerCase()
    );

    if (!skillId) {
      return { success: false, message: `Skill "${skillName}" not found.` };
    }

    const skill = characterData.skills[skillId];
    
    // Check how many ranks trained this level (ranks % 3 gives ranks in current level)
    const ranksInCurrentLevel = skill.ranks % 3;
    const maxRanksAllowed = 3 - ranksInCurrentLevel;
    
    // Check if trying to train more than allowed this level
    if (ranksToTrain > maxRanksAllowed) {
      return { 
        success: false, 
        message: `You can only train ${maxRanksAllowed} more rank(s) in ${skill.name} this level (3 max per level).` 
      };
    }
    
    const [basePhysicalCost, baseMentalCost] = skill.cost;
    let totalPhysicalCost = 0;
    let totalMentalCost = 0;

    // Calculate cost for each rank
    // 1st rank in level: 1x base cost
    // 2nd rank in level: 2x base cost
    // 3rd rank in level: 4x base cost
    for (let i = 0; i < ranksToTrain; i++) {
      const rankInLevel = ranksInCurrentLevel + i;
      let costMultiplier;
      
      if (rankInLevel === 0) costMultiplier = 1;      // 1st rank
      else if (rankInLevel === 1) costMultiplier = 2; // 2nd rank  
      else costMultiplier = 4;                        // 3rd rank
      
      const physicalCost = basePhysicalCost * costMultiplier;
      const mentalCost = baseMentalCost * costMultiplier;
      
      totalPhysicalCost += physicalCost;
      totalMentalCost += mentalCost;
    }

    // Check available TPs
    const availablePhysical = characterData.tps[0];
    const availableMental = characterData.tps[1];
    
    let neededPhysical = totalPhysicalCost;
    let neededMental = totalMentalCost;
    let physicalRemaining = availablePhysical;
    let mentalRemaining = availableMental;
    
    // First, spend available TPs
    const physicalSpent = Math.min(neededPhysical, physicalRemaining);
    neededPhysical -= physicalSpent;
    physicalRemaining -= physicalSpent;
    
    const mentalSpent = Math.min(neededMental, mentalRemaining);
    neededMental -= mentalSpent;
    mentalRemaining -= mentalSpent;
    
    // Convert 2:1 ratio if one pool is exhausted (at 0)
    let conversionMessage = '';
    if (mentalRemaining === 0 && neededMental > 0 && physicalRemaining >= neededMental * 2) {
      // Convert physical to mental (2:1)
      const converted = Math.floor(neededMental);
      physicalRemaining -= converted * 2;
      mentalRemaining += converted;
      neededMental = 0;
      conversionMessage = ` (Converted ${converted * 2} physical TPs to ${converted} mental TP)`;
    } else if (physicalRemaining === 0 && neededPhysical > 0 && mentalRemaining >= neededPhysical * 2) {
      // Convert mental to physical (2:1)
      const converted = Math.floor(neededPhysical);
      mentalRemaining -= converted * 2;
      physicalRemaining += converted;
      neededPhysical = 0;
      conversionMessage = ` (Converted ${converted * 2} mental TPs to ${converted} physical TP)`;
    }
    
    // Check if we still don't have enough
    if (neededPhysical > 0 || neededMental > 0) {
      return { success: false, message: `Not enough training points. You need ${totalPhysicalCost} physical and ${totalMentalCost} mental TPs.` };
    }

    characterData.tps[0] = physicalRemaining;
    characterData.tps[1] = mentalRemaining;
    skill.ranks += ranksToTrain;

    return { success: true, message: `Successfully trained ${skill.name} by ${ranksToTrain} ranks. New rank: ${skill.ranks}. Remaining TPs: ${characterData.tps[0]} physical, ${characterData.tps[1]} mental.${conversionMessage}` };
  }

  /**
   * Show skills list
   */
  showSkillsList(connection) {
    const state = this.creationStates.get(connection);
    
    if (!state.characterData.skills || Object.keys(state.characterData.skills).length === 0) {
      state.characterData.skills = this.initializeSkills(state.characterData.profession);
    }
    
    this.sendMessage(connection, '\r\nAvailable Skills:\r\n');
    this.sendMessage(connection, `Training Points: ${state.characterData.tps[0]} physical, ${state.characterData.tps[1]} mental\r\n\r\n`);
    
    const skills = Object.entries(state.characterData.skills);
    
    // Group skills by category
    const combatSkills = skills.filter(([id, skill]) =>
      ['brawling', 'one_handed_edged', 'one_handed_blunt', 'two_handed', 'polearm', 'ranged', 'thrown', 'combat_maneuvers', 'shield_use', 'armor_use'].includes(id)
    );
    const utilitySkills = skills.filter(([id, skill]) =>
      ['climbing', 'swimming', 'disarm_traps', 'pick_locks', 'stalk_and_hide', 'perception', 'ambush', 'survival', 'first_aid'].includes(id)
    );
    const magicSkills = skills.filter(([id, skill]) =>
      ['spell_aim', 'mana_share', 'magic_item_use', 'scroll_reading', 'harness_power', 'major_elemental', 'minor_elemental', 'major_spiritual', 'minor_spiritual', 'cleric_base', 'wizard_base', 'empath_base', 'sorcerer_base', 'ranger_base', 'paladin_base', 'bard_base'].includes(id)
    );

    const formatSkill = ([id, skill]) => {
      const currentRanks = skill.ranks || 0;
      return `- ${skill.name} (Ranks: ${currentRanks}) - Cost: ${skill.cost[0]} physical, ${skill.cost[1]} mental per rank`;
    };

    if (combatSkills.length > 0) {
      this.sendMessage(connection, '--- Combat Skills ---\r\n');
      combatSkills.forEach(([id, skill]) => {
        this.sendMessage(connection, formatSkill([id, skill]) + '\r\n');
      });
      this.sendMessage(connection, '\r\n');
    }
    if (utilitySkills.length > 0) {
      this.sendMessage(connection, '--- Utility Skills ---\r\n');
      utilitySkills.forEach(([id, skill]) => {
        this.sendMessage(connection, formatSkill([id, skill]) + '\r\n');
      });
      this.sendMessage(connection, '\r\n');
    }
    if (magicSkills.length > 0) {
      this.sendMessage(connection, '--- Magic Skills ---\r\n');
      magicSkills.forEach(([id, skill]) => {
        this.sendMessage(connection, formatSkill([id, skill]) + '\r\n');
      });
      this.sendMessage(connection, '\r\n');
    }
    
    this.sendMessage(connection, '>');
  }

  /**
   * Show finalization
   */
  showFinalization(connection) {
    const state = this.creationStates.get(connection);
    const char = state.characterData;
    
    this.sendMessage(connection, '\r\nCHARACTER SUMMARY\r\n\r\n');
    this.sendMessage(connection, `Name: ${char.name}\r\n`);
    this.sendMessage(connection, `Gender: ${char.gender}\r\n`);
    this.sendMessage(connection, `Race: ${char.race}\r\n`);
    this.sendMessage(connection, `Profession: ${char.profession}\r\n\r\n`);
    this.sendMessage(connection, `Remaining TPs: ${char.tps[0]} physical, ${char.tps[1]} mental\r\n\r\n`);
    this.sendMessage(connection, 'Type "create" to finalize your character, or "back" to return to skill training:\r\n');
    this.sendMessage(connection, '>');
  }

  /**
   * Handle finalization
   */
  async handleFinalization(connection, input) {
    const state = this.creationStates.get(connection);
    
    if (input.toLowerCase() === 'back') {
      state.step = 'skills';
      this.showSkillTraining(connection);
      return { success: true, message: 'Returned to skill training' };
    }
    
    if (input.toLowerCase() === 'create') {
      try {
        // Create the final character
        const character = {
          name: state.characterData.name,
          gender: state.characterData.gender,
          race: state.characterData.race,
          playerClass: state.characterData.profession,
          attributes: state.characterData.attributes,
          tps: state.characterData.tps,
          skills: state.characterData.skills,
          equipment: {},
          inventory: [],
          room: 'wehnimers-landing-town:tsc',
          account: state.account.username,
          metadata: {
            level: 1,
            lastLogin: new Date().toISOString(),
            isOnline: true
          }
        };
        
        // Save the character
        await this.playerSystem.saveCharacter(character);
        
        // Add character to account
        state.account.addCharacter(character.name);
        await this.accountManager.saveAccount(state.account);
        
        this.sendMessage(connection, `\r\nCharacter ${character.name} created successfully!\r\n`);
        this.sendMessage(connection, `Welcome to GS3, ${character.name}!\r\n\r\n`);
        
        // Clear creation state
        this.creationStates.delete(connection);
        
        return { 
          success: true, 
          message: 'Character created successfully', 
          player: character,
          account: state.account
        };
      } catch (error) {
        this.sendMessage(connection, `Error creating character: ${error.message}\r\n`);
        return { success: false, message: error.message };
      }
    }
    
    this.sendMessage(connection, 'Type "create" to finalize or "back" to return to skill training:\r\n');
    this.sendMessage(connection, '>');
    return { success: false, message: 'Invalid choice' };
  }

  /**
   * Send message to connection
   */
  sendMessage(connection, message) {
    if (connection.write) {
      // Telnet connection
      connection.write(message);
    } else if (connection.send) {
      // WebSocket connection
      connection.send(message);
    }
  }

  /**
   * Check if connection is in character creation
   */
  isInCreation(connection) {
    return this.creationStates.has(connection);
  }

  /**
   * Clear creation state
   */
  clearCreationState(connection) {
    this.creationStates.delete(connection);
  }
}

module.exports = CharacterCreationManager;
