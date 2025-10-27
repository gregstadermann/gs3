'use strict';

const CharacterCreationManager = require('./CharacterCreationManager');

/**
 * Login Flow Manager
 * Handles the login process: username → password → character selection
 * Based on gemstone3 login flow
 */
class LoginFlow {
  constructor(accountManager, playerSystem, gameEngine) {
    this.accountManager = accountManager;
    this.playerSystem = playerSystem;
    this.gameEngine = gameEngine;
    this.loginStates = new Map(); // connection -> login state
    this.characterCreationManager = new CharacterCreationManager(
      gameEngine.characterCreation, 
      playerSystem, 
      accountManager
    );
  }

  /**
   * Start the login process for a connection
   */
  startLogin(connection) {
    this.loginStates.set(connection, {
      step: 'username',
      account: null,
      attempts: 0
    });

    this.sendMessage(connection, 'Welcome to GS3!\r\n');
    this.sendMessage(connection, 'Welcome, what is your account username?\r\n');
  }

  /**
   * Process login input
   */
  async processLoginInput(connection, input) {
    // Check if in character creation
    if (this.characterCreationManager.isInCreation(connection)) {
      return await this.characterCreationManager.processCreationInput(connection, input);
    }

    const state = this.loginStates.get(connection);
    if (!state) {
      return { success: false, message: 'No login session found' };
    }

    const trimmedInput = input.trim();
    if (!trimmedInput) {
      return { success: false, message: 'Please enter a valid response' };
    }

    switch (state.step) {
      case 'username':
        return await this.handleUsername(connection, trimmedInput);
      
      case 'create_account':
        return await this.handleCreateAccount(connection, trimmedInput);
      
      case 'new_password':
        return await this.handleNewPassword(connection, trimmedInput);
      
      case 'password':
        return await this.handlePassword(connection, trimmedInput);
      
      case 'character_selection':
        return await this.handleCharacterSelection(connection, trimmedInput);
      
      default:
        return { success: false, message: 'Invalid login state' };
    }
  }

  /**
   * Handle username input
   */
  async handleUsername(connection, username) {
    const state = this.loginStates.get(connection);
    
    // Check if account exists
    let account = this.accountManager.getAccount(username);
    if (!account) {
      account = await this.accountManager.loadAccount(username);
    }

    if (!account) {
      // Ask if they want to create a new account
      state.step = 'create_account';
      state.username = username;
      this.sendMessage(connection, `Account '${username}' not found. Create new account? (yes/no)\r\n`);
      return { success: true, message: 'Account creation prompt sent' };
    }

    // Account exists, ask for password
    state.step = 'password';
    state.account = account;
    state.username = username;
    this.sendMessage(connection, 'Enter your password:\r\n');
    
    return { success: true, message: 'Password prompt sent' };
  }

  /**
   * Handle create account confirmation
   */
  async handleCreateAccount(connection, response) {
    const state = this.loginStates.get(connection);
    
    if (response.toLowerCase() === 'yes' || response.toLowerCase() === 'y') {
      // Create new account
      state.step = 'new_password';
      this.sendMessage(connection, 'Enter a password for your account:\r\n');
      return { success: true, message: 'Password prompt sent' };
    } else if (response.toLowerCase() === 'no' || response.toLowerCase() === 'n') {
      // Go back to username
      state.step = 'username';
      this.sendMessage(connection, 'Welcome, what is your account username?\r\n');
      return { success: true, message: 'Username prompt sent' };
    } else {
      this.sendMessage(connection, 'Please answer yes or no:\r\n');
      return { success: false, message: 'Invalid response' };
    }
  }

  /**
   * Handle new password for account creation
   */
  async handleNewPassword(connection, password) {
    const state = this.loginStates.get(connection);
    
    if (password.length < 3) {
      this.sendMessage(connection, 'Password must be at least 3 characters long. Try again:\r\n');
      return { success: false, message: 'Password too short' };
    }
    
    try {
      // Create the new account
      const account = await this.accountManager.createAccount(state.username, password);
      
      // Set up for character selection
      state.step = 'character_selection';
      state.account = account;
      state.attempts = 0;
      
      this.sendMessage(connection, `Account '${state.username}' created successfully!\r\n`);
      this.showCharacterSelection(connection, account);
      
      return { success: true, message: 'Account created successfully' };
    } catch (error) {
      this.sendMessage(connection, `Error creating account: ${error.message}\r\n`);
      this.sendMessage(connection, 'Welcome, what is your account username?\r\n');
      state.step = 'username';
      return { success: false, message: error.message };
    }
  }

  /**
   * Handle password input
   */
  async handlePassword(connection, password) {
    const state = this.loginStates.get(connection);
    
    const authResult = await this.accountManager.authenticate(state.username, password);
    
    if (!authResult.success) {
      state.attempts++;
      if (state.attempts >= 3) {
        this.sendMessage(connection, 'Too many failed attempts. Disconnecting.\r\n');
        this.clearLoginState(connection);
        return { success: false, message: 'Too many failed attempts', disconnect: true };
      }
      
      this.sendMessage(connection, `${authResult.message}. Try again:\r\n`);
      return { success: false, message: 'Invalid password' };
    }

    // Password correct, show character selection
    state.account = authResult.account;
    state.step = 'character_selection';
    state.attempts = 0;
    
    this.showCharacterSelection(connection, authResult.account);
    return { success: true, message: 'Character selection shown' };
  }

  /**
   * Handle character selection
   */
  async handleCharacterSelection(connection, selection) {
    const state = this.loginStates.get(connection);
    const account = state.account;
    
    if (selection.toLowerCase() === 'create') {
      // Start character creation process
      this.characterCreationManager.startCharacterCreation(connection, account);
      return { success: true, message: 'Character creation started' };
    }

    const choice = parseInt(selection);
    const characters = account.getActiveCharacters();
    
    if (isNaN(choice) || choice < 1 || choice > characters.length) {
      this.sendMessage(connection, 'Invalid selection. Please choose a number or type "create":\r\n');
      this.showCharacterSelection(connection, account);
      return { success: false, message: 'Invalid character selection' };
    }

    // Load the selected character
    const characterName = characters[choice - 1].username;
    const player = await this.playerSystem.loadPlayer(characterName);
    
    if (!player) {
      this.sendMessage(connection, `Error loading character '${characterName}'. Please try again.\r\n`);
      this.showCharacterSelection(connection, account);
      return { success: false, message: 'Character load failed' };
    }

    // Login successful
    this.clearLoginState(connection);
    return { 
      success: true, 
      message: `Welcome back, ${player.name}!`, 
      player: player,
      account: account
    };
  }


  /**
   * Show character selection menu
   */
  showCharacterSelection(connection, account) {
    const characters = account.getActiveCharacters();
    
    this.sendMessage(connection, `\r\nAccount: ${account.username}\r\n`);
    this.sendMessage(connection, 'Select a character:\r\n');
    
    if (characters.length === 0) {
      this.sendMessage(connection, 'No characters found. Type "create" to create a new character.\r\n');
    } else {
      characters.forEach((char, index) => {
        this.sendMessage(connection, `${index + 1}. ${char.username}\r\n`);
      });
      this.sendMessage(connection, 'Type "create" to create a new character.\r\n');
    }
    
    this.sendMessage(connection, 'Your choice: ');
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
   * Clear login state for connection
   */
  clearLoginState(connection) {
    this.loginStates.delete(connection);
  }

  /**
   * Check if connection is in login process
   */
  isInLogin(connection) {
    return this.loginStates.has(connection) || this.characterCreationManager.isInCreation(connection);
  }

  /**
   * Get login state for connection
   */
  getLoginState(connection) {
    return this.loginStates.get(connection);
  }
}

module.exports = LoginFlow;
