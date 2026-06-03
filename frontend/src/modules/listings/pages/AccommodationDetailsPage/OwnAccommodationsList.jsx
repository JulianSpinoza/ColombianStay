import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
// 1. IMPORTAMOS EL ARCHIVO CSS LIMPIO
import "./OwnAccommodationsList.css";

export default function OwnAccommodationsList() {
  const navigate = useNavigate();

  // Datos de prueba locales
  const [accommodations] = useState([
    {
      id: 1,
      title: "Apartamento de 3 habitaciones",
      municipality: { name: "Cundinamarca" },
      main_image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=600&q=80"
    },
    {
      id: 2,
      title: "Cabaña Campestre Confortable",
      municipality: { name: "Antioquia" },
      main_image: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=600&q=80"
    },
    {
      id: 3,
      title: "Finca de descanso con piscina",
      municipality: { name: "Melgar" },
      main_image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=600&q=80"
    },
    {
      id: 4,
      title: "Estudio moderno zona norte",
      municipality: { name: "Bogotá D.C." },
      main_image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=600&q=80"
    }
  ]);

  // Control de paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = accommodations.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(accommodations.length / itemsPerPage);

  return (
    <div className="accommodations-page-wrapper">
      <div className="accommodations-container">
        
        {/* Cabecera del módulo */}
        <div className="accommodations-header">
          <h2 className="accommodations-title">Mis Alojamientos</h2>
          <p className="accommodations-subtitle">
            Lista resumida de las propiedades registradas bajo tu perfil de anfitrión.
          </p>
        </div>

        {/* GRILLA DE TARJETAS */}
        <div className="accommodations-grid">
          {currentItems.map((item) => (
            <div key={item.id} className="accommodation-card">
              <div>
                {/* 1. Imagen principal */}
                <div className="accommodation-card-image-wrapper">
                  <img 
                    src={item.main_image} 
                    alt={item.title}
                    className="accommodation-card-image"
                  />
                </div>

                <div className="accommodation-card-body">
                  {/* 2. Término de ubicación */}
                  <span className="accommodation-card-badge">
                    📍 {item.municipality?.name}
                  </span>
                  
                  {/* 3. Nombre del alojamiento */}
                  <h3 className="accommodation-card-title">
                    {item.title}
                  </h3>
                </div>
              </div>

              {/* Botón de Gestión */}
              <div className="accommodation-card-footer">
                <button
                  type="button"
                  onClick={() => navigate(`/user/my-accommodation/${item.id}`)}
                  className="accommodation-card-button"
                >
                  Gestionar Alojamiento
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* CONTROLES DE PAGINACIÓN */}
        {totalPages > 1 && (
          <div className="pagination-wrapper">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
              className="pagination-btn-arrow"
            >
              Anterior
            </button>
            
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index + 1}
                type="button"
                onClick={() => setCurrentPage(index + 1)}
                className={`pagination-btn-number ${
                  currentPage === index + 1 ? "active" : "inactive"
                }`}
              >
                {index + 1}
              </button>
            ))}

            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
              className="pagination-btn-arrow"
            >
              Siguiente
            </button>
          </div>
        )}

      </div>
    </div>
  );
}