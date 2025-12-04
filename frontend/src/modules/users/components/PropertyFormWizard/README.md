# PropertyFormWizard Component

Un componente multipasos (Wizard) para que los anfitriones publiquen propiedades con formulario completo y subida de fotos.

## Características

✅ **Formulario de 3 pasos**
- Paso 1: Detalles de la propiedad (tipo, título, descripción, habitaciones, huéspedes)
- Paso 2: Precios y ubicación (precio nightly, ciudad, dirección)
- Paso 3: Subida de fotos (drag & drop, hasta 10 fotos, reorden, preview)

✅ **Barra de progreso visual**
- Indicador de paso actual
- Checkmarks para pasos completados
- Etiquetas de pasos

✅ **Validaciones**
- Campos requeridos marcados
- Límites de caracteres en título y descripción
- Validación de números (bedrooms, bathrooms, guests)
- Mínimo 3 fotos recomendadas

✅ **Interfaz Airbnb-style**
- Gradiente púrpura (#667eea → #764ba2)
- Bordes suaves (rounded-lg)
- Focus rings claros
- Animaciones suaves

✅ **Drag & Drop de fotos**
- Zona visual de arrastrar y soltar
- Vista previa de imágenes
- Reorden (mover arriba/abajo)
- Eliminar fotos
- Badge de "Cover Photo" (primera foto)
- Límite de 10 fotos

## Uso

```jsx
import PropertyFormWizard from "./components/PropertyFormWizard/PropertyFormWizard.jsx";

export default function App() {
  return (
    <div>
      <PropertyFormWizard />
    </div>
  );
}
```

## Estructura de Carpetas

```
PropertyFormWizard/
├── PropertyFormWizard.jsx         # Componente principal
├── PropertyFormWizard.css         # Estilos
├── ProgressBar.jsx               # Barra de progreso
└── steps/
    ├── PropertyDetails.jsx        # Paso 1: Detalles
    ├── PricingLocation.jsx        # Paso 2: Precios/Ubicación
    └── PhotoUpload.jsx            # Paso 3: Fotos
```

## Data Structure

```javascript
{
  // Step 1
  title: "",                   // Título (max 50 chars)
  description: "",             // Descripción (max 500 chars)
  propertyType: "apartment",   // Tipo de propiedad
  bedrooms: 1,                 // Cantidad de habitaciones
  bathrooms: 1,                // Cantidad de baños
  guests: 2,                   // Máximo de huéspedes
  
  // Step 2
  price: "",                   // Precio por noche
  currency: "COP",             // Moneda
  location: "",                // Descripción de ubicación
  address: "",                 // Dirección completa
  city: "",                     // Ciudad
  
  // Step 3
  photos: [                    // Array de fotos
    {
      id: 123456,              // ID único
      file: File,              // Objeto File
      preview: "blob:...",     // URL preview
      name: "photo.jpg"        // Nombre del archivo
    }
  ]
}
```

