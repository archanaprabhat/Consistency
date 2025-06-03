export const StorageKey = {
  HABITS: 'habits',
  DARK_MODE: 'darkMode',
  NOTIFICATION_TIME: 'notificationTime',
  FCM_TOKEN: 'fcmToken'
} as const;

export type StorageKeyType = typeof StorageKey[keyof typeof StorageKey];

export const storage = {
  get: <T>(key: StorageKeyType): T | null => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  },
  
  set: <T>(key: StorageKeyType, value: T): void => {
    localStorage.setItem(key, JSON.stringify(value));
  },
  
  remove: (key: StorageKeyType): void => {
    localStorage.removeItem(key);
  },
  
  clear: (): void => {
    localStorage.clear();
  }
}; 