import React, { useState } from "react";

const RateStayModal = ({ isOpen, onClose, onRate }) => {
  // Estado de calificación y comentario, por default hacemos que empiecen vacio 
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Rate Your Stay</h2>
        {/* Para seleccionar las estrellas */}
        <div className="flex items-center mb-4">
          {[1,2,3,4,5].map(star => (
            <button
              key={star}
              type="button"
              className={`text-2xl mr-1 ${star <= rating ? "text-yellow-400" : "text-gray-300"}`}
              onClick={() => setRating(star)}
              aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
            >
              ★
            </button>
          ))}
        </div>
        {/* Este bloque es el que da un campo para poner el comentario, revisar si el tamaño esta bien pls*/}
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Leave a comment
        </label>
        <textarea
          className="w-full border rounded-lg p-2 mb-4 resize-none"
          rows={3}
          value={comment}
          onChange={e => setComment(e.target.value)}
          placeholder="Share your experience (optional)"
        />
        <div className="flex justify-end gap-2">
          <button
            className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300"
            onClick={onClose}
          >
            Close
          </button>
          <button
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            onClick={() => onRate(rating, comment)}
            disabled={rating === 0}
          >
            Submit Rating
          </button>
        </div>
      </div>
    </div>
  );
};

export default RateStayModal;
