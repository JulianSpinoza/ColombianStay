import { useState } from "react";
import { useListingsContext } from "../../contexts/ListingsContext";
import SearchBarAutocomplete from "../../../../global/components/SearchBarAutocomplete/SearchBarAutocomplete";

export default function MainListingsSearch () {

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

    const { fetchListings } = useListingsContext();

    const [filterMunicipality, setFilterMunicipality] = useState("");

    const handleSearch = () => {
      const query = {};
      if(filterMunicipality != ""){ 
        query.municipality = filterMunicipality;
      }
      fetchListings(query);
    };

    return (
      <SearchBarAutocomplete 
        textSearch={filterMunicipality}
        setTextSearch={setFilterMunicipality}
        options={municipalities}
        handleSearch={handleSearch}
        placeholder="Where are you going?"
      />
    );


};