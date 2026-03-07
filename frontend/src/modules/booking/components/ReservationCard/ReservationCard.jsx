import React, { useState } from "react";

/**
 * ReservationCard
 * Reutilizable - Muestra información de una reserva
 * Props:
 * - reservation: { id, property, guest, start_date, end_date, status, total_price }
 * - onCancel?: function(reservationId)
 * - showGuestInfo?: boolean (mostrar nombre del guest - para hosts)
 * - isHost?: boolean (mostrar opciones de host)
 */
const ReservationCard = ({
  reservation,
  onCancel,
  showGuestInfo = false,
  isHost = false,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Determinar si se puede cancelar
  const canCancel = () => {
    if (reservation.status === "cancelled") return false;
    const startDate = new Date(reservation.start_date);
    const today = new Date();
    // Solo se puede cancelar si la fecha de inicio es futura
    return startDate > today;
  };

  // Determinar color del badge según estado
  const getStatusBadgeColor = () => {
    switch (reservation.status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-gray-100 text-gray-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Formato de fecha en español
  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("es-CO", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Calcular número de noches
  const calculateNights = () => {
    const start = new Date(reservation.start_date);
    const end = new Date(reservation.end_date);
    const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    return nights;
  };

  const nights = calculateNights();

  return (
    <div
      className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-lg transition-shadow duration-200"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex gap-4">
        {/* Imagen miniatura */}
        <div className="flex-shrink-0 w-24 h-24">
          <img
            src={reservation.property?.image || "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=200&h=200&fit=crop"}
            alt={reservation.property?.title}
            className="w-full h-full object-cover rounded-lg"
          />
        </div>

        {/* Contenido principal */}
        <div className="flex-1 min-w-0">
          {/* Título y estado */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {reservation.property?.title || "Property"}
              </h3>
              {showGuestInfo && (
                <p className="text-sm text-gray-600">
                  👤 {reservation.guest?.name || "Guest"}
                </p>
              )}
            </div>
            <span
              className={`ml-2 inline-flex items-center rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap ${getStatusBadgeColor()}`}
            >
              {reservation.status === "confirmed" && "Confirmada"}
              {reservation.status === "pending" && "Pendiente"}
              {reservation.status === "cancelled" && "Cancelada"}
              {reservation.status === "completed" && "Completada"}
            </span>
          </div>

          {/* Información de fechas */}
          <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
            <span>
              📅 {formatDate(reservation.start_date)} → {formatDate(reservation.end_date)}
            </span>
            <span>
              🛏️ {nights} {nights === 1 ? "noche" : "noches"}
            </span>
          </div>

          {/* Localización */}
          {reservation.property?.location && (
            <p className="text-sm text-gray-600 mb-3">
              📍 {reservation.property.location}
            </p>
          )}

          {/* Precio */}
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-gray-900">
              ${reservation.total_price?.toLocaleString() || "0"}
            </span>

            {/* Botón de cancelar */}
            {canCancel() && onCancel && (
              <button
                onClick={() => onCancel(reservation.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isHovered
                    ? "bg-red-100 text-red-700 hover:bg-red-200"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Cancelar
              </button>
            )}

            {/* Indicador si no se puede cancelar */}
            {!canCancel() && (
              <span className="text-xs text-gray-500">
                {reservation.status === "cancelled"
                  ? "Cancelada"
                  : "No se puede cancelar"}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReservationCard;
