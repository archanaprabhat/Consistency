import { useState, useEffect } from "react";
import { X, Bell, Clock } from "lucide-react";
import {
  setupNotifications,
  toggleNotifications,
  getNotificationStatus,
  NotificationPreferences,
} from "../firebase";
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
  const [isLoading, setIsLoading] = useState(false);
  const [notificationStatus, setNotificationStatus] = useState({
    isSetup: false,
    isEnabled: false,
    canReceive: false,
  });
  const [notificationTime, setNotificationTime] = useState<NotificationTime>({
    hour: 8,
    minute: 0,
    period: "PM",
  });

  // Load current status and preferences
  const refreshStatus = () => {
    const status = getNotificationStatus();
    setNotificationStatus(status);

    const savedTime = NotificationPreferences.getTime();
    setNotificationTime(savedTime);

    console.log("Current notification status:", status);
  };

  useEffect(() => {
    if (isOpen) {
      refreshStatus();
    }
  }, [isOpen]);

  const handleEnableNotifications = async () => {
    if (notificationStatus.isSetup) {
      // Already set up, just toggle preference
      toggleNotifications(true);
      refreshStatus();
      toast.success("Notifications enabled!");
      return;
    }

    // First-time setup
    setIsLoading(true);
    try {
      const result = await setupNotifications();

      if (result.success) {
        refreshStatus();
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Setup error:", error);
      toast.error("Failed to set up notifications");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisableNotifications = () => {
    toggleNotifications(false);
    refreshStatus();
    toast.info("Notifications disabled");
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
    NotificationPreferences.setTime(updatedTime);

    if (notificationStatus.canReceive) {
      const formattedTime = formatTime(updatedTime);
      toast.success(`Reminder time updated to ${formattedTime}`);
    }
  };

  const formatTime = (time: NotificationTime): string => {
    const hourStr = time.hour.toString();
    const minuteStr = time.minute.toString().padStart(2, "0");
    return `${hourStr}:${minuteStr} ${time.period}`;
  };

  const sendTestNotification = async () => {
    try {
      const { sendTestNotification } = await import(
        "../utils/testNotification"
      );
      const result = await sendTestNotification();

      if (result) {
        toast.success("Test notification sent!");
      } else {
        toast.error("Failed to send test notification");
      }
    } catch (error) {
      console.error("Test notification error:", error);
      toast.error("Error sending test notification");
    }
  };

  if (!isOpen) return null;

  const statusText = () => {
    if (!notificationStatus.isSetup) {
      return "Set up notifications to receive habit reminders";
    }
    if (!notificationStatus.isEnabled) {
      return "Notifications are turned off";
    }
    return "You'll receive daily habit reminders";
  };

  return (
    <div
      className='fixed inset-0 flex items-center justify-center z-50 bg-black'
      onClick={onClose}>
      <div
        className={`${theme.bgCard} w-full max-w-md rounded-lg p-6 relative ${
          darkMode ? "border border-gray-700" : "border border-pink-200"
        }`}
        onClick={(e) => e.stopPropagation()}>
        {/* Header */}
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
          {/* Notification Toggle */}
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

              <div className='flex items-center gap-3'>
                {isLoading && (
                  <div className='w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin'></div>
                )}

                <label className='flex items-center cursor-pointer'>
                  <div className='relative'>
                    <input
                      type='checkbox'
                      className='sr-only'
                      checked={notificationStatus.isEnabled}
                      disabled={isLoading}
                      onChange={(e) => {
                        if (e.target.checked) {
                          handleEnableNotifications();
                        } else {
                          handleDisableNotifications();
                        }
                      }}
                    />
                    <div
                      className={`block w-12 h-7 rounded-full transition ${
                        notificationStatus.isEnabled
                          ? "bg-green-500"
                          : "bg-gray-300"
                      }`}></div>
                    <div
                      className={`absolute left-1 top-1 bg-white w-5 h-5 rounded-full transition-transform duration-300 ${
                        notificationStatus.isEnabled ? "translate-x-5" : ""
                      }`}></div>
                  </div>
                  <span className='ml-3 text-sm font-medium'>
                    {notificationStatus.isEnabled ? "Enabled" : "Disabled"}
                  </span>
                </label>
              </div>
            </div>

            <p
              className={`text-sm ${
                darkMode ? "text-gray-400" : "text-gray-600"
              }`}>
              {statusText()}
            </p>
          </div>

          {/* Time Picker */}
          <div
            className={`p-4 rounded-lg pb-6 ${
              darkMode ? "bg-gray-800/50" : "bg-pink-50/50"
            } ${!notificationStatus.isEnabled ? "opacity-60" : ""}`}>
            <div className='flex items-center mb-3 '>
              <Clock className={`${theme.textPrimary} mr-3`} size={20} />
              <h3 className={`font-medium ${theme.textBody}`}>Reminder Time</h3>
            </div>

            <div className='flex items-center justify-center space-x-2 mt-4'>
              <select
                value={notificationTime.hour}
                onChange={(e) => handleTimeChange("hour", e.target.value)}
                disabled={!notificationStatus.isEnabled}
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
                disabled={!notificationStatus.isEnabled}
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
                disabled={!notificationStatus.isEnabled}
                className={`w-16 p-2 rounded-md ${theme.inputBg} ${theme.inputText}`}>
                <option value='AM'>AM</option>
                <option value='PM'>PM</option>
              </select>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className='mt-6'>
          <button
            onClick={sendTestNotification}
            disabled={!notificationStatus.canReceive}
            className={`w-full px-4 py-2 rounded-lg ${
              theme.btnPrimary
            } text-white transition-opacity ${
              !notificationStatus.canReceive
                ? "opacity-50 cursor-not-allowed"
                : "hover:opacity-90"
            }`}>
            Send Test Notification
          </button>
        </div>
      </div>
    </div>
  );
}
