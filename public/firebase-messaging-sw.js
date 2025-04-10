// Keep track of whether Firebase has been initialized
let firebaseInitialized = false;

// Listen for messages from the main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'FIREBASE_CONFIG') {
    // Store the config values
    self.FIREBASE_API_KEY = event.data.config.FIREBASE_API_KEY;
    self.FIREBASE_AUTH_DOMAIN = event.data.config.FIREBASE_AUTH_DOMAIN;
    self.FIREBASE_PROJECT_ID = event.data.config.FIREBASE_PROJECT_ID;
    self.FIREBASE_STORAGE_BUCKET = event.data.config.FIREBASE_STORAGE_BUCKET;
    self.FIREBASE_MESSAGING_SENDER_ID = event.data.config.FIREBASE_MESSAGING_SENDER_ID;
    self.FIREBASE_APP_ID = event.data.config.FIREBASE_APP_ID;
    
    // Initialize Firebase now that we have the config
    initializeFirebase();
  }
});

// Function to initialize Firebase
function initializeFirebase() {
  if (firebaseInitialized) return;
  
  // Give the service worker access to Firebase Messaging.
  // Note that you can only use Firebase Messaging here. Other Firebase libraries
  // are not available in the service worker.
  importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
  importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

  // Initialize the Firebase app in the service worker by passing in the messagingSenderId.
  firebase.initializeApp({
    apiKey: self.FIREBASE_API_KEY,
    authDomain: self.FIREBASE_AUTH_DOMAIN,
    projectId: self.FIREBASE_PROJECT_ID,
    storageBucket: self.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: self.FIREBASE_MESSAGING_SENDER_ID,
    appId: self.FIREBASE_APP_ID
  });

  // Retrieve an instance of Firebase Messaging so that it can handle background messages.
  const messaging = firebase.messaging();

  // Handle background notifications
  messaging.onBackgroundMessage((payload) => {
    console.log('Received background message: ', payload);
    
    const { title, body } = payload.notification || { 
      title: 'Habit Tracker Reminder', 
      body: 'Time to track your habits!'
    };

    // Customize notification here
    const notificationOptions = {
      body,
      icon: '/icon.png', // Add your app icon path here
      badge: '/badge.png', // Add your badge icon path here
      tag: 'habit-reminder',
      data: payload.data,
      vibrate: [200, 100, 200]
    };

    self.registration.showNotification(title, notificationOptions);
  });
  
  firebaseInitialized = true;
}

// Try to initialize Firebase immediately in case config is already available
initializeFirebase();

// When a user clicks on the notification
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  // Open the app and focus it
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        // Check if there is already a window/tab open with the target URL
        for (let i = 0; i < windowClients.length; i++) {
          const client = windowClients[i];
          // If so, focus it
          if (client.url === '/' && 'focus' in client) {
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