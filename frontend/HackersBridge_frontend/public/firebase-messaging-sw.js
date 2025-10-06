// // public/firebase-messaging-sw.js
// importScripts("https://www.gstatic.com/firebasejs/9.17.1/firebase-app-compat.js");
// importScripts("https://www.gstatic.com/firebasejs/9.17.1/firebase-messaging-compat.js");

// firebase.initializeApp({
//   apiKey: "AIzaSyCI3YEkTq0kfEwqP8z76R7b8CKcJCaHFA4",
//   authDomain: "batch-management-ab0f0.firebaseapp.com",
//   projectId: "batch-management-ab0f0",
//   storageBucket: "batch-management-ab0f0.firebasestorage.app",
//   messagingSenderId: "306334764327",
//   appId: "1:306334764327:web:21b0a8bf19bcbe768dad02",
// });

// const messaging = firebase.messaging();

// messaging.onBackgroundMessage(function (payload) {
//   console.log("📩 Background Message received: ", payload);
//   self.registration.showNotification(payload.notification.title, {
//     body: payload.notification.body,
//     icon: payload.notification.icon,
//   });
// });
