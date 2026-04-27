import { useNavigate } from "react-router-dom";
import PropertyFormWizard from "../../components/PropertyFormWizard/PropertyFormWizard.jsx";
import { publishProperty } from "../../services/listingsService.js";

export default function PublishListing() {
  const navigate = useNavigate();

  const publish = async (property) => {
    try {
      // 1. Enviamos los datos (HU36: Frontend correctly sends data)
      const response = await publishProperty(property);
      
      // 2. Criterio: Recibir aprobación
      // Si el servicio no lanza error, es una aprobación
      alert("¡Publicación exitosa! Tu anuncio ya está disponible.");
      
      // Solo navegamos si fue exitoso
      navigate("/");
      
    } catch (error) {
      // 3. Criterio: Recibir denegación
      console.error("Error detallado del backend:", error);
      
      // Intentamos mostrar el mensaje de error que mandó Janeth (HU37 Contract)
      const errorMsg = error.message || "Hubo un error al procesar tu solicitud. Revisa los datos e intenta de nuevo.";
      alert(`Denegación de creación: ${errorMsg}`);
      
      // NOTA: Aquí NO navegamos a "/", para que el usuario pueda corregir 
      // lo que esté mal en el Wizard sin perder lo que ya escribió.
    }
  };

  return (
    <div className="w-full min-h-screen bg-white">
      {/* Wizard Component */}
      <PropertyFormWizard onPublish={publish}/>
    </div>
  );
};