import React, { useState } from "react";
import "./CancelReservationModal.css";

/**
 * CancelReservationModal
 * Props:
 * - isOpen: boolean
 * - reservationId: string
 * - propertyTitle: string
 * - location: string
 * - userName: string
 * - startDate: string
 * - endDate: string
 * - onConfirm: function(reservationId, cancellationReason)
 * - onCancel: function()
 * - isLoading: boolean
 */
const CancelReservationModal = ({
  isOpen,
  reservationId,
  propertyTitle,
  location,
  userName,
  startDate,
  endDate,
  onConfirm,
  onCancel,
  isLoading = false,
}) => {
  const [cancellationReason, setCancellationReason] = useState("");
  const [confirmed, setConfirmed] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (!confirmed) return;
    onConfirm(reservationId, cancellationReason);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="cancel-modal-backdrop"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="cancel-modal-container">
        {/* Icono de advertencia */}
        <div className="cancel-modal-icon">
          <svg
            className="icon-svg"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4v2m0-14a9 9 0 110 18 9 9 0 010-18z"
            />
          </svg>
        </div>

        <h3 className="cancel-modal-title">¿Cancelar reserva?</h3>
        <p className="cancel-modal-subtitle">
          Antes de continuar, revisa la información y confirma la acción.
        </p>

        {/* Resumen de la reserva */}
        <div className="cancel-modal-summary">
          <p><strong>Propiedad:</strong> {propertyTitle}</p>
          <p><strong>Ubicación:</strong> {location}</p>
          {userName && <p><strong>Usuario:</strong> {userName}</p>}
          <p><strong>Fechas:</strong> {startDate} → {endDate}</p>
        </div>

        {/* Motivo de cancelación */}
        <label className="cancel-modal-label">
          Motivo de cancelación <span className="required">*</span>
        </label>
        <textarea
          className="cancel-modal-textarea"
          placeholder="Escribe el motivo..."
          value={cancellationReason}
          onChange={(e) => setCancellationReason(e.target.value)}
        />

        {/* Checkbox de confirmación */}
        <div className="cancel-modal-checkbox">
          <input
            type="checkbox"
            id="confirm-cancel"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
          />
          <label htmlFor="confirm-cancel">
            Confirmo que deseo cancelar esta reserva.
          </label>
        </div>

        {/* Botones */}
        <div className="cancel-modal-actions">
          <button
            className="cancel-modal-button secondary"
            onClick={onCancel}
            disabled={isLoading}
          >
            Volver
          </button>
          <button
            className="cancel-modal-button primary"
            onClick={handleConfirm}
            disabled={!confirmed || isLoading}
          >
            {isLoading ? "Cancelando..." : "Cancelar reserva"}
          </button>
        </div>
      </div>
    </>
  );
};

export default CancelReservationModal;