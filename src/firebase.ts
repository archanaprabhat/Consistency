import { initializeApp, FirebaseApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, Messaging, MessagePayload } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

let messaging: Messaging | null = null;
let app: FirebaseApp | null = null;

// Simple notification preferences
export const NotificationPreferences = {
  // Check if user wants notifications (simple toggle)
  isEnabled: (): boolean => {
    return localStorage.getItem('notifications_enabled') === 'true';
  },
  
  // Enable/disable notifications (just a preference, doesn't touch FCM)
  setEnabled: (enabled: boolean): void => {
    localStorage.setItem('notifications_enabled', enabled.toString());
  },
  
  // Get notification time
  getTime: () => {
    const saved = localStorage.getItem('notification_time');
    return saved ? JSON.parse(saved) : { hour: 8, minute: 0, period: 'PM' };
  },
  
  // Set notification time
  setTime: (time: { hour: number; minute: number; period: 'AM' | 'PM' }): void => {
    localStorage.setItem('notification_time', JSON.stringify(time));
  },
  
  // Get FCM token (readonly - never delete this)
  getToken: (): string | null => {
    return localStorage.getItem('fcm_token');
  }
};

// Initialize Firebase once
const initializeFirebase = async (): Promise<boolean> => {
  if (typeof window === 'undefined' || app) return !!messaging;
  
  try {
    app = initializeApp(firebaseConfig);
    
    // Register service worker
    if ('serviceWorker' in navigator) {
      await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      await navigator.serviceWorker.ready;
    }
    
    messaging = getMessaging(app);
    console.log('Firebase initialized successfully');
    return true;
  } catch (error) {
    console.error('Firebase initialization failed:', error);
    return false;
  }
};

// One-time setup: Get FCM token and store it permanently
export const setupNotifications = async (): Promise<{ success: boolean; message: string }> => {
  // Check if already set up
  if (NotificationPreferences.getToken()) {
    NotificationPreferences.setEnabled(true);
    return { success: true, message: 'Notifications enabled' };
  }
  
  // Initialize Firebase
  const initialized = await initializeFirebase();
  if (!initialized || !messaging) {
    return { success: false, message: 'Failed to initialize Firebase' };
  }
  
  try {
    // Request permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      return { success: false, message: 'Permission denied' };
    }
    
    // Get and store FCM token if not already present
    const token = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
    });
    
    if (!token) {
      return { success: false, message: 'Failed to get FCM token' };
    }
    
    // Store token permanently
    localStorage.setItem('fcm_token', token);
    NotificationPreferences.setEnabled(true);
    
    console.log('FCM token obtained:', token);
    return { success: true, message: 'Notifications set up successfully' };
    
  } catch (error) {
    console.error('Setup failed:', error);
    return { success: false, message: 'Setup failed: ' + (error as Error).message };
  }
};

// Simple toggle - just changes user preference
export const toggleNotifications = (enabled: boolean): void => {
  NotificationPreferences.setEnabled(enabled);
};

// Check if notifications are ready to use
export const getNotificationStatus = () => {
  const hasToken = !!NotificationPreferences.getToken();
  const isEnabled = NotificationPreferences.isEnabled();
  const hasPermission = typeof window !== 'undefined' && Notification.permission === 'granted';
  
  return {
    isSetup: hasToken && hasPermission,
    isEnabled: isEnabled,
    canReceive: hasToken && hasPermission && isEnabled
  };
};

// Handle foreground messages
export const setupMessageListener = (callback: (payload: MessagePayload) => void) => {
  if (messaging) {
    return onMessage(messaging, callback);
  }
  
  initializeFirebase().then(() => {
    if (messaging) {
      onMessage(messaging, callback);
    }
  });
};

// Initialize on import (browser only)
if (typeof window !== 'undefined') {
  initializeFirebase();
}