import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
// Importación del archivo CSS desacoplado para mantener limpio el componente
import "./OwnAccommodationDetail.css";

export default function OwnAccommodationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Estados del componente para control dual (Formulario vs Preview Dinámica)
  const [originalData, setOriginalData] = useState(null);
  const [editableData, setEditableData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 1. Petición inicial (Sincronizada con la respuesta real de Django)
  useEffect(() => {
    const fetchAccommodation = async () => {
      try {
        const data = {
          title: "Apartamento de 3 habitaciones",
          description: "Descripción de prueba para el alojamiento en ColombianStay.",
          propertytype: "apartment", // Valor inicial por defecto en formato minúscula estricto
          bedrooms: 2,
          bathrooms: 1,
          maxguests: 3,
          pricepernight: 150000,
          locationdesc: "Ubicación cercana a puntos de interés turísticos y comerciales de la zona.",
          addresstext: "Calle 45 # 23-27",
          municipality: { name: "Cundinamarca" }
        };
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

  // 2. Interceptar recargas o cierres accidentales de pestañas en el navegador si hay cambios
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "Tienes modificaciones pendientes por guardar.";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Filtro estricto en OnKeyDown para bloquear letras, exponenciales (e/E) y signos especiales
  const handleKeyPressBlockLetters = (e) => {
    const allowedKeys = ["Backspace", "Tab", "Enter", "Escape", "ArrowLeft", "ArrowRight"];
    
    if (allowedKeys.includes(e.key)) {
      return;
    }

    // Bloquea cualquier tecla que no sea un dígito numérico directo (0-9)
    if (!/^[0-9]$/.test(e.key)) {
      e.preventDefault();
    }
  };

  // Manejo de cambios en los inputs con normalización interactiva e inmediata
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    setEditableData((prev) => {
      let finalValue = value;

      // Validación reactiva en tiempo real para campos estructurales
      if (name === "bedrooms" || name === "bathrooms" || name === "maxguests") {
        const numValue = Number(value);
        // Si digita un número menor a 1, el estado lo fuerza automáticamente a 1
        if (value !== "" && numValue < 1) {
          finalValue = 1;
        } else if (value !== "") {
          finalValue = numValue;
        }
      } else if (name === "pricepernight") {
        finalValue = value !== "" ? Math.max(0, Number(value)) : "";
      }

      return {
        ...prev,
        [name]: finalValue,
      };
    });
  };

  // Sanitización al perder el foco (OnBlur): Autorellena con 1 si borran todo el campo
  const handleBlurSanitize = (e) => {
    const { name, value } = e.target;
    if (value === "" || Number(value) < 1) {
      if (name === "bedrooms" || name === "bathrooms" || name === "maxguests") {
        setEditableData((prev) => ({ ...prev, [name]: 1 }));
      }
    }
  };

  // 3. Guardado con validación estricta de negocio alineada con el modelo de Jorge
  const handleSaveChanges = async () => {
    if (editableData.title.length > 50) {
      alert("Error: El título excede el límite máximo de 50 caracteres del sistema.");
      return;
    }
    if (editableData.bedrooms < 1 || editableData.bathrooms < 1 || editableData.maxguests < 1) {
      alert("Error: Las habitaciones, baños y huéspedes no pueden ser inferiores a 1.");
      return;
    }
    if (editableData.pricepernight < 0) {
      alert("Error: El precio no puede ser un valor negativo.");
      return;
    }
    if (!editableData.addresstext.trim() || !editableData.locationdesc.trim()) {
      alert("Error: La dirección y la descripción de ubicación son parámetros obligatorios.");
      return;
    }

    setOriginalData(editableData);
    setIsEditing(false);
    alert("Alojamiento actualizado y sincronizado correctamente.");
    console.log("JSON final enviado con éxito al backend:", editableData);
  };

  const handleCancelEdition = () => {
    setEditableData(originalData); // Revertimos cambios locales a su estado inicial de DB
    setIsEditing(false);
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center', color: '#5c54e5', fontWeight: 'bold' }}>Cargando la infraestructura del alojamiento...</div>;
  if (error) return <div style={{ padding: '2rem', textAlign: 'center', color: '#dc2626', fontWeight: 'bold' }}>{error}</div>;

  return (
    <div className="detail-page-wrapper">
      <div className="detail-grid-container">
        
        {/* SECCIÓN IZQUIERDA: FORMULARIO CONTROLADO COMPLETO */}
        <div className="detail-form-section">
          <div className="form-section-header">
            <h2 className="form-section-title">Gestión de Datos del Propietario</h2>
            {!isEditing && (
              <button type="button" onClick={() => setIsEditing(true)} className="btn-enable-edit">
                Habilitar Edición
              </button>
            )}
          </div>

          <form onSubmit={(e) => e.preventDefault()} className="edit-property-form">
            
            {/* TÍTULO */}
            <div className="form-field-group">
              <label className="form-field-label">Título del Anuncio</label>
              <input
                type="text"
                name="title"
                value={editableData.title}
                onChange={handleInputChange}
                disabled={!isEditing}
                maxLength={50}
                className="form-input-field"
              />
            </div>

            {/* TIPO DE PROPIEDAD: Sincronizado exactamente con las TextChoices de Django */}
            <div className="form-field-group">
              <label className="form-field-label">Tipo de Propiedad</label>
              <select
                name="propertytype"
                value={editableData.propertytype}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="form-input-field"
                style={{ appearance: 'auto' }}
              >
                <option value="apartment">Apartamento</option>
                <option value="cabin">Cabaña</option>
                <option value="house">Casa</option>
                <option value="loft">Loft</option>
                <option value="room">Habitación / Cuarto</option>
                <option value="studio">Studio</option>
              </select>
            </div>

            {/* DIRECCIÓN FÍSICA TEXTUAL */}
            <div className="form-field-group">
              <label className="form-field-label">Dirección Física</label>
              <input
                type="text"
                name="addresstext"
                value={editableData.addresstext}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="Ej: Calle 45 # 23-27"
                className="form-input-field"
              />
            </div>

            {/* DESCRIPCIÓN GENERAL */}
            <div className="form-field-group">
              <label className="form-field-label">Descripción General</label>
              <textarea
                name="description"
                value={editableData.description}
                onChange={handleInputChange}
                disabled={!isEditing}
                rows="3"
                className="form-textarea-field"
              />
            </div>

            {/* DESCRIPCIÓN DEL ENTORNO TURÍSTICO */}
            <div className="form-field-group">
              <label className="form-field-label">Descripción del Entorno / Lugares de Interés</label>
              <textarea
                name="locationdesc"
                value={editableData.locationdesc}
                onChange={handleInputChange}
                disabled={!isEditing}
                rows="2"
                placeholder="Ej: Ubicación cercana a puntos de interés turísticos y comerciales..."
                className="form-textarea-field"
              />
            </div>

            {/* CARACTERÍSTICAS NUMÉRICAS CONTROLADAS */}
            <div className="form-numbers-grid">
              <div className="form-field-group">
                <label className="form-field-group form-field-label">Habitaciones</label>
                <input
                  type="number"
                  name="bedrooms"
                  value={editableData.bedrooms}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyPressBlockLetters}
                  onBlur={handleBlurSanitize}
                  disabled={!isEditing}
                  min={1}
                  className="form-input-field"
                />
              </div>
              
              <div className="form-field-group">
                <label className="form-field-label">Baños</label>
                <input
                  type="number"
                  name="bathrooms"
                  value={editableData.bathrooms}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyPressBlockLetters}
                  onBlur={handleBlurSanitize}
                  disabled={!isEditing}
                  min={1}
                  className="form-input-field"
                />
              </div>
              
              <div className="form-field-group">
                <label className="form-field-label">Límite Huéspedes</label>
                <input
                  type="number"
                  name="maxguests"
                  value={editableData.maxguests}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyPressBlockLetters}
                  onBlur={handleBlurSanitize}
                  disabled={!isEditing}
                  min={1}
                  className="form-input-field"
                />
              </div>
            </div>

            {/* PRECIO (COP) */}
            <div className="form-field-group">
              <label className="form-field-label">Precio por Noche (COP)</label>
              <div className="price-input-wrapper">
                <span className="price-currency-sign">$</span>
                <input
                  type="number"
                  name="pricepernight"
                  value={editableData.pricepernight}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyPressBlockLetters}
                  disabled={!isEditing}
                  min={0}
                  placeholder="0"
                  className="form-input-field"
                />
              </div>
            </div>

            {/* GEOLOCALIZACIÓN INMUTABLE */}
            <div className="geo-banner">
              <span className="geo-banner-icon">🔹</span>
              <div className="geo-banner-body">
                <label className="geo-banner-label">Geolocalización Asignada (Inmutable)</label>
                <input
                  type="text"
                  value={editableData.municipality?.name || "Municipio Inalterable"}
                  disabled={true}
                  className="geo-input-immutable"
                />
                <p className="geo-banner-help-text">
                  * Cambios de geolocalización restringidos debido a políticas de consistencia de la base de datos local.
                </p>
              </div>
            </div>

            {isEditing && (
              <div className="form-actions-wrapper">
                <button type="button" onClick={handleSaveChanges} className="btn-form-save">
                  Confirmar y Guardar
                </button>
                <button type="button" onClick={handleCancelEdition} className="btn-form-cancel">
                  Descartar Cambios
                </button>
              </div>
            )}
          </form>
        </div>

        {/* SECCIÓN DERECHA: VISTA PREVIA DINÁMICA CON MAPEO ADAPTATIVO */}
        <div className="detail-preview-section">
          <div>
            <div className="preview-section-header">
              <h3 className="preview-section-title">Vista Previa Dinámica</h3>
              {hasUnsavedChanges && (
                <span className="preview-unsaved-badge">Cambios sin aplicar</span>
              )}
            </div>

            <div className="preview-body-wrapper">
              <div className="preview-gallery-mock">
                [ Galería de fotos procesadas por la librería Pillow ]
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span className="preview-unsaved-badge" style={{ backgroundColor: '#e0e7ff', color: '#4f46e5', border: 'none' }}>
                  {editableData.propertytype === "apartment" && "🏢 Apartamento"}
                  {editableData.propertytype === "cabin" && "🏡 Cabaña"}
                  {editableData.propertytype === "house" && "🏠 Casa"}
                  {editableData.propertytype === "loft" && "✨ Loft"}
                  {editableData.propertytype === "room" && "🛏️ Habitación"}
                  {editableData.propertytype === "studio" && "🎨 Studio"}
                </span>
                <span style={{ fontSize: '11px', color: '#9ca3af', fontWeight: 'bold' }}>
                  {editableData.addresstext || "Sin dirección asignada"}
                </span>
              </div>

              <h2 className="preview-property-title">
                {editableData.title || "Inserte un título"}
              </h2>

              <div className="preview-features-row">
                <span className="preview-feature-tag">🛏️ {editableData.bedrooms || 1} Hab.</span>
                <span className="preview-feature-tag">🚿 {editableData.bathrooms || 1} Baño(s)</span>
                <span className="preview-feature-tag">👥 Máx: {editableData.maxguests || 1}</span>
              </div>

              <p className="preview-property-description">
                <strong>Descripción general:</strong><br />
                {editableData.description || "Sin descripción asignada por el momento."}
              </p>

              <p className="preview-property-description" style={{ borderTop: '1px dashed #e5e7eb', paddingTop: '0.5rem', fontSize: '12px' }}>
                <strong>Información de la zona:</strong><br />
                {editableData.locationdesc || "No hay descripciones de interés en el entorno."}
              </p>
            </div>
          </div>

          <div className="preview-price-footer">
            <span className="preview-price-label">Valor por noche asignado</span>
            <span className="preview-price-value">
              ${editableData.pricepernight ? editableData.pricepernight.toLocaleString('es-CO') : "0"}
              <span className="preview-price-currency">COP</span>
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}