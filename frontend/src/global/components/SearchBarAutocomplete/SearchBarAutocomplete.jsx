import "./SearchBarAutocomplete.css"
import { useState } from "react";

export default function SearchBarAutocomplete({
    textSearch, 
    setTextSearch, 
    options,
    handleSearch,
    placeholder,
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

        const maxSuggestions = 7;

        // Filtering searching options
        const filtered = options.filter((m) => m.includes(value)).slice(0,maxSuggestions);

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
                placeholder={placeholder}
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
                <svg
                className="w-5 h-5 text-gray-400"
                fill="currentColor"
                viewBox="0 0 20 20"
                >
                    <path
                    fillRule="evenodd"
                    d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                    clipRule="evenodd"
                    />
                </svg>
            
            </button>
        </div>
    )
}
