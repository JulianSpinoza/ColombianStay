import React, { useState } from "react";

// Modal para cancelar una reserva
const CancelReservationModal = ({ isOpen, onClose, onCancel, reservationId, reservationTitle }) => {
  // Estado para el motivo de cancelación
  const [reason, setReason] = useState("");
  // Estado para mostrar si se está enviando
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  if (!isOpen) return null;

  const handleCancel = async () => {
    try {
      setIsSubmitting(true);
      setErrorMessage("");

      // Llamar el callback con la información de cancelación
      if (onCancel) {
        await onCancel({
          reservationId,
          reason: reason || "Sin especificar",
        });
      }

      setSuccessMessage("Reserva cancelada correctamente");

      // Reset form después de 1.5 segundos
      setTimeout(() => {
        handleClose();
      }, 1500);
    } catch (error) {
      console.error("Error al cancelar reserva:", error);
      setErrorMessage("Error al cancelar la reserva. Intenta de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setReason("");
    setErrorMessage("");
    setSuccessMessage("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-2 text-red-600">Cancelar Reserva</h2>
        
        {reservationTitle && (
          <p className="text-gray-600 text-sm mb-4">
            ¿Deseas cancelar tu reserva en <span className="font-medium">{reservationTitle}</span>?
          </p>
        )}

        {/* Mensaje de éxito */}
        {successMessage && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-700 text-sm">{successMessage}</p>
          </div>
        )}

        {/* Mensaje de error */}
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{errorMessage}</p>
          </div>
        )}

        {/* Advertencia */}
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800 text-sm font-semibold">⚠️ Advertencia</p>
          <p className="text-yellow-700 text-sm mt-1">
            Esta acción no se puede deshacer. La reserva será cancelada permanentemente.
          </p>
        </div>

        {/* Campo para el motivo de cancelación */}
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Motivo de cancelación (Opcional)
        </label>
        <textarea
          className="w-full border border-gray-300 rounded-lg p-3 mb-4 resize-none focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-gray-100"
          rows={3}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Cuéntanos por qué cancelas tu reserva..."
          disabled={isSubmitting}
        />

        <div className="flex justify-end gap-3">
          <button
            className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors disabled:opacity-50"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Volver
          </button>
          <button
            className={`px-4 py-2 rounded-lg text-white transition-colors ${
              isSubmitting
                ? "bg-red-400 cursor-not-allowed"
                : "bg-red-600 hover:bg-red-700"
            }`}
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Cancelando..." : "Cancelar Reserva"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CancelReservationModal;