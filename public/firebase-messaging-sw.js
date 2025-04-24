// Import and initialize the Firebase SDK
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Store Firebase configuration
let firebaseConfig = null;
let messaging = null;

// Initialize Firebase if config is available
function initializeFirebase() {
  if (!firebaseConfig) return;
  
  try {
    firebase.initializeApp(firebaseConfig);
    messaging = firebase.messaging();
    
    // Handle background messages
    messaging.onBackgroundMessage((payload) => {
      console.log('[firebase-messaging-sw.js] Received background message ', payload);
      
      const notificationTitle = payload.notification?.title || 'Habit Tracker';
      const notificationOptions = {
        body: payload.notification?.body || 'Time to check your habits!',
        icon: '/assets/icon.jpg',
        badge: '/assets/badge.jpg',
        tag: 'habit-reminder',
        vibrate: [200, 100, 200]
      };
      
      self.registration.showNotification(notificationTitle, notificationOptions);
    });
    
    console.log('[firebase-messaging-sw.js] Firebase initialized successfully');
  } catch (error) {
    console.error('[firebase-messaging-sw.js] Firebase initialization error:', error);
  }
}

// Listen for messages from the main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'FIREBASE_CONFIG') {
    firebaseConfig = {
      apiKey: event.data.config.FIREBASE_API_KEY,
      authDomain: event.data.config.FIREBASE_AUTH_DOMAIN,
      projectId: event.data.config.FIREBASE_PROJECT_ID,
      storageBucket: event.data.config.FIREBASE_STORAGE_BUCKET,
      messagingSenderId: event.data.config.FIREBASE_MESSAGING_SENDER_ID,
      appId: event.data.config.FIREBASE_APP_ID
    };
    
    console.log('[firebase-messaging-sw.js] Received Firebase config:', firebaseConfig);
    initializeFirebase();
  }
});



// When a user clicks on the notification
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification clicked');
  event.notification.close();

  self.addEventListener("message", (event) => {
    if (event.data === "openWindowTest") {
      if (clients.openWindow) {
        clients.openWindow("/").then((client) => {
          console.log("New window opened:", client);
        });
      }
    }
  });

  // Open the app and focus it
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        // Check if there is already a window/tab open
        for (let i = 0; i < windowClients.length; i++) {
          const client = windowClients[i];
          // If so, focus it
          if ('focus' in client) {
            return client.focus();
          }
        }
        // If not, open a new window/tab
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
  );
});

console.log('[firebase-messaging-sw.js] Service worker loaded');