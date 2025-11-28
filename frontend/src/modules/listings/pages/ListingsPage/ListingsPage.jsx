import "./ListingsPage.css";
import { useState } from "react";
import ListingCard from "../../components/ListingCard/ListingCard";
import useListings from "../../hooks/useListings";

export default function ListingsPage() {

  const [filterMunicipality, setFilterMunicipality] = useState("");
  const { 
    listings, 
    fetchListings,
    loading,
    error 
  } = useListings();

  const handleSearch = () => {
    const query = {
      municipality: filterMunicipality
    }
    fetchListings(query);
  };

  return (
    <div className="listings-page">
      <div className="search-bar">
        <input
          type="text"
          placeholder="Buscar por municipio..."
          value={filterMunicipality}
          onChange={(e) => setFilterMunicipality(e.target.value, 'Municipal')}
        />
        <button onClick={handleSearch}>
          Buscar
        </button>
      </div>

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
