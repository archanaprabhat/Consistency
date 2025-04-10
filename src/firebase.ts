import { initializeApp, FirebaseApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, Messaging, MessagePayload } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyAPTgcTJ6zuDGFCgt7o2TQmlB0nKIE6QQw",
  authDomain: "arch-a-track.firebaseapp.com",
  projectId: "arch-a-track",
  storageBucket: "arch-a-track.firebasestorage.app",
  messagingSenderId: "216751832260",
  appId: "1:216751832260:web:eecac9d014715775b25d91",
  measurementId: "G-43T49Z431T"
};

// Initialize Firebase only on client side
let messaging: Messaging | null = null;
let app: FirebaseApp | null = null;
let swRegistration: ServiceWorkerRegistration | undefined;

if (typeof window !== 'undefined') {
  try {
    app = initializeApp(firebaseConfig);
    messaging = getMessaging(app);
    swRegistration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
  } catch (error) {
    console.error("Firebase initialization error:", error);
  }
}

// Request permission and get token
export const requestNotificationPermission = async () => {
  if (!messaging) return { success: false, reason: 'messaging-not-initialized' };
  
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const token = await getToken(messaging, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
        serviceWorkerRegistration: swRegistration,
      });
      
      // Store token in localStorage
      if (token) {
        localStorage.setItem('fcmToken', token);
        return { success: true, token };
      } else {
        return { success: false, reason: 'no-token-received' };
      }
    }
    return { success: false, reason: 'permission-denied' };
  } catch (error) {
    console.error('Notification permission error:', error);
    return { success: false, reason: 'error', error };
  }
};

// Handle foreground messages
export const setupMessageListener = (callback: (payload: MessagePayload) => void) => {
  if (!messaging) return null;
  
  return onMessage(messaging, (payload) => {
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

export { messaging };