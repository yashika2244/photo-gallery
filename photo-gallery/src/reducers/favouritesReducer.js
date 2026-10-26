/**
 * Favourites Reducer
 * 
 * Manages the state of user-favorited photos in the Photo Gallery application.
 * 
 * WHY useReducer IS USED HERE:
 * 1. Predictable State Transitions: Encapsulates all favourites modification logic 
 *    (toggling individual photos, bulk hydration from storage) into pure, centralized functions.
 * 2. Separation of Concerns: Decouples the business logic of adding/removing favourites and 
 *    ensuring uniqueness from the visual UI components (Gallery, PhotoCard).
 * 3. Atomic Updates & Duplicate Protection: Guarantees that favourites cannot contain duplicate 
 *    IDs and that updates remain immutable without subtle mutation bugs.
 * 4. Extensibility & Testability: Reducer actions can be tested independently with mock state
 *    and payloads without requiring a browser or React component environment.
 */

export const FAVOURITES_ACTION_TYPES = {
  TOGGLE_FAVOURITE: 'TOGGLE_FAVOURITE',
  LOAD_FAVOURITES: 'LOAD_FAVOURITES',
};

export const FAVOURITES_STORAGE_KEY = 'celebrare_photo_gallery_favourites';

export const initialFavouritesState = {
  favourites: [], // Array of favourite photo objects: [{ id, author, download_url, ... }]
};

/**
 * Lazy initializer for useReducer.
 * Synchronously retrieves and parses favourites from localStorage during component initialization.
 * This prevents the common race condition where an empty initial state [] overwrites
 * existing persisted data before an asynchronous or delayed effect can load it.
 *
 * @param {object} initialState 
 * @returns {object} Initial state populated with persisted favourites if available
 */
export function initFavourites(initialState = initialFavouritesState) {
  if (typeof window === 'undefined') {
    return initialState;
  }

  try {
    const rawData = window.localStorage.getItem(FAVOURITES_STORAGE_KEY);
    if (!rawData) {
      return initialState;
    }

    const parsedData = JSON.parse(rawData);

    // Validate that the persisted data is an array
    if (Array.isArray(parsedData)) {
      // Deduplicate entries defensively by photo ID
      const seenIds = new Set();
      const validFavourites = [];

      for (const item of parsedData) {
        if (item && item.id !== undefined && item.id !== null) {
          const idString = String(item.id);
          if (!seenIds.has(idString)) {
            seenIds.add(idString);
            validFavourites.push(item);
          }
        }
      }

      return { favourites: validFavourites };
    }
  } catch (error) {
    // Gracefully handle malformed JSON or restricted storage access
    console.warn('Unable to load favourites from localStorage. Initializing with empty state.', error);
  }

  return initialState;
}

/**
 * Favourites Reducer function
 * 
 * @param {object} state Current favourites state
 * @param {object} action Action object containing type and payload
 * @returns {object} New state
 */
export function favouritesReducer(state, action) {
  switch (action.type) {
    case FAVOURITES_ACTION_TYPES.TOGGLE_FAVOURITE: {
      const photo = action.payload;

      // Guard against invalid payload
      if (!photo || photo.id === undefined || photo.id === null) {
        return state;
      }

      const photoId = String(photo.id);
      const isAlreadyFavourite = state.favourites.some(
        (fav) => String(fav.id) === photoId
      );

      // If already favourite, remove it; otherwise append it to the favourites array
      const updatedFavourites = isAlreadyFavourite
        ? state.favourites.filter((fav) => String(fav.id) !== photoId)
        : [...state.favourites, photo];

      return {
        ...state,
        favourites: updatedFavourites,
      };
    }

    case FAVOURITES_ACTION_TYPES.LOAD_FAVOURITES: {
      const loadedList = action.payload;

      // Guard: must be an array
      if (!Array.isArray(loadedList)) {
        return state;
      }

      // Defensive deduplication to ensure unique IDs
      const seenIds = new Set();
      const sanitizedList = [];

      for (const item of loadedList) {
        if (item && item.id !== undefined && item.id !== null) {
          const idString = String(item.id);
          if (!seenIds.has(idString)) {
            seenIds.add(idString);
            sanitizedList.push(item);
          }
        }
      }

      return {
        ...state,
        favourites: sanitizedList,
      };
    }

    default:
      return state;
  }
}
