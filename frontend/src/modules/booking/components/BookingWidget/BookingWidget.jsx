import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./BookingWidget.css"
import { useApiState } from "../../../../services/api/useApiState.js";
import { bookAProperty } from "../../services/bookingService.js";

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
  // Really necesary?
  rating = 4.9,
  reviews = 128,
}) => {
  const navigate = useNavigate();

  // Form state
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [guests, setGuests] = useState("1");
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState(false);

  // Api state
  const { loading, setLoading, error, setError, handleError } = useApiState();

  // Constants to put on the backend
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
      setFormError("Please select a check-in date");
      return false;
    }
    if (!checkOutDate) {
      setFormError("Please select a check-out date");
      return false;
    }
    if (new Date(checkInDate) >= new Date(checkOutDate)) {
      setFormError("Check-out date must be after check-in date");
      return false;
    }
    if (pricing.nights < 1) {
      setFormError("Minimum stay is 1 night");
      return false;
    }
    setFormError("");
    return true;
  };

  // Handle reservation
  const handleReservation = async () => {
    if (!validateForm()) return;

    setError(null);
    setLoading(true);

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

      const payload = {
        property_id: propertyId,
        start_date: checkInDate,
        end_date: checkOutDate,
        number_of_guests: parseInt(guests),
        total_price: pricing.total,
      };

      const serverBooking = await bookAProperty(payload);

      // Success - combine server response with client-side pricing details
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

      // Redirect immediately to confirmation page with combined data
      navigate("/reservation-confirmation", { state: { reservation: combined } });
    } catch (err) {
      handleError(err);
      setFormError("Failed to complete reservation. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Get minimum date (today)
  const today = new Date().toISOString().split("T")[0];

  // Get tomorrow as default check-out
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split("T")[0];

  return (
    <div className="reservation-card">
      {/* Success State */}
      {success && (
        <div className="alert alert-success">
          <p className="alert-title">✓ Reservation created successfully!</p>
          <p className="alert-subtitle">Redirecting to confirmation...</p>
        </div>
      )}

      {/* Error State */}
      {formError && (
        <div className="alert alert-error">
          <p className="alert-error-text">{formError}</p>
        </div>
      )}

      {/* Price & Rating Header */}
      <div className="price-header">
        <div className="price-row">
          <p className="price-amount">
            ${pricePerNight.toLocaleString()}
          </p>
          <p className="price-unit">per night</p>
        </div>

        <div className="rating-row">
          <span className="rating-star">⭐</span>
          <span className="rating-value">{rating}</span>
          <span className="rating-reviews">({reviews} reviews)</span>
        </div>
      </div>

      {/* Check-in Date */}
      <div className="form-group">
        <label className="form-label">CHECK-IN</label>
        <input
          type="date"
          value={checkInDate}
          min={today}
          onChange={(e) => {
            setCheckInDate(e.target.value);
            setFormError("");
          }}
          disabled={loading}
          className="form-input"
        />
      </div>

      {/* Check-out Date */}
      <div className="form-group">
        <label className="form-label">CHECK-OUT</label>
        <input
          type="date"
          value={checkOutDate}
          min={checkInDate || tomorrowStr}
          onChange={(e) => {
            setCheckOutDate(e.target.value);
            setFormError("");
          }}
          disabled={loading}
          className="form-input"
        />
      </div>

      {/* Guests Selector */}
      <div className="form-group">
        <label className="form-label">GUESTS</label>
        <select
          value={guests}
          onChange={(e) => setGuests(e.target.value)}
          disabled={loading}
          className="form-input"
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
        disabled={loading || !checkInDate || !checkOutDate || success}
        className="reserve-button"
      >
        {loading ? (
          <span className="loading">
            <span className="spinner"></span>
            Processing...
          </span>
        ) : success ? (
          "✓ Reservation Complete"
        ) : (
          "Reserve"
        )}
      </button>

      <p className="disclaimer">You won't be charged yet</p>

      {/* Price Breakdown */}
      {pricing.nights > 0 && (
        <div className="price-breakdown">
          <div className="row">
            <span>
              ${pricePerNight.toLocaleString()} × {pricing.nights}{" "}
              {pricing.nights === 1 ? "night" : "nights"}
            </span>
            <span className="bold">
              ${pricing.subtotal.toLocaleString()}
            </span>
          </div>

          <div className="row">
            <span>Cleaning fee</span>
            <span className="bold">${pricing.cleaningFee.toLocaleString()}</span>
          </div>

          <div className="row">
            <span>Service fee</span>
            <span className="bold">${pricing.serviceFee.toLocaleString()}</span>
          </div>

          <div className="row total">
            <span>Total</span>
            <span>${pricing.total.toLocaleString()}</span>
          </div>
        </div>
      )}

      {/* Info Footer */}
      <div className="info-footer">
        <p>✓ Free cancellation for 7 days</p>
        <p>✓ Self check-in with smart lock</p>
      </div>
    </div>
  );
};

export default BookingWidget;
