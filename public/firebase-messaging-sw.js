// public/firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

const firebaseConfig = {
    apiKey: "AIzaSyAPTgcTJ6zuDGFCgt7o2TQmlB0nKIE6QQw",
    authDomain: "arch-a-track.firebaseapp.com",
    projectId: "arch-a-track",
    storageBucket: "arch-a-track.firebasestorage.app",
    messagingSenderId: "216751832260",
    appId: "1:216751832260:web:eecac9d014715775b25d91",
    measurementId: "G-43T49Z431T"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('Received background message:', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/file.svg'
  };
  
  self.registration.showNotification(notificationTitle, notificationOptions);
});