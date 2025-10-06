// import { getToken, onMessage } from "firebase/messaging";
// import { messaging } from "./FireBase";
// // import firebase from './../../../node_modules/@firebase/app-compat/dist/app-compat.d';
// import Firebase from "firebase/compat/app";
// import axiosInstance from './../Components/dashboard/api/api';
// import BASE_URL from "../ip/Ip";

// export const VAPID_KEY = "BO9-Ff_KcXN_norQE4ZMwL83Mq1Vb1COR-34cvd3uuIwprFx3AJfzwl_a7o3hrSVhwLHuirqgUbNtFxp7Kj6MUE"; // from Firebase console


// // Save or refresh token in backend
// export const saveFCMToken = async (token) => {
//   try {
//     const response = await axiosInstance.post(
//       `${BASE_URL}/push_notification/fcm-token/save/`,
//       { token }
//     );
//     console.log("✅ Token saved to backend:", response.data);
//   } catch (err) {
//     console.error("❌ Error saving FCM token:", err);
//   }
// };

// // Request FCM Token
// export const requestFCMToken = async () => {
//   try {
//     const currentToken = await getToken(messaging, { vapidKey: VAPID_KEY });
//     if (currentToken) {
//       await saveFCMToken(currentToken);
//     } else {
//       console.log("No registration token. Request permission.");
//     }
//   } catch (err) {
//     console.error("Error getting FCM token:", err);
//   }
// };

// // Foreground Message Listener
// export const onMessageListener = () =>
//   new Promise((resolve) => {
//     onMessage(messaging, (payload) => {
//       console.log("📩 Foreground message received:", payload);
//       resolve(payload);
//     });
//   });
