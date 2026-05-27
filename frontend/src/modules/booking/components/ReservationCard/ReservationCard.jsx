import React from "react";

const ReservationCard = ({
  reservation,
  onCancel,
  showGuestInfo = false,
}) => {
  const status = reservation.status || "pending";

  const statusConfig = {
    pending: {
      label: "Pendiente",
      className:
        "guest-reservation-card-status guest-reservation-card-status-pending",
    },
    confirmed: {
      label: "Confirmada",
      className:
        "guest-reservation-card-status guest-reservation-card-status-confirmed",
    },
    active: {
      label: "Activa",
      className:
        "guest-reservation-card-status guest-reservation-card-status-active",
    },
    cancelled: {
      label: "Cancelada",
      className:
        "guest-reservation-card-status guest-reservation-card-status-cancelled",
    },
    completed: {
      label: "Completada",
      className:
        "guest-reservation-card-status guest-reservation-card-status-completed",
    },
  };

  const currentStatus = statusConfig[status] || {
    label: status,
    className:
      "guest-reservation-card-status guest-reservation-card-status-default",
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "Fecha no disponible";

    return new Date(dateStr).toLocaleDateString("es-CO", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const calculateNights = () => {
    if (!reservation.start_date || !reservation.end_date) return 0;

    const start = new Date(reservation.start_date);
    const end = new Date(reservation.end_date);
    const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

    return nights > 0 ? nights : 0;
  };

  const canCancel = () => {
    if (status === "cancelled" || status === "completed") return false;

    const startDate = new Date(reservation.start_date);
    const today = new Date();

    return startDate > today;
  };

  const handleCancelClick = () => {
    if (!reservation.id) {
      console.error("La reserva no tiene ID:", reservation);
      return;
    }

    onCancel(reservation.id);
  };

  const nights = calculateNights();

  return (
    <article className="guest-reservation-card">
      <div className="guest-reservation-card-image-wrapper">
        <img
          src={
            reservation.property?.image ||
            "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=300&h=300&fit=crop"
          }
          alt={reservation.property?.title || "Propiedad reservada"}
          className="guest-reservation-card-image"
        />
      </div>

      <div className="guest-reservation-card-content">
        <div className="guest-reservation-card-main">
          <div>
            <div className="guest-reservation-card-title-row">
              <h3 className="guest-reservation-card-title">
                {reservation.property?.title || "Propiedad"}
              </h3>

              <span className={currentStatus.className}>
                {currentStatus.label}
              </span>
            </div>

            {showGuestInfo && (
              <p className="guest-reservation-card-guest">
                Reservado por: {reservation.guest?.name || "Huésped"}
              </p>
            )}

            <p className="guest-reservation-card-location">
              {reservation.property?.location || "Municipio no disponible"}
            </p>
          </div>

          <div className="guest-reservation-card-price">
            ${Number(reservation.total_price || 0).toLocaleString("es-CO")}
          </div>
        </div>

        <div className="guest-reservation-card-details">
          <div className="guest-reservation-card-detail">
            <span>Estadía</span>
            <strong>
              {formatDate(reservation.start_date)} -{" "}
              {formatDate(reservation.end_date)}
            </strong>
          </div>

          <div className="guest-reservation-card-detail">
            <span>Noches</span>
            <strong>
              {nights} {nights === 1 ? "noche" : "noches"}
            </strong>
          </div>

          <div className="guest-reservation-card-detail">
            <span>Creada</span>
            <strong>{formatDate(reservation.created_at)}</strong>
          </div>
        </div>

        <div className="guest-reservation-card-footer">
          {canCancel() && onCancel ? (
            <button
              type="button"
              onClick={handleCancelClick}
              className="guest-reservation-card-cancel-button"
            >
              Cancelar reserva
            </button>
          ) : (
            <span className="guest-reservation-card-note">
              {status === "cancelled"
                ? "Esta reserva fue cancelada."
                : "No se puede cancelar."}
            </span>
          )}
        </div>
      </div>
    </article>
  );
};

export default ReservationCard;