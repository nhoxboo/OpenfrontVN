/**
 * OfflineGameEngine - Manages offline local game execution
 * Simulates game server behavior for standalone offline games
 */

import type { GameRecord, GameStartInfo } from "../Schemas";

export interface OfflineGameConfig {
  gameId: string;
  playerId: string;
  playerName: string;
  mapName: string;
  gameMode: "sandbox" | "practice" | "ai-duel";
  aiPlayers?: number;
  aiDifficulty?: "easy" | "normal" | "hard";
  maxPlayers?: number;
}

export interface OfflineGameSnapshot {
  gameId: string;
  config: OfflineGameConfig;
  gameData: GameRecord;
  turn: number;
  startTime: number;
  lastUpdateTime: number;
  paused: boolean;
}

export class OfflineGameEngine {
  private gameSnapshot: OfflineGameSnapshot | null = null;
  private updateInterval: NodeJS.Timeout | null = null;
  private listeners: Map<string, Set<(data: unknown) => void>> = new Map();

  /**
   * Initialize a new offline game
   */
  initializeGame(config: OfflineGameConfig): OfflineGameSnapshot {
    const gameId = config.gameId || `offline-${Date.now()}`;

    this.gameSnapshot = {
      gameId,
      config,
      gameData: this.createEmptyGameRecord(config),
      turn: 0,
      startTime: Date.now(),
      lastUpdateTime: Date.now(),
      paused: false,
    };

    return this.gameSnapshot;
  }

  /**
   * Create an empty game record for offline play
   */
  private createEmptyGameRecord(config: OfflineGameConfig): GameRecord {
    return {
      gameId: config.gameId,
      mapName: config.mapName,
      gameMode: config.gameMode,
      players: [
        {
          playerId: config.playerId,
          playerName: config.playerName,
          nation: config.playerName,
          team: 0,
          terroryCount: 50, // Starting territory
          gold: 1000, // Starting resources
          isHuman: true,
          isAI: false,
          joinedAt: Date.now(),
          statistics: {
            totalTerritories: 50,
            maxTerritories: 50,
            totalGold: 1000,
            unitCount: 0,
            buildingsCount: 0,
            attacksCount: 0,
            defensesCount: 0,
          },
        },
      ],
      terrain: [],
      currentTurn: 0,
      gameState: "RUNNING",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    } as unknown as GameRecord;
  }

  /**
   * Get current game snapshot
   */
  getSnapshot(): OfflineGameSnapshot | null {
    return this.gameSnapshot;
  }

  /**
   * Start the offline game loop
   */
  startGameLoop(tickRate: number = 100): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }

    this.updateInterval = setInterval(() => {
      if (this.gameSnapshot && !this.gameSnapshot.paused) {
        this.updateGameState();
      }
    }, tickRate);
  }

  /**
   * Stop the offline game loop
   */
  stopGameLoop(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  /**
   * Pause the game
   */
  pauseGame(): void {
    if (this.gameSnapshot) {
      this.gameSnapshot.paused = true;
      this.emit("gamePaused", this.gameSnapshot);
    }
  }

  /**
   * Resume the game
   */
  resumeGame(): void {
    if (this.gameSnapshot) {
      this.gameSnapshot.paused = false;
      this.emit("gameResumed", this.gameSnapshot);
    }
  }

  /**
   * Update game state on each tick
   */
  private updateGameState(): void {
    if (!this.gameSnapshot) return;

    // Increment turn every ~10 ticks (100ms * 10 = 1 second per turn)
    this.gameSnapshot.lastUpdateTime = Date.now();

    // Emit game state update
    this.emit("gameStateUpdated", this.gameSnapshot);
  }

  /**
   * Add event listener
   */
  on(event: string, callback: (data: unknown) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  /**
   * Remove event listener
   */
  off(event: string, callback: (data: unknown) => void): void {
    if (this.listeners.has(event)) {
      this.listeners.get(event)!.delete(callback);
    }
  }

  /**
   * Emit event
   */
  private emit(event: string, data: unknown): void {
    if (this.listeners.has(event)) {
      this.listeners.get(event)!.forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Save game state
   */
  saveGame(): OfflineGameSnapshot | null {
    return this.gameSnapshot ? { ...this.gameSnapshot } : null;
  }

  /**
   * Load game state
   */
  loadGame(snapshot: OfflineGameSnapshot): void {
    this.gameSnapshot = { ...snapshot };
    this.emit("gameLoaded", this.gameSnapshot);
  }

  /**
   * End the game
   */
  endGame(): void {
    this.stopGameLoop();
    if (this.gameSnapshot) {
      this.gameSnapshot.gameData.gameState = "FINISHED";
      this.emit("gameEnded", this.gameSnapshot);
    }
  }
}

// Singleton instance
export const offlineGameEngine = new OfflineGameEngine();
