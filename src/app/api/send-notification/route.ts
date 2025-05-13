// src/app/api/send-notification/route.ts
import { NextResponse } from 'next/server';
import admin from 'firebase-admin';
import { ServiceAccount } from 'firebase-admin';

const serviceAccount = {
  type: process.env.FIREBASE_TYPE,
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: process.env.FIREBASE_AUTH_URI,
  token_uri: process.env.FIREBASE_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
  client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
  universe_domain: process.env.FIREBASE_UNIVERSE_DOMAIN,
};

// Initialize Firebase Admin if it hasn't been initialized yet
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as ServiceAccount),
    });
    
    console.log('Firebase Admin initialized successfully');
  } catch (error) {
    console.error('Firebase admin initialization error:', error);
  }
}

export async function POST(request: Request) {
  try {
    const { token, title, body, data } = await request.json();
    
    // Log the request
    console.log('Notification request received:', { token: token?.substring(0, 10) + '...', title, body });

    // Validate inputs
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Missing FCM token' },
        { status: 400 }
      );
    }

    // Send notification
    const message = {
      token,
      notification: {
        title: title || 'Habit Tracker',
        body: body || 'Time to check your habits!',
      },
      data: data || {},
      webpush: {
        fcmOptions: {
          link: '/',
        },
        notification: {
          icon: '/assets/icon.jpg',
        },
      },
    };

    console.log('Sending FCM message:', message);
    
    const response = await admin.messaging().send(message);
    console.log('Successfully sent message:', response);
    
    return NextResponse.json({
      success: true,
      result: response,
    });
  } catch (error) {
    console.error('Error sending notification:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}