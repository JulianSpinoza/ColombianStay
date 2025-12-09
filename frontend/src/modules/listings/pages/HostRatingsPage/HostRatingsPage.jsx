import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import httpClient from "../../../../services/api/httpClient";
import "./HostRatingsPage.css";

const HostRatingsPage = () => {
  const navigate = useNavigate();
  // este contiene alojamiento y ratings
  const [accommodations, setAccommodations] = useState([]);
  // Sirve para controlar errores y carga
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAccommodation, setSelectedAccommodation] = useState(null);

  useEffect(() => {
    const fetchHostRatings = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Conectar con el endpoint del backend
        const response = await httpClient.get('host-ratings/');
        
        if (response.data && Array.isArray(response.data)) {
          setAccommodations(response.data);
          // Seleccionar la primera propiedad por defecto
          if (response.data.length > 0) {
            setSelectedAccommodation(response.data[0]);
          }
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Error al cargar ratings:", err);
        
        if (err.response?.status === 401) {
          setError("Debes estar autenticado para ver los ratings");
          navigate('/login');
        } else {
          setError("No se pudieron cargar los ratings. Intenta más tarde.");
        }
        setLoading(false);
      }
    };
    
    fetchHostRatings();
  }, [navigate]);

  // Mostrar la carga mientras se está obteniendo datos
  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Cargando ratings...</p>
        </div>
      </div>
    );
  }
  
  // Si hay un error entonces mostrarlo
  if (error) {
    return (
      <div className="p-8">
        <div className="max-w-md mx-auto bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-700 mb-2">Error</h3>
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="host-ratings-page min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Tus Calificaciones</h1>
          <p className="text-gray-600">
            Mira las calificaciones y reseñas de los huéspedes en tus propiedades
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/*A la izquierda estan los alojamientos */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 bg-gray-50 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Tus Propiedades</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {accommodations.length === 0 ? (
                  <div className="p-4 text-gray-500 text-center">
                    Aún no tienes propiedades
                  </div>
                ) : (
                  accommodations.map((accommodation) => (
                    <button
                      key={accommodation.listing_id}
                      onClick={() => setSelectedAccommodation(accommodation)}
                      className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
                        selectedAccommodation?.listing_id === accommodation.listing_id
                          ? "bg-blue-50 border-l-4 border-blue-600"
                          : ""
                      }`}
                    >
                      <div className="font-medium text-gray-900 text-sm">
                        {accommodation.listing_title}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        ⭐ {accommodation.average_rating?.toFixed(1)} ({accommodation.rating_count} {accommodation.rating_count === 1 ? 'reseña' : 'reseñas'})
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* En la columna derecha el detalle de calificaciones */}
          <div className="lg:col-span-2">
            {selectedAccommodation ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {selectedAccommodation.listing_title}
                  </h2>
                  <div className="flex items-center gap-4">
                    <div>
                      <div className="text-3xl font-bold text-yellow-500">
                        {selectedAccommodation.average_rating?.toFixed(1)}
                      </div>
                      <div className="text-sm text-gray-600">
                        Basado en {selectedAccommodation.rating_count} {selectedAccommodation.rating_count === 1 ? 'reseña' : 'reseñas'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Lista de ratings */}
                <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                  {selectedAccommodation.ratings && selectedAccommodation.ratings.length > 0 ? (
                    selectedAccommodation.ratings.map((rating) => (
                      <div key={rating.ratingid} className="p-4 hover:bg-gray-50 transition-colors">
                        {/* Muestra el encabezado que le hallan puesto al rating */}
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="font-medium text-gray-900">
                              {rating.guest_name || "Huésped Anónimo"}
                            </div>
                            <div className="text-sm text-gray-500">
                              {new Date(rating.created_at).toLocaleDateString('es-CO')}
                            </div>
                          </div>
                          {/* Muestra las estrellas */}
                          <div className="text-lg">
                            {"⭐".repeat(rating.rating)}
                          </div>
                        </div>
                        {/* Pa mostrar comentarios de la reseña */}
                        {rating.comment && (
                          <p className="text-gray-700 text-sm leading-relaxed">
                            {rating.comment}
                          </p>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-gray-500">
                      Aún no hay reseñas para esta propiedad
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <p className="text-gray-500">
                  Selecciona una propiedad para ver sus calificaciones y reseñas
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HostRatingsPage;
