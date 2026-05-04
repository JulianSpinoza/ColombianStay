import { useEffect } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import ListingCard from "../../components/ListingCard/ListingCard";
import { useListingsContext } from "../../contexts/ListingsContext";
import "./ListingsPage.css";

const ListingsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const { fetchListings, listings, suggestions, loading, error } =
    useListingsContext();

  const municipality = searchParams.get("municipality") || "";
  const page = Number(searchParams.get("page") || 1);

  useEffect(() => {
    const delay = setTimeout(() => {
      const query = {};

      if (municipality) {
        query.municipality = municipality;
      }

      if (page) {
        query.page = page;
      }

      fetchListings(query);
    }, 300); // debounce de 300ms

    return () => clearTimeout(delay);
  }, [municipality, page, fetchListings]);

  const handleCardClick = (listing) => {
    const listingId = listing?.accomodationid || listing?.id;

    navigate(`/listings/${listingId}`, {
      state: {
        from: `${location.pathname}${location.search}`,
      },
    });
  };

  const hasMainResults = listings.length > 0;
  const hasSuggestions = suggestions.length > 0;

  if (loading) {
    return (
      <div className="listings-page">
        <div className="listings-page-container">
          <h1 className="page-title">Properties</h1>
          <p className="page-subtitle">Loading results...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="listings-page">
        <div className="listings-page-container">
          <h1 className="page-title">Properties</h1>
          <p className="empty-message">
            We could not load the properties right now.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="listings-page">
      <div className="listings-page-container">
        <h1 className="page-title">Properties</h1>

        {!hasMainResults && hasSuggestions && (
          <div className="results-message">
            <h2 className="section-title">No exact matches found</h2>
            <p className="section-subtitle">
              Here are some suggested properties you may like.
            </p>
          </div>
        )}

        {hasMainResults && (
          <section className="results-section">
            <h2 className="section-title">Results</h2>
            <div className="listings-grid">
              {listings.map((listing) => (
                <ListingCard
                  key={listing.accomodationid || listing.id}
                  listing={listing}
                  onCardClick={handleCardClick}
                />
              ))}
            </div>
          </section>
        )}

        {hasSuggestions && (
          <section className="suggestions-section">
            <h2 className="section-title">Suggested properties</h2>
            <div className="listings-grid">
              {suggestions.map((listing) => (
                <ListingCard
                  key={listing.accomodationid || listing.id}
                  listing={listing}
                  onCardClick={handleCardClick}
                />
              ))}
            </div>
          </section>
        )}

        {!hasMainResults && !hasSuggestions && (
          <div className="empty-state">
            <h2 className="section-title">No properties found</h2>
            <p className="empty-message">
              Try adjusting your search to see more options.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ListingsPage;