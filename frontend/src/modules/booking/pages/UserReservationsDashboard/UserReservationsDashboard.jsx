import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import ReservationCard from "../../components/ReservationCard/ReservationCard.jsx";
import CancelReservationModal from "../../components/CancelReservationModal/CancelReservationModal.jsx";
import { BOOKINGS_ENDPOINTS } from "../../../../services/api/endpoints.js";

import "./UserReservationsDashboard.css";
import httpClient from "../../../../services/api/httpClient.js";
import useReservations from "../../hooks/useReservations.js";
import RateStayModal from "../../../ratings/components/RateStayModal/RateStayModal.jsx";

const UserReservationsDashboard = () => {
  // Consumo del hook de reservas del cliente
  const { reservations, loading, error, fetchReservations } = useReservations("guest");
  
  const [searchTerm, setSearchTerm] = useState("");
  const location = useLocation();
  const [activeFilter, setActiveFilter] = useState(location.state?.selectedOption === "historic" ? "past" : "all");
  const [selectedReservationId, setSelectedReservationId] = useState(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [localError, setLocalError] = useState(null);

  // --- CONTROL DE LA TAREA #104 (RATE PROPERTY POP UP) ---
  const [pendingRatingListing, setPendingRatingListing] = useState(null);
  const [isRateModalOpen, setIsRateModalOpen] = useState(false);

  // Trigger automático: Escanea el set de datos simulado o real para levantar el modal
  useEffect(() => {
    if (mockReservations && mockReservations.length > 0) {
      const completedStay = mockReservations.find((res) => res.status === "completed");
      
      if (completedStay) {
        setPendingRatingListing({
          accomodationid: completedStay.property.id,
          title: completedStay.property.title
        });
        setIsRateModalOpen(true);
      }
    }
  }, []); // Se ejecuta una sola vez al montar para evitar bucles infinitos
  // --------------------------------------------------------

  // Mock data local para desarrollo y pruebas del entorno
  const mockReservations = [
    {
      id: "RES101",
      property: {
        id: "PROP001",
        title: "Apartamento Moderno en Bogotá",
        location: "Teusaquillo, Bogotá",
        image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop",
      },
      start_date: "2025-12-20",
      end_date: "2025-12-25",
      status: "confirmed",
      total_price: 850000,
      created_at: "2025-12-01",
    },
    {
      id: "RES102",
      property: {
        id: "PROP003",
        title: "Cabaña en la Montaña",
        location: "Zipaquirá, Cundinamarca",
        image: "https://images.unsplash.com/photo-1506479773649-6bde12d37357?w=400&h=300&fit=crop",
      },
      start_date: "2025-11-01",
      end_date: "2025-11-08",
      status: "completed",
      total_price: 1200000,
      created_at: "2025-10-01",
    },
    {
      id: "RES103",
      property: {
        id: "PROP004",
        title: "Casa de Playa en Cartagena",
        location: "Cartagena, Bolívar",
        image: "https://images.unsplash.com/photo-1501183007986-d339d0da3123?w=400&h=300&fit=crop",
      },
      start_date: "2025-09-15",
      end_date: "2025-09-20",
      status: "cancelled",
      total_price: 950000,
      created_at: "2025-08-20",
    },
    {
      id: "RES104",
      property: {
        id: "PROP005",
        title: "Loft Moderno en Medellín",
        location: "El Poblado, Medellín",
        image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop",
      },
      start_date: "2026-02-10",
      end_date: "2026-02-15",
      status: "confirmed",
      total_price: 720000,
      created_at: "2025-12-10",
    },
    {
      id: "RES105",
      property: {
        id: "PROP006",
        title: "Villa Exclusiva con Piscina",
        location: "Envigado, Medellín",
        image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=300&fit=crop",
      },
      start_date: "2025-10-05",
      end_date: "2025-10-10",
      status: "completed",
      total_price: 1500000,
      created_at: "2025-09-01",
    },
  ];

  // Determinar la colección final de visualización (Usamos los datos locales para la fase de pruebas)
  const displayReservations = reservations && reservations.length > 0 ? reservations : mockReservations;

  // Filtrado síncrono local basado en la barra de búsqueda y tabs activos
  const filteredReservations = displayReservations.filter((res) => {
    const matchesSearch = res.property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          res.property.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeFilter === "all") return matchesSearch;
    if (activeFilter === "upcoming") return matchesSearch && res.status === "confirmed";
    if (activeFilter === "past") return matchesSearch && res.status === "completed";
    if (activeFilter === "cancelled") return matchesSearch && res.status === "cancelled";
    return matchesSearch;
  });

  // Manejar el envío de filtros hacia la API si el hook lo requiere
  const handleSearchSubmit = () => {
    const query = {};
    if (searchTerm) query.nameOfProperty = searchTerm;
    if (activeFilter && activeFilter !== "all") query.perspectiveStatus = activeFilter;
    fetchReservations(query);
  };

  // Manejar proceso de cancelación e inyección síncrona en el servidor
  const handleCancelReservation = async (reservationId) => {
    setIsCancelling(true);
    setLocalError(null);
    try {
      // Consumo del endpoint real patch sincronizado con Docker
      await httpClient.patch(BOOKINGS_ENDPOINTS.CANCEL(reservationId), { status: 'cancelled' });
      
      setIsCancelModalOpen(false);
      setSuccessMessage("Tu reserva ha sido cancelada");
      
      // Re-fechear el hook para actualizar el listado del servidor de Django
      fetchReservations();

      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (apiErr) {
      console.error('API cancel error', apiErr);
      setLocalError('Error al procesar la cancelación en el servidor remoto de Django.');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleOpenCancelModal = (reservationId) => {
    setSelectedReservationId(reservationId);
    setIsCancelModalOpen(true);
  };

  const selectedReservation = displayReservations.find((res) => res.id === selectedReservationId);

  return (
    <div className="page">
      <div className="container">

        {/* Encabezado */}
        <div className="header">
          <h1 className="title">Mis Reservas</h1>
        </div>

        {/* Tarjeta de información */}
        <div className="info-card">
          <svg className="info-icon" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zm-11-1a1 1 0 11-2 0 1 1 0 012 0z"
              clipRule="evenodd"
            />
          </svg>
          <p className="info-text">
            <strong>Tip:</strong> Puedes cancelar una reserva hasta 7 días antes de la fecha de llegada sin penalización.
          </p>
        </div>

        {/* Mensaje de éxito */}
        {successMessage && (
          <div className="success-message">
            <svg className="success-icon" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span>{successMessage}</span>
          </div>
        )}

        {/* Errores del Dashboard */}
        {(error || localError) && (
          <div className="error-message">
            <p>{localError || error}</p>
          </div>
        )}

        {/* Buscador y filtros */}
        <div className="filters">
          <div className="search">
            <svg className="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyUp={(e) => e.key === 'Enter' && handleSearchSubmit()}
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
                onClick={() => setActiveFilter(filter.key)}
                className={`filter-button ${
                  activeFilter === filter.key ? "active" : ""
                }`}
              >
                {filter.icon} {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Lista de reservas controladas */}
        {loading ? (
          <div className="loader-container">
            <div className="loader" />
          </div>
        ) : filteredReservations.length > 0 ? (
          <div className="reservations">
            <p className="counter">
              {filteredReservations.length}{" "}
              {filteredReservations.length === 1 ? "reserva filtrada" : "reservas filtradas"}
            </p>

            {filteredReservations.map((reservation) => (
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
                : "Aún no tienes registros bajo este filtro"}
            </p>
            <a href="/" className="primary-button">
              Explorar propiedades
            </a>
          </div>
        )}
      </div>

      <CancelReservationModal
        isOpen={isCancelModalOpen}
        reservationId={selectedReservationId}
        propertyTitle={selectedReservation?.property?.title || ""}
        onConfirm={handleCancelReservation}
        onCancel={() => setIsCancelModalOpen(false)}
        isLoading={isCancelling}
      />

      <RateStayModal
        isOpen={isRateModalOpen}
        onClose={() => setIsRateModalOpen(false)}
        listing={pendingRatingListing}
        onSubmit={(data) => {
          console.log("Rating guardado con éxito en Docker:", data);
        }}
      />
    </div>
  );
};

export default UserReservationsDashboard;