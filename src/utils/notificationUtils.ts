export interface NotificationTime {
  hour: number;
  minute: number;
  period: "AM" | "PM";
}

export const convertTo24Hour = (time: NotificationTime): { hours: number; minutes: number } => {
  let hours = time.hour;
  if (time.period === "PM" && hours < 12) hours += 12;
  if (time.period === "AM" && hours === 12) hours = 0;
  return { hours, minutes: time.minute };
};

export const formatTime = (time: NotificationTime): string => {
  const hourStr = time.hour.toString();
  const minuteStr = time.minute.toString().padStart(2, "0");
  return `${hourStr}:${minuteStr} ${time.period}`;
}; 