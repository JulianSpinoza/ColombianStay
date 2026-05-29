import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import SearchBarAutocomplete from "../../../../global/components/SearchBarAutocomplete/SearchBarAutocomplete";
import RangeSlider from "../../../../global/components/RangeSlider/RangeSlider";
import './MainListingsSearch.css'
import { clamp, parseNumber, formatNumber } from "../../../../global/utils/general_utils";
import useAutoCompleteSearch from "../../hooks/useAutoCompleteSearch";
import ApiState from "../../../../global/components/ApiState/ApiState";

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

export default function MainListingsSearch({data_testid}) {

    const {
      options:locations,
      loading:locations_loading,
      error
    } = useAutoCompleteSearch();

    const [searchParams, setSearchParams] = useSearchParams();

    const [showFilters, setShowFilters] = useState(false);

    const [filters, setFilters] = useState(DEFAULT_FILTERS);

    useEffect(() => {

      if(locations_loading) return;

      const getLocation = () => {
        let option_classification;
        let id;
        if (id = searchParams.get("region_id")) {
          option_classification = "Region";
        } else if (id = searchParams.get("department_id")) {
          option_classification = "Departamento";
        } else if (id = searchParams.get("municipality_id")) {
          option_classification = "Municipio";
        } else {
          return null;
        }

        const idLocation = parseInt(id, 10)

        const locationFilter = locations.find(
          location => (location.id === idLocation && location.option_classification == option_classification)
        )

        return locationFilter;
      }

      const getNum = (key, defaultIdx) => {
        const val = searchParams.get(key);
        return val !== null ? Number(val) : DEFAULT_FILTERS.price[defaultIdx];
      };

      const formattedFilters = {
        keyword: searchParams.get("keyword") || DEFAULT_FILTERS.keyword,
        location: getLocation() || DEFAULT_FILTERS.location,
        price: [getNum("min_price", 0), getNum("max_price", 1)],
        quantities: {
          guests: Number(searchParams.get("maxguests")) || DEFAULT_FILTERS.quantities.guests,
          bedrooms: Number(searchParams.get("bedrooms")) || DEFAULT_FILTERS.quantities.bedrooms,
          bathrooms: Number(searchParams.get("bathrooms")) || DEFAULT_FILTERS.quantities.bathrooms,
        },
        property_type: searchParams.get("propertytype") || DEFAULT_FILTERS.property_type,
      };

      setFilters(formattedFilters);

    }, [searchParams.toString(), locations_loading]);

    const handleSearch = () => {

      const formattedFilters = {};

      if(JSON.stringify(filters) !== JSON.stringify(DEFAULT_FILTERS)) {
        if (filters.quantities.bedrooms !== DEFAULT_FILTERS.quantities.bedrooms){
          formattedFilters.bedrooms = filters.quantities.bedrooms;
        }
        if (filters.quantities.bathrooms !== DEFAULT_FILTERS.quantities.bathrooms){
          formattedFilters.bathrooms = filters.quantities.bathrooms;
        }
        if (filters.quantities.guests !== DEFAULT_FILTERS.quantities.guests){
          formattedFilters.maxguests = filters.quantities.guests;
        }
        if (filters.property_type !== DEFAULT_FILTERS.property_type) {
          formattedFilters.propertytype = filters.property_type;
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
      }

      setShowFilters(false);
      setSearchParams(formattedFilters);

    };

    const handleClearAll = () => {
      setFilters(DEFAULT_FILTERS);
    };

    return (
      <div className="search-container" data_testid={data_testid}>

        {filters.location && (
          <div className="location-selected-container" data_testid="location-selected-type">
            {locations_loading ? (
              <ApiState type='loading'/>
            ) : (
              <>
                <span className="location-selected-type">
                  {filters.location.option_classification}
                </span>
                <span className="location-selected-name">
                  {filters.location.name_option}
                </span>
              </>
            )}
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
          data_testid="show-advanced-filters-button"
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
  const [MIN_LIMIT, MAX_LIMIT] = DEFAULT;

  const value = filters.price;

  const setValue = (newValue) => {
    setFilters((prev) => ({
      ...prev,
      price: newValue,
    }));
  };

  const isActive =
    value[0] !== DEFAULT[0] ||
    value[1] !== DEFAULT[1];

  // Inputs visuales
  const [minInput, setMinInput] = useState(
    formatNumber(value[0])
  );

  const [maxInput, setMaxInput] = useState(
    formatNumber(value[1])
  );

  // Saber si el usuario está editando
  const [editingMin, setEditingMin] = useState(false);
  const [editingMax, setEditingMax] = useState(false);

  /**
   * Cuando el slider cambie el valor,
   * actualizamos los inputs SOLO si
   * el usuario no está escribiendo.
   */
  useEffect(() => {
    if (!editingMin) {
      setMinInput(formatNumber(value[0]));
    }

    if (!editingMax) {
      setMaxInput(formatNumber(value[1]));
    }
  }, [value, editingMin, editingMax]);

  // =========================
  // MIN INPUT
  // =========================

  const handleMinFocus = () => {
    setEditingMin(true);

    setMinInput(
      parseNumber(minInput).toString()
    );
  };

  const handleMinChange = (e) => {
    setMinInput(e.target.value);
  };

  const handleMinBlur = () => {
    let parsed = parseNumber(minInput);

    parsed = clamp(
      parsed,
      MIN_LIMIT,
      value[1]
    );

    setValue([
      parsed,
      value[1]
    ]);

    setMinInput(formatNumber(parsed));
    setEditingMin(false);
  };

  const handleMinKeyDown = (e) => {
    if (e.key === "Enter") {
      e.target.blur();
    }
  };

  // =========================
  // MAX INPUT
  // =========================

  const handleMaxFocus = () => {
    setEditingMax(true);

    setMaxInput(
      parseNumber(maxInput).toString()
    );
  };

  const handleMaxChange = (e) => {
    setMaxInput(e.target.value);
  };

  const handleMaxBlur = () => {
    let parsed = parseNumber(maxInput);

    parsed = clamp(
      parsed,
      value[0],
      MAX_LIMIT
    );

    setValue([
      value[0],
      parsed
    ]);

    setMaxInput(formatNumber(parsed));
    setEditingMax(false);
  };

  const handleMaxKeyDown = (e) => {
    if (e.key === "Enter") {
      e.target.blur();
    }
  };

  return (
    <Filter
      title="Price Per Night Filter"
      handleResetFilter={() =>
        setValue(DEFAULT)
      }
      isActive={isActive}
    >
      <div className="filter-price-slider-container">

        {/* MIN */}
        <div className="filter-price-input-wrapper">

          <span className="filter-price-currency-symbol">
            $
          </span>

          <input
            className="filter-price-input"
            value={minInput}
            onFocus={handleMinFocus}
            onChange={handleMinChange}
            onBlur={handleMinBlur}
            onKeyDown={handleMinKeyDown}
            data_testid="min-price-input"
          />

          <span className="filter-price-currency-code">
            COP
          </span>

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

          <span className="filter-price-currency-symbol">
            $
          </span>

          <input
            className="filter-price-input"
            value={maxInput}
            onFocus={handleMaxFocus}
            onChange={handleMaxChange}
            onBlur={handleMaxBlur}
            onKeyDown={handleMaxKeyDown}
            data_testid="max-price-input"
          />

          <span className="filter-price-currency-code">
            COP
          </span>

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
              data_testid={`${key}-quantity-input`}
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
          data_testid="property_type-item"
        >
          {option}
        </button>
      ))}
    </Filter>
  );
};
