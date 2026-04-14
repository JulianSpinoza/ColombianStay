import React, { useMemo, useState } from "react";

const WEEK_DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

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

const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatRangeDate = (dateString) => {
  const [year, month, day] = dateString.split("-");
  return `${day}/${month}/${year}`;
};

const CalendarIntervalHandler = ({ value = [], onChange, error = "" }) => {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [localError, setLocalError] = useState("");

  const today = useMemo(() => formatDate(new Date()), []);

  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 11 }, (_, index) => currentYear - 2 + index);
  }, []);

  const intervalsSorted = useMemo(() => {
    return [...value].sort(
      (a, b) => new Date(a.startDate) - new Date(b.startDate)
    );
  }, [value]);

  const hasOverlap = (newStart, newEnd) => {
    return value.some((interval) => {
      return newStart <= interval.endDate && newEnd >= interval.startDate;
    });
  };

  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      1
    );

    const startOffset = firstDayOfMonth.getDay();
    const firstGridDay = new Date(firstDayOfMonth);
    firstGridDay.setDate(firstGridDay.getDate() - startOffset);

    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(firstGridDay);
      date.setDate(firstGridDay.getDate() + index);

      const dateString = formatDate(date);
      const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
      const isPast = dateString < today;
      const isAvailable = value.some(
        (interval) =>
          dateString >= interval.startDate && dateString <= interval.endDate
      );

      const isSelected =
        startDate &&
        (!endDate
          ? dateString === startDate
          : dateString >= startDate && dateString <= endDate);

      const isRangeStart = startDate && dateString === startDate;
      const isRangeEnd = endDate && dateString === endDate;

      return {
        date,
        dateString,
        dayNumber: date.getDate(),
        isCurrentMonth,
        isPast,
        isAvailable,
        isSelected,
        isRangeStart,
        isRangeEnd,
      };
    });
  }, [currentMonth, value, startDate, endDate, today]);

  const handlePrevMonth = () => {
    setCurrentMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
    );
  };

  const handleMonthSelect = (event) => {
    const selectedMonth = Number(event.target.value);
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), selectedMonth, 1)
    );
  };

  const handleYearSelect = (event) => {
    const selectedYear = Number(event.target.value);
    setCurrentMonth(
      new Date(selectedYear, currentMonth.getMonth(), 1)
    );
  };

  const handleDayClick = (day) => {
    if (day.isPast || !day.isCurrentMonth) return;

    setLocalError("");

    if (!startDate || (startDate && endDate)) {
      setStartDate(day.dateString);
      setEndDate("");
      return;
    }

    if (day.dateString <= startDate) {
      setStartDate(day.dateString);
      setEndDate("");
      return;
    }

    setEndDate(day.dateString);
  };

  const handleAddInterval = () => {
    if (!startDate) {
      setLocalError("Please select a start date.");
      return;
    }

    if (!endDate) {
      setLocalError("Please select an end date.");
      return;
    }

    if (endDate < startDate) {
      setLocalError("End date must be after start date.");
      return;
    }

    if (hasOverlap(startDate, endDate)) {
      setLocalError("This interval overlaps with an existing one.");
      return;
    }

    const updatedIntervals = [...value, { startDate, endDate }].sort(
      (a, b) => new Date(a.startDate) - new Date(b.startDate)
    );

    onChange(updatedIntervals);
    setStartDate("");
    setEndDate("");
    setLocalError("");
  };

  const handleRemoveInterval = (intervalToRemove) => {
    const updatedIntervals = value.filter(
      (interval) =>
        !(
          interval.startDate === intervalToRemove.startDate &&
          interval.endDate === intervalToRemove.endDate
        )
    );

    onChange(updatedIntervals);
    setLocalError("");
  };

  return (
    <div className="availability-handler">
      <div className="calendar-shell">
        <div className="calendar-toolbar">
          <button
            type="button"
            className="calendar-nav-button"
            onClick={handlePrevMonth}
            aria-label="Previous month"
          >
            ←
          </button>

          <div className="calendar-toolbar-center">
            <select
              className="calendar-select"
              value={currentMonth.getMonth()}
              onChange={handleMonthSelect}
            >
              {MONTH_NAMES.map((month, index) => (
                <option key={month} value={index}>
                  {month}
                </option>
              ))}
            </select>

            <select
              className="calendar-select"
              value={currentMonth.getFullYear()}
              onChange={handleYearSelect}
            >
              {yearOptions.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            className="calendar-nav-button"
            onClick={handleNextMonth}
            aria-label="Next month"
          >
            →
          </button>
        </div>

        <div className="calendar-weekdays">
          {WEEK_DAYS.map((day) => (
            <div key={day} className="calendar-weekday">
              {day}
            </div>
          ))}
        </div>

        <div className="calendar-grid">
          {calendarDays.map((day) => {
            const className = [
              "calendar-day",
              !day.isCurrentMonth && "day-outside",
              day.isPast && "day-past",
              !day.isPast &&
                day.isCurrentMonth &&
                (day.isAvailable ? "day-available" : "day-unavailable"),
              day.isSelected && "day-selected",
              day.isRangeStart && "day-range-start",
              day.isRangeEnd && "day-range-end",
            ]
              .filter(Boolean)
              .join(" ");

            return (
              <button
                key={day.dateString}
                type="button"
                className={className}
                onClick={() => handleDayClick(day)}
                disabled={day.isPast || !day.isCurrentMonth}
              >
                {day.dayNumber}
              </button>
            );
          })}
        </div>
      </div>

      <div className="calendar-footer">
        <div className="calendar-legend">
          <div className="legend-item">
            <span className="legend-dot available"></span>
            <span>Available</span>
          </div>

          <div className="legend-item">
            <span className="legend-dot unavailable"></span>
            <span>Unavailable</span>
          </div>

          <div className="legend-item">
            <span className="legend-dot selected"></span>
            <span>Current selection</span>
          </div>
        </div>

        {(startDate || endDate) && (
          <p className="range-summary">
            {endDate
              ? `Selected: ${formatRangeDate(startDate)} → ${formatRangeDate(
                  endDate
                )}`
              : `Start date: ${formatRangeDate(startDate)}`}
          </p>
        )}
      </div>

      <button
        type="button"
        className="btn-primary add-interval-btn"
        onClick={handleAddInterval}
      >
        Add interval
      </button>

      {localError && <p className="field-error">{localError}</p>}
      {error && <p className="field-error">{error}</p>}

      {intervalsSorted.length > 0 && (
        <div className="availability-list">
          {intervalsSorted.map((interval, index) => (
            <div
              key={`${interval.startDate}-${interval.endDate}-${index}`}
              className="availability-item"
            >
              <span>
                {interval.startDate} → {interval.endDate}
              </span>

              <button
                type="button"
                className="btn-secondary"
                onClick={() => handleRemoveInterval(interval)}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CalendarIntervalHandler;