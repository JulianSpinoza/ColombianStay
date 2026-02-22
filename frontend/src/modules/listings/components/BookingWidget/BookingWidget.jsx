import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../../../users/contexts/AuthContext.jsx";
import { BOOKINGS_ENDPOINTS } from "../../../../services/api/endpoints.js";

/**
 * BookingWidget
 * Airbnb-style booking component for property reservations
 * Props:
 * - propertyId: string/number - ID of the property
 * - pricePerNight: number - Price per night in COP
 * - rating?: number - Property rating (default 4.9)
 * - reviews?: number - Number of reviews (default 128)
 * - onReservationSuccess?: function - Callback after successful reservation
 */
const BookingWidget = ({
  propertyId,
  pricePerNight,
  rating = 4.9,
  reviews = 128,
  onReservationSuccess,
}) => {
  const navigate = useNavigate();
  const { axiosInstance } = useAuthContext();

  // Form state
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [guests, setGuests] = useState("1");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Constants
  const CLEANING_FEE = 50000; // COP
  const SERVICE_FEE_PERCENTAGE = 0.1; // 10%

  // Calculate number of nights
  const calculateNights = () => {
    if (!checkInDate || !checkOutDate) return 0;
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const diffTime = checkOut - checkIn;
    const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return nights > 0 ? nights : 0;
  };

  // Calculate total price breakdown
  const calculatePricing = () => {
    const nights = calculateNights();
    if (nights <= 0) {
      return {
        nights: 0,
        subtotal: 0,
        cleaningFee: CLEANING_FEE,
        serviceFee: 0,
        total: 0,
      };
    }

    const subtotal = pricePerNight * nights;
    const serviceFee = Math.round(subtotal * SERVICE_FEE_PERCENTAGE);
    const total = subtotal + CLEANING_FEE + serviceFee;

    return {
      nights,
      subtotal,
      cleaningFee: CLEANING_FEE,
      serviceFee,
      total,
    };
  };

  const pricing = calculatePricing();

  // Validate form
  const validateForm = () => {
    if (!checkInDate) {
      setError("Please select a check-in date");
      return false;
    }
    if (!checkOutDate) {
      setError("Please select a check-out date");
      return false;
    }
    if (new Date(checkInDate) >= new Date(checkOutDate)) {
      setError("Check-out date must be after check-in date");
      return false;
    }
    if (pricing.nights < 1) {
      setError("Minimum stay is 1 night");
      return false;
    }
    setError("");
    return true;
  };

  // Handle reservation
  const handleReservation = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    setError("");

    try {
      // Prepare reservation data
      const reservationData = {
        property_id: propertyId,
        start_date: checkInDate,
        end_date: checkOutDate,
        guests: parseInt(guests),
        total_price: pricing.total,
        subtotal: pricing.subtotal,
        cleaning_fee: pricing.cleaningFee,
        service_fee: pricing.serviceFee,
        nights: pricing.nights,
      };

      console.log("📋 Reservation Data:", reservationData);

      // Call real API
      if (!axiosInstance) {
        throw new Error("No axios instance available");
      }

      const payload = {
        property_id: propertyId,
        start_date: checkInDate,
        end_date: checkOutDate,
        guests: parseInt(guests),
        number_of_guests: parseInt(guests),
        total_price: pricing.total,
      };

      const response = await axiosInstance.post(BOOKINGS_ENDPOINTS.CREATE, payload);

      // Success - combine server response with client-side pricing details
      const serverBooking = response.data;
      const combined = {
        ...serverBooking,
        // backend uses check_in_date/check_out_date, frontend components expect start_date/end_date
        start_date: serverBooking.check_in_date || reservationData.start_date,
        end_date: serverBooking.check_out_date || reservationData.end_date,
        nights: pricing.nights,
        subtotal: pricing.subtotal,
        cleaning_fee: pricing.cleaningFee,
        service_fee: pricing.serviceFee,
        guests: parseInt(guests),
      };
      
      setSuccess(true);

      if (onReservationSuccess) onReservationSuccess(combined);

      // Redirect immediately to confirmation page with combined data
      navigate("/reservation-confirmation", { state: { reservation: combined } });
    } catch (err) {
      console.error("❌ Reservation Error:", err);
      setError(
        err.message || "Failed to complete reservation. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Get minimum date (today)
  const today = new Date().toISOString().split("T")[0];

  // Get tomorrow as default check-out
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split("T")[0];

  return (
    <div className="lg:sticky lg:top-20 bg-white rounded-xl border border-gray-200 p-6 shadow-xl">
      {/* Success State */}
      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-700 font-medium text-center">
            ✓ Reservation created successfully!
          </p>
          <p className="text-sm text-green-600 text-center mt-1">
            Redirecting to confirmation...
          </p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Price & Rating Header */}
      <div className="mb-6 pb-6 border-b">
        <div className="flex items-baseline gap-2 mb-2">
          <p className="text-3xl font-bold text-gray-900">
            ${pricePerNight.toLocaleString()}
          </p>
          <p className="text-sm text-gray-600">per night</p>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-yellow-400">⭐</span>
          <span className="font-semibold text-gray-900">{rating}</span>
          <span className="text-gray-600">({reviews} reviews)</span>
        </div>
      </div>

      {/* Check-in Date */}
      <div className="mb-4">
        <label className="block text-xs font-semibold text-gray-700 mb-2">
          CHECK-IN
        </label>
        <input
          type="date"
          value={checkInDate}
          onChange={(e) => {
            setCheckInDate(e.target.value);
            setError("");
          }}
          min={today}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 font-medium"
          disabled={isLoading}
        />
      </div>

      {/* Check-out Date */}
      <div className="mb-4">
        <label className="block text-xs font-semibold text-gray-700 mb-2">
          CHECK-OUT
        </label>
        <input
          type="date"
          value={checkOutDate}
          onChange={(e) => {
            setCheckOutDate(e.target.value);
            setError("");
          }}
          min={checkInDate || tomorrowStr}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 font-medium"
          disabled={isLoading}
        />
      </div>

      {/* Guests Selector */}
      <div className="mb-6">
        <label className="block text-xs font-semibold text-gray-700 mb-2">
          GUESTS
        </label>
        <select
          value={guests}
          onChange={(e) => setGuests(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 font-medium"
          disabled={isLoading}
        >
          <option value="1">1 Guest</option>
          <option value="2">2 Guests</option>
          <option value="3">3 Guests</option>
          <option value="4">4 Guests</option>
          <option value="5">5 Guests</option>
          <option value="6">6+ Guests</option>
        </select>
      </div>

      {/* Reserve Button */}
      <button
        onClick={handleReservation}
        disabled={isLoading || !checkInDate || !checkOutDate || success}
        className="w-full py-4 rounded-lg font-bold text-white text-lg
          bg-gradient-to-r from-indigo-600 to-purple-600
          hover:from-indigo-700 hover:to-purple-700
          disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed
          transition-all duration-200 mb-4"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
            Processing...
          </span>
        ) : success ? (
          "✓ Reservation Complete"
        ) : (
          "Reserve"
        )}
      </button>

      {/* You won't be charged message */}
      <p className="text-xs text-gray-600 text-center mb-6">
        You won't be charged yet
      </p>

      {/* Price Breakdown */}
      {pricing.nights > 0 && (
        <div className="pt-6 border-t space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-700">
              ${pricePerNight.toLocaleString()} × {pricing.nights}{" "}
              {pricing.nights === 1 ? "night" : "nights"}
            </span>
            <span className="font-medium text-gray-900">
              ${pricing.subtotal.toLocaleString()}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-700">Cleaning fee</span>
            <span className="font-medium text-gray-900">
              ${pricing.cleaningFee.toLocaleString()}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-700">Service fee</span>
            <span className="font-medium text-gray-900">
              ${pricing.serviceFee.toLocaleString()}
            </span>
          </div>

          <div className="pt-2 border-t flex justify-between">
            <span className="font-semibold text-gray-900">Total</span>
            <span className="font-bold text-lg text-gray-900">
              ${pricing.total.toLocaleString()}
            </span>
          </div>
        </div>
      )}

      {/* Info Footer */}
      <div className="mt-6 pt-6 border-t text-xs text-gray-600 space-y-2">
        <p>✓ Free cancellation for 7 days</p>
        <p>✓ Self check-in with smart lock</p>
      </div>
    </div>
  );
};

export default BookingWidget;
