import { useState, useEffect } from "react";
import ReservationCard from "../../../listings/components/ReservationCard/ReservationCard.jsx";
import CancelReservationModal from "../../../listings/components/CancelReservationModal/CancelReservationModal.jsx";
import { BOOKINGS_ENDPOINTS } from "../../../../services/api/endpoints.js";

import "./UserReservationsDashboard.css";
import httpClient from "../../../../services/api/httpClient.js";

/**
 * UserReservationsDashboard
 * User Story: 'Como usuario, quiero ver mis reservas y poder cancelarlas'
 * 
 * Features:
 * - Muestra lista de reservas del usuario actual
 * - Información de cada propiedad (título, localización, foto)
 * - Filtros: Próximas, Pasadas, Canceladas
 * - Búsqueda por nombre de propiedad
 * - Lógica de cancelación con modal de confirmación
 * - Actualización optimista de UI
 * - Acceso a detalles de la propiedad
 */
const UserReservationsDashboard = () => {
  const [reservations, setReservations] = useState([]);
  const [filteredReservations, setFilteredReservations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all"); // all, upcoming, past, cancelled
  const [selectedReservationId, setSelectedReservationId] = useState(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Mock data - En producción, obtener del backend
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

  // Cargar reservas desde el API
  useEffect(() => {
    const fetchReservations = async () => {
      setIsLoading(true);
      setError("");
      try {

        const res = await httpClient.get(BOOKINGS_ENDPOINTS.USER_RESERVATIONS);
        const formatted = res.data.map((booking) => ({
          id: booking.bookingid,
          property: {
            id: booking.listing_id,
            title: booking.listing_title,
            location: booking.listing_location,
            image: booking.listing_image,
          },
          start_date: booking.check_in_date,
          end_date: booking.check_out_date,
          status: booking.status,
          total_price: booking.total_price,
          created_at: booking.created_at,
        }));

        setReservations(formatted);
      } catch (err) {
        console.error(err);
        setError("Error al cargar tus reservas");
        setReservations([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReservations();
  }, []);

  // Aplicar filtros y búsqueda
  useEffect(() => {
    let filtered = reservations;

    // Filtro por búsqueda
    if (searchTerm) {
      filtered = filtered.filter((res) =>
        res.property.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por estado
    const today = new Date();
    if (activeFilter === "upcoming") {
      filtered = filtered.filter(
        (res) =>
          new Date(res.start_date) > today && res.status === "confirmed"
      );
    } else if (activeFilter === "past") {
      filtered = filtered.filter(
        (res) =>
          new Date(res.end_date) < today && res.status !== "cancelled"
      );
    } else if (activeFilter === "cancelled") {
      filtered = filtered.filter((res) => res.status === "cancelled");
    }

    setFilteredReservations(filtered);
  }, [searchTerm, activeFilter, reservations]);

  // Manejar cancelación
  const handleCancelReservation = async (reservationId) => {
    setIsCancelling(true);
    try {
      // Actualizar optimistamente en la UI
      setReservations((prev) =>
        prev.map((res) =>
          res.id === reservationId ? { ...res, status: "cancelled" } : res
        )
      );

      setIsCancelModalOpen(false);
      setSuccessMessage("Tu reserva ha sido cancelada");

      // En producción: llamar al API para cancelar
      try {
        
        await httpClient.patch(BOOKINGS_ENDPOINTS.CANCEL(reservationId), { status: 'cancelled' });
        
      } catch (apiErr) {
        console.error('API cancel error', apiErr);
        setError('Error al cancelar la reserva en el servidor');
        
      }

      // Limpiar mensaje de éxito después de 3 segundos
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setError("Error al cancelar la reserva");
      console.error(err);
      // Revertir cambio optimista en caso de error
      setReservations(mockReservations);
    } finally {
      setIsCancelling(false);
    }
  };

  // Abrir modal de confirmación
  const handleOpenCancelModal = (reservationId) => {
    setSelectedReservationId(reservationId);
    setIsCancelModalOpen(true);
  };

  const selectedReservation = reservations.find(
    (res) => res.id === selectedReservationId
  );

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

        {/* Error */}
        {error && (
          <div className="error-message">
            <p>{error}</p>
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

        {/* Lista de reservas */}
        {isLoading ? (
          <div className="loader-container">
            <div className="loader" />
          </div>
        ) : filteredReservations.length > 0 ? (
          <div className="reservations">
            <p className="counter">
              {filteredReservations.length}{" "}
              {filteredReservations.length === 1 ? "reserva" : "reservas"}
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
        reservationId={selectedReservationId}
        propertyTitle={selectedReservation?.property?.title || ""}
        onConfirm={handleCancelReservation}
        onCancel={() => setIsCancelModalOpen(false)}
        isLoading={isCancelling}
      />
    </div>
  );
};

export default UserReservationsDashboard;
