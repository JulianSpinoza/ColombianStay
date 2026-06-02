import React from "react";
import "./ReservationCard.css";

export default function ReservationCard({ reservation, onCancel, showGuestInfo, isHost }) {
  const statusConfig = {
    pending: { label: "Pendiente", className: "status-pending" },
    confirmed: { label: "Confirmada", className: "status-confirmed" },
    active: { label: "Activa", className: "status-active" },
    cancelled: { label: "Cancelada", className: "status-cancelled" },
    completed: { label: "Completada", className: "status-completed" },
  };

  const status = statusConfig[reservation.status] || { label: reservation.status, className: "" };
  const canCancel = () => reservation.status !== "cancelled" && reservation.status !== "completed";

  const formatDate = (dateStr) => {
    if (!dateStr) return "Fecha no disponible";
    return new Date(dateStr).toLocaleDateString("es-CO",{day:"numeric",month:"short",year:"numeric"});
  };

  return (
    <div className={`host-reservation-card ${isHost?"host":"guest"}`}>
      <div className="host-reservation-card-image-wrapper">
        <img src={reservation.property?.image||"https://via.placeholder.com/100"}
             alt={reservation.property?.title||"Propiedad"}
             className="host-reservation-card-image"/>
      </div>

      <div className="host-reservation-card-content">
        <div className="host-reservation-card-header">
          <h3 className="host-reservation-card-title">{reservation.property?.title}</h3>
          <span className={`host-reservation-card-status ${status.className}`}>{status.label}</span>
        </div>

        <p className="host-reservation-card-location">{reservation.property?.location}</p>
        {showGuestInfo && reservation.guest && <p className="host-reservation-card-guest">Huésped: {reservation.guest.name}</p>}

        <div className="host-reservation-card-dates">
          <span>Estadía: {formatDate(reservation.start_date)} - {formatDate(reservation.end_date)}</span>
          <span>Creada: {formatDate(reservation.created_at)}</span>
        </div>

        <div className="host-reservation-card-footer">
          {canCancel() && onCancel ? (
            <button className="host-reservation-card-cancel-button" onClick={() => onCancel(reservation.id)}>Cancelar reserva</button>
          ) : (
            <span className="host-reservation-card-note">
              {reservation.status==="cancelled"?"Esta reserva fue cancelada":"No se puede cancelar"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}