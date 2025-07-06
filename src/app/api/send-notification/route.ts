// // src/app/api/send-notification/route.ts
// import { NextResponse } from 'next/server';
// import admin from 'firebase-admin';
// import { ServiceAccount } from 'firebase-admin';

// // Import your service account key
// //import serviceKey from '../../../../servicekey.json';

// // Initialize Firebase Admin if it hasn't been initialized yet
// if (!admin.apps.length) {
//   admin.initializeApp({
//     credential: admin.credential.cert(serviceKey as ServiceAccount),
//   });
// }

// export async function POST(request: Request) {
//   try {
//     const { token, title, body } = await request.json();

//     // Validate inputs
//     if (!token || !title || !body) {
//       return NextResponse.json(
//         { success: false, error: 'Missing required fields' },
//         { status: 400 }
//       );
//     }

//     // Send notification
//     const message = {
//       notification: {
//         title,
//         body,
//       },
//       token,
//     };

//     const response = await admin.messaging().send(message);
    
//     return NextResponse.json({
//       success: true,
//       result: response,
//     });
//   } catch (error) {
//     console.error('Error sending notification:', error);
//     return NextResponse.json(
//       { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
//       { status: 500 }
//     );
//   }
// }