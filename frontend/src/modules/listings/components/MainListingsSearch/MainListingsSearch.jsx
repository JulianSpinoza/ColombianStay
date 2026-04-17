import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import SearchBarAutocomplete from "../../../../global/components/SearchBarAutocomplete/SearchBarAutocomplete";

export default function MainListingsSearch() {
  const municipalities = useMemo(
    () => [
      "Barranquilla",
      "Soledad",
      "Puerto Colombia",
      "Cartagena",
      "Turbaco",
      "Santa Marta",
      "Montería",
      "Sincelejo",
      "Riohacha",
      "Bogotá",
      "Zipaquirá",
      "La Calera",
      "Medellín",
      "Envigado",
      "Guatapé",
      "Bucaramanga",
      "San Gil",
      "Tunja",
      "Villa de Leyva",
      "Pereira",
      "Armenia",
      "Manizales",
      "Cali",
      "Buenaventura",
      "Palmira",
      "Quibdó",
      "Villavicencio",
      "Arauca",
      "Florencia",
      "Leticia",
      "San Andrés",
      "Providencia",
    ],
    []
  );

  const [searchParams, setSearchParams] = useSearchParams();
  const municipalityFromUrl = searchParams.get("municipality") || "";

  const [filterMunicipality, setFilterMunicipality] = useState(municipalityFromUrl);

  useEffect(() => {
    setFilterMunicipality(municipalityFromUrl);
  }, [municipalityFromUrl]);

  const handleSearch = () => {
    const trimmedMunicipality = filterMunicipality.trim();
    const params = new URLSearchParams(searchParams);

    if (trimmedMunicipality) {
      params.set("municipality", trimmedMunicipality);
    } else {
      params.delete("municipality");
    }

    params.set("page", "1");
    setSearchParams(params);
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
}