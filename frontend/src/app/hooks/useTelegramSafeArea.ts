import { useEffect, useState } from 'react';

interface SafeAreaInsets {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

/**
 * Hook to handle Telegram Mini App safe area insets
 * Listens to viewport changes and updates CSS variables
 */
export function useTelegramSafeArea() {
  const [safeArea, setSafeArea] = useState<SafeAreaInsets>({
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  });

  useEffect(() => {
    // Check if Telegram WebApp is available
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;

      // Function to update safe area
      const updateSafeArea = () => {
        const insets = {
          top: tg.safeAreaInset?.top || 0,
          bottom: tg.safeAreaInset?.bottom || 0,
          left: tg.safeAreaInset?.left || 0,
          right: tg.safeAreaInset?.right || 0,
        };

        setSafeArea(insets);

        // Update CSS variables
        document.documentElement.style.setProperty('--tg-safe-top', `${insets.top}px`);
        document.documentElement.style.setProperty('--tg-safe-bottom', `${insets.bottom}px`);
        document.documentElement.style.setProperty('--tg-safe-left', `${insets.left}px`);
        document.documentElement.style.setProperty('--tg-safe-right', `${insets.right}px`);

        // Also set content safe area insets (includes status bar, header, etc.)
        const contentInsets = {
          top: tg.contentSafeAreaInset?.top || 0,
          bottom: tg.contentSafeAreaInset?.bottom || 0,
          left: tg.contentSafeAreaInset?.left || 0,
          right: tg.contentSafeAreaInset?.right || 0,
        };

        document.documentElement.style.setProperty('--tg-content-safe-top', `${contentInsets.top}px`);
        document.documentElement.style.setProperty('--tg-content-safe-bottom', `${contentInsets.bottom}px`);
        document.documentElement.style.setProperty('--tg-content-safe-left', `${contentInsets.left}px`);
        document.documentElement.style.setProperty('--tg-content-safe-right', `${contentInsets.right}px`);
      };

      // Initial update
      updateSafeArea();

      // Enable fullscreen mode
      tg.expand();

      // Listen to viewport changes
      tg.onEvent('viewportChanged', updateSafeArea);

      // Cleanup
      return () => {
        tg.offEvent('viewportChanged', updateSafeArea);
      };
    } else {
      // Fallback for non-Telegram environments (development)
      // Set default values
      document.documentElement.style.setProperty('--tg-safe-top', '0px');
      document.documentElement.style.setProperty('--tg-safe-bottom', '0px');
      document.documentElement.style.setProperty('--tg-safe-left', '0px');
      document.documentElement.style.setProperty('--tg-safe-right', '0px');
      document.documentElement.style.setProperty('--tg-content-safe-top', '0px');
      document.documentElement.style.setProperty('--tg-content-safe-bottom', '0px');
      document.documentElement.style.setProperty('--tg-content-safe-left', '0px');
      document.documentElement.style.setProperty('--tg-content-safe-right', '0px');
    }
  }, []);

  return safeArea;
}

// Type declaration for Telegram WebApp
declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        expand: () => void;
        safeAreaInset?: {
          top: number;
          bottom: number;
          left: number;
          right: number;
        };
        contentSafeAreaInset?: {
          top: number;
          bottom: number;
          left: number;
          right: number;
        };
        onEvent: (eventType: string, callback: () => void) => void;
        offEvent: (eventType: string, callback: () => void) => void;
        viewportHeight: number;
        viewportStableHeight: number;
        isExpanded: boolean;
      };
    };
  }
}
