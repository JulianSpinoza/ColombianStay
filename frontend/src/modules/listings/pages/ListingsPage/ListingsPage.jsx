import { useEffect } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import ListingCard from "../../components/ListingCard/ListingCard";
import ApiState from "../../../../global/components/ApiState/ApiState.jsx";
import Pagination from "../../components/PaginationComponent/Pagination.jsx";
import useListings from "../../hooks/useListings.js";
import "./ListingsPage.css";

const ListingsPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { 
    listings,
    suggestions, 
    loading,
    error,
    fetchListings,
    page,
    totalPages,
    changePage,
  } = useListings();

  useEffect(()=> {
    fetchListings(Object.fromEntries(searchParams));
  },[searchParams.toString()])

  const handleListingClick = (listing) => {
    navigate(`/listings/${listing.accomodationid || listing.id}`);
  };

  const hasMainResults = listings.length > 0;
  const hasSuggestions = suggestions?.length > 0 || false;


  if (loading) {
    return (
      <ApiState type='loading'/>
    );
  }

  if (error) {
    return (
      <ApiState type='error' onRetry={() => fetchListings()}/>
    );
  }

  if(!loading && !error && !hasMainResults && hasSuggestions) {
    return (
      <div className="listings-page">
        <div className="listings-page-container">
          <ApiState 
            type='empty'  
            message="No encontramos alojamientos con esos filtros"
          />
          <section className="suggestions-section" data_testid="listing-suggestions">
            <h2 className="section-title">Suggested properties</h2>
            <div className="listings-grid">
              {suggestions.map((listing) => (
                <div
                  key={listing.accomodationid || listing.id}
                  onClick={() => handleListingClick(listing)}
                  className="cursor-pointer"
                >
                  <ListingCard listing={listing} />
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    );
  }


  return (
    <div className="listings-page">
      <div className="listings-page-container">
          <section className="results-section" data_testid="listing-results">

            {/* Listings Grid */}
            <div className="listings-grid">
              {listings.map((listing) => (
                <div
                  key={listing.accomodationid || listing.id}
                  onClick={() => handleListingClick(listing)}
                  className="cursor-pointer"
                  data_testid="listing-item"
                >
                  <ListingCard listing={listing}/>
                </div>
              ))}
            </div>
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={(newPage) => {
                changePage(newPage);
              }}
            />
          </section>
        </div>
      </div>
  );
};

export default ListingsPage;