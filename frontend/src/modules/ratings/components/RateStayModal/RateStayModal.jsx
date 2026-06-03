import React, { useState } from "react";
import "./RateStayModal.css";
import { ratePropertyByBooking } from "../../services/ratingsService";

const RateStayModal = ({ isOpen, onClose, listingTitle, bookingId }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccessSubmitted, setIsSuccessSubmitted] = useState(false);
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
    try {
      setIsSubmitting(true);
      setErrorMessage("");
      await ratePropertyByBooking(bookingId,{
        rating: rating,
        comment: comment || null,
      })
      setIsSuccessSubmitted(true);
    } catch (error) {
      console.error("Error submitting rating:", error);
      setErrorMessage("Error submitting rating. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setRating(0);
    setHoverRating(0);
    setComment("");
    setIsSuccessSubmitted(false);
    setErrorMessage("");
    onClose();
  };

  // 2. RENDERIZADO CON LAS NUEVAS CLASES DEL CSS PERSONALIZADO
  return (
    <div className="rate-modal-overlay">
      <div className="rate-modal-container">
        
        <button onClick={handleClose} disabled={isSubmitting} className="rate-modal-close">
          ✕
        </button>

        {!isSuccessSubmitted ? (
          <>
            <div className="rate-modal-header">
              <h2 className="rate-modal-title">Tell other guests how it went</h2>
              {listingTitle && (
                <p className="rate-modal-subtitle">
                  Rate your stay at <span style={{ fontWeight: 600, color: '#374151' }}>{listingTitle}</span>
                </p>
              )}
            </div>

            {errorMessage && (
              <div className="rate-modal-error">
                <p>{errorMessage}</p>
              </div>
            )}

            <div className="rate-stars-section">
              <div className="rate-stars-row">
                {[1, 2, 3, 4, 5].map((star) => {
                  const labels = ["Terrible", "Bad", "Okay", "Good", "Great"];
                  const isActive = star <= (hoverRating || rating);
                  
                  return (
                    <div key={star} className="rate-star-item">
                      <button
                        type="button"
                        onClick={() => handleStarClick(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        disabled={isSubmitting}
                        className="rate-star-button"
                        style={{ color: isActive ? "#fbbf24" : "#e5e7eb" }}
                      >
                        ★
                      </button>
                      <span style={{ color: isActive ? "#1f2937" : "#9ca3af" }} className="rate-star-text">
                        {labels[star - 1]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <p className="rate-modal-info-text">
              Since you just finished your stay, your feedback is valuable for other guests who want to know what to expect.
            </p>

            <div className="rate-modal-divider" />

            <div className="rate-comment-section">
              <div className="rate-comment-labels">
                <label className="rate-comment-label">Write a Review</label>
                <span className="rate-comment-badge">Optional</span>
              </div>
              <textarea
                className="rate-comment-textarea"
                rows={2}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Describe your experience, cleanliness, location, or host attention..."
                maxLength={300}
                disabled={isSubmitting}
              />
              <p className="rate-comment-counter">{comment.length} / 300 characters</p>
            </div>

            <div className="rate-modal-footer">
              <button type="button" className="rate-btn-cancel" onClick={handleClose} disabled={isSubmitting}>
                Cancel
              </button>
              <button
                type="button"
                className="rate-btn-submit"
                style={{ 
                  backgroundColor: isSubmitting || rating === 0 ? "#d1d5db" : "#5c54e5",
                  cursor: isSubmitting || rating === 0 ? "not-allowed" : "pointer"
                }}
                onClick={handleSubmit}
                disabled={isSubmitting || rating === 0}
              >
                {isSubmitting ? "Submitting..." : "Submit Review"}
              </button>
            </div>
          </>
        ) : (
          <div className="rate-success-screen">
            <div className="rate-success-star">★</div>
            <div>
              <h3 className="rate-success-title">Review Submitted!</h3>
              <p className="rate-modal-subtitle" style={{ maxWidth: '20rem', margin: '0 auto' }}>
                Thank you for sharing your experience. Your rating helps the ColombianStay community grow stronger.
              </p>
            </div>
            <button onClick={handleClose} className="rate-success-btn-close">
              Close Window
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RateStayModal;