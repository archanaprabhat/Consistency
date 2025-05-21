import { useState, useEffect } from "react";
import { X, Bell, Clock,} from "lucide-react";
import { requestNotificationPermission } from "../firebase";
import { toast } from "sonner";

interface Theme {
  bgCard: string;
  textHeader: string;
  textPrimary: string;
  textBody: string;
  bgButtonHover: string;
  btnPrimary: string;
  inputBg: string;
  inputText: string;
}

interface NotificationSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  darkMode: boolean;
  theme: Theme;
}

interface NotificationTime {
  hour: number;
  minute: number;
  period: "AM" | "PM";
}

export default function NotificationSettings({
  isOpen,
  onClose,
  darkMode,
  theme,
}: NotificationSettingsProps) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState("default");
  const [notificationTime, setNotificationTime] = useState<NotificationTime>({
    hour: 8,
    minute: 0,
    period: "PM",
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if ("Notification" in window) {
      setPermissionStatus(Notification.permission);
      setNotificationsEnabled(Notification.permission === "granted");
    }

    const savedTime = localStorage.getItem("notificationTime");
    if (savedTime) {
      try {
        setNotificationTime(JSON.parse(savedTime));
      } catch (e) {
        console.error("Error parsing saved notification time:", e);
      }
    }
  }, []);

  const enableNotifications = async () => {
    setIsLoading(true);
    console.log("Requesting notification permission...");
    
    const result = await requestNotificationPermission();
    setIsLoading(false);
  
    console.log("Permission result:", result);
  
    if (result.success) {
      setNotificationsEnabled(true);
      setPermissionStatus("granted");
      
      // Explicitly check the token was stored
      const storedToken = localStorage.getItem('fcmToken');
      if (storedToken) {
        toast.success("Notifications enabled successfully!");
        console.log("FCM Token stored:", storedToken);
      } else {
        toast.error("Failed to store FCM token. Please try again.");
      }
    } else {
      console.error("Failed to enable notifications:", result.reason);
      if (result.reason === "permission-denied") {
        toast.error(
          "Permission denied. Please enable notifications in your browser settings."
        );
        setPermissionStatus("denied");
      } else {
        toast.error("Failed to enable notifications. Please try again.");
      }
    }
  };

  const handleTimeChange = (
    field: keyof NotificationTime,
    value: string | number
  ) => {
    let newValue = value;

    if (field === "hour") {
      newValue = Math.min(12, Math.max(1, parseInt(value as string)));
    } else if (field === "minute") {
      newValue = Math.min(59, Math.max(0, parseInt(value as string)));
    }

    const updatedTime = { ...notificationTime, [field]: newValue };
    setNotificationTime(updatedTime);
    localStorage.setItem("notificationTime", JSON.stringify(updatedTime));

    if (notificationsEnabled) {
      scheduleNotification(updatedTime);
    }
  };

  const scheduleNotification = (time: NotificationTime) => {
    const now = new Date();
    const notifyTime = new Date();

    let hours = time.hour;
    if (time.period === "PM" && hours < 12) hours += 12;
    if (time.period === "AM" && hours === 12) hours = 0;

    notifyTime.setHours(hours, time.minute, 0, 0);
    if (notifyTime < now) notifyTime.setDate(notifyTime.getDate() + 1);

    localStorage.setItem("nextNotificationTime", notifyTime.toString());

    const formattedTime = notifyTime.toLocaleTimeString();
    console.log(`Notification scheduled for: ${formattedTime}`);
    toast.success(`Notification scheduled for ${formattedTime}`);
  };

  if (!isOpen) return null;
  const debugServiceWorker = async () => {
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      console.log('Service Worker Registrations:', registrations);
      
      const fcmToken = localStorage.getItem('fcmToken');
      console.log('Stored FCM Token:', fcmToken);
      
      // Check permission status
      console.log('Notification Permission:', Notification.permission);
    }
  };

  return (
    <div className='fixed inset-0 flex items-center justify-center z-50 bg-black' onClick={onClose}>
      <div
        className={`${
          theme.bgCard
        } w-full max-w-md rounded-lg p-6 relative ${
          darkMode ? "border border-gray-700" : "border border-pink-200"
        }`}
        onClick={(e) => e.stopPropagation()}
        >
        <div className='flex justify-between items-center mb-6'>
          <h2 className={`text-xl font-bold ${theme.textHeader}`}>
            Notification Settings
          </h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-full ${theme.bgButtonHover}`}
            aria-label='Close settings'>
            <X size={20} className={theme.textPrimary} />
          </button>
        </div>

        <div className='space-y-6'>
          {/* Enable Notifications */}
          <div
            className={`p-4 rounded-lg ${
              darkMode ? "bg-gray-800/50" : "bg-pink-50/50"
            }`}>
            <div className='flex items-center justify-between mb-3'>
              <div className='flex items-center'>
                <Bell className={`${theme.textPrimary} mr-3`} size={20} />
                <h3 className={`font-medium ${theme.textBody}`}>
                  Push Notifications
                </h3>
              </div>
              <label className="flex items-center cursor-pointer">
  <div className="relative">
    <input
      type="checkbox"
      className="sr-only"
      checked={notificationsEnabled}
      disabled={permissionStatus === "denied" || isLoading}
      onChange={(e) => {
        if (e.target.checked) {
          enableNotifications();
        } else {
          setNotificationsEnabled(false);
          localStorage.removeItem("fcmToken");
          toast.info("Notifications turned off.");
        }
      }}
    />
    <div
      className={`block w-12 h-7 rounded-full transition ${
        notificationsEnabled ? "bg-green-500" : "bg-gray-300"
      }`}
    ></div>
    <div
      className={`dot absolute left-1 top-1 bg-white w-5 h-5 rounded-full transition ${
        notificationsEnabled ? "translate-x-5" : ""
      }`}
    ></div>
  </div>
  <span className="ml-3 text-sm font-medium">
    {notificationsEnabled ? "Enabled" : "Disabled"}
  </span>
</label>
              {isLoading && (
                <div className="ml-2 w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
              )}
            </div>
            <p
              className={`text-sm ${
                darkMode ? "text-gray-400" : "text-gray-600"
              }`}>
              {notificationsEnabled
                ? "You'll receive reminders to track your habits."
                : permissionStatus === "denied"
                ? "Please enable notifications in your browser settings."
                : "Enable notifications to get reminders about tracking your habits."}
            </p>
          </div>

          {/* Time Picker */}
          <div
            className={`p-4 rounded-lg ${
              darkMode ? "bg-gray-800/50" : "bg-pink-50/50"
            } ${!notificationsEnabled ? "opacity-60" : ""}`}>
            <div className='flex items-center mb-3'>
              <Clock className={`${theme.textPrimary} mr-3`} size={20} />
              <h3 className={`font-medium ${theme.textBody}`}>Reminder Time</h3>
            </div>

            <div className='flex items-center justify-center space-x-2 mt-4'>
              <select
                value={notificationTime.hour}
                onChange={(e) => handleTimeChange("hour", e.target.value)}
                disabled={!notificationsEnabled}
                className={`w-16 p-2 rounded-md ${theme.inputBg} ${theme.inputText}`}>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((hour) => (
                  <option key={hour} value={hour}>
                    {hour}
                  </option>
                ))}
              </select>
              <span className={theme.textBody}>:</span>
              <select
                value={notificationTime.minute}
                onChange={(e) => handleTimeChange("minute", e.target.value)}
                disabled={!notificationsEnabled}
                className={`w-16 p-2 rounded-md ${theme.inputBg} ${theme.inputText}`}>
                {Array.from({ length: 60 }, (_, i) => i).map((minute) => (
                  <option key={minute} value={minute}>
                    {minute.toString().padStart(2, "0")}
                  </option>
                ))}
              </select>
              <select
                value={notificationTime.period}
                onChange={(e) =>
                  handleTimeChange("period", e.target.value as "AM" | "PM")
                }
                disabled={!notificationsEnabled}
                className={`w-16 p-2 rounded-md ${theme.inputBg} ${theme.inputText}`}>
                <option value='AM'>AM</option>
                <option value='PM'>PM</option>
              </select>
            </div>
          </div>
        </div>

        {/* Footer buttons */}
        <div className='mt-4'>
          <button
            onClick={async () => {
              const { sendTestNotification } = await import(
                "../utils/testNotification"
              );
              try {
                console.log("Sending test notification...");
                const token = localStorage .getItem("fcmToken");
                console.log("Current FCM token:", token);

                if (!token) {
                  toast.error(
                    "No FCM token found. Enable notifications first."
                  );
                  return;
                }

                const result = await sendTestNotification();
                if (result) {
                  toast.success("Test notification sent successfully!");
                } else {
                  toast.error("Failed to send test notification");
                }
              } catch (error) {
                console.error("Error sending test notification:", error);
                toast.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
              }
            }}
            disabled={!notificationsEnabled}
            className={`px-4 py-2 rounded-lg ${theme.btnPrimary} text-white ${
              !notificationsEnabled ? "opacity-50" : ""
            }`}>
            Send Test Notification
          </button>
          <button
  onClick={async () => {
    // Clear FCM token
    localStorage.removeItem('fcmToken');
    // Reset UI state
    setNotificationsEnabled(false);
    setPermissionStatus('default');
    toast.info("Notification settings reset. Please enable notifications again.");
  }}
  className={`mt-2 px-4 py-2 rounded-lg ${
    darkMode ? "bg-gray-700" : "bg-gray-200"
  } ${theme.textBody}`}>
  Reset Notification Settings
</button>
<button onClick={debugServiceWorker} className="mt-2 text-xs text-gray-500">
  Debug Service Worker
</button>
        </div>
      </div>
    </div>
  );
}
