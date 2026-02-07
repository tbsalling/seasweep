// ads.js — Ad integration abstraction layer

class AdManager {
  constructor() {
    this.publisherId = ''; // Set your AdSense publisher ID
    this.enabled = false;
    this.rewardedAdReady = false;
    this.interstitialCounter = 0;
    this.interstitialFrequency = 3; // show every N levels
    this.onRewardGranted = null;
  }

  init(publisherId) {
    if (!publisherId) return;
    this.publisherId = publisherId;

    // Check if AdSense script is loaded
    if (typeof window.adsbygoogle !== 'undefined') {
      this.enabled = true;
      this.initBannerAd();
    }
  }

  initBannerAd() {
    // The banner ad slot is in the HTML. Push to load it.
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      // Ad blocker or load failure
    }
  }

  shouldShowInterstitial() {
    this.interstitialCounter++;
    return this.enabled && (this.interstitialCounter % this.interstitialFrequency === 0);
  }

  showInterstitial(callback) {
    if (!this.enabled) {
      if (callback) callback();
      return;
    }
    // In a real implementation, this would show a full-screen ad
    // For now, simulate with a brief delay
    console.log('[Ad] Interstitial would show here');
    if (callback) setTimeout(callback, 100);
  }

  showRewardedAd(onReward) {
    if (!this.enabled) {
      // No ads available — grant reward anyway for testing
      if (onReward) onReward();
      return;
    }
    // In a real implementation, this would show a rewarded ad
    console.log('[Ad] Rewarded ad would show here');
    if (onReward) setTimeout(onReward, 100);
  }

  showBanner() {
    const el = document.getElementById('banner-ad');
    if (el) el.style.display = 'block';
  }

  hideBanner() {
    const el = document.getElementById('banner-ad');
    if (el) el.style.display = 'none';
  }
}
