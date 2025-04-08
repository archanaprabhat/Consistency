// src/firebase.ts
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, Messaging } from 'firebase/messaging';

// Your Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAPTgcTJ6zuDGFCgt7o2TQmlB0nKIE6QQw",
    authDomain: "arch-a-track.firebaseapp.com",
    projectId: "arch-a-track",
    storageBucket: "arch-a-track.firebasestorage.app",
    messagingSenderId: "216751832260",
    appId: "1:216751832260:web:eecac9d014715775b25d91",
    measurementId: "G-43T49Z431T"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get messaging instance
let messaging: Messaging | null = null;

// Initialize messaging if in browser environment
if (typeof window !== 'undefined') {
  messaging = getMessaging(app);
}

// Request permission and get token
export const requestNotificationPermission = async () => {
  try {
    if (!messaging) return { success: false, reason: 'not-browser' };
    
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      // This is where you'll use your VAPID key
      const token = await getToken(messaging, {
        vapidKey: 'BNGtVu3_KptzyoglMgn3_YYTBaiFOK_5tgsV4NVca9oaGxF0zPkkV_bz0DIrlSzlnHW1HiIPgOTtW1XaNQCBMZQ'
      });
      return { success: true, token };
    }
    return { success: false, reason: 'permission-denied' };
  } catch (error) {
    console.error('Notification permission error:', error);
    return { success: false, reason: 'error', error };
  }
};

export { messaging };