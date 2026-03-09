import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

/**
 * ReservationConfirmation
 * Displays booking confirmation details after successful reservation
 */
const ReservationConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [reservation, setReservation] = useState(null);

  useEffect(() => {
    if (location.state?.reservation) {
      setReservation(location.state.reservation);
    } else {
      // Redirect to home if no reservation data
      navigate("/");
    }
  }, [location, navigate]);

  if (!reservation) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading confirmation...</p>
        </div>
      </div>
    );
  }

  // Format date for display
  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("es-CO", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="bg-gradient-to-b from-green-50 to-white min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🎉 Reservation Confirmed!
          </h1>
          <p className="text-gray-600">
            Thank you for booking with us. Your reservation details are below.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Confirmation Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Confirmation Card */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-8">
              <div className="flex items-center gap-3 mb-6 pb-6 border-b">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  <span className="text-2xl">✓</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Booking Confirmed
                  </h2>
                  <p className="text-sm text-gray-600">
                    Reservation ID: #{Math.random().toString(36).substr(2, 9).toUpperCase()}
                  </p>
                </div>
              </div>

              {/* Reservation Dates */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-4">
                  📅 Reservation Dates
                </h3>
                <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-xs text-gray-600">Check-in</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {formatDate(reservation.start_date)}
                      </p>
                    </div>
                    <div className="text-gray-400">→</div>
                    <div className="text-right">
                      <p className="text-xs text-gray-600">Check-out</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {formatDate(reservation.end_date)}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-indigo-700 font-medium">
                    {reservation.nights} {reservation.nights === 1 ? "night" : "nights"}
                  </p>
                </div>
              </div>

              {/* Guest Info */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">
                  👥 Guests
                </h3>
                <p className="text-lg text-gray-700">
                  {reservation.guests} {reservation.guests === 1 ? "guest" : "guests"}
                </p>
              </div>

              {/* Payment Method */}
              <div className="mb-6 pb-6 border-b">
                <h3 className="font-semibold text-gray-900 mb-3">
                  💳 Payment
                </h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-2">
                    Payment method
                  </p>
                  <p className="text-lg font-semibold text-gray-900">
                    Not yet charged
                  </p>
                  <p className="text-xs text-gray-600 mt-2">
                    Payment will be processed 48 hours before check-in
                  </p>
                </div>
              </div>

              {/* Next Steps */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">
                  ✅ What happens next?
                </h3>
                <ol className="space-y-3">
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-sm font-bold">
                      1
                    </span>
                    <div>
                      <p className="font-medium text-gray-900">
                        Confirmation email sent
                      </p>
                      <p className="text-sm text-gray-600">
                        Check your email for booking details
                      </p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-sm font-bold">
                      2
                    </span>
                    <div>
                      <p className="font-medium text-gray-900">
                        Host confirmation
                      </p>
                      <p className="text-sm text-gray-600">
                        The host will confirm your reservation within 24 hours
                      </p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-sm font-bold">
                      3
                    </span>
                    <div>
                      <p className="font-medium text-gray-900">
                        Check-in details
                      </p>
                      <p className="text-sm text-gray-600">
                        Receive check-in instructions 48 hours before arrival
                      </p>
                    </div>
                  </li>
                </ol>
              </div>
            </div>
          </div>

          {/* Right Column: Price Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-6 sticky top-20">
              <h3 className="font-semibold text-gray-900 mb-4">
                Price Summary
              </h3>

              <div className="space-y-3 mb-4 pb-4 border-b">
                <div className="flex justify-between">
                  <span className="text-gray-700">
                    Nightly rate × {reservation.nights}
                  </span>
                  <span className="font-medium text-gray-900">
                    ${reservation.subtotal.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-700">Cleaning fee</span>
                  <span className="font-medium text-gray-900">
                    ${reservation.cleaning_fee.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-700">Service fee</span>
                  <span className="font-medium text-gray-900">
                    ${reservation.service_fee.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex justify-between mb-6">
                <span className="font-bold text-gray-900">Total</span>
                <span className="font-bold text-2xl text-indigo-600">
                  ${reservation.total_price.toLocaleString()}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <button
                  onClick={() => navigate("/")}
                  className="w-full py-3 rounded-lg font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition"
                >
                  Continue Exploring
                </button>

                <button
                  onClick={() => navigate("/my-reservations")}
                  className="w-full py-3 rounded-lg font-semibold text-indigo-600 border border-indigo-600 hover:bg-indigo-50 transition"
                >
                  View My Reservations
                </button>
              </div>

              {/* Support Info */}
              <div className="mt-6 pt-6 border-t bg-gray-50 rounded-lg p-4">
                <p className="text-xs text-gray-600 mb-2">
                  💬 Need help?
                </p>
                <p className="text-sm text-gray-900 font-medium">
                  Contact us at support@colombianstay.com
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-12 bg-blue-50 border-t border-b border-blue-200">
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex gap-4">
            <span className="text-2xl">📋</span>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">
                Important: Review the Cancellation Policy
              </h4>
              <p className="text-sm text-gray-700">
                Free cancellation up to 7 days before check-in. For cancellations
                within 7 days, you will be charged 50% of the reservation total.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReservationConfirmation;
