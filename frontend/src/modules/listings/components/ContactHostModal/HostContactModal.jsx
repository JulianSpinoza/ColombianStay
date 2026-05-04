import React, { useState } from "react";
import "./HostContactModal.css";

const HostContactModal = ({
  isOpen,
  onClose,
  hostName,
  email,
  avatarUrl
}) => {

  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const initial = hostName?.charAt(0).toUpperCase();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);

    } catch (error) {
      console.error("No se pudo copiar", error);
    }
  };

  return (
    <div className="host-contact-backdrop">
      <div className="host-contact-modal">

        <button
          className="host-contact-close-button"
          onClick={onClose}
        >
          ✕
        </button>

        <div className="host-contact-avatar-container">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={hostName}
              className="host-contact-avatar-image"
            />
          ) : (
            <div className="host-contact-avatar-fallback">
              {initial}
            </div>
          )}
        </div>

        <h2 className="host-contact-name">
          {hostName}
        </h2>

        <div className="host-contact-email-box">
          <div className="host-contact-email-label">
            Email
          </div>

          <div className="host-contact-email-value">
            {email}
          </div>

          <button
            className="host-contact-copy-button"
            onClick={handleCopy}
          >
            📋
          </button>
        </div>

        {copied && (
          <span className="host-contact-copied-msg">
            Copiado al portapapeles
          </span>
        )}

      </div>
    </div>
  );
};

export default HostContactModal;