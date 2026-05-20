import React from "react";
import "./BookingConfirmationModal.css";

const BookingConfirmationModal = ({ isOpen, onClose, booking }) => {
  if (!isOpen || !booking) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">

        {/* Close button */}
        <button className="modal-close" onClick={onClose}>
          ✕
        </button>

        {/* Header */}
        <h2 className="modal-title">🎉 Reservation Confirmed</h2>

        {/* Listing Info */}
        <div className="listing-section">
          <img
            src={booking.listing_image}
            alt={booking.listing_title}
            className="listing-image"
          />
          <div>
            <h3>{booking.listing_title}</h3>
            <p>{booking.listing_location}</p>
          </div>
        </div>

        {/* Guest Info */}
        <div className="guest-section">
          <img
            src={booking.guest_avatar}
            alt={booking.guest_name}
            className="guest-avatar"
          />
          <div>
            <p><strong>{booking.guest_name}</strong></p>
            <p>{booking.guest_email}</p>
          </div>
        </div>

        {/* Booking Details */}
        <div className="details-section">
          <div className="row">
            <span>Check-in:</span>
            <span>{booking.check_in_date}</span>
          </div>
          <div className="row">
            <span>Check-out:</span>
            <span>{booking.check_out_date}</span>
          </div>
          <div className="row">
            <span>Guests:</span>
            <span>{booking.number_of_guests}</span>
          </div>
          <div className="row">
            <span>Status:</span>
            <span className="status">{booking.actual_status}</span>
          </div>
        </div>

        {/* Total */}
        <div className="total-section">
          <span>Total Paid:</span>
          <span className="total-price">
            ${booking.total_price?.toLocaleString()}
          </span>
        </div>

        {/* Footer */}
        <button className="modal-button" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

export default BookingConfirmationModal;