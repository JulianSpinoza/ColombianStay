import React, { useState } from 'react';

const PhotosGallery = ({ images = [] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Imágenes por defecto por si no llegan datos aún
  const slides = images.length > 0 ? images : [
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=1000",
    "https://images.unsplash.com/photo-1493809842364-78817add7ffb?q=80&w=1000",
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=1000"
  ];

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  return (
    <div className="relative w-full h-[500px] overflow-hidden rounded-2xl group shadow-lg">
      {/* Imagen Principal con transición suave */}
      <div 
        className="w-full h-full bg-center bg-cover duration-700 ease-in-out transition-all"
        style={{ backgroundImage: `url(${slides[currentIndex]})` }}
      ></div>

      {/* Controles: Flecha Izquierda */}
      <button 
        onClick={prevSlide}
        className="absolute top-1/2 left-5 -translate-y-1/2 text-2xl rounded-full p-2 bg-white/30 text-white hover:bg-white/50 transition-all backdrop-blur-sm"
      >
        ❮
      </button>

      {/* Controles: Flecha Derecha */}
      <button 
        onClick={nextSlide}
        className="absolute top-1/2 right-5 -translate-y-1/2 text-2xl rounded-full p-2 bg-white/30 text-white hover:bg-white/50 transition-all backdrop-blur-sm"
      >
        ❯
      </button>

      {/* Indicadores de posición (Puntos) */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, index) => (
          <button 
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-3 h-3 rounded-full transition-all ${currentIndex === index ? "bg-white scale-125" : "bg-white/40"}`}
          />
        ))}
      </div>
      
      {/* Contador de fotos */}
      <div className="absolute bottom-4 right-6 bg-black/50 text-white text-xs px-3 py-1 rounded-full backdrop-blur-sm">
        {currentIndex + 1} / {slides.length}
      </div>
    </div>
  );
};

export default PhotosGallery;