import { useMemo, useState } from "react";
import ReservationCard from "../../components/ReservationCard/ReservationCard.jsx";
import CancelReservationModal from "../../components/CancelReservationModal/CancelReservationModal.jsx";
import { BOOKINGS_ENDPOINTS } from "../../../../services/api/endpoints.js";
import "./HostReservationsDashboard.css";
import httpClient from "../../../../services/api/httpClient.js";
import useReservations from "../../hooks/useReservations.js";

const RECENT_CANCELLED_DAYS = 30;

export default function HostReservationsDashboard() {
  const { reservations, setReservations, loading, error, setError } = useReservations("host");

  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedReservationId, setSelectedReservationId] = useState(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const isRecentlyCancelled = (reservation) => {
    if (reservation.status !== "cancelled") return false;
    const referenceDate = reservation.updated_at || reservation.created_at;
    if (!referenceDate) return true;
    const cancelledDate = new Date(referenceDate);
    const today = new Date();
    return (today - cancelledDate) / (1000*60*60*24) <= RECENT_CANCELLED_DAYS;
  };

  const panelReservations = useMemo(() => {
    const activeStatuses = ["pending","confirmed","active"];
    return reservations.filter(r => activeStatuses.includes(r.status) || isRecentlyCancelled(r));
  }, [reservations]);

  const filteredReservations = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    return panelReservations.filter(reservation => {
      const propertyTitle = reservation.property?.title?.toLowerCase() || "";
      const location = reservation.property?.location?.toLowerCase() || "";
      const matchesSearch = !normalizedSearch || propertyTitle.includes(normalizedSearch) || location.includes(normalizedSearch);

      const status = reservation.status || "pending";
      const matchesFilter = activeFilter === "all"
        || (activeFilter === "active" && ["pending","confirmed","active"].includes(status))
        || (activeFilter === "cancelled" && status === "cancelled");

      return matchesSearch && matchesFilter;
    });
  }, [panelReservations, searchTerm, activeFilter]);

  const selectedReservation = reservations.find(r => r.id === selectedReservationId);

  const handleCancelReservation = async (reservationId, cancellationReason) => {
    if (!reservationId) return setError("No se pudo identificar la reserva.");
    if (!cancellationReason || cancellationReason.trim().length < 5) return setError("Debes ingresar un motivo válido.");

    setIsCancelling(true);
    setError(null);
    setSuccessMessage("");

    try {
      const response = await httpClient.patch(BOOKINGS_ENDPOINTS.CANCEL(reservationId), {
        status: "cancelled",
        cancellation_reason: cancellationReason.trim()
      });

      setReservations(prev => prev.map(r => r.id === reservationId ? {...r, status: response.data.status, updated_at: new Date().toISOString()} : r));
      setIsCancelModalOpen(false);
      setSelectedReservationId(null);
      setSuccessMessage(response.data.message);
    } catch(err) {
      console.error(err);
      let message = "Error al cancelar la reserva.";
      if(err?.response?.data){
        const data = err.response.data;
        if(data?.cancellation_reason?.[0]) message = data.cancellation_reason[0];
        else if(data?.detail) message = data.detail;
        else if(data?.message) message = data.message;
      }
      setError(message);
    } finally {
      setIsCancelling(false);
    }
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
              { key:"active", label:"Activas"},
              { key:"cancelled", label:"Canceladas recientes"}
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
          ) : filteredReservations.length>0 ? (
            filteredReservations.map(reservation => (
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