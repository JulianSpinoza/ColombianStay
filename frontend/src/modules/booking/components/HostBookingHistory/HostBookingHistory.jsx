import React, { useState, useEffect } from "react";
import httpClient from "../../../services/api/httpClient";

const HostBookingHistory = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const response = await httpClient.get("bookings/host-history/");
        setBookings(response.data);
      } catch (err) {
        setError(err.message || "Error charging bookings");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const filteredBookings = bookings.filter((booking) => {
    if (filterStatus === "all") return true;
    return booking.status === filterStatus;
  });

  const getStatusColor = (status) => {
    const colors = {
      confirmed: "bg-blue-100 text-blue-800",
      upcoming: "bg-blue-100 text-blue-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };
{/* Por si se quieren cambiar los labels */}
  const getStatusLabel = (status) => {
    const labels = {
      confirmed: "Confirmed",
      upcoming: "Upcoming",
      completed: "Completed",
      cancelled: "Cancelled",
    };
    return labels[status] || status;
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-100 p-4 rounded-lg text-red-800">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-40 bg-white border-b shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Reservation History</h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex gap-2 mb-8 flex-wrap">
          {[
            { value: "all", label: "Todas" },
            { value: "upcoming", label: "Upcoming" },
            { value: "confirmed", label: "Confirmed" },
            { value: "completed", label: "Completed" },
            { value: "cancelled", label: "Cancelled" },
          ].map((filter) => (
            <button
              key={filter.value}
              onClick={() => setFilterStatus(filter.value)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filterStatus === filter.value
                  ? "bg-rose-500 text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:border-gray-400"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-gray-600 text-sm font-medium">Total reservations</p>
            <p className="text-3xl font-bold text-gray-900">{bookings.length}</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-gray-600 text-sm font-medium">Next</p>
            <p className="text-3xl font-bold text-blue-600">
              {bookings.filter((b) => b.status === "upcoming").length}
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-gray-600 text-sm font-medium">Completed</p>
            <p className="text-3xl font-bold text-green-600">
              {bookings.filter((b) => b.status === "completed").length}
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-gray-600 text-sm font-medium">Ingresos</p>
            <p className="text-3xl font-bold text-gray-900">
              ${bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0).toLocaleString()}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.length > 0 ? (
              filteredBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition overflow-hidden"
                >
                  <div
                    className="p-6 flex items-start justify-between cursor-pointer"
                    onClick={() =>
                      setSelectedBooking(selectedBooking?.id === booking.id ? null : booking)
                    }
                  >
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-bold text-gray-900">
                          {booking.guestName}
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                            booking.status
                          )}`}
                        >
                          {getStatusLabel(booking.status)}
                        </span>
                      </div>

                      <p className="text-gray-600 font-medium">{booking.propertyName}</p>

                      <div className="flex gap-4 mt-2 text-sm text-gray-600 flex-wrap">
                        {/* Cantidad de Huespedes */}
                        {booking.checkIn && <span> {booking.checkIn}</span>}
                        {booking.numberOfGuests && (
                          <span>{booking.numberOfGuests} Guests</span>
                        )}
                        {/* Noches */}
                        {booking.nights && <span> {booking.nights} Nights</span>}
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0 ml-4">
                      <p className="text-2xl font-bold text-gray-900">
                        ${booking.totalPrice?.toLocaleString()}
                      </p>
                      <p
                        className={`text-xs font-medium mt-1 ${
                          booking.paymentStatus === "paid"
                            ? "text-green-600"
                            : "text-orange-600"
                        }`}
                      >
                        {booking.paymentStatus === "paid" ? "Paid" : "pending"}
                      </p>
                    </div>

                    <button className="ml-4 text-gray-400 hover:text-gray-600 transition">
                      {selectedBooking?.id === booking.id ? "▼" : "▶"}
                    </button>
                  </div>

                  {selectedBooking?.id === booking.id && (
                    <div className="border-t bg-gray-50 p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-bold text-gray-900 mb-4">
                            Reservation details
                          </h4>
                          <div className="space-y-3 text-sm">
                            {booking.checkIn && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">CheckIn:</span>
                                <span className="font-medium">{booking.checkIn}</span>
                              </div>
                            )}
                            {booking.checkOut && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">CheckOut:</span>
                                <span className="font-medium">{booking.checkOut}</span>
                              </div>
                            )}
                            {booking.nights && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">Nights:</span>
                                <span className="font-medium">{booking.nights}</span>
                              </div>
                            )}
                            {booking.numberOfGuests && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">Huéspedes:</span>
                                <span className="font-medium">{booking.numberOfGuests}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        {/* Para las opiniones del Huesped */}
                        {booking.guestRating && (
                          <div>
                            <h4 className="font-bold text-gray-900 mb-4">
                              guest opinion
                            </h4>
                            <div className="bg-white p-4 rounded-lg border border-gray-200">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-lg">⭐ {booking.guestRating}/5</span>
                              </div>
                              <p className="text-gray-700 text-sm">{booking.guestReview}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="bg-white rounded-lg p-12 text-center">
                <p className="text-2xl text-gray-500 font-medium mb-2">No hay reservas</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default HostBookingHistory;
