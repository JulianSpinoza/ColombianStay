import React, { useState } from "react";
import httpClient from "../../../../services/api/httpClient";

const RateStayModal = ({ isOpen, onClose, onSubmit, listing }) => {
  // Estado para la calificación (1-5 estrellas)
  const [rating, setRating] = useState(0);
  // Estado para el comentario
  const [comment, setComment] = useState("");
  // Estado para mostrar si se está enviando
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  if (!isOpen) return null;

  const handleStarClick = (value) => {
    setRating(value);
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      setErrorMessage("Please select a rating");
      return;
    }

    if (!listing || !listing.accomodationid) {
      setErrorMessage("Error: no property to rate");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage("");

      // Crear el rating en la API
      const response = await httpClient.post('ratings/', {
        listing: listing.accomodationid,
        rating: rating,
        comment: comment || null,
      });

      setSuccessMessage("Rating successfully submitted");
      
      // Llamar el callback si existe
      if (onSubmit) {
        onSubmit(response.data);
      }

      // Reset form después de 1.5 segundos
      setTimeout(() => {
        handleClose();
      }, 1500);
    } catch (error) {
      console.error("Error submitting rating:", error);
      
      if (error.response?.status === 401) {
        setErrorMessage("You must be logged in to submit a rating");
      } else if (error.response?.data?.non_field_errors) {
        setErrorMessage(error.response.data.non_field_errors[0]);
      } else {
        setErrorMessage("Error submitting rating. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setRating(0);
    setComment("");
    setSuccessMessage("");
    setErrorMessage("");
    onClose();
  };

  const listingTitle = listing?.title || "your stay";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-2">Rate Your Stay</h2>
        {listing && (
          <p className="text-gray-600 text-sm mb-4">
            Your experience at <span className="font-medium">{listingTitle}</span>
          </p>
        )}

        {successMessage && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-700 text-sm">{successMessage}</p>
          </div>
        )}

        {errorMessage && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{errorMessage}</p>
          </div>
        )}

        {/* Star Rating Selection */}
        <div className="mb-6">
          <label className="block mb-3 text-sm font-medium text-gray-700">
            How would you rate this property?
          </label>
          <div className="flex gap-2 justify-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => handleStarClick(star)}
                disabled={isSubmitting}
                className={`text-3xl transition-transform transform hover:scale-110 disabled:opacity-50 ${
                  star <= rating ? "text-yellow-400" : "text-gray-300"
                }`}
                aria-label={`Rate ${star} stars`}
              >
                ⭐
              </button>
            ))}
          </div>
          <p className="text-center text-sm text-gray-600 mt-2">
            {rating > 0 ? `You selected ${rating} star${rating !== 1 ? "s" : ""}` : "Select a rating"}
          </p>
        </div>

        {/* Comment Section */}
        <div className="mb-6">
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Comment (Optional)
          </label>
          <textarea
            className="w-full border border-gray-300 rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience with other guests..."
            disabled={isSubmitting}
          />
          <p className="text-xs text-gray-500 mt-1">
            {comment.length} characters
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <button
            className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors disabled:opacity-50"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            className={`px-4 py-2 rounded-lg text-white transition-colors ${
              isSubmitting || rating === 0
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
            onClick={handleSubmit}
            disabled={isSubmitting || rating === 0}
          >
            {isSubmitting ? "Submitting..." : "Submit Rating"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RateStayModal;
