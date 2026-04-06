import PhotosGallery from "../../components/PhotosGallery/PhotosGallery";
import React from 'react';
import { useParams } from 'react-router-dom';

/*// --- COMPONENTES PLACEHOLDER ---
const PhotosGallery = () => (
  <div className="w-full h-[400px] bg-gray-200 rounded-2xl flex items-center justify-center border-2 border-dashed border-gray-400">
    <p className="text-gray-500 font-semibold">Espacio para PhotosGallery (#42)</p>
  </div>
);
*/
const Map = () => (
  <div className="w-full h-64 bg-gray-100 rounded-xl flex items-center justify-center border">
    <p className="text-gray-400 italic font-medium">Mapa de ubicación aproximada (#43)</p>
  </div>
);

const BookingWidget = ({ price }) => (
  <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-xl sticky top-8">
    <div className="flex justify-between items-center mb-4">
      <span className="text-2xl font-bold">${price} <span className="text-sm font-normal text-gray-500">/ noche</span></span>
    </div>
    <button className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 rounded-lg transition-all active:scale-95">
      Reservar ahora
    </button>
    <p className="text-center text-xs text-gray-400 mt-4 italic text-balance">HU44: Booking Widget Component</p>
  </div>
);

// ESTE ES EL NUEVO: RatingReviewWidget (#45 aprox)
const RatingReviewWidget = () => (
  <div className="border-t pt-8 mt-8">
    <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
      <span className="text-yellow-500">★</span> 4.8 · 12 reseñas
    </h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {[1, 2].map((i) => (
        <div key={i} className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-600">U</div>
            <div>
              <p className="font-semibold text-sm">Usuario Prueba {i}</p>
              <p className="text-xs text-gray-400">Marzo 2026</p>
            </div>
          </div>
          <p className="text-gray-600 text-sm italic">"Excelente lugar, la atención de Milton fue increíble. Muy recomendado para estudiantes."</p>
        </div>
      ))}
    </div>
    <button className="mt-8 border border-black px-6 py-2 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
      Mostrar todas las reseñas
    </button>
  </div>
);

// --- PÁGINA PRINCIPAL ---
const AccommodationDetailsPage = () => {
  const { id } = useParams();

  const accommodation = {
    title: "Apartamento Moderno - ColombianStay Principal",
    location: "Bogotá, Colombia",
    description: "Disfruta de una estancia inolvidable en este alojamiento diseñado para la comodidad. Cerca de universidades, centros comerciales y transporte público.",
    capacity: "4 huéspedes",
    amenities: ["WiFi de alta velocidad", "Cocina integral", "Zona de trabajo", "Seguridad 24/7"],
    rules: "No se permiten fiestas. Respetar el horario de silencio después de las 10 PM.",
    policies: "Cancelación flexible: Reembolso total hasta 48 horas antes.",
    host: "Andres Torres",
    price: "180,000"
  };

  const handleAction = (type) => {
    alert(`Acción ejecutada: ${type}. (Flujo esperado de la HU41)`);
  };

  return (
    <main className="max-w-6xl mx-auto px-4 py-8 font-sans">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{accommodation.title}</h1>
          <p className="text-gray-600 underline font-medium">{accommodation.location}</p>
        </div>
        <div className="flex gap-4">
          <button onClick={() => handleAction('Compartir')} className="text-sm font-semibold underline hover:bg-gray-100 p-2 rounded">Compartir</button>
          <button onClick={() => handleAction('Contactar')} className="text-sm font-semibold underline hover:bg-gray-100 p-2 rounded">Contactar Host</button>
        </div>
      </div>

      <section className="mb-10">
        <PhotosGallery />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between border-b pb-6 mb-6">
            <div>
              <h2 className="text-xl font-semibold">Ofrecido por {accommodation.host}</h2>
              <p className="text-gray-500">{accommodation.capacity} · 2 habitaciones · 2 baños</p>
            </div>
            <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center text-white font-bold uppercase">
              {accommodation.host.charAt(0)}
            </div>
          </div>

          <article className="mb-8">
            <h3 className="text-xl font-semibold mb-3">Descripción</h3>
            <p className="text-gray-600 leading-relaxed text-lg">{accommodation.description}</p>
          </article>

          <section className="mb-8 border-t pt-8">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Lo que ofrece este lugar</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {accommodation.amenities.map(item => (
                <div key={item} className="flex items-center gap-3 text-gray-600">
                  <span className="text-green-500 text-xl">✔</span> {item}
                </div>
              ))}
            </div>
          </section>

          <section className="mb-8 border-t pt-8">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Reglas y Políticas</h3>
            <div className="space-y-4">
              <p className="text-gray-600 text-sm"><span className="font-bold">Reglas:</span> {accommodation.rules}</p>
              <p className="text-gray-600 text-sm"><span className="font-bold">Cancelación:</span> {accommodation.policies}</p>
            </div>
          </section>

          {/* HU43: Mapa */}
          <section className="mb-8 border-t pt-8">
            <h3 className="text-xl font-semibold mb-4">¿Dónde vas a estar?</h3>
            <Map />
          </section>

          {/* NUEVO: RatingReviewWidget */}
          <RatingReviewWidget />
        </div>

        <aside className="relative">
          <BookingWidget price={accommodation.price} />
        </aside>
      </div>
    </main>
  );
};

export default AccommodationDetailsPage;