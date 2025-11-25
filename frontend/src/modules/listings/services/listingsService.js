// --- Datos Mock por ahora ---
const MOCK_LISTINGS = [
  { id: 1, title: "Apartamento en Bogotá", city: "Bogotá" , images:
    ['/PruebaImagen.png',
      '/PruebaImagen2.png'
    ]
   },
  { id: 2, title: "Casa en Boston", city: "Boston" , images:
    ['/PruebaImagen2.png',
      '/PruebaImagen.png'
    ]},
  { id: 3, title: "Cabaña en Medellín", city: "Medellín" , images:
    ['/PruebaImagen.png',
      '/PruebaImagen2.png'
    ]},
  { id: 4, title: "Hostal en Bogotá", city: "Bogotá" , images:
    ['/PruebaImagen.png',
      '/PruebaImagen2.png'
    ]},
  { id: 5, title: "Loft en Barranquilla", city: "Barranquilla" , images:
    ['/PruebaImagen.png',
      '/PruebaImagen2.png'
    ]},
];

// --- Función simple getListings(query) ---
export async function getListings(query) {
  // Simulamos latencia mínima para parecer una API real
  await new Promise(resolve => setTimeout(resolve, 5000));

  if (!query || query.trim() === "") {
    return MOCK_LISTINGS;
  }

  const normalized = query.toLowerCase();

  return MOCK_LISTINGS.filter(item =>
    item.city.toLowerCase().includes(normalized)
  );
}