import { debounce, normalizeText } from "../../utils/general_utils";
import "./SearchBarAutocomplete.css"
import { useCallback, useState } from "react";

export default function SearchBarAutocomplete({
    textSearch, 
    setTextSearch,
    setSelection, 
    options,
    handleSearch,
    placeholder,
}){

    const [suggestions, setSuggestions] = useState([]);

    const debouncedSearch = useCallback(
        debounce(() => {
            handleSearch();
        }, 500), // 500 ms of wait time
        [handleSearch]
    );

    const handleInputSearch = (e) => {
        const value = e.target.value;
        setTextSearch(value);

        // Empty search
        if(value.trim() === "") {
            setSuggestions([]);
            return;
        }

        const MAXSUGGESTIONS = 7;

        const normalizedInput = normalizeText(value);

        // Filtering searching options
        const filtered = options
            .filter((option) => {
                const normalizedOption = normalizeText(option?.name_option ?? '');
                return normalizedOption.includes(normalizedInput);
            })
        .slice(0, MAXSUGGESTIONS);

        setSuggestions(filtered);
    }

    const handleSelectOption = (option) => {
        setTextSearch('');
        setSelection(option)
        setSuggestions([]);
    }

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
        e.preventDefault();
        setSuggestions([]);
        handleSearch();
    }
  };

    return (
        <div className="search-bar-autocomplete">
            <div className="input-wrapper">
                <input
                type="text"
                placeholder={placeholder}
                value={textSearch}
                onChange={handleInputSearch}
                onKeyDown={handleKeyDown}
                autoComplete="off"
                data_testid="search-input"
                />
                {suggestions.length > 0 && (
                    <ul className="suggestions-list" data_testid="search-bar-suggestions-list">
                        {suggestions.map((suggestion) => (
                            <li 
                            key={suggestion.name_option}
                            onClick={() => handleSelectOption(suggestion)}
                            onMouseDown={(e) => e.preventDefault()}
                            className="suggestion-item"
                            data_testid="search-bar-suggestions-item"
                            >
                                <span className="suggestion-name">
                                    {suggestion.name_option}
                                </span>
                                
                                <span className="suggestion-classification">
                                    {suggestion.option_classification}
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            <button 
                onClick={debouncedSearch} 
                type="button"
                data_testid="search-button"
            >
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
