import { useEffect, useMemo, useState } from "react";
import ReservationCard from "../../components/ReservationCard/ReservationCard.jsx";
import CancelReservationModal from "../../components/CancelReservationModal/CancelReservationModal.jsx";

import "./UserReservationsDashboard.css";
import useReservations from "../../hooks/useReservations.js";
import useCancelReservation from "../../hooks/useCancelReservation.js";
import { useSearchParams } from "react-router-dom";

const UserReservationsDashboard = () => {

  const [searchParams, setSearchParams] = useSearchParams();

  const { 
      reservations, 
      loading, 
      error, 
      setError,
    } = useReservations("guest");

  const {
      cancelReservation,
      cancelLoading,
      cancelError,
    } = useCancelReservation("guest");

  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedReservationId, setSelectedReservationId] = useState(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const normalizedSearchTerm = searchTerm.trim().toLowerCase();
    
    let filter;

      if(normalizedSearchTerm === "" && activeFilter === "all") {
        filter = {}
      } else if(normalizedSearchTerm === "" && activeFilter !== "all"){
        filter = {
          actual_status: activeFilter,
        }
      } else if(normalizedSearchTerm !== "" && activeFilter === "all"){
        filter = {
          search_term: normalizedSearchTerm,
        }
      } else {
        filter = {
          search_term: normalizedSearchTerm,
          actual_status: activeFilter,
        }
      }
    

    setSearchParams(filter);

  }, [searchTerm, activeFilter])

  const selectedReservation = reservations.find(
    (reservation) => reservation.id === selectedReservationId
  );

  const handleCancelReservation = async (reservationId, cancellationReason) => {
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

      cancelReservation(reservationId,cancellationReason);

      setIsCancelModalOpen(false);
      setSelectedReservationId(null);
    };

  const handleOpenCancelModal = (reservationId) => {
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

  return (
    <div className="guest-reservations-page">
      <div className="guest-reservations-container">
        <header className="guest-reservations-header">
          <h1 className="guest-reservations-title">Mis reservas</h1>
          <p className="guest-reservations-subtitle">
            Consulta tus reservas activas y las canceladas recientemente.
          </p>
        </header>

        <section className="guest-reservations-info-card">
          <svg
            className="guest-reservations-info-icon"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zm-11-1a1 1 0 11-2 0 1 1 0 012 0z"
              clipRule="evenodd"
            />
          </svg>

          <p className="guest-reservations-info-text">
            <strong>Panel de reservas:</strong> aquí aparecen tus reservas
            activas y las canceladas durante los últimos 30 días.
          </p>
        </section>

        {successMessage && (
          <section className="guest-reservations-success-message">
            <svg
              className="guest-reservations-success-icon"
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
          </section>
        )}

        {error && (
          <section className="guest-reservations-error-message">
            <p>{error}</p>
          </section>
        )}

        {cancelError && (
          <section className="guest-reservations-error-message">
            <p>{cancelError}</p>
          </section>
        )}

        <section className="guest-reservations-filters">
          <div className="guest-reservations-search">
            <svg
              className="guest-reservations-search-icon"
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
              placeholder="Buscar por propiedad o municipio..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="guest-reservations-search-input"
            />
          </div>

          <div className="guest-reservations-filter-buttons">
            {[
              { key: "all", label: "Todas" },
              { key: "ACTIVE", label: "Activas" },
              { key: "CANCELLED", label: "Canceladas recientes" },
            ].map((filter) => (
              <button
                key={filter.key}
                type="button"
                onClick={() => setActiveFilter(filter.key)}
                className={`guest-reservations-filter-button ${
                  activeFilter === filter.key ? "active" : ""
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </section>

        {loading ? (
          <div className="guest-reservations-loader-container">
            <div className="guest-reservations-loader" />
          </div>
        ) : reservations.length > 0 ? (
          <section className="guest-reservations-list">
            <p className="guest-reservations-counter">
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
          </section>
        ) : (
          <section className="guest-reservations-empty-state">
            <h3>No hay reservas para mostrar</h3>

            <p>
              No encontramos reservas activas o canceladas recientemente que
              coincidan con tu búsqueda.
            </p>

            <a href="/" className="guest-reservations-primary-button">
              Explorar propiedades
            </a>
          </section>
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