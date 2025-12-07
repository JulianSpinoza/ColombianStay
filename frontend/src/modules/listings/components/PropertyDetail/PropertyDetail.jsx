import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import httpClient from "../../../services/api/httpClient";
import { LISTINGS_ENDPOINTS } from "../../../services/api/endpoints";

const PropertyDetail = () => {
  const { propertyId } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setLoading(true);
        const response = await httpClient.get(LISTINGS_ENDPOINTS.DETAIL(propertyId));
        setProperty(response.data);
      } catch (err) {
        setError(err.message || "Error loading property");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (propertyId) {
      fetchProperty();
    }
  }, [propertyId]);

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
        <p className="text-gray-700 mb-4">{error}</p>
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition"
        >
          Go back
        </button>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Property not found</h1>
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition"
        >
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="sticky top-0 z-40 bg-white border-b">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900 font-medium"
          >
            ← Volver
          </button>
          <div className="flex gap-3">
            <button className="px-4 py-2 rounded-lg border border-gray-300 hover:border-gray-400 transition">
              Compartir
            </button>
            <button className="px-4 py-2 rounded-lg border border-gray-300 hover:border-gray-400 transition">
              Guardar
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900">{property.title}</h1>
              <p className="text-gray-600 mt-1"> {property.idmunicipality}</p>
            </div>

            <div className="py-6 border-b">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-2xl font-bold">{property.maxguests}</p>
                  <p className="text-gray-600">Maximum Guests</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-20 bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <div className="mb-4">
                <div className="flex items-baseline gap-1 mb-3">
                  <span className="text-3xl font-bold text-gray-900">
                    ${property.pricepernight?.toLocaleString()}
                  </span>
                  <span className="text-gray-600">/night</span>
                </div>
              </div>

              <button className="w-full bg-rose-500 text-white font-bold py-3 rounded-lg hover:bg-rose-600 transition mb-3">
                Reserve
              </button>

              <p className="text-xs text-center text-gray-600">No payments will be made yet</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetail;
