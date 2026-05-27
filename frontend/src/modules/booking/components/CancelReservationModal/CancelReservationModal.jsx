import React, { useEffect, useState } from "react";
import "./CancelReservationModal.css";

const CancelReservationModal = ({
  isOpen,
  reservationId,
  propertyTitle,
  location,
  startDate,
  endDate,
  onConfirm,
  onCancel,
  isLoading = false,
}) => {
  const [cancellationReason, setCancellationReason] = useState("");
  const [isConfirmed, setIsConfirmed] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCancellationReason("");
      setIsConfirmed(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const reasonIsValid = cancellationReason.trim().length >= 5;
  const canSubmit = reasonIsValid && isConfirmed && !isLoading;

  const formatDate = (dateStr) => {
    if (!dateStr) return "Fecha no disponible";

    return new Date(dateStr).toLocaleDateString("es-CO", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const handleConfirm = () => {
    if (!canSubmit) return;

    onConfirm(reservationId, cancellationReason.trim());
  };

  return (
    <>
      <div
        className="cancel-popup-backdrop"
        onClick={isLoading ? undefined : onCancel}
      />

      <div className="cancel-popup-wrapper">
        <div className="cancel-popup-card">
          <div className="cancel-popup-floating-icon">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
              />
            </svg>
          </div>

          <button
            type="button"
            className="cancel-popup-close"
            onClick={onCancel}
            disabled={isLoading}
            aria-label="Cerrar modal"
          >
            ×
          </button>

          <div className="cancel-popup-content">
            <h2>Cancelar reserva</h2>

            <p className="cancel-popup-description">
              Revisa los datos de la reserva antes de continuar.
            </p>

            <section className="cancel-popup-summary">
              <div className="cancel-popup-summary-row">
                <span>Propiedad</span>
                <strong>{propertyTitle || "Reserva seleccionada"}</strong>
              </div>

              <div className="cancel-popup-summary-row">
                <span>Municipio</span>
                <strong>{location || "Municipio no disponible"}</strong>
              </div>

              <div className="cancel-popup-summary-row">
                <span>Fechas</span>
                <strong>
                  {formatDate(startDate)} - {formatDate(endDate)}
                </strong>
              </div>
            </section>

            <section className="cancel-popup-field">
              <label htmlFor="cancellationReason">
                Motivo de cancelación <span>*</span>
              </label>

              <textarea
                id="cancellationReason"
                value={cancellationReason}
                onChange={(event) =>
                  setCancellationReason(event.target.value)
                }
                disabled={isLoading}
                placeholder="Escribe el motivo..."
                rows={3}
              />

              <div className="cancel-popup-helper">
                <p
                  className={
                    cancellationReason.length > 0 && !reasonIsValid
                      ? "cancel-popup-helper-error"
                      : ""
                  }
                >
                  {cancellationReason.length > 0 && !reasonIsValid
                    ? "Mínimo 5 caracteres."
                    : "Campo obligatorio."}
                </p>

                <span>{cancellationReason.trim().length}/5</span>
              </div>
            </section>

            <label className="cancel-popup-check">
              <input
                type="checkbox"
                checked={isConfirmed}
                onChange={(event) => setIsConfirmed(event.target.checked)}
                disabled={isLoading}
              />

              <span>Confirmo que deseo cancelar esta reserva.</span>
            </label>

            <div className="cancel-popup-actions">
              <button
                type="button"
                className="cancel-popup-button cancel-popup-button-secondary"
                onClick={onCancel}
                disabled={isLoading}
              >
                Volver
              </button>

              <button
                type="button"
                className="cancel-popup-button cancel-popup-button-primary flex items-center justify-center gap-2"
                onClick={handleConfirm}
                disabled={!canSubmit}
              >
                {isLoading ? (
                  <>
                    <div className="spinner" />
                    Cancelando...
                  </>
                ) : (
                  "Cancelar reserva"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CancelReservationModal;