import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { CalendarEvent } from "../types/types";

const COLORS = [
  { label: "Blue", value: "#3b82f6" },
  { label: "Red", value: "#ef4444" },
  { label: "Green", value: "#22c55e" },
  { label: "Purple", value: "#a855f7" },
  { label: "Orange", value: "#f97316" },
  { label: "Pink", value: "#ec4899" },
];

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// --- Helpers ---
const getMonthDays = (year: number, month: number) => {
  const firstDay = new Date(year, month, 1);
  // Chuyển Sun=0 → 6, Mon=1 → 0
  const startWeekday = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const cells: {
    day: number;
    month: number;
    year: number;
    isCurrentMonth: boolean;
  }[] = [];

  // Ngày tháng trước
  for (let i = startWeekday - 1; i >= 0; i--) {
    cells.push({
      day: daysInPrevMonth - i,
      month: month - 1 < 0 ? 11 : month - 1,
      year: month - 1 < 0 ? year - 1 : year,
      isCurrentMonth: false,
    });
  }

  // Ngày tháng hiện tại
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, month, year, isCurrentMonth: true });
  }

  // Ngày tháng sau để fill đủ 6 hàng (42 ô)
  const remaining = 42 - cells.length;
  for (let d = 1; d <= remaining; d++) {
    cells.push({
      day: d,
      month: month + 1 > 11 ? 0 : month + 1,
      year: month + 1 > 11 ? year + 1 : year,
      isCurrentMonth: false,
    });
  }

  return cells;
};

const formatDateKey = (year: number, month: number, day: number) =>
  `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// --- Component ---
const Calendar = () => {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());

  // Events state, persisted to localStorage
  const [events, setEvents] = useState<CalendarEvent[]>(() => {
    try {
      const saved = localStorage.getItem("calendar_events");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    startTime: "09:00",
    endTime: "10:00",
    color: COLORS[0].value,
    description: "",
  });

  // Detail popup
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null,
  );

  const cells = useMemo(
    () => getMonthDays(currentYear, currentMonth),
    [currentYear, currentMonth],
  );

  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    for (const ev of events) {
      if (!map[ev.date]) map[ev.date] = [];
      map[ev.date].push(ev);
    }
    // Sort events by startTime within each day
    for (const key of Object.keys(map)) {
      map[key].sort((a, b) => a.startTime.localeCompare(b.startTime));
    }
    return map;
  }, [events]);

  const saveEvents = (updated: CalendarEvent[]) => {
    setEvents(updated);
    localStorage.setItem("calendar_events", JSON.stringify(updated));
  };

  // --- Navigation ---
  const goToday = () => {
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
  };
  const goPrev = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };
  const goNext = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  // --- Modal handlers ---
  const openCreateModal = (dateKey: string) => {
    setEditingEvent(null);
    setFormData({
      title: "",
      date: dateKey,
      startTime: "09:00",
      endTime: "10:00",
      color: COLORS[0].value,
      description: "",
    });
    setShowModal(true);
    setSelectedEvent(null);
  };

  const openEditModal = (ev: CalendarEvent) => {
    setEditingEvent(ev);
    setFormData({
      title: ev.title,
      date: ev.date,
      startTime: ev.startTime,
      endTime: ev.endTime,
      color: ev.color,
      description: ev.description || "",
    });
    setShowModal(true);
    setSelectedEvent(null);
  };

  const handleSave = () => {
    if (!formData.title.trim()) return;

    if (editingEvent) {
      // Update
      const updated = events.map((ev) =>
        ev.id === editingEvent.id
          ? { ...ev, ...formData, title: formData.title.trim() }
          : ev,
      );
      saveEvents(updated);
    } else {
      // Create
      const newEvent: CalendarEvent = {
        id: crypto.randomUUID(),
        title: formData.title.trim(),
        date: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime,
        color: formData.color,
        description: formData.description,
      };
      saveEvents([...events, newEvent]);
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    saveEvents(events.filter((ev) => ev.id !== id));
    setSelectedEvent(null);
  };

  const todayKey = formatDateKey(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );

  return (
    <div className="flex-1 bg-[#f8f9fe] flex flex-col rounded-none md:rounded-r-3xl overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 px-3 md:px-6 py-3 md:py-4 border-b border-gray-200 bg-gradient-to-r from-white via-blue-50 to-blue-100 md:rounded-tr-3xl">
        <div className="flex items-center gap-2 md:gap-3">
          <button
            onClick={goToday}
            className="px-3 md:px-4 py-1.5 text-xs md:text-sm font-medium border border-gray-300 rounded-full hover:bg-white transition-colors"
          >
            Today
          </button>
          <button
            onClick={goPrev}
            className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center rounded-full hover:bg-white/70 transition-colors"
          >
            <i className="fa-solid fa-chevron-left text-xs md:text-sm text-gray-600"></i>
          </button>
          <button
            onClick={goNext}
            className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center rounded-full hover:bg-white/70 transition-colors"
          >
            <i className="fa-solid fa-chevron-right text-xs md:text-sm text-gray-600"></i>
          </button>
          <h2 className="text-base md:text-xl font-bold text-gray-800 ml-1 md:ml-2">
            {MONTH_NAMES[currentMonth]} {currentYear}
          </h2>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="flex-1 flex flex-col p-2 md:p-4 overflow-hidden">
        {/* Day headers */}
        <div className="grid grid-cols-7 mb-1">
          {DAYS.map((d) => (
            <div
              key={d}
              className="text-center text-[10px] md:text-xs font-semibold text-gray-400 py-1 md:py-2"
            >
              {d}
            </div>
          ))}
        </div>

        {/* Date cells */}
        <div className="grid grid-cols-7 flex-1 border-t border-l border-gray-200 rounded-xl overflow-hidden">
          {cells.map((cell, idx) => {
            const dateKey = formatDateKey(cell.year, cell.month, cell.day);
            const dayEvents = eventsByDate[dateKey] || [];
            const isToday = dateKey === todayKey;

            return (
              <div
                key={idx}
                onClick={() => openCreateModal(dateKey)}
                className={`border-r border-b border-gray-200 p-1 md:p-1.5 min-h-[48px] md:min-h-[80px] cursor-pointer transition-colors hover:bg-blue-50/40 ${
                  cell.isCurrentMonth ? "bg-white" : "bg-gray-50/50"
                }`}
              >
                <div className="flex justify-between items-start">
                  <span
                    className={`text-[10px] md:text-xs font-medium w-5 h-5 md:w-6 md:h-6 flex items-center justify-center rounded-full ${
                      isToday
                        ? "bg-blue-500 text-white"
                        : cell.isCurrentMonth
                          ? "text-gray-700"
                          : "text-gray-300"
                    }`}
                  >
                    {cell.day}
                  </span>
                </div>
                {/* Events - dots on mobile, full text on md+ */}
                <div className="mt-0.5 space-y-0.5">
                  {/* Mobile: colored dots */}
                  <div className="flex md:hidden gap-0.5 flex-wrap">
                    {dayEvents.slice(0, 3).map((ev) => (
                      <div
                        key={ev.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedEvent(ev);
                        }}
                        className="w-1.5 h-1.5 rounded-full cursor-pointer"
                        style={{ backgroundColor: ev.color }}
                        title={`${ev.startTime}–${ev.endTime} ${ev.title}`}
                      />
                    ))}
                    {dayEvents.length > 3 && (
                      <span className="text-[8px] text-gray-400">+{dayEvents.length - 3}</span>
                    )}
                  </div>
                  {/* Desktop: full event labels */}
                  <div className="hidden md:block space-y-0.5">
                    {dayEvents.slice(0, 3).map((ev) => (
                      <div
                        key={ev.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedEvent(ev);
                        }}
                        className="text-[10px] leading-tight px-1.5 py-0.5 rounded truncate text-white cursor-pointer hover:opacity-80 transition-opacity"
                        style={{ backgroundColor: ev.color }}
                        title={`${ev.startTime}–${ev.endTime} ${ev.title}`}
                      >
                        {ev.startTime} {ev.title}
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="text-[10px] text-gray-400 pl-1.5">
                        +{dayEvents.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Event Detail Popup */}
      <AnimatePresence>
        {selectedEvent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 flex items-center justify-center z-50"
            onClick={() => setSelectedEvent(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4"
            >
              <div className="flex items-start gap-3 mb-4">
                <div
                  className="w-4 h-4 rounded mt-1 flex-shrink-0"
                  style={{ backgroundColor: selectedEvent.color }}
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg text-gray-800 break-words">
                    {selectedEvent.title}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {selectedEvent.date} · {selectedEvent.startTime} –{" "}
                    {selectedEvent.endTime}
                  </p>
                  {selectedEvent.description && (
                    <p className="text-sm text-gray-600 mt-2 break-words">
                      {selectedEvent.description}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => openEditModal(selectedEvent)}
                  className="px-4 py-2 text-sm font-medium text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(selectedEvent.id)}
                  className="px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4"
            >
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                {editingEvent ? "Edit Event" : "New Event"}
              </h3>

              {/* Title */}
              <input
                type="text"
                placeholder="Add title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full text-lg font-medium border-b-2 border-gray-200 focus:border-blue-500 outline-none pb-2 mb-4 transition-colors"
                autoFocus
              />

              {/* Date */}
              <div className="flex items-center gap-3 mb-3">
                <i className="fa-regular fa-calendar text-gray-400 w-5 text-center"></i>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              {/* Time */}
              <div className="flex items-center gap-3 mb-3">
                <i className="fa-regular fa-clock text-gray-400 w-5 text-center"></i>
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) =>
                    setFormData({ ...formData, startTime: e.target.value })
                  }
                  className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <span className="text-gray-400">–</span>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) =>
                    setFormData({ ...formData, endTime: e.target.value })
                  }
                  className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              {/* Color */}
              <div className="flex items-center gap-3 mb-3">
                <i className="fa-solid fa-palette text-gray-400 w-5 text-center"></i>
                <div className="flex gap-2">
                  {COLORS.map((c) => (
                    <button
                      key={c.value}
                      onClick={() =>
                        setFormData({ ...formData, color: c.value })
                      }
                      className={`w-7 h-7 rounded-full transition-all ${
                        formData.color === c.value
                          ? "ring-2 ring-offset-2 ring-gray-400 scale-110"
                          : "hover:scale-110"
                      }`}
                      style={{ backgroundColor: c.value }}
                      title={c.label}
                    />
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="flex items-start gap-3 mb-5">
                <i className="fa-solid fa-align-left text-gray-400 w-5 text-center mt-2.5"></i>
                <textarea
                  placeholder="Add description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                  className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-5 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
                >
                  Save
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Calendar;
