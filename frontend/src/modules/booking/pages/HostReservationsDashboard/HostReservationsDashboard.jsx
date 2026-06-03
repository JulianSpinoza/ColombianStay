import { useEffect, useMemo, useState } from "react";
import ReservationCard from "../../components/ReservationCard/ReservationCard.jsx";
import CancelReservationModal from "../../components/CancelReservationModal/CancelReservationModal.jsx";
import "./HostReservationsDashboard.css";
import useReservations from "../../hooks/useReservations.js";
import useCancelReservation from "../../hooks/useCancelReservation.js";

export default function HostReservationsDashboard() {
  const { 
    reservations, 
    loading, 
    error, 
    setError,
    fetchReservations,
  } = useReservations("host");

  const {
    cancelReservation,
    cancelLoading,
    cancelError,
  } = useCancelReservation("host");

  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedReservationId, setSelectedReservationId] = useState(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const normalizedSearchTerm = searchTerm.trim().toLowerCase();

    if(activeFilter === "all"){
      fetchReservations({
        search_term: normalizedSearchTerm,
      })
    } else {
      fetchReservations({
        search_term: normalizedSearchTerm,
        actual_status: activeFilter,
      })
    }
  }, [searchTerm, activeFilter]);

  const selectedReservation = reservations.find(r => r.id === selectedReservationId);

  const handleCancelReservation = async (reservationId, cancellationReason) => {
    if (!reservationId) return setError("No se pudo identificar la reserva.");
    if (!cancellationReason || cancellationReason.trim().length < 5) return setError("Debes ingresar un motivo válido.");

    setIsCancelling(true);
    setError(null);
    setSuccessMessage("");

    cancelReservation(reservationId,cancellationReason)

    setIsCancelModalOpen(false);
    setSelectedReservationId(null);
  };

  const handleOpenCancelModal = reservationId => {
    if(!reservationId) return setError("No se pudo identificar la reserva.");
    setSelectedReservationId(reservationId);
    setIsCancelModalOpen(true);
    setError(null);
    setSuccessMessage("");
  };

  const handleCloseCancelModal = () => {
    if(isCancelling) return;
    setIsCancelModalOpen(false);
    setSelectedReservationId(null);
  };

  return (
    <div className="host-reservations-page">
      <div className="host-reservations-container">

        {/* Subtítulo opcional */}
        <p className="host-reservations-subtitle">
          Aquí aparecen tus reservas activas y las canceladas recientemente.
        </p>

        {successMessage && (
          <section className="host-reservations-success-message">
            <span>{successMessage}</span>
          </section>
        )}

        {error && (
          <section className="host-reservations-error-message">
            <p>{error}</p>
          </section>
        )}

        {/* Filtros y búsqueda */}
        <div className="host-reservations-filters">
          <input
            type="text"
            placeholder="Buscar propiedad o huésped..."
            className="host-reservations-search-input"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <div className="host-reservations-filter-buttons">
            {[
              { key:"all", label:"Todas"},
              { key:"ACTIVE", label:"Activas"},
              { key:"CANCELLED", label:"Canceladas recientes"}
            ].map(f => (
              <button
                key={f.key}
                className={`host-reservations-filter-button ${activeFilter===f.key?"active":""}`}
                onClick={() => setActiveFilter(f.key)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Lista de reservas */}
        <div className="host-reservations-list">
          {loading ? (
            <p>Cargando reservas...</p>
          ) : reservations.length>0 ? (
            reservations.map(reservation => (
              <ReservationCard
                key={reservation.id}
                reservation={reservation}
                showGuestInfo={true}
                isHost={true}
                onCancel={handleOpenCancelModal}
              />
            ))
          ) : (
            <p>No hay reservas para mostrar</p>
          )}
        </div>
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
}