import "./SearchBarAutocomplete.css"
import { useState } from "react";

export default function SearchBarAutocomplete({
    textSearch, 
    setTextSearch, 
    options,
    handleSearch,
    //categoryname,
}){

    const [suggestions, setSuggestions] = useState([]);

    const handleInputSearch = (e) => {
        const value = e.target.value;
        setTextSearch(value);

        // Empty search
        if(value.trim() === "") {
            setSuggestions([]);
            return;
        }

        // Filtering searching options
        const filtered = options.filter((m) => m.includes(value));

        setSuggestions(filtered);
    }

    const handleSelectOption = (option) => {
        setTextSearch(option);
        setSuggestions([]);
    }

    return (
        <div className="search-bar-autocomplete">
            <div className="input-wrapper">
                <input
                type="text"
                placeholder="Buscar por municipio..."
                value={textSearch}
                onChange={handleInputSearch}
                autoComplete="off"
                />
                {suggestions.length > 0 && (
                    <ul className="suggestions-list">
                        {suggestions.map((suggestion) => (
                            <li 
                                key= {suggestion}
                                onClick={() => handleSelectOption(suggestion)}
                                onMouseDown={(e) => e.preventDefault()}
                            >
                                {suggestion}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            <button onClick={handleSearch}>
            Buscar
            </button>
        </div>
    )
}
