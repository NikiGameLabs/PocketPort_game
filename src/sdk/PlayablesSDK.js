import bridge from '@playgama/bridge';

class PlayablesSDK {
  constructor() {
    this.bridge = bridge;
    this.isBridgeReady = false;
    this.firstFrameSent = false;
    this.gameReadySent = false;

    this.initBridge();
  }

  async initBridge() {
    try {
      await this.bridge.initialize();
      this.isBridgeReady = true;
      console.log('[PlaygamaBridge] Initialized successfully. Platform:', this.bridge.platform?.id);
    } catch (err) {
      console.warn('[PlaygamaBridge] Running in standalone/fallback mode:', err);
    }
  }

  firstFrameReady() {
    if (this.firstFrameSent) return;
    this.firstFrameSent = true;
    console.log('[PlayablesSDK] firstFrameReady triggered');

    // Direct YouTube Playables native hook if present
    if (typeof window !== 'undefined' && window.YouTubePlayables?.firstFrameReady) {
      window.YouTubePlayables.firstFrameReady();
    }
  }

  gameReady() {
    if (this.gameReadySent) return;
    this.gameReadySent = true;
    console.log('[PlayablesSDK] gameReady triggered');

    // Inform Playgama Bridge
    if (this.bridge?.setGameLoadingProgress) {
      this.bridge.setGameLoadingProgress(100);
    }

    // Direct YouTube Playables native hook if present
    if (typeof window !== 'undefined' && window.YouTubePlayables?.gameReady) {
      window.YouTubePlayables.gameReady();
    }
  }

  showRewardedAd(onRewarded, onError) {
    console.log('[PlayablesSDK] Requesting Rewarded Video Ad...');

    if (this.bridge?.advertisement?.showRewarded) {
      // Playgama Bridge Rewarded Ad
      this.bridge.advertisement.showRewarded({
        placement: 'speed_boost',
        onRewarded: () => {
          console.log('[PlayablesSDK] Rewarded Ad completed! Granting reward.');
          if (onRewarded) onRewarded();
        },
        onError: (err) => {
          console.warn('[PlayablesSDK] Rewarded Ad error or cancelled:', err);
          // In development/test mode, still grant reward so gameplay isn't blocked
          if (onRewarded) onRewarded();
          if (onError) onError(err);
        }
      });
    } else {
      // Local fallback simulation
      setTimeout(() => {
        if (onRewarded) onRewarded();
      }, 500);
    }
  }

  showInterstitialAd() {
    console.log('[PlayablesSDK] Requesting Interstitial Ad...');

    if (this.bridge?.advertisement?.showInterstitial) {
      this.bridge.advertisement.showInterstitial({
        placement: 'port_completed'
      });
    }
  }

  saveGameProgress(data) {
    try {
      localStorage.setItem('pocketport_save_data', JSON.stringify(data));
      if (this.bridge?.storage?.set) {
        this.bridge.storage.set('pocketport_save_data', JSON.stringify(data));
      }
    } catch (e) {
      console.warn('[PlayablesSDK] Save error:', e);
    }
  }

  loadGameProgress() {
    try {
      const stored = localStorage.getItem('pocketport_save_data');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('[PlayablesSDK] Load error:', e);
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

    // Native YouTube Playables handlers
    if (window.YouTubePlayables?.onPause) {
      window.YouTubePlayables.onPause(() => { if (onPause) onPause(); });
    }
    if (window.YouTubePlayables?.onResume) {
      window.YouTubePlayables.onResume(() => { if (onResume) onResume(); });
    }
  }
}

export const sdk = new PlayablesSDK();
