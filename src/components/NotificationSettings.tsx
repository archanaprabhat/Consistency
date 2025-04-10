import { useState, useEffect } from "react";
import { X, Bell, Clock, Check } from "lucide-react";
import { requestNotificationPermission } from "../firebase";
import {toast } from "sonner";

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

  // Check if notifications are already enabled
  useEffect(() => {
    // Check browser notification permission status
    if ("Notification" in window) {
      setPermissionStatus(Notification.permission);
      setNotificationsEnabled(Notification.permission === "granted");
    }

    // Check if notification time is already saved
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
    const result = await requestNotificationPermission();
    setIsLoading(false);

    if (result.success) {
      setNotificationsEnabled(true);
      setPermissionStatus("granted");
      toast.success("Notifications enabled successfully!");
    } else {
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

  const handleTimeChange = (field: keyof NotificationTime, value: string | number) => {
    let newValue = value;
    
    // Handle numeric fields
    if (field === "hour") {
      newValue = parseInt(value as string);
      if (isNaN(newValue) || newValue < 1) newValue = 1;
      if (newValue > 12) newValue = 12;
    } else if (field === "minute") {
      newValue = parseInt(value as string);
      if (isNaN(newValue) || newValue < 0) newValue = 0;
      if (newValue > 59) newValue = 59;
    }

    const updatedTime = { ...notificationTime, [field]: newValue };
    setNotificationTime(updatedTime);
    
    // Save to localStorage
    localStorage.setItem("notificationTime", JSON.stringify(updatedTime));
    
    // Schedule the notification (if permissions are granted)
    if (notificationsEnabled) {
      scheduleNotification(updatedTime);
    }
  };

  const scheduleNotification = (time: NotificationTime) => {
    // Convert selected time to milliseconds
    const now = new Date();
    const notifyTime = new Date();
    
    // Set hours, converting from 12-hour to 24-hour format
    let hours = time.hour;
    if (time.period === "PM" && hours < 12) hours += 12;
    if (time.period === "AM" && hours === 12) hours = 0;
    
    notifyTime.setHours(hours, time.minute, 0, 0);
    
    // If time has already passed today, schedule for tomorrow
    if (notifyTime < now) {
      notifyTime.setDate(notifyTime.getDate() + 1);
    }
    
    // Store the next notification time
    localStorage.setItem("nextNotificationTime", notifyTime.toString());
    
    // For debug purposes only
    const formattedTime = notifyTime.toLocaleTimeString();
    console.log(`Notification scheduled for: ${formattedTime}`);
    
    toast.success(`Notification scheduled for ${formattedTime}`);
    
    // We'll handle the actual scheduling in the HabitTracker component
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div
        className={`${
          theme.bgCard
        } w-full max-w-md rounded-lg shadow-xl p-6 relative ${
          darkMode ? "border border-gray-700" : "border border-pink-200"
        }`}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className={`text-xl font-bold ${theme.textHeader}`}>
            Notification Settings
          </h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-full ${theme.bgButtonHover}`}
            aria-label="Close settings"
          >
            <X size={20} className={theme.textPrimary} />
          </button>
        </div>

        <div className="space-y-6">
          {/* Notification Toggle */}
          <div
            className={`p-4 rounded-lg ${
              darkMode ? "bg-gray-800/50" : "bg-pink-50/50"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <Bell className={`${theme.textPrimary} mr-3`} size={20} />
                <h3 className={`font-medium ${theme.textBody}`}>
                  Push Notifications
                </h3>
              </div>
              <button
                onClick={enableNotifications}
                disabled={
                  isLoading || notificationsEnabled || permissionStatus === "denied"
                }
                className={`px-4 py-2 rounded-lg ${
                  notificationsEnabled
                    ? "bg-green-500 text-white"
                    : permissionStatus === "denied"
                    ? "bg-gray-400 text-gray-100"
                    : theme.btnPrimary
                } transition-colors flex items-center ${
                  isLoading ? "opacity-70" : ""
                }`}
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                ) : notificationsEnabled ? (
                  <Check size={16} className="mr-2" />
                ) : null}
                {notificationsEnabled
                  ? "Enabled"
                  : permissionStatus === "denied"
                  ? "Blocked"
                  : "Enable"}
              </button>
            </div>
            <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
              {notificationsEnabled
                ? "You'll receive reminders to track your habits."
                : permissionStatus === "denied"
                ? "Please enable notifications in your browser settings."
                : "Enable notifications to get reminders about tracking your habits."}
            </p>
          </div>

          {/* Notification Time */}
          <div
            className={`p-4 rounded-lg ${
              darkMode ? "bg-gray-800/50" : "bg-pink-50/50"
            } ${!notificationsEnabled ? "opacity-60" : ""}`}
          >
            <div className="flex items-center mb-3">
              <Clock className={`${theme.textPrimary} mr-3`} size={20} />
              <h3 className={`font-medium ${theme.textBody}`}>
                Reminder Time
              </h3>
            </div>

            <div className="flex items-center justify-center space-x-2 mt-4">
              <select
                value={notificationTime.hour}
                onChange={(e) => handleTimeChange("hour", e.target.value)}
                disabled={!notificationsEnabled}
                className={`w-16 p-2 rounded-md ${theme.inputBg} ${theme.inputText}`}
              >
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
                className={`w-16 p-2 rounded-md ${theme.inputBg} ${theme.inputText}`}
              >
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
                className={`w-16 p-2 rounded-md ${theme.inputBg} ${theme.inputText}`}
              >
                <option value="AM">AM</option>
                <option value="PM">PM</option>
              </select>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-lg ${theme.btnPrimary} text-white`}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}