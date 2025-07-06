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
  Settings,
} from "lucide-react";
import { Toaster, toast } from "sonner";
import { IoMdFingerPrint } from "react-icons/io";

interface Habit {
  id: number;
  name: string;
  monthlyChecked: Record<string, Record<number, boolean>>;
}

export default function HabitTracker() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [newHabit, setNewHabit] = useState("");
  const [habits, setHabits] = useState<Habit[]>([]);
  const [themeConfig, setThemeConfig] = useState({
    type: 'minimal',  // 'minimal' | 'pink'
    mode: 'light'     // 'light' | 'dark'
  });
  const [showSettings, setShowSettings] = useState(false);
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
      const savedTheme = localStorage.getItem("themeConfig");
      
      if (savedHabits) {
        try {
          setHabits(JSON.parse(savedHabits));
        } catch (e) {
          console.error("Error parsing saved habits:", e);
          setHabits([]);
        }
      }
  
      if (savedTheme) {
        try {
          setThemeConfig(JSON.parse(savedTheme));
        } catch (e) {
          console.error("Error parsing saved theme:", e);

        }
      }  
      setIsLoading(false);
    }
  }, []);

  // Save theme config to localStorage and remove dead code (no body class manipulation)
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem("themeConfig", JSON.stringify(themeConfig));
    }
  }, [themeConfig, isLoading]);

  // Save habits to localStorage
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem("habits", JSON.stringify(habits));
    }
  }, [habits, isLoading]);

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

    if (
      (isCurrentMonth && dayIndex + 1 > today.getDate()) ||
      currentDate > today
    ) {
      toast.error("You can't check future dates", {
        dismissible: true,
      });
      return;
    }

    newHabits[habitIndex].monthlyChecked[monthKey][dayIndex] =
      !newHabits[habitIndex].monthlyChecked[monthKey][dayIndex];

    setHabits(newHabits);
  };

  const deleteHabit = (id: number) => {
    setHabits(habits.filter((h) => h.id !== id));
  };

  // Quick toggle for current theme's color mode (keeps same theme type)
  const toggleColorMode = () => {
    setThemeConfig(prev => ({
      ...prev,
      mode: prev.mode === 'light' ? 'dark' : 'light'
    }));
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
    switch (themeConfig.type) {
      case 'minimal':
        if (themeConfig.mode === 'light') {
          return {
            // Minimal Light Theme
            bgMain: "bg-gray-50",
            bgCard: "bg-white",
            bgHeader: "bg-gray-100",
            bgHover: "hover:bg-gray-50",
            bgButtonHover: "hover:bg-gray-100",
            bgCellHover: "hover:bg-gray-100",
            bgSticky: "bg-white",
            bgHeaderSticky: "bg-gray-100",
    
            textPrimary: "text-gray-900",
            textHeader: "text-gray-800",
            textBody: "text-gray-700",
            textMuted: "text-gray-500",
    
            borderMain: "border-gray-200",
            borderRow: "border-gray-100",
    
            btnPrimary: "bg-blue-600 hover:bg-blue-700",
    
            checkBg: "bg-green-100",
            checkColor: "text-green-600",
            xColor: "text-gray-300",
    
            inputBg: "bg-white border-gray-300",
            inputFocus: "focus:ring-blue-500 focus:border-blue-500",
            inputText: "text-gray-900",
    
            currentDayBg: "bg-blue-100",
            currentDayBorder: "border-blue-400",
          };
        } else {
          return {
            // Minimal Dark Theme
            bgMain: "bg-gray-900",
            bgCard: "bg-gray-800",
            bgHeader: "bg-gray-700",
            bgHover: "hover:bg-gray-700",
            bgButtonHover: "hover:bg-gray-700",
            bgCellHover: "hover:bg-gray-700",
            bgSticky: "bg-gray-800",
            bgHeaderSticky: "bg-gray-700",
    
            textPrimary: "text-gray-100",
            textHeader: "text-gray-200",
            textBody: "text-gray-300",
            textMuted: "text-gray-500",
    
            borderMain: "border-gray-600",
            borderRow: "border-gray-700",
    
            btnPrimary: "bg-blue-700 hover:bg-blue-800",
    
            checkBg: "bg-green-900/40",
            checkColor: "text-green-400",
            xColor: "text-gray-500",
    
            inputBg: "bg-gray-800 border-gray-600",
            inputFocus: "focus:ring-blue-600 focus:border-blue-600",
            inputText: "text-gray-200",
    
            currentDayBg: "bg-blue-900/30",
            currentDayBorder: "border-blue-600",
          };
        }
      
      case 'pink':
      default:
        if (themeConfig.mode === 'light') {
          return {
            // Pink Light Theme
            bgMain: "bg-gradient-to-br from-rose-200 to-red-200",
            bgCard: "bg-white/80",
            bgHeader: "bg-rose-100",
            bgHover: "hover:bg-rose-50/70",
            bgButtonHover: "hover:bg-rose-100",
            bgCellHover: "hover:bg-rose-100/50",
            bgSticky: "bg-white/90",
            bgHeaderSticky: "bg-rose-100",
    
            textPrimary: "text-pink-800",
            textHeader: "text-pink-900",
            textBody: "text-pink-900",
            textMuted: "text-pink-500",
    
            borderMain: "border-pink-200",
            borderRow: "border-pink-100",
    
            btnPrimary: "bg-pink-600 hover:bg-pink-700",
    
            checkBg: "bg-green-100",
            checkColor: "text-green-600",
            xColor: "text-red-300",
    
            inputBg: "bg-white/90 border-pink-300",
            inputFocus: "focus:ring-pink-400 focus:border-pink-400",
            inputText: "text-gray-900",
    
            currentDayBg: "bg-pink-200/70",
            currentDayBorder: "border-pink-400",
          };
        } else {
          return {
            // Pink Dark Theme
            bgMain: "bg-gray-900",
            bgCard: "bg-gray-800/90",
            bgHeader: "bg-gray-800",
            bgHover: "hover:bg-gray-700/70",
            bgButtonHover: "hover:bg-gray-700",
            bgCellHover: "hover:bg-gray-700/50",
            bgSticky: "bg-gray-800",
            bgHeaderSticky: "bg-gray-800",
    
            textPrimary: "text-pink-300",
            textHeader: "text-pink-300",
            textBody: "text-gray-200",
            textMuted: "text-pink-400",
    
            borderMain: "border-gray-700",
            borderRow: "border-gray-700",
    
            btnPrimary: "bg-pink-700 hover:bg-pink-800",
    
            checkBg: "bg-green-900/40",
            checkColor: "text-green-400",
            xColor: "text-red-400",
    
            inputBg: "bg-gray-800 border-gray-600",
            inputFocus: "focus:ring-pink-700 focus:border-pink-700",
            inputText: "text-gray-200",
    
            currentDayBg: "bg-pink-900/30",
            currentDayBorder: "border-pink-700",
          };
        }
    }
  };

  const theme = getThemeClasses();

  // Minimal Layout Component - Replaced with new minimal UI
  const MinimalLayout = () => {
    // All state and logic are shared from the parent scope
    const [showAddInput, setShowAddInput] = useState(false);
    const isDark = themeConfig.mode === "dark";
    const themeClasses = {
      bg: isDark ? "bg-gray-900" : "bg-gray-50",
      card: isDark ? "bg-gray-800" : "bg-white",
      text: isDark ? "text-gray-100" : "text-gray-900",
      textSecondary: isDark ? "text-gray-400" : "text-gray-600",
      border: isDark ? "border-gray-700" : "border-gray-200",
      hover: isDark ? "hover:bg-gray-700" : "hover:bg-gray-100",
      input: isDark
        ? "bg-gray-800 border-gray-600 text-gray-100 placeholder-gray-400"
        : "bg-white border-gray-300 text-gray-900 placeholder-gray-500",
      bgHeader: isDark ? "bg-gray-700" : "bg-gray-100",
      textHeader: isDark ? "text-gray-200" : "text-gray-800",
      borderMain: isDark ? "border-gray-600" : "border-gray-300",
      bgHover: isDark ? "hover:bg-gray-750" : "hover:bg-gray-50",
      textBody: isDark ? "text-gray-200" : "text-gray-800",
      borderRow: isDark ? "border-gray-700" : "border-gray-200",
      bgSticky: isDark ? "bg-gray-800" : "bg-white",
      bgHeaderSticky: isDark ? "bg-gray-700" : "bg-gray-100",
      currentDayBg: isDark ? "bg-blue-900" : "bg-stone-300",
      currentDayBorder: isDark ? "border-blue-600" : "border-blue-400",
      bgCellHover: isDark ? "hover:bg-gray-700" : "hover:bg-gray-100",
      checkBg: isDark ? "bg-green-600" : "bg-green-500",
      checkColor: isDark ? "text-white" : "text-white",
      xColor: isDark ? "text-gray-500" : "text-gray-400",
    };

    // Mobile Component: Day Box
    const DayBox = ({
      habitIndex,
      dayIndex,
      isChecked,
      isPastDay,
      isCurrentDay,
      isDisabled,
    }: {
      habitIndex: number;
      dayIndex: number;
      isChecked: boolean;
      isPastDay: boolean;
      isCurrentDay: boolean;
      isDisabled: boolean;
    }) => {
      const baseClasses =
        "w-6 h-6 rounded-md transition-all duration-200 flex items-center justify-center text-xs font-medium";

      let dayClasses = baseClasses;

      if (isDisabled) {
        dayClasses += ` ${
          isDark ? "bg-gray-800 text-gray-600" : "bg-gray-100 text-gray-400"
        } cursor-not-allowed`;
      } else {
        dayClasses += " cursor-pointer hover:scale-105 active:scale-95";

        if (isChecked) {
          dayClasses += ` ${
            isDark ? "bg-green-600 text-white" : "bg-green-500 text-white"
          }`;
        } else if (isPastDay) {
          dayClasses += ` ${
            isDark
              ? "bg-red-900 border-2 border-red-700 tex-black"
              : "bg-red-50 border-2 border-red-300 text-red-600"
          }`;
        } else {
          dayClasses += ` ${
            isDark
              ? "border-2 border-gray-600 text-gray-400 hover:border-gray-500"
              : "border-2 border-gray-300 text-gray-600 hover:border-gray-400"
          }`;
        }
      }

      if (isCurrentDay) {
        dayClasses += " ring-2 ring-blue-400 ring-offset-1";
      }

      return (
        <button
          className={dayClasses}
          onClick={() => !isDisabled && toggleDay(habitIndex, dayIndex)}
          disabled={isDisabled}
          aria-label={`Day ${dayIndex + 1}, ${
            isChecked ? "completed" : "not completed"
          }`}>
          {dayIndex + 1}
        </button>
      );
    };

    // Mobile  Component: Habit Row
    const MobileHabitRow = ({
      habit,
      habitIndex,
    }: {
      habit: Habit;
      habitIndex: number;
    }) => {
      return (
        <div
          className={`${themeClasses.card} rounded-lg p-4 shadow-2xl border ${themeClasses.border} `}>
          {/* Habit Name and Delete Button */}
          <div className='flex items-center justify-between mb-3'>
            <h3 className={`font-medium ${themeClasses.text} `}>
              {habit.name}
            </h3>
            <button
              onClick={() => deleteHabit(habit.id)}
              className={`p-2 rounded-full ${themeClasses.hover} text-red-500 hover:text-red-700`}
              aria-label={`Delete ${habit.name} habit`}>
              <Trash2 size={16} />
            </button>
          </div>

          {/* Days Grid */}
          <div className='grid grid-cols-7 gap-2 sm:gap-2'>
            {Array.from({ length: daysInMonth }, (_, dayIndex) => {
              const monthValue = getMonthKey();
              const isChecked = Boolean(
                habit.monthlyChecked?.[monthValue]?.[dayIndex]
              );
              const dayNumber = dayIndex + 1;
              const isCurrentDay = isCurrentMonth && dayNumber === currentDay;
              const isPastDay = isCurrentMonth && dayNumber < currentDay;
              const isDisabled =
                (isCurrentMonth && dayNumber > currentDay) || currentDate > today;

              return (
                <DayBox
                  key={dayIndex}
                  habitIndex={habitIndex}
                  dayIndex={dayIndex}
                  isChecked={isChecked}
                  isPastDay={isPastDay}
                  isCurrentDay={isCurrentDay}
                  isDisabled={isDisabled}
                />
              );
            })}
          </div>
        </div>
      );
    };

    // Desktop Component: Grid Layout
    const DesktopTableLayout = () => {
      // Get the day of week for the 1st of the month (0 = Sunday, 1 = Monday, etc.)
      const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
      
      // Weekday abbreviations
      const weekdayAbbrevs = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
      
      // Generate weekday headers starting from the first day of the month
      const weekdayHeaders = Array.from({ length: daysInMonth }, (_, i) => {
        const dayOfWeek = (firstDayOfMonth + i) % 7;
        return weekdayAbbrevs[dayOfWeek];
      });

      // Component to render each habit row
      const HabitRow = ({ habit, habitIndex }: { habit: Habit; habitIndex: number }) => {
        return (
          <div className="flex items-center group ">
            {/* Habit Name Column with responsive width */}
            <div className="w-32 md:w-36 lg:w-40 shrink-0 pr-3 md:pr-4 flex items-center justify-between ">
              <span className={`font-medium text-sm md:text-base lg:text-lg ${themeClasses.textBody} truncate`}>
                {habit.name}
              </span>
              <button
                onClick={() => deleteHabit(habit.id)}
                className={`opacity-0 group-hover:opacity-100 p-1 rounded-full transition-all duration-200 hover:bg-red-100 text-red-500 hover:text-red-700`}
                aria-label={`Delete ${habit.name} habit`}
              >
                <Trash2 size={14} />
              </button>
            </div>
            
            {/* Day Boxes Grid with responsive gap */}
            <div className="flex-1 grid gap-0.5 md:gap-1" style={{ gridTemplateColumns: `repeat(${daysInMonth}, minmax(0, 1fr))` }}>
              {Array.from({ length: daysInMonth }, (_, dayIndex) => {
                const monthValue = getMonthKey();
                const isChecked = Boolean(habit.monthlyChecked?.[monthValue]?.[dayIndex]);
                const dayNumber = dayIndex + 1;
                const isCurrentDay = isCurrentMonth && dayNumber === currentDay;
                const isPastDay = isCurrentMonth && dayNumber < currentDay;
                const isDisabled = (isCurrentMonth && dayNumber > currentDay) || currentDate > today;
      
                return (
                  <div key={dayIndex} className="flex items-center justify-center min-w-0">
                    <DayBox
                      habitIndex={habitIndex}
                      dayIndex={dayIndex}
                      isChecked={isChecked}
                      isPastDay={isPastDay}
                      isCurrentDay={isCurrentDay}
                      isDisabled={isDisabled}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        );
      };

      // Day box component
      const DayBox = ({
        habitIndex,
        dayIndex,
        isChecked,
        isPastDay,
        isCurrentDay,
        isDisabled,
      }: {
        habitIndex: number;
        dayIndex: number;
        isChecked: boolean;
        isPastDay: boolean;
        isCurrentDay: boolean;
        isDisabled: boolean;
      }) => {
        // Better responsive sizing - smaller on tablets, larger on desktop
        const baseClasses = "w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 rounded-sm transition-all duration-200 cursor-pointer hover:scale-105";
        
        let boxClasses = baseClasses;
        
        if (isDisabled) {
          boxClasses += ` cursor-not-allowed opacity-50 pointer-events-none ${
            isDark ? "bg-gray-800 border border-gray-700" : "bg-gray-100 border border-gray-300"
          }`;
        } else if (isChecked) {
          boxClasses += isDark 
            ? " bg-white border border-white" 
            : " bg-black border border-black";
        } else if (isPastDay) {
          boxClasses += " bg-red-200 border border-red-500";
        } else {
          boxClasses += isDark 
            ? " border-2 border-white bg-gray-900" 
            : " border-2 border-black bg-white";
        }
        
        if (isCurrentDay) {
          boxClasses += " ring-2 ring-blue-400 ring-offset-1";
        }
      
        return (
          <div
            className={boxClasses}
            onClick={() => !isDisabled && toggleDay(habitIndex, dayIndex)}
            aria-label={`Day ${dayIndex + 1}, ${isChecked ? "completed" : "not completed"}`}
          />
        );
      };
      
      // Updated grid container with better responsive behavior
      return (
        <div className={`w-full overflow-x-auto rounded-lg shadow-2xl ${themeClasses.card} transition-colors duration-300 p-4 `}>
          {habits.length > 0 ? (
            <div className="space-y-4">
              {/* Weekday Header Row */}
              <div className="flex items-center">
                <div className="w-32 md:w-36 lg:w-40 shrink-0 pr-3 md:pr-4">
                  <span className={`text-xs md:text-sm font-semibold ${themeClasses.textHeader}`}>
                  </span>
                </div> 
                <div className="flex-1 grid gap-0.5 md:gap-1" style={{ gridTemplateColumns: `repeat(${daysInMonth}, minmax(0, 1fr))` }}>
                  {weekdayHeaders.map((weekday, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-center text-xs font-medium ${themeClasses.textHeader} min-w-0`}
                    >
                      {weekday}
                    </div>
                  ))}
                </div>
              </div>
      
              {/* Date Header Row */}
              <div className="flex items-center">
                <div className="w-32 md:w-36 lg:w-40 shrink-0 pr-3 md:pr-4">
                  <span className={`text-sm font-semibold ${themeClasses.textHeader}`}>
                  </span>
                </div>
                <div className="flex-1 grid gap-0.5 md:gap-1" style={{ gridTemplateColumns: `repeat(${daysInMonth}, minmax(0, 1fr))` }}>
                  {Array.from({ length: daysInMonth }, (_, i) => (
                    <div
                      key={i}
                      className={`flex items-center justify-center text-xs font-medium min-w-0 ${
                        themeClasses.textHeader
                      } ${
                        isCurrentMonth && i + 1 === currentDay
                          ? `${themeClasses.currentDayBg} rounded-sm`
                          : ""
                      }`}
                    >
                      {i + 1}
                    </div>
                  ))}
                </div>
              </div>
      
              {/* Separator */}
              <div className={`border-t ${themeClasses.border} my-2 pb-1`} />
      
              {/* Habit Rows */}
              <div className="space-y-7">
                {habits.map((habit, habitIndex) => (
                  <HabitRow
                    key={habit.id}
                    habit={habit}
                    habitIndex={habitIndex}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className={`p-8 text-center border ${themeClasses.border} rounded-lg`}>
              <div className="mb-4">
                <div
                  className={`w-12 h-12 rounded-full ${
                    isDark ? "bg-gray-700" : "bg-gray-100"
                  } flex items-center justify-center mx-auto mb-3`}
                >
                  <button onClick={() => setShowAddInput(!showAddInput)}>
                    <Plus size={24} />
                  </button>
                </div>
                <p className={`${themeClasses.textSecondary} mb-2`}>No habits yet</p>
                <p className={`text-sm ${themeClasses.textSecondary}`}>
                  Click the + button to add your first habit
                </p>
              </div>
            </div>
          )}
        </div>
      );
    };

    return (
      <div
        className={`min-h-screen ${themeClasses.bg} transition-colors duration-300 `}>
        {/* Header */}
        <header
          className={`${themeClasses.card} border-b ${themeClasses.border} sticky top-0 z-20 shadow-sm`}>
          <div className='container mx-auto px-4 py-4'>
            <div className='flex items-center justify-between'>
              {/* Logo */}
              <div className='flex items-center'>
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center`}>
                  <IoMdFingerPrint size={38} className='text-gray-500' />
                </div>
              </div>

              {/* Month Navigation */}
              <div className='flex items-center space-x-4'>
                <button
                  onClick={() => changeMonth(-1)}
                  className={`p-2 rounded-full transition-colors ${themeClasses.hover} ${themeClasses.textSecondary}`}
                  aria-label='Previous month'>
                  <ChevronLeft size={20} />
                </button>

                <div className='text-center min-w-0 '>
                  <h1
                    className={`text-lg sm:text-xl font-semibold w-10 md:w-32 ${themeClasses.text}`}>
                    {currentDate.toLocaleDateString("default", { month: "long" })}
                  </h1>
                  <p className={`text-sm ${themeClasses.textSecondary}`}>
                    {currentDate.getFullYear()}
                  </p>
                </div>

                <button
                  onClick={() => changeMonth(1)}
                  className={`p-2 rounded-ful transition-colors ${themeClasses.hover} ${themeClasses.textSecondary}`}
                  aria-label='Next month'>
                  <ChevronRight size={20} />
                </button>
              </div>

              {/* Action Buttons */}
              <div className='flex items-center space-x-2'>
                <button
                  onClick={() => setShowAddInput(!showAddInput)}
                  className={` hidden md:block border-1 px-2 py-1 md:px-4 md:py-2 rounded-full text-sm transition-all duration-200 hover:scale-105 active:scale-95 ${themeClasses.hover} ${themeClasses.textSecondary}`}
                  aria-label='Add new habit'>
                  Add new +
                </button>
                <button
                onClick={() => setShowAddInput(!showAddInput)}
                className={` rounded-lg px-4 transition-colors`}>
                <Plus size={18} />
              </button>
                <button
                  onClick={toggleColorMode}
                  className={`p-2 rounded-lg transition-colors ${themeClasses.hover} ${themeClasses.textSecondary}`}
                  aria-label='Toggle theme'>
                  {isDark ? <Sun size={20} /> : <Moon size={20} />}
                </button>
                <button
                  onClick={() => setShowSettings(true)}
                  className={`p-2 rounded-lg transition-colors ${themeClasses.hover} ${themeClasses.textSecondary}`}
                  aria-label='Settings'>
                  <Settings size={20} />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className='mx-auto px-4 py-6'>
          {/* Add Habit Input */}
          {showAddInput && (
            <div
              className={`${themeClasses.card} rounded-lg p-4 mb-6 border ${themeClasses.border} shadow-sm`}>
              <div className='flex gap-4'>
                <input
                  type='text'
                  placeholder='Build your better days — add a habit!'
                  value={newHabit}
                  onChange={(e) => setNewHabit(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className={`flex-1 px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${themeClasses.input}`}
                  autoFocus
                />
                <button
                  onClick={addHabit}
                  disabled={!newHabit.trim()}
                  className='px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'>
                  Add
                </button>
                <button
                  onClick={() => {
                    setShowAddInput(false);
                    setNewHabit("");
                  }}
                  className={`p-2 rounded-lg transition-colors ${themeClasses.hover} ${themeClasses.textSecondary}`}>
                  <X size={20} />
                </button>
              </div>
            </div>
          )}

          {/* Mobile Layout - Hidden on desktop */}
          <div className='block md:hidden space-y-4'>
            {habits.map((habit, habitIndex) => (
              <MobileHabitRow
                key={habit.id}
                habit={habit}
                habitIndex={habitIndex}
              />
            ))}

            {habits.length === 0 && (
              <div
                className={`${themeClasses.card} rounded-lg p-8 text-center border ${themeClasses.border}`}>
                <div className='mb-4 '>
                  <div
                    className={`w-12 h-12 rounded-full ${
                      isDark ? "bg-gray-700" : "bg-gray-100"
                    } flex items-center justify-center mx-auto mb-3`}>
                    <button
                  onClick={() => setShowAddInput(!showAddInput)}>
                  <Plus size={24} />
                </button>
                  </div>
                  <p className={`${themeClasses.textSecondary} mb-2`}>
                    No habits yet
                  </p>
                  <p className={`text-sm ${themeClasses.textSecondary}`}>
                    Click the + button to add your first habit
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Desktop Layout - Hidden on mobile */}
          <div className='hidden md:block '>
            <DesktopTableLayout />
          </div>
        </main>

        {/* Settings Modal */}
        {showSettings && (
          <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
            <div
              className={`${themeClasses.card} rounded-xl p-6 max-w-sm w-full shadow-xl border ${themeClasses.border}`}>
              <div className='flex justify-between items-center mb-6'>
                <h2 className={`text-xl font-semibold ${themeClasses.text}`}>
                  Settings
                </h2>
                <button
                  onClick={() => setShowSettings(false)}
                  className={`p-1 rounded-lg transition-colors ${themeClasses.hover} ${themeClasses.textSecondary}`}>
                  <X size={20} />
                </button>
              </div>

              <div className='mb-6'>
                <h3 className={`text-sm font-medium mb-3 ${themeClasses.text}`}>
                  Theme
                </h3>
                <div className='grid grid-cols-2 gap-2'>
                  <button
                    onClick={() =>
                      setThemeConfig((prev) => ({ ...prev, mode: "light" }))
                    }
                    className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg border-2 transition-all ${
                      themeConfig.mode === "light"
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : `${themeClasses.border} ${themeClasses.hover} ${themeClasses.textSecondary}`
                    }`}>
                    <Sun size={16} />
                    Light
                  </button>
                  <button
                    onClick={() =>
                      setThemeConfig((prev) => ({ ...prev, mode: "dark" }))
                    }
                    className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg border-2 transition-all ${
                      themeConfig.mode === "dark"
                        ? "border-blue-500 bg-blue-900 text-blue-300"
                        : `${themeClasses.border} ${themeClasses.hover} ${themeClasses.textSecondary}`
                    }`}>
                    <Moon size={16} />
                    Dark
                  </button>
                </div>
              </div>

              <button
                onClick={() => setShowSettings(false)}
                className='w-full py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium'>
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Pink Layout Component (Your existing elaborate layout)
  const PinkLayout = () => (
    <div className={`${theme.bgMain} min-h-screen w-full flex flex-col items-center p-2 md:p-4 font-sans transition-colors duration-300`}>
      {/* Header */}
      <div className="w-full max-w-7xl">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <Calendar className={`${theme.textPrimary} mr-2`} size={28} />
            <h1 className={`text-3xl md:text-4xl font-bold ${theme.textPrimary}`}>
              Arch•a•Track
            </h1>
          </div>
          <div className="flex gap-2">
            <button
              onClick={toggleColorMode}
              className={`p-2 rounded-full ${theme.bgButtonHover} transition-colors`}
              aria-label="Toggle color mode">
              {themeConfig.mode === 'dark' ? (
                <Sun className={theme.textPrimary} size={24} />
              ) : (
                <Moon className={theme.textPrimary} size={24} />
              )}
            </button>
            <button
              onClick={() => setShowSettings(true)}
              className={`p-2 rounded-full ${theme.bgButtonHover} transition-colors`}
              aria-label="Settings">
              <Settings className={theme.textPrimary} size={24} />
            </button>
          </div>
        </div>

        {/* Month Navigation */}
        <div className="flex justify-between items-center w-full max-w-md mx-auto mb-6">
          <button
            onClick={() => changeMonth(-1)}
            className={`p-2 ${theme.bgButtonHover} rounded-full transition-colors duration-200`}>
            <ChevronLeft size={28} className={theme.textPrimary} />
          </button>
          <h2 className={`text-xl md:text-2xl font-medium italic font-mono ${theme.textPrimary}`}>
            {monthYear}
          </h2>
          <button
            onClick={() => changeMonth(1)}
            className={`p-2 ${theme.bgButtonHover} rounded-full transition-colors duration-200`}>
            <ChevronRight size={28} className={theme.textPrimary} />
          </button>
        </div>

        {/* Add Habit Input */}
        <div className="flex gap-2 w-full max-w-xl mx-auto mb-6 relative">
          <div ref={emojiRef} className="relative w-full">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-20">
              <button
                onClick={toggleEmojiPicker}
                className={`p-1 rounded-full ${theme.bgButtonHover} transition-colors`}>
                <Smile className={theme.textPrimary} size={26} />
              </button>
            </div>

            {showEmojiPicker && (
              <div className="absolute top-full left-0 mt-2 z-50 transition-all duration-300 ease-in-out opacity-100 scale-100 -translate-x-1/2">
                <EmojiPicker
                  onEmojiClick={handleEmojiSelect}
                  theme={themeConfig.mode === 'dark' ? Theme.DARK : Theme.LIGHT}
                />
              </div>
            )}

            <input
              type="text"
              placeholder="Add a new habit..."
              value={newHabit}
              onChange={(e) => setNewHabit(e.target.value)}
              onKeyPress={handleKeyPress}
              className={`w-full pl-16 p-3 rounded-lg border ${theme.inputBg} text-base md:text-lg focus:outline-none focus:ring-2 ${theme.inputFocus} shadow- transition-all ${theme.inputText}`}
            />
          </div>
          <button
            onClick={addHabit}
            className={`${theme.btnPrimary} text-white rounded-lg px-3 md:px-4 transition-colors shadow-md flex items-center justify-center`}>
            <Plus size={24} />
          </button>
        </div>

        {/* Habits Table */}
        <div className={`w-full overflow-x-auto rounded-lg shadow-lg ${theme.bgCard} mb-6 transition-colors duration-300`}>
          {habits.length > 0 ? (
            <table className="w-full border-collapse">
              <thead>
                <tr className={theme.bgHeader}>
                  <th className={`p-3 text-left font-semibold ${theme.textHeader} border-b ${theme.borderMain} sticky left-0 ${theme.bgHeaderSticky} z-10 w-40 md:w-48`}>
                    Habits
                  </th>
                  {Array.from({ length: daysInMonth }, (_, i) => (
                    <th
                      key={i}
                      className={`p-2 min-w-8 w-12 font-medium ${theme.textHeader} border-b ${theme.borderMain} text-center ${
                        isCurrentMonth && i + 1 === currentDay ? theme.currentDayBg : ""
                      }`}>
                      {i + 1}
                    </th>
                  ))}
                  <th className={`p-2 w-12 md:w-16 font-semibold ${theme.textHeader} border-b ${theme.borderMain} text-center sticky right-0 ${theme.bgHeaderSticky} z-10`}>
                    Delete
                  </th>
                </tr>
              </thead>
              <tbody>
                {habits.map((habit, habitIndex) => (
                  <tr key={habit.id} className={`${theme.bgHover} transition-colors`}>
                    <td className={`p-2 md:p-3 font-medium ${theme.textBody} border-b ${theme.borderRow} sticky left-0 ${theme.bgSticky} z-10`}>
                      {habit.name}
                    </td>
                    {Array.from({ length: daysInMonth }, (_, dayIndex) => {
                      const monthValue = getMonthKey();
                      const isChecked = Boolean(habit.monthlyChecked?.[monthValue]?.[dayIndex]);

                      return (
                        <td
                          key={dayIndex}
                          onClick={() => toggleDay(habitIndex, dayIndex)}
                          className={`border-b ${theme.borderRow} text-center cursor-pointer ${theme.bgCellHover} transition-colors ${
                            isCurrentMonth && dayIndex + 1 === currentDay
                              ? `${theme.currentDayBg} border-2 ${theme.currentDayBorder}`
                              : ""
                          }`}>
                          {isChecked ? (
                            <div className="w-full h-10 md:h-12 flex items-center justify-center">
                              <div className={`${theme.checkBg} rounded-full p-1`}>
                                <Check className={theme.checkColor} size={18} strokeWidth={3} />
                              </div>
                            </div>
                          ) : (
                            <div className="w-full h-10 md:h-12 flex items-center justify-center">
                              <div className="rounded-full p-1">
                                <X className={theme.xColor} size={18} strokeWidth={2} />
                              </div>
                            </div>
                          )}
                        </td>
                      );
                    })}
                    <td className={`p-2 md:p-3 border-b ${theme.borderRow} text-center sticky right-0 ${theme.bgSticky} z-10`}>
                      <button
                        onClick={() => deleteHabit(habit.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-100/20">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className={`py-12 text-center ${theme.textMuted}`}>
              <p className="text-xl mb-3">No habits added yet</p>
              <p>Add your first habit using the input above</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Settings Modal Component
  const SettingsModal = () => {
    if (!showSettings) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className={`${theme.bgCard} rounded-lg p-6 max-w-md w-full mx-4 shadow-xl`}>
          <div className="flex justify-between items-center mb-6">
            <h2 className={`text-2xl font-bold ${theme.textPrimary}`}>Settings</h2>
            <button
              onClick={() => setShowSettings(false)}
              className={`p-1 rounded-full ${theme.bgButtonHover} transition-colors`}>
              <X className={theme.textMuted} size={20} />
            </button>
          </div>
          
          {/* Theme Type Selection */}
          <div className="mb-6">
            <h3 className={`text-lg font-medium mb-3 ${theme.textBody}`}>Theme Style</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setThemeConfig(prev => ({...prev, type: 'minimal'}))}
                className={`p-3 rounded-lg border-2 transition-all ${
                  themeConfig.type === 'minimal' 
                    ? `border-blue-500 ${themeConfig.mode === 'dark' ? 'bg-blue-900/20' : 'bg-blue-50'}` 
                    : `${theme.borderMain} ${theme.bgHover}`
                }`}>
                <div className="w-full h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded mb-2 flex items-center justify-center">
                  <div className="text-xs text-gray-600 font-medium">Clean & Simple</div>
                </div>
                <span className={`text-sm font-medium ${theme.textBody}`}>Minimal</span>
              </button>
              
              <button
                onClick={() => setThemeConfig(prev => ({...prev, type: 'pink'}))}
                className={`p-3 rounded-lg border-2 transition-all ${
                  themeConfig.type === 'pink' 
                    ? `border-pink-500 ${themeConfig.mode === 'dark' ? 'bg-pink-900/20' : 'bg-pink-50'}` 
                    : `${theme.borderMain} ${theme.bgHover}`
                }`}>
                <div className="w-full h-16 bg-gradient-to-br from-rose-200 to-pink-200 rounded mb-2 flex items-center justify-center">
                  <div className="text-xs text-pink-700 font-medium">Colorful & Fun</div>
                </div>
                <span className={`text-sm font-medium ${theme.textBody}`}>Pink</span>
              </button>
            </div>
          </div>

          {/* Color Mode Selection */}
          <div className="mb-6">
            <h3 className={`text-lg font-medium mb-3 ${theme.textBody}`}>Color Mode</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setThemeConfig(prev => ({...prev, mode: 'light'}))}
                className={`flex-1 px-4 py-3 rounded-lg transition-all flex items-center justify-center gap-2 ${
                  themeConfig.mode === 'light'
                    ? 'bg-yellow-200 text-yellow-800 border-2 border-yellow-400'
                    : `${theme.bgButtonHover} ${theme.textBody} border-2 ${theme.borderMain}`
                }`}>
                <Sun size={18} />
                Light
              </button>
              <button
                onClick={() => setThemeConfig(prev => ({...prev, mode: 'dark'}))}
                className={`flex-1 px-4 py-3 rounded-lg transition-all flex items-center justify-center gap-2 ${
                  themeConfig.mode === 'dark'
                    ? 'bg-gray-800 text-gray-100 border-2 border-gray-600'
                    : `${theme.bgButtonHover} ${theme.textBody} border-2 ${theme.borderMain}`
                }`}>
                <Moon size={18} />
                Dark
              </button>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={() => setShowSettings(false)}
            className={`w-full ${theme.btnPrimary} text-white py-3 rounded-lg transition-colors font-medium`}>
            Done
          </button>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen w-full flex justify-center items-center ${theme.bgMain}`}>
        <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500'></div>
      </div>
    );
  }

  return (
    <>
      <Toaster
        position='top-right'
        richColors
        theme={themeConfig.mode === 'dark' ? "dark" : "light"}
        closeButton
      />
      
      {/* Conditional Layout Rendering */}
      {themeConfig.type === 'minimal' ? <MinimalLayout /> : <PinkLayout />}
      
      {/* Settings Modal */}
      <SettingsModal />
    </>
  );
}