"use client";

import { useState, useEffect } from "react";

interface ProductFilters {
  page?: number;
  limit?: number;
  category?: string;
  q?: string;
  condition?: string;
  minPrice?: number;
  maxPrice?: number;
}

export function useProducts(filters: ProductFilters = {}) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, val]) => {
      if (val !== undefined && val !== "") params.set(key, String(val));
    });

    setLoading(true);
    fetch(`/api/products?${params.toString()}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setData(json.data);
        else setError(json.message);
      })
      .catch(() => setError("Failed to load products"))
      .finally(() => setLoading(false));
  }, [JSON.stringify(filters)]);

  return { data, loading, error };
}