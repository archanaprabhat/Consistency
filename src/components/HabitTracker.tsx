"use client";

import { useState, useEffect, useRef } from "react";
import EmojiPicker, { EmojiClickData, Theme } from "emoji-picker-react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Check,
  X,
  Trash2,
  Moon,
  Sun,
  Calendar,
  Smile,
} from "lucide-react";


interface Habit {
  id: number;
  name: string;
  monthlyChecked: Record<string, Record<number, boolean>>;
}

export default function HabitTracker() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [newHabit, setNewHabit] = useState("");
  const [habits, setHabits] = useState<Habit[]>([]);
  const [darkMode, setDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiRef = useRef<HTMLDivElement>(null);

  const today = new Date();
  const isCurrentMonth =
    today.getMonth() === currentDate.getMonth() &&
    today.getFullYear() === currentDate.getFullYear();
  const currentDay = today.getDate();

  // Load habits and theme preference from localStorage on component mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedHabits = localStorage.getItem("habits");
      const savedTheme = localStorage.getItem("darkMode");
      if (savedHabits) {
        try {
          setHabits(JSON.parse(savedHabits));
        } catch (e) {
          console.error("Error parsing saved habits:", e);
          setHabits([]);
        }
      }

      if (savedTheme) {
        setDarkMode(savedTheme === "true");
      } else {
        // Check user's system preference for dark mode
        const prefersDark = window.matchMedia(
          "(prefers-color-scheme: dark)"
        ).matches;
        setDarkMode(prefersDark);
      }

      setIsLoading(false);
    }
  }, []);

  // Save habits to localStorage whenever they change
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem("habits", JSON.stringify(habits));
    }
  }, [habits, isLoading]);

  // Save theme preference
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem("darkMode", darkMode.toString());

      if (darkMode) {
        document.body.classList.add("dark-mode");
      } else {
        document.body.classList.remove("dark-mode");
      }
    }
  }, [darkMode, isLoading]);
  // console.log("Habits state:", habits);

  const monthYear = currentDate.toLocaleDateString("default", {
    month: "long",
    year: "numeric",
  });

  // Calculate days in current month
  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();

  const changeMonth = (offset: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + offset);
    setCurrentDate(newDate);
  };

  const addHabit = () => {
    if (newHabit.trim()) {
      setHabits([
        ...habits,
        {
          id: Date.now(),
          name: newHabit,
          monthlyChecked: {},
        },
      ]);
      setNewHabit("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      addHabit();
    }
  };

  const getMonthKey = () =>
    `${currentDate.getFullYear()} - ${currentDate.getMonth() + 1}`;

  const toggleDay = (habitIndex: number, dayIndex: number) => {
    const newHabits = [...habits];
    const monthKey = getMonthKey();
    if (!newHabits[habitIndex].monthlyChecked[monthKey]) {
      newHabits[habitIndex].monthlyChecked[monthKey] = {};
    }
    if(dayIndex + 1 < currentDate.getDate()){
      newHabits[habitIndex].monthlyChecked[monthKey][dayIndex] =
      !newHabits[habitIndex].monthlyChecked[monthKey][dayIndex];
    }
    

    setHabits(newHabits);
  };

  const deleteHabit = (id: number) => {
    setHabits(habits.filter((h) => h.id !== id));
  };

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };
  const handleEmojiSelect = (emojiData: EmojiClickData) => {
    setNewHabit((prevHabit) => prevHabit + emojiData.emoji);
  };

  const toggleEmojiPicker = () => {
    setShowEmojiPicker(!showEmojiPicker);
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target as Node)) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener("mousedown", handler);

    return () => {
      document.removeEventListener("mousedown", handler);
    };
  }, [showEmojiPicker]);

  // Get theme-based classes and colors
  const getThemeClasses = () => {
    return {
      // Main backgrounds
      bgMain: darkMode
        ? "bg-gray-900"
        : "bg-gradient-to-br from-rose-200 to-red-200",
      bgCard: darkMode ? "bg-gray-800/90" : "bg-white/80",
      bgHeader: darkMode ? "bg-gray-800" : "bg-rose-100",
      bgHover: darkMode ? "hover:bg-gray-700/70" : "hover:bg-rose-50/70",
      bgButtonHover: darkMode ? "hover:bg-gray-700" : "hover:bg-rose-100",
      bgCellHover: darkMode ? "hover:bg-gray-700/50" : "hover:bg-rose-100/50",
      bgSticky: darkMode ? "bg-gray-800" : "bg-white/90",
      bgHeaderSticky: darkMode ? "bg-gray-800" : "bg-rose-100",

      // Text colors
      textPrimary: darkMode ? "text-pink-300" : "text-pink-800",
      textHeader: darkMode ? "text-pink-300" : "text-pink-900",
      textBody: darkMode ? "text-gray-200" : "text-pink-900",
      textMuted: darkMode ? "text-pink-400" : "text-pink-500",

      // Borders
      borderMain: darkMode ? "border-gray-700" : "border-pink-200",
      borderRow: darkMode ? "border-gray-700" : "border-pink-100",

      // Button colors
      btnPrimary: darkMode
        ? "bg-pink-700 hover:bg-pink-800"
        : "bg-pink-600 hover:bg-pink-700",

      // Check/X colors
      checkBg: darkMode ? "bg-green-900/40" : "bg-green-100",
      checkColor: darkMode ? "text-green-400" : "text-green-600",
      xColor: darkMode ? "text-red-400" : "text-red-300",

      // Input styles
      inputBg: darkMode
        ? "bg-gray-800 border-gray-600"
        : "bg-white/90 border-pink-300",
      inputFocus: darkMode
        ? "focus:ring-pink-700 focus:border-pink-700"
        : "focus:ring-pink-400 focus:border-pink-400",
      inputText: darkMode ? "text-gray-200" : "text-gray-900",

      // Current day highlight
      currentDayBg: darkMode ? "bg-pink-900/30" : "bg-pink-200/70",
      currentDayBorder: darkMode ? "border-pink-700" : "border-pink-400",
    };
  };

  const theme = getThemeClasses();

  if (isLoading) {
    return (
      <div
        className={`min-h-screen w-full flex justify-center items-center ${theme.bgMain}`}>
        <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500'></div>
      </div>
    );
  }

  return (
    <div
      className={`${theme.bgMain} min-h-screen w-full flex flex-col items-center p-2 md:p-4 font-sans transition-colors duration-300`}>
      {/* Header */}
      <div className='w-full max-w-7xl'>
        <div className='flex justify-between items-center mb-4'>
          <div className='flex items-center'>
            <Calendar className={`${theme.textPrimary} mr-2`} size={28} />
            <h1
              className={`text-3xl md:text-4xl font-bold ${theme.textPrimary}`}>
              Arch•a•Track
            </h1>
          </div>
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-full ${theme.bgButtonHover} transition-colors`}
            aria-label={
              darkMode ? "Switch to light mode" : "Switch to dark mode"
            }>
            {darkMode ? (
              <Sun className={theme.textPrimary} size={24} />
            ) : (
              <Moon className={theme.textPrimary} size={24} />
            )}
          </button>
        </div>

        {/* Month Navigation */}
        <div className='flex justify-between items-center w-full max-w-md mx-auto mb-6'>
          <button
            onClick={() => changeMonth(-1)}
            className={`p-2 ${theme.bgButtonHover} rounded-full transition-colors duration-200`}
            aria-label='Previous month'>
            <ChevronLeft size={28} className={theme.textPrimary} />
          </button>
          <h2
            className={`text-xl md:text-2xl font-medium italic font-mono ${theme.textPrimary}`}>
            {monthYear}
          </h2>
          <button
            onClick={() => changeMonth(1)}
            className={`p-2 ${theme.bgButtonHover} rounded-full transition-colors duration-200`}
            aria-label='Next month'>
            <ChevronRight size={28} className={theme.textPrimary} />
          </button>
        </div>

        {/* Add Habit Input */}
        <div className='flex gap-2 w-full max-w-xl mx-auto mb-6 relative'>
          <div ref={emojiRef} className='relative w-full'>
            <div className='absolute left-3 top-1/2 transform -translate-y-1/2 z-20'>
              <button
                onClick={toggleEmojiPicker}
                className={`p-1 rounded-full ${theme.bgButtonHover} transition-colors`}>
                <Smile className={theme.textPrimary} size={26} />
              </button>
            </div>

            {/* Emoji Picker with Transition */}
            {showEmojiPicker && (
              <div
                className={`absolute top-full left-0 mt-2 z-50 
                transition-all duration-300 ease-in-out 
                ${
                  showEmojiPicker
                    ? "opacity-100 scale-100"
                    : "opacity-0 scale-95"
                } -translate-x-1/2 `}>
                <EmojiPicker
                  onEmojiClick={handleEmojiSelect}
                  theme={darkMode ? Theme.DARK : Theme.LIGHT}
                />
              </div>
            )}

            <input
              type='text'
              placeholder='Add a new habit...'
              value={newHabit}
              onChange={(e) => setNewHabit(e.target.value)}
              onKeyPress={handleKeyPress}
              className={`w-full pl-16 p-3 rounded-lg border ${theme.inputBg} text-base md:text-lg focus:outline-none focus:ring-2 ${theme.inputFocus} shadow- transition-all ${theme.inputText}`}
            />
          </div>
          <button
            onClick={addHabit}
            className={`${theme.btnPrimary} text-white rounded-lg px-3 md:px-4 transition-colors shadow-md flex items-center justify-center`}
            aria-label='Add habit'>
            <Plus size={24} />
          </button>
        </div>

        {/* Habits Table */}
        <div
          className={`w-full overflow-x-auto rounded-lg shadow-lg ${theme.bgCard} mb-6 transition-colors duration-300`}>
          {habits.length > 0 ? (
            <table className='w-full border-collapse'>
              <thead>
                <tr className={theme.bgHeader}>
                  <th
                    className={`p-3 text-left font-semibold ${theme.textHeader} border-b ${theme.borderMain} sticky left-0 ${theme.bgHeaderSticky} z-10 w-40 md:w-48`}>
                    Habits
                  </th>
                  {Array.from({ length: daysInMonth }, (_, i) => (
                    <th
                      key={i}
                      className={`p-2 min-w-8 w-12 font-medium ${
                        theme.textHeader
                      } border-b ${theme.borderMain} text-center ${
                        isCurrentMonth && i + 1 === currentDay
                          ? theme.currentDayBg
                          : ""
                      }`}>
                      {i + 1}
                    </th>
                  ))}
                  <th
                    className={`p-2 w-12 md:w-16 font-semibold ${theme.textHeader} border-b ${theme.borderMain} text-center sticky right-0 ${theme.bgHeaderSticky} z-10`}>
                    Delete
                  </th>
                </tr>
              </thead>
              <tbody>
                {habits.map((habit, habitIndex) => (
                  <tr
                    key={habit.id}
                    className={`${theme.bgHover} transition-colors`}>
                    <td
                      className={`p-2 md:p-3 font-medium ${theme.textBody} border-b ${theme.borderRow} sticky left-0 ${theme.bgSticky} z-10`}>
                      {habit.name}
                    </td>
                    {Array.from({ length: daysInMonth }, (_, dayIndex) => {
                      const monthValue = getMonthKey();
                      const isChecked = Boolean(
                        habit.monthlyChecked?.[monthValue]?.[dayIndex]
                      );

                      return (
                        <td
                          key={dayIndex}
                          onClick={() => toggleDay(habitIndex, dayIndex)}
                          className={`border-b ${
                            theme.borderRow
                          } text-center cursor-pointer ${
                            theme.bgCellHover
                          } transition-colors ${
                            isCurrentMonth && dayIndex + 1 === currentDay
                              ? `${theme.currentDayBg} border-2 ${theme.currentDayBorder}`
                              : ""
                          }`}>
                          {isChecked ? (
                            <div className='w-full h-10 md:h-12 flex items-center justify-center'>
                              <div
                                className={`${theme.checkBg} rounded-full p-1`}>
                                <Check
                                  className={theme.checkColor}
                                  size={18}
                                  strokeWidth={3}
                                />
                              </div>
                            </div>
                          ) : (
                            <div className='w-full h-10 md:h-12 flex items-center justify-center'>
                              <div className='rounded-full p-1'>
                                <X
                                  className={theme.xColor}
                                  size={18}
                                  strokeWidth={2}
                                />
                              </div>
                            </div>
                          )}
                        </td>
                      );
                    })}
                    <td
                      className={`p-2 md:p-3 border-b ${theme.borderRow} text-center sticky right-0 ${theme.bgSticky} z-10`}>
                      <button
                        onClick={() => deleteHabit(habit.id)}
                        className='text-gray-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-100/20'
                        aria-label='Delete habit'>
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className={`py-12 text-center ${theme.textMuted}`}>
              <p className='text-xl mb-3'>No habits added yet</p>
              <p>Add your first habit using the input above</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
