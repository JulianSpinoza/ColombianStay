import { useState } from "react";

export function useApiState() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Helper para manejar errores
  const handleError = (err) => {
    console.error(err);
    setError(err.message || "Unexpected error");
  };

  return {
    loading,
    setLoading,
    error,
    setError,
    handleError,
  };
}
