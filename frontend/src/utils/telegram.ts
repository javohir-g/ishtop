/**
 * Utility for interacting with the Telegram WebApp API.
 */

interface WebAppUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  photo_url?: string;
}

interface WebAppInitData {
  query_id?: string;
  user?: WebAppUser;
  receiver?: WebAppUser;
  start_param?: string;
  auth_date: number;
  hash: string;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        initData: string;
        initDataUnsafe: WebAppInitData;
        expand: () => void;
        close: () => void;
        headerColor: string;
        backgroundColor: string;
        ready: () => void;
        onEvent: (eventType: string, eventHandler: () => void) => void;
        offEvent: (eventType: string, eventHandler: () => void) => void;
        sendData: (data: string) => void;
        isExpanded: boolean;
        viewportHeight: number;
        viewportStableHeight: number;
        safeAreaInset: {
          top: number;
          bottom: number;
          left: number;
          right: number;
        };
        contentSafeAreaInset: {
          top: number;
          bottom: number;
          left: number;
          right: number;
        };
      };
    };
  }
}

export const getTelegramWebApp = () => {
  return window.Telegram?.WebApp;
};

export const getTelegramInitData = () => {
  return getTelegramWebApp()?.initData || '';
};

export const getTelegramUser = () => {
  return getTelegramWebApp()?.initDataUnsafe?.user;
};

export const expandTelegramWebApp = () => {
  getTelegramWebApp()?.expand();
};
