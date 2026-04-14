import { useEffect, useState } from "react";
import { useListingsContext } from "../../contexts/ListingsContext";
import SearchBarAutocomplete from "../../../../global/components/SearchBarAutocomplete/SearchBarAutocomplete";
import RangeSlider from "../../../../global/components/RangeSlider/RangeSlider";
import './MainListingsSearch.css'
import { clamp, parseNumber, formatNumber } from "../../../../global/utils/general_utils";
import useAutoCompleteSearch from "../../hooks/useAutoCompleteSearch";

const DEFAULT_FILTERS = {
  keyword: "",
  location: null,
  price: [50000, 2000000],
  quantities: {
    guests: 1,
    bedrooms: 1,
    bathrooms: 1,
  },
  property_type:null,
};

export default function MainListingsSearch () {

    const {
      options:locations,
      loading,
      error
    } = useAutoCompleteSearch();

    const { fetchListings } = useListingsContext();

    const [showFilters, setShowFilters] = useState(false);

    const [filters, setFilters] = useState(DEFAULT_FILTERS);

    const handleSearch = () => {
      if(JSON.stringify(filters) === JSON.stringify(DEFAULT_FILTERS)) {
        fetchListings();
      } else {
        const formattedFilters = {
          propertytype: filters.property_type,
          bedrooms: filters.quantities.bedrooms,
          bathrooms: filters.quantities.bathrooms,
          maxguests: filters.quantities.guests,
        }
        if(filters.price[0] !== DEFAULT_FILTERS.price[0]){
          formattedFilters.min_price = filters.price[0];
        }
        if(filters.price[1] !== DEFAULT_FILTERS.price[1]){
          formattedFilters.max_price = filters.price[1];
        }
        if(filters.keyword !== DEFAULT_FILTERS.keyword){
          formattedFilters.keyword = filters.keyword;
        }
        if(filters.location) {
          switch (filters.location.option_classification) {
            case "Region":
              formattedFilters.region_id = filters.location.id
              break;
            case "Departamento":
              formattedFilters.department_id = filters.location.id
              break;
            case "Municipio":
              formattedFilters.municipality_id = filters.location.id
              break;
          }
        }
        fetchListings(formattedFilters);
      }
    };

    const handleClearAll = () => {
      setFilters(DEFAULT_FILTERS);
    };

    return (
      <div className="search-container">

        {filters.location && (
          <div className="location-selected-container">
            <span className="location-selected-type">
              {filters.location?.option_classification}
            </span>
            <span className="location-selected-name">
              {filters.location?.name_option}
            </span>
          </div>
        )}
        <SearchBarAutocomplete 
          textSearch={filters.keyword}
          setTextSearch={(newValue) => {
            setFilters((prev) => ({
              ...prev,
              keyword: newValue,
            }));
          }}
          setSelection= {(selectedLocation) => {
            setFilters((prev) => ({
              ...prev,
              location: selectedLocation,
            }));
          }}
          options={locations}
          handleSearch={handleSearch}
          placeholder="Where are you going?"
        />
        <button 
          onClick={() => setShowFilters(prev => !prev)}
          className="show-filters-button"
        >
          {!showFilters ? (
            <svg
            className="w-6 h-6 text-gray-400"
            fill="currentColor"
            viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          ) : (
            <svg
              className="w-6 h-6 text-gray-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg> 
          )}
        </button>

        {showFilters && (
          <div className="filters-panel">
            <div className="filters-header">
              <h4>Advanced Filters...</h4>
              <button onClick={handleClearAll} className="clear-all-btn">
                Clear all
              </button>
            </div>
            <div className="filter-option">
              <PriceFilter filters={filters} setFilters={setFilters}/>
            </div>
            <div className="filter-option">
              <QuantityFilter filters={filters} setFilters={setFilters}/>
            </div>
            <div className="filter-option">
              <PropertyTypeFilter filters={filters} setFilters={setFilters}/>
            </div>
          </div>
        )}
      </div>
    );
};

const Filter = ({title, handleResetFilter, isActive, children}) => {

  return (
    <fieldset className={`filter-container ${isActive ? "active" : ""}`}>
      <legend className="filter-title">{title}</legend>
      {children}
      {isActive && (
        <button 
          onClick={handleResetFilter}
          className="reset-button"
        >
          Reset filter
        </button>
      )}
    </fieldset>
  );
}

const PriceFilter = ({ filters, setFilters }) => {
  const DEFAULT = DEFAULT_FILTERS.price;
  const [MIN_LIMIT, MAX_LIMIT] = DEFAULT_FILTERS.price;
  const value = filters.price;

  const setValue = (newValue) => {
    setFilters((prev) => ({
      ...prev,
      price: newValue,
    }));
  };

  const isActive =
    value[0] !== DEFAULT[0] || value[1] !== DEFAULT[1];

  // estados locales (solo texto)
  const [minInput, setMinInput] = useState(formatNumber(value[0]));
  const [maxInput, setMaxInput] = useState(formatNumber(value[1]));

  useEffect(() => {
    setMinInput(formatNumber(value[0]));
    setMaxInput(formatNumber(value[1]));
  }, [value]);

  // MIN
  const handleMinChange = (e) => {
    const raw = e.target.value;
    setMinInput(raw);

    let parsed = parseNumber(raw);
    parsed = clamp(parsed, MIN_LIMIT, value[1]);

    setValue([parsed, value[1]]);
  };

  const handleMinBlur = () => {
    let parsed = parseNumber(minInput);
    parsed = clamp(parsed, MIN_LIMIT, value[1]);

    setMinInput(formatNumber(parsed));
    setValue([parsed, value[1]]);
  };

  // MAX
  const handleMaxChange = (e) => {
    const raw = e.target.value;
    setMaxInput(raw);

    let parsed = parseNumber(raw);
    parsed = clamp(parsed, value[0], MAX_LIMIT);

    setValue([value[0], parsed]);
  };

  const handleMaxBlur = () => {
    let parsed = parseNumber(maxInput);
    parsed = clamp(parsed, value[0], MAX_LIMIT);

    setMaxInput(formatNumber(parsed));
    setValue([value[0], parsed]);
  };

  return (
    <Filter
      title="Price Per Night Filter"
      handleResetFilter={() => setValue(DEFAULT)}
      isActive={isActive}
    >
      <div className="filter-price-slider-container">

        {/* MIN */}
        <div className="filter-price-input-wrapper">
          <span className="filter-price-currency-symbol">$</span>

          <input
            className="filter-price-input"
            value={minInput}
            onChange={handleMinChange}
            onBlur={handleMinBlur}
          />

          <span className="filter-price-currency-code">COP</span>
        </div>

        {/* SLIDER */}
        <RangeSlider
          value={value}
          onValueChange={setValue}
          min={MIN_LIMIT}
          max={MAX_LIMIT}
          step={100000}
        />

        {/* MAX */}
        <div className="filter-price-input-wrapper">
          <span className="filter-price-currency-symbol">$</span>

          <input
            className="filter-price-input"
            value={maxInput}
            onChange={handleMaxChange}
            onBlur={handleMaxBlur}
          />

          <span className="filter-price-currency-code">COP</span>
        </div>

      </div>
    </Filter>
  );
};

const QuantityFilter = ({ filters, setFilters }) => {
  const DEFAULT = DEFAULT_FILTERS.quantities;
  const values = filters.quantities;

  const handleChange = (key, val) => {
    setFilters(prev => ({
      ...prev,
      quantities: {
        ...prev.quantities,
        [key]: Math.max(1, Number(val) || 1),
      },
    }));
  };

  const isActive =
    values.guests !== DEFAULT.guests ||
    values.bedrooms !== DEFAULT.bedrooms ||
    values.bathrooms !== DEFAULT.bathrooms;

  return (
    <Filter
      title={"Quantity Filter"}
      handleResetFilter={() =>
        setFilters(prev => ({
          ...prev,
          quantities: DEFAULT,
        }))
      }
      isActive={isActive}
    >
      <div className="quantity-group">
        {Object.entries(values).map(([key, value]) => (
          <div key={key} className="quantity-item">
            <input
              type="number"
              min={1}
              value={value}
              onChange={(e) => handleChange(key, e.target.value)}
              className="number-box"
            />
            <span className="quantity-label">{key}</span>
          </div>
        ))}
      </div>
    </Filter>
  );
};

const ServicesFilter = ({ filters, setFilters }) => {

  const OPTIONS = ["WiFi", "Parking", "Pool", "Pet Friendly"];

  const DEFAULT = DEFAULT_FILTERS.services;
  const active = filters.services;

  const toggle = (option) => {
    setFilters(prev => ({
      ...prev,
      services: prev.services.includes(option)
        ? prev.services.filter(o => o !== option)
        : [...prev.services, option],
    }));
  };

  const isActive = active.length > 0;

  return (
    <Filter
      title={"Services Filter"}
      handleResetFilter={() =>
        setFilters(prev => ({
          ...prev,
          services: DEFAULT,
        }))
      }
      isActive={isActive}
    >
      {OPTIONS.map(option => (
        <button
          key={option}
          onClick={() => toggle(option)}
          className={active.includes(option) ? "active" : ""}
        >
          {option}
        </button>
      ))}
    </Filter>
  );
};

const PropertyTypeFilter = ({ filters, setFilters }) => {
  
  const OPTIONS = ["apartment", "cabin", "house", "loft", "room", "studio"];

  const DEFAULT = DEFAULT_FILTERS.property_type;

  const active = filters.property_type;
  const isActive = active !== null;

  const setValue = (newValue) => {
    setFilters((prev) => ({
      ...prev,
      property_type: newValue,
    }));
  };

  const handleSelect = (option) => {
    setValue(option);
  };

  return (
    <Filter
      title={"Property Type Filter"}
      handleResetFilter={() => setValue(DEFAULT)}
      isActive={isActive}
    >
      {OPTIONS.map(option => (
        <button
          key={option}
          onClick={() => handleSelect(option)}
          className={active === option ? "active" : ""}
        >
          {option}
        </button>
      ))}
    </Filter>
  );
};