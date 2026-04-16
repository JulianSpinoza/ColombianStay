import React from "react";
import CalendarIntervalHandler from "../CalendarIntervalHandler.jsx";

const Availability = ({ formData, onInputChange, error }) => {
  return (
    <div className="form-step">
      <div className="form-step-header">
        <h2>Set your availability</h2>
        <p>Add the date intervals when your property can be booked.</p>
      </div>

      <CalendarIntervalHandler
        value={formData.availability}
        onChange={(intervals) => onInputChange("availability", intervals)}
        error={error}
      />
    </div>
  );
};

export default Availability;