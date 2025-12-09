import React, { useState, useCallback } from "react";
import PriceEditor from "./PriceEditor.jsx";
import AvailabilityCalendar from "./AvailabilityCalendar.jsx";

/**
 * PropertyManager
 * Props:
 * - property: { id, price, blockedDates: ['YYYY-MM-DD', ...] }
 * - onSavePrice(price)
 * - onSaveAvailability(blockedDatesArray)
 */
const PropertyManager = ({ property = {}, onSavePrice, onSaveAvailability }) => {
  const [price, setPrice] = useState(property.price ?? "");
  const [blockedDates, setBlockedDates] = useState(new Set(property.blockedDates || []));

  const handlePriceSave = useCallback(
    async (newPrice) => {
      setPrice(newPrice);
      if (onSavePrice) await onSavePrice(newPrice);
      else console.log("Price saved (mock):", newPrice);
    },
    [onSavePrice]
  );

  const handleAvailabilitySave = useCallback(
    async (newBlockedDatesSet) => {
      setBlockedDates(new Set(newBlockedDatesSet));
      const arr = Array.from(newBlockedDatesSet).sort();
      if (onSaveAvailability) await onSaveAvailability(arr);
      else console.log("Availability saved (mock):", arr);
    },
    [onSaveAvailability]
  );

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: settings */}
        <div className="lg:col-span-1 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Pricing & Availability</h2>
          <p className="text-sm text-gray-600 mb-4">Adjust your base price and block dates for this property.</p>

          <PriceEditor
            price={price}
            onSave={handlePriceSave}
          />

          <div className="mt-6 text-sm text-gray-600">
            <p className="font-medium">Quick tips</p>
            <ul className="mt-2 list-disc ml-5 space-y-1">
              <li>Price updates save on blur or when you click "Save".</li>
              <li>Click dates on the calendar to toggle availability.</li>
              <li>Blocked dates show as grayed/tachado.</li>
            </ul>
          </div>
        </div>

        {/* Right column: calendar spans 2 cols on large */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
          <h3 className="text-md font-semibold text-gray-900 mb-4">Calendar</h3>
          <AvailabilityCalendar
            blockedDates={blockedDates}
            onChange={handleAvailabilitySave}
          />
        </div>
      </div>
    </div>
  );
};

export default PropertyManager;
