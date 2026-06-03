import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

// Redirección de importaciones calculada a 3 niveles de profundidad (../../../)
import { getPropertyDetails, updatePropertyDetails } from "../../../services/listingsService.js";

export default function OwnAccommodationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Estados del componente para control dual (Formulario vs Preview)
  const [originalData, setOriginalData] = useState(null);
  const [editableData, setEditableData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 1. Petición inicial al Backend corriendo en tu Docker
  useEffect(() => {
    const fetchAccommodation = async () => {
      try {
        const data = await getPropertyDetails(id);
        setOriginalData(data);
        setEditableData(data);
      } catch (err) {
        setError("Error al cargar la información del alojamiento técnico.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAccommodation();
  }, [id]);

  // Evaluar si existen modificaciones locales comparando el estado original y el editable
  const hasUnsavedChanges = JSON.stringify(originalData) !== JSON.stringify(editableData);

  // 2. CRITERIO DE TERMINACIÓN: Interceptar recargas o cierres de pestañas en el navegador
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "Tienes modificaciones pendientes por guardar.";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);

  // Interceptar clics en el menú lateral si hay modificaciones activas
  const handleMenuExitWarning = (targetRoute) => {
    if (hasUnsavedChanges) {
      const confirmLeave = window.confirm("¡Atención! Perderás los cambios realizados si sales del editor. ¿Deseas continuar?");
      if (!confirmLeave) return;
    }
    navigate(targetRoute);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditableData((prev) => ({
      ...prev,
      [name]: name === "pricepernight" || name === "bedrooms" || name === "bathrooms" || name === "maxguests" 
        ? Number(value) 
        : value,
    }));
  };

  // 3. Guardado con validación estricta de negocio mapeando serializers.py y models.py
  const handleSaveChanges = async () => {
    if (editableData.title.length > 50) {
      alert("Error: El título excede el límite máximo de 50 caracteres del sistema.");
      return;
    }
    if (editableData.bedrooms < 1 || editableData.bathrooms < 1) {
      alert("Error: Las habitaciones y baños no pueden ser inferiores a 1.");
      return;
    }
    if (editableData.pricepernight < 0) {
      alert("Error: El precio no puede ser un valor negativo.");
      return;
    }

    try {
      await updatePropertyDetails(id, editableData);
      setOriginalData(editableData); // Sincronizamos estados tras el éxito en la DB
      setIsEditing(false);
      alert("Alojamiento actualizado y sincronizado correctamente.");
    } catch (err) {
      alert("Error de red o restricción del servidor al procesar la actualización.");
    }
  };

  const handleCancelEdition = () => {
    setEditableData(originalData); // Revertimos cambios locales de la vista previa
    setIsEditing(false);
  };

  if (loading) return <div className="p-8 text-center text-[#003366] font-bold">Cargando la infraestructura del alojamiento...</div>;
  if (error) return <div className="p-8 text-center text-red-600 font-semibold">{error}</div>;

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white grid grid-cols-1 lg:grid-cols-2 gap-8 font-sans">
      
      {/* SECCIÓN IZQUIERDA: FORMULARIO CONTROLADO */}
      <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-[#003366]">Gestión de Datos del Propietario</h2>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="bg-[#003366] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-opacity-90 transition-all"
            >
              Habilitar Edición
            </button>
          )}
        </div>

        <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Título del Anuncio</label>
            <input
              type="text"
              name="title"
              value={editableData.title}
              onChange={handleInputChange}
              disabled={!isEditing}
              maxLength={50} // Asegura compatibilidad con max_length=50 del backend
              className="w-full p-2.5 border rounded-lg bg-white disabled:bg-gray-100"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Descripción General</label>
            <textarea
              name="description"
              value={editableData.description}
              onChange={handleInputChange}
              disabled={!isEditing}
              rows="4"
              className="w-full p-2.5 border rounded-lg bg-white disabled:bg-gray-100"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Habitaciones</label>
              <input
                type="number"
                name="bedrooms"
                value={editableData.bedrooms}
                onChange={handleInputChange}
                disabled={!isEditing}
                min={1}
                className="w-full p-2.5 border rounded-lg bg-white disabled:bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Baños</label>
              <input
                type="number"
                name="bathrooms"
                value={editableData.bathrooms}
                onChange={handleInputChange}
                disabled={!isEditing}
                min={1}
                className="w-full p-2.5 border rounded-lg bg-white disabled:bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Límite Huéspedes</label>
              <input
                type="number"
                name="maxguests"
                value={editableData.maxguests}
                onChange={handleInputChange}
                disabled={!isEditing}
                min={1}
                className="w-full p-2.5 border rounded-lg bg-white disabled:bg-gray-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Precio por Noche (COP)</label>
            <input
              type="number"
              name="pricepernight"
              value={editableData.pricepernight}
              onChange={handleInputChange}
              disabled={!isEditing}
              min={0}
              className="w-full p-2.5 border rounded-lg bg-white disabled:bg-gray-100"
            />
          </div>

          {/* CRITERIO DE TERMINACIÓN: Geolocalización bloqueada por regla de negocio */}
          <div className="p-4 bg-gray-100 rounded-lg border border-gray-200 mt-4">
            <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Geolocalización Asignada (Inmutable)</label>
            <input
              type="text"
              value={editableData.municipality?.name || "Municipio Inalterable"}
              disabled={true}
              className="w-full p-2.5 border rounded-md bg-gray-200 text-gray-400 cursor-not-allowed text-sm"
            />
            <p className="text-[10px] text-gray-400 italic mt-1">
              * Cambios de geolocalización restringidos debido a políticas de consistencia de la base de datos local.
            </p>
          </div>

          {isEditing && (
            <div className="flex space-x-4 pt-2">
              <button
                type="button"
                onClick={handleSaveChanges}
                className="flex-1 bg-green-600 text-white p-2.5 rounded-lg font-bold hover:bg-green-700 text-sm transition-all"
              >
                Confirmar y Guardar
              </button>
              <button
                type="button"
                onClick={handleCancelEdition}
                className="flex-1 bg-gray-400 text-white p-2.5 rounded-lg font-bold hover:bg-gray-500 text-sm transition-all"
              >
                Descartar Cambios
              </button>
            </div>
          )}
        </form>
      </div>

      {/* SECCIÓN DERECHA: PANORÁMICA DE VISTA PREVIA COMPLETA (PREVIEW LIVE) */}
      <div className="border-2 border-dashed border-gray-300 p-6 rounded-xl flex flex-col justify-between bg-white">
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-md font-bold text-gray-700">Vista Previa Dinámica</h3>
            {hasUnsavedChanges && (
              <span className="bg-amber-100 text-amber-800 text-[10px] px-2.5 py-1 rounded-full font-bold animate-pulse">
                Modificaciones sin aplicar en Base de Datos
              </span>
            )}
          </div>

          <div className="space-y-4">
            <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400 text-xs font-medium">
              [ Galería de fotos procesadas por la librería Pillow ]
            </div>

            <h2 className="text-2xl font-black text-gray-900 break-words">
              {editableData.title || "Inserte un título"}
            </h2>

            <div className="flex space-x-3 text-xs font-bold text-gray-600 bg-gray-100 p-2 rounded-lg w-fit">
              <span>🛏️ {editableData.bedrooms} Hab.</span>
              <span>🚿 {editableData.bathrooms} Baños</span>
              <span>👥 Máx: {editableData.maxguests}</span>
            </div>

            <p className="text-gray-600 text-sm whitespace-pre-line break-words leading-relaxed">
              {editableData.description || "Sin descripción asignada por el momento."}
            </p>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-4 mt-6">
          <span className="text-[10px] font-bold text-gray-400 uppercase block">Valor por noche asignado</span>
          <span className="text-2xl font-extrabold text-[#003366]">
            ${editableData.pricepernight ? editableData.pricepernight.toLocaleString('es-CO') : "0"} COP
          </span>
        </div>
      </div>

    </div>
  );
}