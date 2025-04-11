export const sendTestNotification = async () => {
  const fcmToken = localStorage.getItem('fcmToken');
  
  if (!fcmToken) {
    console.error('No FCM token found. Enable notifications first.');
    return false;
  }
  
  console.log('Sending notification with token:', fcmToken);
  
  try {
    const response = await fetch('/api/send-notification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: fcmToken,
        title: 'Test Notification',
        body: 'This is a test notification from your Habit Tracker app!',
        data: {
          time: new Date().toISOString(),
          url: '/'
        }
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null) || await response.text();
      console.error('Server returned error:', response.status, errorData);
      return false;
    }
    
    const result = await response.json();
    console.log('Notification sending result:', result);
    return result.success;
  } catch (error) {
    console.error('Error sending test notification:', error);
    return false;
  }
};