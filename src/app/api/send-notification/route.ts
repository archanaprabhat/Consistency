// src/app/api/send-notification/route.ts
import { NextResponse } from 'next/server';
import admin from 'firebase-admin';
import { ServiceAccount } from 'firebase-admin';
import serviceAccount from '../../../../servicekey.json';

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