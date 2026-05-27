/**
 * OfflineManager - Manages offline game state and local storage
 * Handles persistence of game data locally for offline gameplay
 */

import type { GameRecord } from "../Schemas";

export interface OfflineGameState {
  gameId: string;
  timestamp: number;
  gameData: GameRecord;
  playerId: string;
  playerName: string;
}

export class OfflineManager {
  private static readonly DB_NAME = "OpenFrontOffline";
  private static readonly DB_VERSION = 1;
  private static readonly STORE_GAMES = "offlineGames";
  private static readonly STORE_SETTINGS = "offlineSettings";
  private db: IDBDatabase | null = null;

  /**
   * Initialize the offline database
   */
  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(
        OfflineManager.DB_NAME,
        OfflineManager.DB_VERSION,
      );

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object stores if they don't exist
        if (!db.objectStoreNames.contains(OfflineManager.STORE_GAMES)) {
          db.createObjectStore(OfflineManager.STORE_GAMES, {
            keyPath: "gameId",
          });
        }

        if (!db.objectStoreNames.contains(OfflineManager.STORE_SETTINGS)) {
          db.createObjectStore(OfflineManager.STORE_SETTINGS);
        }
      };
    });
  }

  /**
   * Save game state for offline access
   */
  async saveOfflineGame(state: OfflineGameState): Promise<void> {
    if (!this.db) await this.initialize();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(
        [OfflineManager.STORE_GAMES],
        "readwrite",
      );
      const store = transaction.objectStore(OfflineManager.STORE_GAMES);
      const request = store.put(state);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  /**
   * Load offline game by ID
   */
  async loadOfflineGame(gameId: string): Promise<OfflineGameState | null> {
    if (!this.db) await this.initialize();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(
        [OfflineManager.STORE_GAMES],
        "readonly",
      );
      const store = transaction.objectStore(OfflineManager.STORE_GAMES);
      const request = store.get(gameId);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || null);
    });
  }

  /**
   * Get all offline games
   */
  async getAllOfflineGames(): Promise<OfflineGameState[]> {
    if (!this.db) await this.initialize();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(
        [OfflineManager.STORE_GAMES],
        "readonly",
      );
      const store = transaction.objectStore(OfflineManager.STORE_GAMES);
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || []);
    });
  }

  /**
   * Delete offline game
   */
  async deleteOfflineGame(gameId: string): Promise<void> {
    if (!this.db) await this.initialize();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(
        [OfflineManager.STORE_GAMES],
        "readwrite",
      );
      const store = transaction.objectStore(OfflineManager.STORE_GAMES);
      const request = store.delete(gameId);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  /**
   * Save offline setting
   */
  async saveSetting(key: string, value: unknown): Promise<void> {
    if (!this.db) await this.initialize();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(
        [OfflineManager.STORE_SETTINGS],
        "readwrite",
      );
      const store = transaction.objectStore(OfflineManager.STORE_SETTINGS);
      const request = store.put(value, key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  /**
   * Load offline setting
   */
  async loadSetting(key: string): Promise<unknown> {
    if (!this.db) await this.initialize();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(
        [OfflineManager.STORE_SETTINGS],
        "readonly",
      );
      const store = transaction.objectStore(OfflineManager.STORE_SETTINGS);
      const request = store.get(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  /**
   * Clear all offline data (for debugging/reset)
   */
  async clearAllData(): Promise<void> {
    if (!this.db) await this.initialize();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(
        [OfflineManager.STORE_GAMES, OfflineManager.STORE_SETTINGS],
        "readwrite",
      );

      const gamesStore = transaction.objectStore(OfflineManager.STORE_GAMES);
      const settingsStore = transaction.objectStore(
        OfflineManager.STORE_SETTINGS,
      );

      const gamesReq = gamesStore.clear();
      const settingsReq = settingsStore.clear();

      transaction.onerror = () => reject(transaction.error);
      transaction.oncomplete = () => resolve();
    });
  }
}

// Singleton instance
export const offlineManager = new OfflineManager();
