import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.20efc81991b04264b743c40fde6b6632',
  appName: 'PriceTracker',
  webDir: 'dist',
  server: {
    // Hot reload depuis le preview Lovable (pour le développement)
    url: 'https://20efc819-91b0-4264-b743-c40fde6b6632.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  android: {
    allowMixedContent: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#059669',
      showSpinner: false
    }
  }
};

export default config;
