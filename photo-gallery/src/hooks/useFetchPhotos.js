import { useState, useEffect } from 'react';

const API_ENDPOINT = 'https://picsum.photos/v2/list?limit=30';

/**
 * Custom hook to fetch a batch of 30 photos from the Picsum Photos API.
 * Encapsulates network communication, loading state, error handling, and request abort cleanup.
 *
 * @returns {{ photos: Array, loading: boolean, error: string | null }}
 */
export function useFetchPhotos() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // AbortController allows cancelling the request if the component unmounts,
    // avoiding state updates on unmounted components and memory leaks.
    const controller = new AbortController();

    async function fetchPhotos() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(API_ENDPOINT, {
          signal: controller.signal,
        });

        // Defensive check for unsuccessful HTTP status (e.g., 404, 500)
        if (!response.ok) {
          throw new Error(`Server returned HTTP ${response.status}: ${response.statusText || 'Error'}`);
        }

        const data = await response.json();

        // Defensive check against unexpected or malformed API responses
        if (!Array.isArray(data)) {
          throw new Error('Malformed API response: Expected an array of photos.');
        }

        setPhotos(data);
      } catch (err) {
        // Only set error state if the request was NOT intentionally aborted
        if (err.name !== 'AbortError') {
          console.error('Fetch error in useFetchPhotos:', err);
          setError('Unable to load photos. Please check your internet connection and try again.');
        }
      } finally {
        // Ensure loading state is reset only if component is still mounted
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchPhotos();

    // Effect cleanup: abort the in-flight network request on unmount
    return () => {
      controller.abort();
    };
  }, []); // Empty dependency array ensures photos are fetched strictly once on initial mount

  return { photos, loading, error };
}
