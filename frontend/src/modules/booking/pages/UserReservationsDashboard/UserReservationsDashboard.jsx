import { useState } from "react";
import ReservationCard from "../../components/ReservationCard/ReservationCard.jsx";
import CancelReservationModal from "../../components/CancelReservationModal/CancelReservationModal.jsx";
import { BOOKINGS_ENDPOINTS } from "../../../../services/api/endpoints.js";

import "./UserReservationsDashboard.css";
import httpClient from "../../../../services/api/httpClient.js";
import useReservations from "../../hooks/useReservations.js";

const UserReservationsDashboard = () => {
  const {
    reservations,
    setReservations,
    loading,
    error,
    setError,
    fetchReservations,
  } = useReservations("guest");

  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedReservationId, setSelectedReservationId] = useState(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleSearch = () => {
    const query = {};

    if (searchTerm.trim()) {
      query.nameOfProperty = searchTerm.trim();
    }

    if (activeFilter) {
      query.perspectiveStatus = activeFilter;
    }

    fetchReservations(query);
  };

  const handleCancelReservation = async (
    reservationId,
    cancellationReason
  ) => {
    if (!reservationId) {
      setError("No se pudo identificar la reserva seleccionada.");
      return;
    }

    if (!cancellationReason || cancellationReason.trim().length < 5) {
      setError("Debes ingresar un motivo de cancelación válido.");
      return;
    }

    setIsCancelling(true);
    setError(null);
    setSuccessMessage("");

    try {
      await httpClient.patch(BOOKINGS_ENDPOINTS.CANCEL(reservationId), {
        status: "cancelled",
        cancellation_reason: cancellationReason.trim(),
      });

      setReservations((prevReservations) =>
        prevReservations.filter(
          (reservation) => reservation.id !== reservationId
        )
      );

      setIsCancelModalOpen(false);
      setSelectedReservationId(null);
      setSuccessMessage("Tu reserva ha sido cancelada correctamente.");

      setTimeout(() => {
        setSuccessMessage("");
      }, 3500);
    } catch (apiErr) {
      console.error("API cancel error", apiErr);

      const backendReasonError =
        apiErr?.response?.data?.cancellation_reason?.[0];

      setError(
        backendReasonError || "Error al cancelar la reserva en el servidor."
      );
    } finally {
      setIsCancelling(false);
    }
  };

  const handleOpenCancelModal = (reservationId) => {
    console.log("ID recibido desde ReservationCard:", reservationId);

    if (!reservationId) {
      setError("No se pudo identificar la reserva seleccionada.");
      return;
    }

    setError(null);
    setSuccessMessage("");
    setSelectedReservationId(reservationId);
    setIsCancelModalOpen(true);
  };

  const handleCloseCancelModal = () => {
    if (isCancelling) return;

    setIsCancelModalOpen(false);
    setSelectedReservationId(null);
  };

  const selectedReservation = reservations.find(
    (reservation) => reservation.id === selectedReservationId
  );

  return (
    <div className="page">
      <div className="container">
        <div className="header">
          <h1 className="title">Mis Reservas</h1>
        </div>

        <div className="info-card">
          <svg className="info-icon" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zm-11-1a1 1 0 11-2 0 1 1 0 012 0z"
              clipRule="evenodd"
            />
          </svg>

          <p className="info-text">
            <strong>Tip:</strong> Puedes cancelar una reserva hasta 7 días antes
            de la fecha de llegada sin penalización.
          </p>
        </div>

        {successMessage && (
          <div className="success-message">
            <svg
              className="success-icon"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>

            <span>{successMessage}</span>
          </div>
        )}

        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}

        <div className="filters">
          <div className="search">
            <svg
              className="search-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>

            <input
              type="text"
              placeholder="Buscar una propiedad..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  handleSearch();
                }
              }}
              className="search-input"
            />
          </div>

          <div className="filter-buttons">
            {[
              { key: "all", label: "Todas", icon: "📋" },
              { key: "upcoming", label: "Próximas", icon: "📅" },
              { key: "past", label: "Pasadas", icon: "✅" },
              { key: "cancelled", label: "Canceladas", icon: "❌" },
            ].map((filter) => (
              <button
                key={filter.key}
                type="button"
                onClick={() => {
                  setActiveFilter(filter.key);

                  fetchReservations({
                    perspectiveStatus: filter.key,
                    ...(searchTerm.trim()
                      ? { nameOfProperty: searchTerm.trim() }
                      : {}),
                  });
                }}
                className={`filter-button ${
                  activeFilter === filter.key ? "active" : ""
                }`}
              >
                {filter.icon} {filter.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="loader-container">
            <div className="loader" />
          </div>
        ) : reservations.length > 0 ? (
          <div className="reservations">
            <p className="counter">
              {reservations.length}{" "}
              {reservations.length === 1 ? "reserva" : "reservas"}
            </p>

            {reservations.map((reservation) => (
              <ReservationCard
                key={reservation.id}
                reservation={reservation}
                showGuestInfo={false}
                isHost={false}
                onCancel={handleOpenCancelModal}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h3>No hay reservas</h3>

            <p>
              {searchTerm
                ? "No hay reservas que coincidan con tu búsqueda"
                : "Aún no has hecho ninguna reserva"}
            </p>

            <a href="/" className="primary-button">
              Explorar propiedades
            </a>
          </div>
        )}
      </div>

      <CancelReservationModal
        isOpen={isCancelModalOpen}
        reservationId={selectedReservation?.id || selectedReservationId}
        propertyTitle={selectedReservation?.property?.title || ""}
        location={selectedReservation?.property?.location || ""}
        startDate={selectedReservation?.start_date || ""}
        endDate={selectedReservation?.end_date || ""}
        onConfirm={handleCancelReservation}
        onCancel={handleCloseCancelModal}
        isLoading={isCancelling}
      />
    </div>
  );
};

export default UserReservationsDashboard;