import "./ListingsPage.css";
import { useState } from "react";
import ListingCard from "../../components/ListingCard/ListingCard";
import useListings from "../../hooks/useListings";
import SearchBarAutocomplete from "../../components/SearchBarAutocomplete/SearchBarAutocomplete";

export default function ListingsPage() {

  const municipalities = [
    'Barranquilla',
    'Soledad',
    'Puerto Colombia',
    'Cartagena',
    'Turbaco',
    'Santa Marta',
    'Montería',
    'Sincelejo',
    'Riohacha',
    'Bogotá',
    'Zipaquirá',
    'La Calera',
    'Medellín',
    'Envigado',
    'Guatapé',
    'Bucaramanga',
    'San Gil',
    'Tunja',
    'Villa de Leyva',
    'Pereira',
    'Armenia',
    'Manizales',
    'Cali',
    'Buenaventura',
    'Palmira',
    'Quibdó',
    'Villavicencio',
    'Arauca',
    'Florencia',
    'Leticia',
    'San Andrés',
    'Providencia'
  ]

  const [filterMunicipality, setFilterMunicipality] = useState("");
  const { 
    listings, 
    fetchListings,
    loading,
    error 
  } = useListings();

  const handleSearch = () => {
    const query = {};
    if(filterMunicipality != ""){
      query.municipality = filterMunicipality;
    }
    fetchListings(query);
  };

  return (
    <div className="listings-page">
      <SearchBarAutocomplete 
        textSearch={filterMunicipality}
        setTextSearch={setFilterMunicipality}
        options={municipalities}
        handleSearch={handleSearch}
      />

      {/* LOADING */}
      {loading && <p>Cargando...</p>}

      {/* ERROR */}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* LISTADO */}
      {!loading && !error && listings.length === 0 && (
        <p>No hay resultados.</p>
      )}

      <div className="listings-container">
        <div className="listings-grid">
          {listings.map((item) => (
            <ListingCard key={item.id} listing={item} />
          ))}
        </div>
      </div>
    </div>
  );
}
