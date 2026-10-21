import bridge from '@playgama/bridge';

class PlayablesSDK {
  constructor() {
    this.bridge = (typeof window !== 'undefined' && window.bridge) ? window.bridge : bridge;
    this.isBridgeReady = false;
    this.firstFrameSent = false;
    this.gameReadySent = false;
    this.memoryStore = {};

    this.initBridge();
  }

  async initBridge() {
    try {
      const b = (typeof window !== 'undefined' && window.bridge) ? window.bridge : this.bridge;
      if (b && !b.isInitialized) {
        await b.initialize();
      }
      this.isBridgeReady = true;
      console.log('[PlaygamaBridge] Initialized successfully. Platform:', b?.platform?.id);

      // Report game ready
      if (b?.platform?.sendMessage) {
        b.platform.sendMessage('game_ready');
      }
    } catch (err) {
      console.warn('[PlaygamaBridge] Running in fallback mode:', err);
    }
  }

  firstFrameReady() {
    if (this.firstFrameSent) return;
    this.firstFrameSent = true;
    console.log('[PlayablesSDK] firstFrameReady triggered');

    if (typeof window !== 'undefined' && window.YouTubePlayables?.firstFrameReady) {
      window.YouTubePlayables.firstFrameReady();
    }
  }

  gameReady() {
    if (this.gameReadySent) return;
    this.gameReadySent = true;
    console.log('[PlayablesSDK] gameReady triggered');

    const b = (typeof window !== 'undefined' && window.bridge) ? window.bridge : this.bridge;
    if (b?.platform?.sendMessage) {
      b.platform.sendMessage('game_ready');
      console.log('[PlayablesSDK] Sent game_ready message to Bridge platform');
    }

    if (b?.setGameLoadingProgress) {
      b.setGameLoadingProgress(100);
    }

    if (typeof window !== 'undefined' && window.YouTubePlayables?.gameReady) {
      window.YouTubePlayables.gameReady();
    }
  }

  showRewardedAd(onRewarded, onError) {
    console.log('[PlayablesSDK] Requesting Rewarded Video Ad...');
    const b = (typeof window !== 'undefined' && window.bridge) ? window.bridge : this.bridge;

    if (b?.advertisement?.showRewarded) {
      b.advertisement.showRewarded({
        placement: 'speed_boost',
        onRewarded: () => {
          console.log('[PlayablesSDK] Rewarded Ad completed! Granting reward.');
          if (onRewarded) onRewarded();
        },
        onError: (err) => {
          console.warn('[PlayablesSDK] Rewarded Ad error or cancelled:', err);
          if (onRewarded) onRewarded();
          if (onError) onError(err);
        }
      });
    } else {
      setTimeout(() => {
        if (onRewarded) onRewarded();
      }, 500);
    }
  }

  showInterstitialAd() {
    console.log('[PlayablesSDK] Requesting Interstitial Ad...');
    const b = (typeof window !== 'undefined' && window.bridge) ? window.bridge : this.bridge;

    if (b?.advertisement?.showInterstitial) {
      b.advertisement.showInterstitial({
        placement: 'port_completed'
      });
    }
  }

  saveGameProgress(data) {
    try {
      this.memoryStore['pocketport_save_data'] = JSON.stringify(data);
    } catch (e) {}

    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('pocketport_save_data', JSON.stringify(data));
      }
    } catch (e) {
      // Sandboxed iframe localStorage restricted
    }

    try {
      const b = (typeof window !== 'undefined' && window.bridge) ? window.bridge : this.bridge;
      if (b?.storage?.set) {
        b.storage.set('pocketport_save_data', JSON.stringify(data));
      }
    } catch (e) {
      console.warn('[PlayablesSDK] Bridge save error:', e);
    }
  }

  loadGameProgress() {
    // 1. In-memory check
    if (this.memoryStore['pocketport_save_data']) {
      try {
        return JSON.parse(this.memoryStore['pocketport_save_data']);
      } catch (e) {}
    }

    // 2. localStorage check
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = localStorage.getItem('pocketport_save_data');
        if (stored) {
          this.memoryStore['pocketport_save_data'] = stored;
          return JSON.parse(stored);
        }
      }
    } catch (e) {
      // Sandboxed iframe localStorage restricted
    }

    return {
      cash: 100,
      unlockedPort: 1,
      speedLevel: 1,
      capacityLevel: 1,
      hasHelper: false,
      totalEarned: 0,
    };
  }

  setupLifecycleHandlers(onPause, onResume) {
    if (typeof window === 'undefined') return;

    window.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        if (onPause) onPause();
      } else {
        if (onResume) onResume();
      }
    });

    if (window.YouTubePlayables?.onPause) {
      window.YouTubePlayables.onPause(() => { if (onPause) onPause(); });
    }
    if (window.YouTubePlayables?.onResume) {
      window.YouTubePlayables.onResume(() => { if (onResume) onResume(); });
    }
  }
}

export const sdk = new PlayablesSDK();
