import './globals.css'
import { Metadata } from 'next'
import Script from 'next/script'

export const metadata: Metadata = {
  title: 'Habit Tracker',
  description: 'Track your daily habits and build consistency',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* Script to set Firebase config in service worker context */}
        <Script
          id="firebase-config-script"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
                navigator.serviceWorker.ready.then(registration => {
                  registration.active?.postMessage({
                    type: 'FIREBASE_CONFIG',
                    config: {
                      FIREBASE_API_KEY: '${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}',
                      FIREBASE_AUTH_DOMAIN: '${process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN}',
                      FIREBASE_PROJECT_ID: '${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}',
                      FIREBASE_STORAGE_BUCKET: '${process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET}',
                      FIREBASE_MESSAGING_SENDER_ID: '${process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID}',
                      FIREBASE_APP_ID: '${process.env.NEXT_PUBLIC_FIREBASE_APP_ID}'
                    }
                  });
                });
              }
            `
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  )
}