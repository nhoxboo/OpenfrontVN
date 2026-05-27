/**
 * AIStrategy - Defines different AI difficulty levels and decision-making strategies
 * Includes Aggressive, Defensive, and Balanced strategies
 */

export type AIDifficulty = "easy" | "normal" | "hard";

export interface AIDecision {
  action: "expand" | "defend" | "attack" | "trade" | "diplomacy";
  priority: number;
  targetTerritory?: string;
  targetPlayer?: string;
  amount?: number;
}

export interface AIState {
  playerId: string;
  playerName: string;
  difficulty: AIDifficulty;
  strategy: "aggressive" | "defensive" | "balanced";
  territoryCount: number;
  gold: number;
  militaryStrength: number;
  diplomacyLevel: number;
}

export class AIStrategy {
  /**
   * Get AI strategy based on difficulty
   */
  static getStrategyByDifficulty(
    difficulty: AIDifficulty,
  ): "aggressive" | "defensive" | "balanced" {
    switch (difficulty) {
      case "easy":
        return "defensive";
      case "normal":
        return "balanced";
      case "hard":
        return "aggressive";
      default:
        return "balanced";
    }
  }

  /**
   * Calculate AI decision with reaction time based on difficulty
   */
  static getReactionTime(difficulty: AIDifficulty): number {
    switch (difficulty) {
      case "easy":
        return 3000 + Math.random() * 3000; // 3-6 seconds
      case "normal":
        return 1000 + Math.random() * 2000; // 1-3 seconds
      case "hard":
        return 500 + Math.random() * 1000; // 0.5-1.5 seconds
      default:
        return 2000;
    }
  }

  /**
   * Get decision quality based on difficulty (affects random decision accuracy)
   */
  static getDecisionQuality(difficulty: AIDifficulty): number {
    switch (difficulty) {
      case "easy":
        return 0.4; // 40% optimal decisions
      case "normal":
        return 0.7; // 70% optimal decisions
      case "hard":
        return 0.95; // 95% optimal decisions
      default:
        return 0.7;
    }
  }
}

export class AggressiveAIStrategy {
  /**
   * Make aggressive expansion decisions
   */
  static makeDecision(state: AIState): AIDecision {
    const decisions: AIDecision[] = [
      { action: "expand", priority: 10, amount: Math.floor(state.gold * 0.6) },
      { action: "attack", priority: 8, amount: Math.floor(state.gold * 0.3) },
      { action: "defend", priority: 3, amount: Math.floor(state.gold * 0.1) },
    ];

    return decisions.sort((a, b) => b.priority - a.priority)[0];
  }

  /**
   * Calculate territorial growth target
   */
  static calculateGrowthTarget(currentTerritory: number): number {
    return Math.floor(currentTerritory * 1.15); // Aim for 15% growth
  }
}

export class DefensiveAIStrategy {
  /**
   * Make defensive-focused decisions
   */
  static makeDecision(state: AIState): AIDecision {
    const decisions: AIDecision[] = [
      { action: "defend", priority: 10, amount: Math.floor(state.gold * 0.6) },
      { action: "expand", priority: 5, amount: Math.floor(state.gold * 0.2) },
      { action: "trade", priority: 5, amount: Math.floor(state.gold * 0.2) },
    ];

    return decisions.sort((a, b) => b.priority - a.priority)[0];
  }

  /**
   * Calculate defensive fortification budget
   */
  static calculateDefenseBudget(totalGold: number): number {
    return Math.floor(totalGold * 0.6);
  }
}

export class BalancedAIStrategy {
  /**
   * Make balanced decisions between growth and defense
   */
  static makeDecision(state: AIState): AIDecision {
    const decisions: AIDecision[] = [
      { action: "expand", priority: 6, amount: Math.floor(state.gold * 0.4) },
      { action: "defend", priority: 6, amount: Math.floor(state.gold * 0.3) },
      { action: "attack", priority: 5, amount: Math.floor(state.gold * 0.2) },
      { action: "trade", priority: 3, amount: Math.floor(state.gold * 0.1) },
    ];

    return decisions.sort((a, b) => b.priority - a.priority)[0];
  }

  /**
   * Calculate balanced growth target
   */
  static calculateGrowthTarget(currentTerritory: number): number {
    return Math.floor(currentTerritory * 1.08); // Aim for 8% growth
  }
}

/**
 * Main AI decision maker
 */
export class AIDecisionMaker {
  /**
   * Get next AI decision based on state and strategy
   */
  static getNextDecision(state: AIState): AIDecision {
    const quality = AIStrategy.getDecisionQuality(state.difficulty);

    // Use optimal decision with probability based on difficulty
    if (Math.random() < quality) {
      return this.getOptimalDecision(state);
    } else {
      return this.getRandomDecision(state);
    }
  }

  /**
   * Get optimal decision based on current strategy
   */
  private static getOptimalDecision(state: AIState): AIDecision {
    switch (state.strategy) {
      case "aggressive":
        return AggressiveAIStrategy.makeDecision(state);
      case "defensive":
        return DefensiveAIStrategy.makeDecision(state);
      case "balanced":
      default:
        return BalancedAIStrategy.makeDecision(state);
    }
  }

  /**
   * Get random decision (used for lower difficulties)
   */
  private static getRandomDecision(state: AIState): AIDecision {
    const actions: Array<"expand" | "defend" | "attack" | "trade" | "diplomacy"> = [
      "expand",
      "defend",
      "attack",
      "trade",
      "diplomacy",
    ];
    const action = actions[Math.floor(Math.random() * actions.length)];

    return {
      action,
      priority: Math.random() * 10,
      amount: Math.floor(Math.random() * state.gold),
    };
  }

  /**
   * Evaluate game situation for emergency defensive actions
   */
  static shouldPlayDefensive(state: AIState): boolean {
    // Emergency defense if territory is critically low
    const minTerritory = 20;
    return state.territoryCount < minTerritory;
  }

  /**
   * Evaluate if AI can afford aggressive expansion
   */
  static canAffordAggression(state: AIState): boolean {
    // Need at least 50% of max gold to attack
    const minGold = 500; // Assume 1000 is starting amount
    return state.gold > minGold;
  }
}
