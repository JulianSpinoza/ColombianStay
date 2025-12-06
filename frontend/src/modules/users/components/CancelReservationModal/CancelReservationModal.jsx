import React, { useState } from "react";

// Modal para cancelar una reserva
const CancelReservationModal = ({ isOpen, onClose, onCancel }) => {
  // Estado para el motivo de cancelación
  const [reason, setReason] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Cancel Reservation</h2>
        {/* Aca va el espacio para el motivo de cancelación */}
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Reason for cancellation
        </label>
        <textarea
          className="w-full border rounded-lg p-2 mb-4 resize-none"
          rows={3}
          value={reason}
          onChange={e => setReason(e.target.value)}
          placeholder="Optional: Let us know why you're cancelling"
        />
        <div className="flex justify-end gap-2">
          <button
            className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300"
            onClick={onClose}
          >
            Close
          </button>
          <button
            className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600"
            onClick={() => onCancel(reason)}
          >
            Cancel Reservation
          </button>
        </div>
      </div>
    </div>
  );
};

export default CancelReservationModal;
