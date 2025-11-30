import React from "react";
import ListingCard from "../../../modules/users/components/ListingCard/ListingCard.jsx";

export default function Section({ title, listings }) {
  return (
    <div className="section">
      <h2>{title}</h2>

      <div className="listings-grid">
        {listings.map(listing => (
          <ListingCard key={listing.id} {...listing} />
        ))}
      </div>
    </div>
  );
}
