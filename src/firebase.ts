import { initializeApp, FirebaseApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, Messaging, MessagePayload } from 'firebase/messaging';

// Define Firebase config once
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase only on client side
let messaging: Messaging | null = null;
let app: FirebaseApp | null = null;
let swRegistration: ServiceWorkerRegistration | undefined;

// Initialize Firebase
const initializeFirebase = async () => {
  if (typeof window === 'undefined') return;
  
  if (!app) {
    try {
      app = initializeApp(firebaseConfig);
      
      // Register service worker first
      try {
        if ('serviceWorker' in navigator) {
          swRegistration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
            scope: '/'
          });
          console.log('Service worker registered successfully', swRegistration);
          
          // Wait for the service worker to be ready
          await navigator.serviceWorker.ready;
          
          // Pass config to service worker - reuse the same config object
          if (swRegistration.active) {
            swRegistration.active.postMessage({
              type: 'FIREBASE_CONFIG',
              config: firebaseConfig
            });
          }
        }
        
        // Initialize messaging only after service worker is ready
        messaging = getMessaging(app);
        console.log('Firebase messaging initialized');
      } catch (error) {
        console.error("Service worker registration error:", error);
      }
    } catch (error) {
      console.error("Firebase initialization error:", error);
    }
  }
};

// Request permission and get token
export const requestNotificationPermission = async () => {
  await initializeFirebase();
  
  if (!messaging) return { success: false, reason: 'messaging-not-initialized' };
  
  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      return { success: false, reason: 'permission-denied' };
    }
    
    
    // Ensure service worker is properly registered
    if (!swRegistration) {
      swRegistration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      console.log('Service worker registered in permission flow');
    }
    
    const token = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
      serviceWorkerRegistration: swRegistration,
    });
    
    // Store token in localStorage
    if (token) {
      localStorage.setItem('fcmToken', token);
      console.log('FCM Token obtained and stored:', token);
      return { success: true, token };
    } else {
      console.error('No FCM token received');
      return { success: false, reason: 'no-token-received' };
    }
  } catch (error) {
    console.error('Notification permission error:', error);
    return { success: false, reason: 'error', error };
  }
};

// Handle foreground messages
export const setupMessageListener = (callback: (payload: MessagePayload) => void) => {
  if (!messaging) {
    initializeFirebase().then(() => {
      if (messaging) {
        return onMessage(messaging, (payload) => {
          console.log('Foreground message received:', payload);
          callback(payload);
        });
      }
    });
    return null;
  }
  
  return onMessage(messaging, (payload) => {
    console.log('Foreground message received:', payload);
    callback(payload);
  });
};

// Get stored FCM token
export const getFCMToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('fcmToken');
  }
  return null;
};

// Initialize Firebase on import if we're in browser
if (typeof window !== 'undefined') {
  initializeFirebase();
}

export { messaging };