import React, { useState, useEffect, useMemo, useCallback } from "react";

// Helper: format Date to YYYY-MM-DD
const formatISO = (d) => d.toISOString().slice(0, 10);

// Build calendar grid for a given month (Date object pointing to 1st)
function buildMonthGrid(year, month) {
  const first = new Date(year, month, 1);
  const startDay = first.getDay(); // 0 Sun .. 6 Sat
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // We'll build a 6x7 grid to keep layout consistent
  const cells = [];
  // days from previous month
  const prevDays = startDay; // number of placeholders before day 1
  const prevMonthLastDate = new Date(year, month, 0).getDate();

  for (let i = prevMonthLastDate - prevDays + 1; i <= prevMonthLastDate; i++) {
    const d = new Date(year, month - 1, i);
    cells.push({ date: d, inMonth: false });
  }

  for (let i = 1; i <= daysInMonth; i++) {
    const d = new Date(year, month, i);
    cells.push({ date: d, inMonth: true });
  }

  // fill next month days
  const needed = 42 - cells.length;
  for (let i = 1; i <= needed; i++) {
    const d = new Date(year, month + 1, i);
    cells.push({ date: d, inMonth: false });
  }

  return cells;
}

/**
 * AvailabilityCalendar
 * Props:
 * - blockedDates: Set of 'YYYY-MM-DD'
 * - onChange(newBlockedDatesSet)
 */
const AvailabilityCalendar = ({ blockedDates = new Set(), onChange }) => {
  const today = new Date();
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [localBlocked, setLocalBlocked] = useState(new Set(blockedDates));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLocalBlocked(new Set(blockedDates));
  }, [blockedDates]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const grid = useMemo(() => buildMonthGrid(year, month), [year, month]);

  const monthLabel = viewDate.toLocaleString(undefined, { month: 'long', year: 'numeric' });

  const toggleDate = useCallback(
    (dateObj) => {
      const iso = formatISO(dateObj);
      const next = new Set(localBlocked);
      if (next.has(iso)) next.delete(iso);
      else next.add(iso);
      setLocalBlocked(next);

      // immediate save (could be debounced)
      (async () => {
        setSaving(true);
        try {
          if (onChange) await onChange(next);
          else console.log('Saved blocked dates (mock):', Array.from(next));
        } catch (err) {
          console.error('Error saving blocked dates', err);
        } finally {
          setSaving(false);
        }
      })();
    },
    [localBlocked, onChange]
  );

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button onClick={prevMonth} className="p-2 rounded-full hover:bg-gray-100">
            ‹
          </button>
          <div className="text-lg font-semibold">{monthLabel}</div>
          <button onClick={nextMonth} className="p-2 rounded-full hover:bg-gray-100">
            ›
          </button>
        </div>
        <div className="text-sm text-gray-500">{saving ? 'Saving...' : 'Changes saved'}</div>
      </div>

      <div className="grid grid-cols-7 gap-2 text-center">
        {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((d) => (
          <div key={d} className="text-xs font-medium text-gray-500">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2 mt-2">
        {grid.map((cell, idx) => {
          const iso = formatISO(cell.date);
          const isBlocked = localBlocked.has(iso);
          const isToday = iso === formatISO(today);
          const inMonth = cell.inMonth;

          const baseClasses = "py-3 rounded-lg cursor-pointer select-none border";
          const inMonthClasses = inMonth ? "bg-white" : "bg-gray-50 text-gray-300";
          const blockedClasses = isBlocked ? "bg-gray-200 text-gray-500 line-through" : "text-gray-900";
          const todayClasses = isToday ? "ring-2 ring-indigo-300" : "";

          return (
            <div
              key={idx}
              onClick={() => inMonth && toggleDate(cell.date)}
              className={`${baseClasses} ${inMonthClasses} ${blockedClasses} ${todayClasses} flex items-center justify-center`}
              title={iso}
            >
              <span className="text-sm">{cell.date.getDate()}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AvailabilityCalendar;
