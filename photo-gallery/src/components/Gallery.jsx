import React, { useState, useEffect, useCallback, useMemo, useReducer } from 'react';
import { useFetchPhotos } from '../hooks/useFetchPhotos';
import { PhotoCard } from './PhotoCard';
import {
  favouritesReducer,
  initialFavouritesState,
  initFavourites,
  FAVOURITES_ACTION_TYPES,
  FAVOURITES_STORAGE_KEY,
} from '../reducers/favouritesReducer';

//  * Gallery Component

export function Gallery() {
  // 1. Fetch photos from custom hook
  const { photos, loading, error } = useFetchPhotos();

  // 2. Search state (controlled input)
  const [searchQuery, setSearchQuery] = useState('');

  // 3. Favourites state managed via useReducer
  // We use the lazy initializer `initFavourites` to read from localStorage synchronously
  // before the initial render, preventing an initial empty state [] from overwriting persisted data.
  const [favouritesState, dispatchFavourites] = useReducer(
    favouritesReducer,
    initialFavouritesState,
    initFavourites
  );

  // Sync favourites changes to browser localStorage
  useEffect(() => {
    try {
      window.localStorage.setItem(
        FAVOURITES_STORAGE_KEY,
        JSON.stringify(favouritesState.favourites)
      );
    } catch (err) {
      console.error('Failed to persist favourites to localStorage:', err);
    }
  }, [favouritesState.favourites]);

  // Listen to cross-tab storage changes to keep favourites synchronized if open in multiple windows
  useEffect(() => {
    const handleStorageEvent = (event) => {
      if (event.key === FAVOURITES_STORAGE_KEY && event.newValue) {
        try {
          const parsed = JSON.parse(event.newValue);
          if (Array.isArray(parsed)) {
            dispatchFavourites({
              type: FAVOURITES_ACTION_TYPES.LOAD_FAVOURITES,
              payload: parsed,
            });
          }
        } catch (err) {
          console.error('Failed to parse synchronized storage update:', err);
        }
      }
    };

    window.addEventListener('storage', handleStorageEvent);
    return () => window.removeEventListener('storage', handleStorageEvent);
  }, []);

  const handleSearchChange = useCallback((event) => {
    setSearchQuery(event.target.value);
  }, []);

  /**
   * Action handler to toggle a photo's favourite status.
   * Wrapped in useCallback for stable reference passed down to PhotoCard components.
   */
  const handleToggleFavourite = useCallback((photo) => {
    dispatchFavourites({
      type: FAVOURITES_ACTION_TYPES.TOGGLE_FAVOURITE,
      payload: photo,
    });
  }, []);

  /**
   * Handler to quickly reset/clear the search query.
   */
  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  /**
  
   * Filtering rules:
   * - Real-time filtering by author name
   * - Case-insensitive matching
   * - Leading/trailing whitespace trimmed
   * - Pure in-memory filtering: never mutates `photos` or re-fetches from the API
   */
  const filteredPhotos = useMemo(() => {
    const trimmedQuery = searchQuery.trim().toLowerCase();

    // If query is empty or whitespace only, display the full gallery
    if (!trimmedQuery) {
      return photos;
    }

    return photos.filter((photo) => {
      if (!photo || !photo.author) return false;
      return photo.author.toLowerCase().includes(trimmedQuery);
    });
  }, [photos, searchQuery]);

  /**
   * Set of favourite IDs memoized for O(1) membership check when rendering each photo card.
   */
  const favouriteIdsSet = useMemo(() => {
    return new Set(favouritesState.favourites.map((fav) => String(fav.id)));
  }, [favouritesState.favourites]);

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14">
      {/* Gallery Header */}
      <header className="text-center max-w-2xl mx-auto mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 mb-3">
          Curated Photo{" "}
          <span className="text-blue-600">Gallery</span>
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl mx-auto">
          Discover handpicked captures from talented photographers around the world.
          Save your favourite shots with persistent bookmarking.
        </p>
      </header>

      {/* Control Bar: Search Input and Photo Count Indicator */}
      <div className="mb-7 sm:mb-8 max-w-xl mx-auto">
        <div className="relative w-full">
          <label htmlFor="gallery-author-search" className="sr-only">
            Search photos by photographer name
          </label>
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
            {/* Inline SVG Search Icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4 text-slate-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </div>

          <input
            type="text"
            id="gallery-author-search"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search by photographer name (e.g. John, Alejandro)..."
            disabled={loading || Boolean(error)}
            className="w-full h-11 sm:h-12 pl-11 pr-11 text-sm bg-white border border-slate-200/90 rounded-2xl text-slate-900 placeholder-slate-400 shadow-[0_2px_8px_-2px_rgba(15,23,42,0.05)] transition-all duration-200 hover:border-slate-300 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-500/15 focus-visible:outline-none focus-visible:border-blue-600 focus-visible:ring-4 focus-visible:ring-blue-500/15 disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed"
          />

          {/* Clear Search Button inside input */}
          {searchQuery && (
            <button
              type="button"
              onClick={handleClearSearch}
              aria-label="Clear author search"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-3.5 h-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>

        {/* Compact Rounded Status Badges for Photo Count and Favourites */}
        {!loading && !error && (
          <div className="mt-3 flex items-center justify-between gap-2.5 flex-wrap px-0.5">
            {/* Photo count status badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-white/95 text-slate-600 border border-slate-200/90 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600" aria-hidden="true" />
              <span>
                Showing <strong className="font-semibold text-slate-900">{filteredPhotos.length}</strong> of{' '}
                <strong className="font-semibold text-slate-900">{photos.length}</strong> photos
              </span>
            </div>

            {/* Favourite count status badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-white/95 text-slate-600 border border-slate-200/90 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className={`w-3.5 h-3.5 ${favouritesState.favourites.length > 0 ? 'text-rose-500' : 'text-slate-400'
                  }`}
                aria-hidden="true"
              >
                <path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" />
              </svg>
              <span>
                <strong className="font-semibold text-slate-900">{favouritesState.favourites.length}</strong>{' '}
                {favouritesState.favourites.length === 1 ? 'favourite' : 'favourites'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area: Loading, Error, Empty, or Photo Grid */}
      <div className="w-full">
        {/* State 1: Loading Spinner */}
        {loading && (
          <div
            role="status"
            aria-live="polite"
            className="flex flex-col items-center justify-center py-24 px-4 text-center"
          >
            {/* CSS / Tailwind Centered Spinner */}
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4" />
            <p className="text-base font-medium text-slate-700">Loading photos...</p>
            <p className="text-xs text-slate-400 mt-1">Fetching 30 curated images from Picsum Photos</p>
          </div>
        )}

        {/* State 2: Error Message with Retry */}
        {!loading && error && (
          <div
            role="alert"
            className="max-w-md mx-auto my-12 p-6 bg-red-50 border border-red-200 rounded-2xl text-center shadow-sm"
          >
            <div className="w-12 h-12 mx-auto mb-3 text-red-500 flex items-center justify-center rounded-full bg-red-100">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-red-900 mb-1">Unable to Load Gallery</h2>
            <p className="text-sm text-red-700 mb-5">{error}</p>
            <button
              type="button"
              id="retry-fetch-btn"
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors shadow-sm"
            >
              Retry Loading
            </button>
          </div>
        )}

        {/* State 3: Empty Search Results */}
        {!loading && !error && filteredPhotos.length === 0 && (
          <div className="text-center py-20 px-4 max-w-md mx-auto">
            <div className="w-12 h-12 mx-auto mb-3 text-slate-400 flex items-center justify-center rounded-full bg-slate-100">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
                <line x1="8" y1="11" x2="14" y2="11" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-slate-800 mb-1">
              No photos found for this author
            </h2>
            <p className="text-sm text-slate-500 mb-4">
              We couldn&apos;t find any photographers matching &ldquo;{searchQuery.trim()}&rdquo;.
            </p>
            <button
              type="button"
              id="reset-search-btn"
              onClick={handleClearSearch}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Clear Search & Show All Photos
            </button>
          </div>
        )}

        {/* State 4: Responsive Photo Grid (1 col Mobile, 2 cols Tablet, 4 cols Desktop) */}
        {!loading && !error && filteredPhotos.length > 0 && (
          <div
            id="photo-grid"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {filteredPhotos.map((photo) => (
              <PhotoCard
                key={photo.id}
                photo={photo}
                isFavourite={favouriteIdsSet.has(String(photo.id))}
                onToggleFavourite={handleToggleFavourite}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default Gallery;
