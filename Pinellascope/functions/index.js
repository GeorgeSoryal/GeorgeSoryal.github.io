// // // The public key must match the one in your pwa_push_app_vanilla.html
// // const VAPID_PUBLIC_KEY = 'BPh2tBvV8-5B4n-j_t91_XwK2sQ0c-5oE7Jv_S-J_oV-g_oZ_E0k-w'; 
// // const VAPID_PRIVATE_KEY = 'YOUR_GENERATED_VAPID_PRIVATE_KEY_HERE'; // KEEP THIS SECRET
// // // --- Firebase Functions Backend (Node.js) ---
// const functions = require('firebase-functions');
// const admin = require('firebase-admin');
// const webpush = require('web-push');

// // // Initialize Firebase Admin SDK to access Firestore
// admin.initializeApp();
// const db = admin.firestore();

// // // --- Configuration ---

// // // The public key must match the one in your pwa_push_app_vanilla.html
// // const VAPID_PUBLIC_KEY = 'BPh2tBvV8-5B4n-j_t91_XwK2sQ0c-5oE7Jv_S-J_oV-g_oZ_E0k-w'; 
// // const VAPID_PRIVATE_KEY = 'YOUR_GENERATED_VAPID_PRIVATE_KEY_HERE'; // KEEP THIS SECRET
// exports.scheduledDailyPush = functions.pubsub.schedule('0 9 * * *')
//     .timeZone('America/New_York') 
//     .onRun(async (context) => {
//         const generalCollection = await db.collection('general/nextDate').get();
//         generalCollection.forEach(async (doc) => {
//             console.log(doc.data());
//         }
//         // const subscriptionsSnapshot = await db.collection('subscriptions').get();
//     });