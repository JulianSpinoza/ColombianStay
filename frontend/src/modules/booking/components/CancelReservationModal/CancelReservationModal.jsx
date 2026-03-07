import React from "react";

/**
 * CancelReservationModal
 * Modal de confirmación para cancelar reservas
 * Props:
 * - isOpen: boolean
 * - reservationId: string
 * - propertyTitle: string
 * - onConfirm: function(reservationId)
 * - onCancel: function()
 * - isLoading: boolean
 */
const CancelReservationModal = ({
  isOpen,
  reservationId,
  propertyTitle,
  onConfirm,
  onCancel,
  isLoading = false,
}) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 transform transition-all">
          {/* Icono de advertencia */}
          <div className="flex justify-center mb-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100">
              <svg
                className="w-6 h-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4v2m0 4v2m0-14a9 9 0 110 18 9 9 0 010-18z"
                />
              </svg>
            </div>
          </div>

          {/* Título */}
          <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
            ¿Cancelar reserva?
          </h3>

          {/* Descripción */}
          <p className="text-sm text-gray-600 text-center mb-2">
            Estás a punto de cancelar la reserva de:
          </p>
          <p className="text-sm font-medium text-gray-900 text-center mb-4 px-2 py-2 bg-gray-50 rounded-lg">
            {propertyTitle}
          </p>

          {/* Aviso sobre cancelación */}
          <div className="mb-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-xs text-yellow-800">
              <strong>Nota:</strong> Una vez cancelada, la reserva no podrá recuperarse. Podrás crear una nueva reserva en el futuro.
            </p>
          </div>

          {/* Botones */}
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Mantener Reserva
            </button>
            <button
              onClick={() => onConfirm(reservationId)}
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  Cancelando...
                </>
              ) : (
                "Sí, Cancelar"
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default CancelReservationModal;
