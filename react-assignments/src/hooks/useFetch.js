import { useEffect, useState } from "react";

// Module-level cache object shared across all components
const cache = {};

// Cache expiration time in milliseconds (2 minutes)
const CACHE_EXPIRY = 2 * 60 * 1000;

// Helper function to check if cache is still valid
const isCacheValid = (url) => {
  if (!cache[url]) return false;
  const { timestamp } = cache[url];
  return Date.now() - timestamp < CACHE_EXPIRY;
};

export const useFetch = (apiUrl) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!apiUrl) return;

    const fetchData = async () => {
      // Check if we have valid cached data
      if (isCacheValid(apiUrl)) {
        const { data: cachedData } = cache[apiUrl];
        setData(cachedData);
        setLoading(false);
        setError(null);
        return;
      }

      // No valid cache, fetch fresh data
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(apiUrl);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const json = await response.json();

        // Update cache with new data and timestamp
        cache[apiUrl] = {
          data: json,
          timestamp: Date.now(),
        };

        setData(json);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [apiUrl]);

  return { data, loading, error };
};
