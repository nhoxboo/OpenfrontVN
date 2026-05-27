/**
 * OfflineEnvironment - Detects and manages offline mode status
 * Provides utilities for detecting network connectivity and offline mode configuration
 */

export interface OfflineConfig {
  enabled: boolean;
  cacheAssets: boolean;
  allowAI: boolean;
  maxLocalGames: number;
}

export class OfflineEnvironment {
  private static isOnline: boolean = navigator.onLine;
  private static offlineConfig: OfflineConfig = {
    enabled: false,
    cacheAssets: true,
    allowAI: true,
    maxLocalGames: 10,
  };

  /**
   * Initialize offline environment
   */
  static initialize(config: Partial<OfflineConfig> = {}): void {
    OfflineEnvironment.offlineConfig = {
      ...OfflineEnvironment.offlineConfig,
      ...config,
    };

    // Listen to online/offline events
    window.addEventListener("online", () => {
      OfflineEnvironment.isOnline = true;
      window.dispatchEvent(new CustomEvent("offlineStatusChanged", {
        detail: { online: true },
      }));
    });

    window.addEventListener("offline", () => {
      OfflineEnvironment.isOnline = false;
      window.dispatchEvent(new CustomEvent("offlineStatusChanged", {
        detail: { online: false },
      }));
    });
  }

  /**
   * Check if currently online
   */
  static isConnected(): boolean {
    return OfflineEnvironment.isOnline;
  }

  /**
   * Check if offline mode is enabled
   */
  static isOfflineModeEnabled(): boolean {
    return OfflineEnvironment.offlineConfig.enabled;
  }

  /**
   * Get current offline configuration
   */
  static getConfig(): OfflineConfig {
    return { ...OfflineEnvironment.offlineConfig };
  }

  /**
   * Update offline configuration
   */
  static updateConfig(config: Partial<OfflineConfig>): void {
    OfflineEnvironment.offlineConfig = {
      ...OfflineEnvironment.offlineConfig,
      ...config,
    };
  }

  /**
   * Enable offline mode
   */
  static enableOfflineMode(): void {
    OfflineEnvironment.offlineConfig.enabled = true;
    window.dispatchEvent(new CustomEvent("offlineModeToggled", {
      detail: { enabled: true },
    }));
  }

  /**
   * Disable offline mode
   */
  static disableOfflineMode(): void {
    OfflineEnvironment.offlineConfig.enabled = false;
    window.dispatchEvent(new CustomEvent("offlineModeToggled", {
      detail: { enabled: false },
    }));
  }

  /**
   * Can play offline (offline mode enabled and has saved games or can play with AI)
   */
  static canPlayOffline(): boolean {
    return (
      OfflineEnvironment.offlineConfig.enabled &&
      OfflineEnvironment.offlineConfig.allowAI
    );
  }

  /**
   * Attempt to detect if browser supports required features for offline mode
   */
  static supportsOfflineMode(): boolean {
    // Check for IndexedDB support
    const indexedDBSupported =
      !!window.indexedDB || !!window.webkitIndexedDB || !!window.mozIndexedDB;

    // Check for ServiceWorker support (optional, for offline caching)
    const serviceWorkerSupported = !!navigator.serviceWorker;

    return indexedDBSupported;
  }
}

// Initialize on module load
OfflineEnvironment.initialize();
