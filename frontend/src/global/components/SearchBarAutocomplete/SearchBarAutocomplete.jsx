import "./SearchBarAutocomplete.css";
import { useMemo, useState } from "react";

const normalizeText = (text = "") =>
  text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

export default function SearchBarAutocomplete({
  textSearch,
  setTextSearch,
  options,
  handleSearch,
  placeholder,
}) {
  const [suggestions, setSuggestions] = useState([]);

  const normalizedOptions = useMemo(
    () =>
      options.map((option) => ({
        original: option,
        normalized: normalizeText(option),
      })),
    [options]
  );

  const handleInputSearch = (e) => {
    const value = e.target.value;
    setTextSearch(value);

    const normalizedValue = normalizeText(value);

    if (!normalizedValue) {
      setSuggestions([]);
      return;
    }

    const maxSuggestions = 7;

    const startsWithMatches = normalizedOptions
      .filter((item) => item.normalized.startsWith(normalizedValue))
      .map((item) => item.original);

    const includesMatches = normalizedOptions
      .filter(
        (item) =>
          item.normalized.includes(normalizedValue) &&
          !item.normalized.startsWith(normalizedValue)
      )
      .map((item) => item.original);

    const filtered = [...startsWithMatches, ...includesMatches].slice(
      0,
      maxSuggestions
    );

    setSuggestions(filtered);
  };

  const handleSelectOption = (option) => {
    setTextSearch(option);
    setSuggestions([]);
  };

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
        />

        {suggestions.length > 0 && (
          <ul className="suggestions-list">
            {suggestions.map((suggestion) => (
              <li
                key={suggestion}
                onClick={() => handleSelectOption(suggestion)}
                onMouseDown={(e) => e.preventDefault()}
              >
                {suggestion}
              </li>
            ))}
          </ul>
        )}
      </div>

      <button type="button" onClick={handleSearch}>
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
  );
}