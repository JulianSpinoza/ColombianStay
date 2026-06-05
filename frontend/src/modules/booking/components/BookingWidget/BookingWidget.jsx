import { useEffect, useState } from "react";
import "./BookingWidget.css"
import useBookingProcess from "../../hooks/useBookingProcess.js";
import BookingConfirmationModal from "../BookingConfirmationModal/BookingConfirmationModal.jsx";
import { DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css'; 
import 'react-date-range/dist/theme/default.css';
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthContext } from "../../../users/contexts/AuthContext.jsx";

const BookingWidget = ({
  propertyId,
  pricePerNight,
  rating,
  reviews,
  initial_unavailibity
}) => {

  const location = useLocation()
  const navigate = useNavigate()
  const { state } = useAuthContext();

  const [showModal, setShowModal] = useState(false);

  // Form state
  const [checkInDate, setCheckInDate] = useState();
  const [checkOutDate, setCheckOutDate] = useState();
  const [guests, setGuests] = useState(1);
  const [formError, setFormError] = useState();

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
    if (new Date(checkInDate) > new Date(checkOutDate)) {
      setFormError("Check-out date must be after check-in date");
      return false;
    }

    const nights =
      (new Date(checkOutDate) - new Date(checkInDate)) /
      (1000 * 60 * 60 * 24);

    if (nights < 1) {
      setFormError("Minimum stay is 1 night");
      return false;
    }
    setFormError("");
    return true;
  };

  const {
    resultOfBooking,
    success,
    bookingLoading,
    bookingError,
    postBooking,
    totalPrice,
    unavailablesDates,
    preInfoLoading,
    preInfoError
  } = useBookingProcess({
    guests: guests,
    check_in: checkInDate,
    check_out: checkOutDate,
    listing: propertyId,
  }, initial_unavailibity, validateForm);

  useEffect(() => {
    if (success && resultOfBooking) {
      setShowModal(true);
      setCheckInDate(new Date());
      setCheckOutDate(new Date());
    }
  }, [success, resultOfBooking]);

  const handleSelect = (ranges) => {
    const { startDate, endDate } = ranges.selection;
    
    setCheckInDate(startDate);
    setCheckOutDate(endDate);
  };

  // Handle reservation
  const handleReservation = async () => {

    if(!state.isAuthenticated) {
      navigate("/login", { state: { backgroundLocation: location } });
      return
    }

    if (!validateForm()) return;

    try {
      postBooking();
    } catch (err) {
      setFormError("Failed to complete reservation. Please try again.");
    } 
  };

  return (
  <>
    <BookingConfirmationModal
      isOpen={showModal}
      onClose={() => setShowModal(false)}
      booking={resultOfBooking}
    />
    <div className="reservation-card">
      {/* Success State */}
      {success && showModal && (
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

      {/* Calendar */}
      <div className="form-group">
        <label className="form-label">SELECT DATES</label> 
        <DateRange
          onChange={handleSelect}
          editableDateInputs={true}
          moveRangeOnFirstSelection={false}
          minDate={new Date()}
          disabledDates={unavailablesDates}
          ranges={[
            {
              startDate: checkInDate || new Date(),
              endDate: checkOutDate || new Date(),
              key: 'selection',
            }
          ]}
        />
      </div>

      {/* Guests Selector */}
      <div className="form-group">
        <label className="form-label">GUESTS</label>
        <input
          type="number"
          min={1}
          disabled={bookingLoading}
          value={guests}
          onChange={(e) => setGuests(parseInt(e.target.value)) }
          className="form-input"
          required
        />
      </div>

      {/* Reserve Button */}
      <button
        onClick={handleReservation}
        disabled={bookingLoading || !checkInDate || (checkInDate === checkOutDate) || (success && showModal)}
        className="reserve-button"
      >
        {bookingLoading ? (
          <span className="loading">
            <span className="spinner"></span>
            Processing...
          </span>
        ) : (success && showModal) ? (
          "✓ Reservation Complete"
        ) : (
          "Reserve"
        )}
      </button>

      <p className="disclaimer">You won't be charged yet</p>

      {/* Price Breakdown */}
      {preInfoLoading ? (
        <span className="loading">
          <span className="spinner"></span>
        </span>
      ) : totalPrice && (
        <div className="price-breakdown">
          <div className="row total">
            <span>Total</span>
            <span>${totalPrice?.toLocaleString()}</span>
          </div>
        </div>
      )}
    
      {/* Info Footer */}
      <div className="info-footer">
        <p>✓ Free cancellation for 7 days</p>
        <p>✓ Cancellation avaliable until 3 days before the check-in</p>
      </div>
    </div>
  </>
  );
};

export default BookingWidget;
