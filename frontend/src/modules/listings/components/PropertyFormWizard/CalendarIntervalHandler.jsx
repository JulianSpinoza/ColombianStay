import React, { useMemo, useState } from "react";

const CalendarIntervalHandler = ({ value = [], onChange, error = "" }) => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [localError, setLocalError] = useState("");

  const today = useMemo(() => {
    return new Date().toISOString().split("T")[0];
  }, []);

  const intervalsSorted = useMemo(() => {
    return [...value].sort(
      (a, b) => new Date(a.startDate) - new Date(b.startDate)
    );
  }, [value]);

  const hasOverlap = (newStart, newEnd) => {
    return value.some((interval) => {
      const existingStart = new Date(interval.startDate);
      const existingEnd = new Date(interval.endDate);
      const candidateStart = new Date(newStart);
      const candidateEnd = new Date(newEnd);

      return candidateStart <= existingEnd && candidateEnd >= existingStart;
    });
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

    if (new Date(startDate) >= new Date(endDate)) {
      setLocalError("End date must be after start date.");
      return;
    }

    if (hasOverlap(startDate, endDate)) {
      setLocalError("This interval overlaps with an existing one.");
      return;
    }

    const updatedIntervals = [
      ...value,
      { startDate, endDate },
    ];

    onChange(updatedIntervals);
    setStartDate("");
    setEndDate("");
    setLocalError("");
  };

  const handleRemoveInterval = (indexToRemove) => {
    const updatedIntervals = value.filter((_, index) => index !== indexToRemove);
    onChange(updatedIntervals);
    setLocalError("");
  };

  return (
    <div className="availability-handler">
      <div className="availability-inputs">
        <div className="form-group">
          <label className="form-label">Start date</label>
          <input
            type="date"
            className="form-input"
            min={today}
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              setLocalError("");
            }}
          />
        </div>

        <div className="form-group">
          <label className="form-label">End date</label>
          <input
            type="date"
            className="form-input"
            min={startDate || today}
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              setLocalError("");
            }}
          />
        </div>
      </div>

      <button
        type="button"
        className="btn-primary"
        onClick={handleAddInterval}
      >
        Add interval
      </button>

      {localError && <p className="field-error">{localError}</p>}
      {error && <p className="field-error">{error}</p>}

      {intervalsSorted.length > 0 && (
        <div className="availability-list">
          {intervalsSorted.map((interval, index) => (
            <div key={`${interval.startDate}-${interval.endDate}-${index}`} className="availability-item">
              <span>
                {interval.startDate} → {interval.endDate}
              </span>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => handleRemoveInterval(index)}
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