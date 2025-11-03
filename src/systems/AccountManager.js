'use strict';

const bcrypt = require('bcryptjs');
const databaseManager = require('../adapters/db/mongoClient');

/**
 * Account System
 * Manages user accounts with password hashing and character lists
 * Based on gemstone3-core Account system
 */
class Account {
  constructor(data) {
    this.username = data.username;
    this.characters = data.characters || [];
    this.password = data.password;
    this.banned = data.banned || false;
    this.deleted = data.deleted || false;
    this.metadata = data.metadata || {};
    this.createdAt = data.createdAt || new Date().toISOString();
    this.lastLogin = data.lastLogin || null;
  }

  /**
   * Get the username
   */
  getUsername() {
    return this.username;
  }

  /**
   * Add a character to this account
   */
  addCharacter(characterName) {
    this.characters.push({ 
      username: characterName, 
      deleted: false,
      createdAt: new Date().toISOString()
    });
  }

  /**
   * Check if account has a character
   */
  hasCharacter(name) {
    return this.characters.find(c => c.username === name && !c.deleted);
  }

  /**
   * Get all active characters
   */
  getActiveCharacters() {
    return this.characters.filter(c => !c.deleted);
  }

  /**
   * Delete a character (soft delete)
   */
  deleteCharacter(name) {
    const character = this.characters.find(c => c.username === name);
    if (character) {
      character.deleted = true;
      character.deletedAt = new Date().toISOString();
    }
  }

  /**
   * Undelete a character
   */
  undeleteCharacter(name) {
    const character = this.characters.find(c => c.username === name);
    if (character) {
      character.deleted = false;
      delete character.deletedAt;
    }
  }

  /**
   * Set password (hashed)
   */
  setPassword(password) {
    this.password = this._hashPassword(password);
  }

  /**
   * Check password
   */
  checkPassword(password) {
    return bcrypt.compareSync(password, this.password);
  }

  /**
   * Update last login time
   */
  updateLastLogin() {
    this.lastLogin = new Date().toISOString();
  }

  /**
   * Ban this account
   */
  ban() {
    this.banned = true;
  }

  /**
   * Delete this account
   */
  deleteAccount() {
    this.characters.forEach(char => {
      this.deleteCharacter(char.username);
    });
    this.deleted = true;
  }

  /**
   * Hash password using bcrypt
   */
  _hashPassword(password) {
    const salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(password, salt);
  }

  /**
   * Serialize account data for saving
   */
  serialize() {
    return {
      username: this.username,
      characters: this.characters,
      password: this.password,
      banned: this.banned,
      deleted: this.deleted,
      metadata: this.metadata,
      createdAt: this.createdAt,
      lastLogin: this.lastLogin
    };
  }
}

/**
 * Account Manager
 * Handles account creation, loading, and management
 */
class AccountManager {
  constructor(dataDir) {
    this.accounts = new Map(); // In-memory cache
    this.db = null;
  }

  /**
   * Initialize the account manager
   */
  async initialize() {
    try {
      this.db = await databaseManager.initialize();
      console.log('Account manager initialized with MongoDB');
    } catch (error) {
      console.error('Error initializing account manager:', error);
      throw error;
    }
  }

  /**
   * Create a new account
   */
  async createAccount(username, password) {
    // Check in-memory cache first
    if (this.accounts.has(username)) {
      throw new Error('Account already exists');
    }
    
    // Check database
    const existing = await this.db.collection('accounts').findOne({ username: username });
    if (existing) {
      throw new Error('Account already exists');
    }

    const account = new Account({
      username: username,
      password: password
    });

    // Hash the password
    account.setPassword(password);

    // Save to MongoDB
    await this.saveAccount(account);

    // Add to memory cache
    this.accounts.set(username, account);

    return account;
  }

  /**
   * Load an account from MongoDB
   */
  async loadAccount(username) {
    try {
      // Check memory cache first
      if (this.accounts.has(username)) {
        return this.accounts.get(username);
      }
      
      // Load from MongoDB
      const accountData = await this.db.collection('accounts').findOne({ username: username });
      
      if (accountData) {
        const account = new Account(accountData);
        this.accounts.set(username, account);
        return account;
      }
      
      return null;
    } catch (error) {
      console.error(`Error loading account ${username}:`, error);
      return null;
    }
  }

  /**
   * Save account to MongoDB
   */
  async saveAccount(account) {
    try {
      const accountData = account.serialize();
      await this.db.collection('accounts').replaceOne(
        { username: account.username },
        accountData,
        { upsert: true }
      );
      
      // Update in-memory cache
      this.accounts.set(account.username, account);
    } catch (error) {
      console.error(`Error saving account ${account.username}:`, error);
      throw error;
    }
  }

  /**
   * Get account by username
   */
  getAccount(username) {
    return this.accounts.get(username);
  }

  /**
   * Check if account exists
   */
  hasAccount(username) {
    return this.accounts.has(username);
  }

  /**
   * Authenticate user with username and password
   */
  async authenticate(username, password) {
    let account = this.getAccount(username);
    
    // Load from file if not in memory
    if (!account) {
      account = await this.loadAccount(username);
    }

    if (!account) {
      return { success: false, message: 'Account not found' };
    }

    if (account.banned) {
      return { success: false, message: 'Account is banned' };
    }

    if (account.deleted) {
      return { success: false, message: 'Account is deleted' };
    }

    if (!account.checkPassword(password)) {
      return { success: false, message: 'Invalid password' };
    }

    // Update last login
    account.updateLastLogin();
    await this.saveAccount(account);

    return { success: true, account: account };
  }

  /**
   * Get all accounts (for admin purposes)
   */
  getAllAccounts() {
    return Array.from(this.accounts.values());
  }
  
  /**
   * Get all accounts from database (not just cached)
   */
  async getAllAccountsFromDatabase() {
    try {
      const accounts = await this.db.collection('accounts').find({}).toArray();
      return accounts.map(data => new Account(data));
    } catch (error) {
      console.error('Error getting all accounts:', error);
      return [];
    }
  }
  
  /**
   * Delete account from MongoDB
   */
  async deleteAccount(username) {
    try {
      await this.db.collection('accounts').deleteOne({ username: username });
      this.accounts.delete(username);
    } catch (error) {
      console.error(`Error deleting account ${username}:`, error);
      throw error;
    }
  }
}

module.exports = { Account, AccountManager };
