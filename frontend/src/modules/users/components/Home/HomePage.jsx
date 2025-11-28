import React from "react";
import Section from "./Section.jsx";
import "./HomePage.css";

const sampleListings = [
  {
    id: 1,
    title: "Apartamento en Bogotá",
    price: "224,400 COP por 2 noches",
    rating: 4.88,
    image: "/images/apt1.jpg",
  },
  {
    id: 2,
    title: "Habitación en Bogotá",
    price: "128,481 COP por 2 noches",
    rating: 4.92,
    image: "/images/apt2.jpg",
  },
  {
    id: 3,
    title: "Casa de huéspedes en Bogotá",
    price: "148,140 COP por 2 noches",
    rating: 4.82,
    image: "/images/apt3.jpg",
  },
];

export default function HomePage() {
  return (
    <div className="home-container">
      <Section 
        title="Alojamientos populares en Bogotá"
        listings={sampleListings}
      />

      <Section 
        title="Hoteles destacados en Madrid"
        listings={sampleListings}
      />

      <Section 
        title="Disponibles cerca de Medellín este fin de semana"
        listings={sampleListings}
      />
    </div>
  );
}
