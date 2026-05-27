/**
 * AIPlayer - Represents an AI-controlled player in the game
 * Handles AI logic, decision making, and turn execution
 */

import type {
  AIDecision,
  AIDifficulty,
  AIState,
} from "./AIStrategy";
import { AIDecisionMaker, AIStrategy } from "./AIStrategy";

export class AIPlayer {
  playerId: string;
  playerName: string;
  difficulty: AIDifficulty;
  state: AIState;
  private decisionQueue: AIDecision[] = [];
  private lastDecisionTime: number = 0;
  private reactionTime: number;

  constructor(
    playerId: string,
    playerName: string,
    difficulty: AIDifficulty = "normal",
  ) {
    this.playerId = playerId;
    this.playerName = playerName;
    this.difficulty = difficulty;
    this.reactionTime = AIStrategy.getReactionTime(difficulty);

    this.state = {
      playerId,
      playerName,
      difficulty,
      strategy: AIStrategy.getStrategyByDifficulty(difficulty),
      territoryCount: 50,
      gold: 1000,
      militaryStrength: 0,
      diplomacyLevel: 0,
    };
  }

  /**
   * Get next decision if reaction time has passed
   */
  getNextDecision(): AIDecision | null {
    const now = Date.now();

    if (now - this.lastDecisionTime >= this.reactionTime) {
      const decision = AIDecisionMaker.getNextDecision(this.state);
      this.lastDecisionTime = now;
      this.decisionQueue.push(decision);
      return decision;
    }

    // Return from queue if available
    return this.decisionQueue.length > 0 ? this.decisionQueue[0] : null;
  }

  /**
   * Execute a decision and remove it from queue
   */
  executeDecision(decision: AIDecision): void {
    if (this.decisionQueue.length > 0 && this.decisionQueue[0] === decision) {
      this.decisionQueue.shift();

      // Update state based on decision
      if (decision.amount) {
        this.state.gold -= decision.amount;
      }
    }
  }

  /**
   * Update AI state with game state changes
   */
  updateState(updates: Partial<AIState>): void {
    this.state = {
      ...this.state,
      ...updates,
    };
  }

  /**
   * Check if AI should take emergency action
   */
  isInEmergency(): boolean {
    return AIDecisionMaker.shouldPlayDefensive(this.state);
  }

  /**
   * Get AI difficulty label for UI
   */
  getDifficultyLabel(): string {
    switch (this.difficulty) {
      case "easy":
        return "Easy";
      case "normal":
        return "Normal";
      case "hard":
        return "Hard";
      default:
        return "Unknown";
    }
  }

  /**
   * Reset AI state (for game restart)
   */
  reset(): void {
    this.state = {
      playerId: this.playerId,
      playerName: this.playerName,
      difficulty: this.difficulty,
      strategy: AIStrategy.getStrategyByDifficulty(this.difficulty),
      territoryCount: 50,
      gold: 1000,
      militaryStrength: 0,
      diplomacyLevel: 0,
    };
    this.decisionQueue = [];
    this.lastDecisionTime = 0;
  }
}

/**
 * AIPlayerManager - Manages multiple AI players
 */
export class AIPlayerManager {
  private aiPlayers: Map<string, AIPlayer> = new Map();
  private updateInterval: NodeJS.Timeout | null = null;

  /**
   * Add new AI player
   */
  addAIPlayer(
    playerId: string,
    playerName: string,
    difficulty: AIDifficulty,
  ): AIPlayer {
    const aiPlayer = new AIPlayer(playerId, playerName, difficulty);
    this.aiPlayers.set(playerId, aiPlayer);
    return aiPlayer;
  }

  /**
   * Get AI player by ID
   */
  getAIPlayer(playerId: string): AIPlayer | undefined {
    return this.aiPlayers.get(playerId);
  }

  /**
   * Get all AI players
   */
  getAllAIPlayers(): AIPlayer[] {
    return Array.from(this.aiPlayers.values());
  }

  /**
   * Remove AI player
   */
  removeAIPlayer(playerId: string): boolean {
    return this.aiPlayers.delete(playerId);
  }

  /**
   * Start AI game loop
   */
  startAILoop(tickRate: number = 1000): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }

    this.updateInterval = setInterval(() => {
      this.updateAllAIPlayers();
    }, tickRate);
  }

  /**
   * Stop AI game loop
   */
  stopAILoop(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  /**
   * Update all AI players
   */
  private updateAllAIPlayers(): void {
    this.aiPlayers.forEach((aiPlayer) => {
      const decision = aiPlayer.getNextDecision();
      if (decision) {
        // Dispatch decision to game engine
        window.dispatchEvent(
          new CustomEvent("aiDecision", {
            detail: {
              playerId: aiPlayer.playerId,
              decision,
            },
          }),
        );
      }
    });
  }

  /**
   * Create multiple AI opponents for a game
   */
  createAIOpponents(
    count: number,
    difficulty: AIDifficulty,
    startIndex: number = 1,
  ): AIPlayer[] {
    const aiPlayers: AIPlayer[] = [];

    for (let i = 0; i < count; i++) {
      const playerId = `ai-${startIndex + i}`;
      const playerName = this.generateAIPlayerName(i);
      const aiPlayer = this.addAIPlayer(playerId, playerName, difficulty);
      aiPlayers.push(aiPlayer);
    }

    return aiPlayers;
  }

  /**
   * Generate random AI player names
   */
  private generateAIPlayerName(index: number): string {
    const adjectives = [
      "Swift",
      "Mighty",
      "Cunning",
      "Bold",
      "Wise",
      "Fierce",
    ];
    const nouns = [
      "Dragon",
      "Phoenix",
      "Wolf",
      "Eagle",
      "Bear",
      "Lion",
    ];

    const adj =
      adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];

    return `${adj}${noun}${index}`;
  }

  /**
   * Clear all AI players
   */
  clearAll(): void {
    this.stopAILoop();
    this.aiPlayers.clear();
  }

  /**
   * Get AI statistics
   */
  getAIStats(): {
    totalPlayers: number;
    byDifficulty: Record<AIDifficulty, number>;
  } {
    const stats: Record<AIDifficulty, number> = {
      easy: 0,
      normal: 0,
      hard: 0,
    };

    this.aiPlayers.forEach((player) => {
      stats[player.difficulty]++;
    });

    return {
      totalPlayers: this.aiPlayers.size,
      byDifficulty: stats,
    };
  }
}

// Singleton instance
export const aiPlayerManager = new AIPlayerManager();
