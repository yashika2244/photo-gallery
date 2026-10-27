import React, { useState } from 'react';

/**
 * PhotoCard Component

 * @param {object} props
 * @param {object} props.photo - Photo object from the Picsum API ({ id, author, download_url, ... })
 * @param {boolean} props.isFavourite - Whether this photo is currently favourited
 * @param {Function} props.onToggleFavourite - Callback when the favourite button is toggled
 */
export function PhotoCard({ photo, isFavourite, onToggleFavourite }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Optimized Picsum image URL based on photo ID for fast loading and uniform dimensions
  // Falls back to download_url if ID is absent
  const imageUrl = photo.id
    ? `https://picsum.photos/id/${photo.id}/600/450`
    : photo.download_url;

  return (
    <article
      id={`photo-card-${photo.id}`}
      className="group relative flex flex-col bg-white rounded-2xl border border-slate-200/90 shadow-[0_2px_8px_-2px_rgba(15,23,42,0.06)] hover:shadow-[0_12px_24px_-4px_rgba(15,23,42,0.1)] hover:border-slate-300 transition-all duration-300 overflow-hidden"
    >
      {/* Photo Container with fixed 4:3 Aspect Ratio */}
      <div className="relative aspect-[4/3] w-full bg-slate-100 overflow-hidden">
        {/* Subtle Loading Placeholder shimmer until image is ready */}
        {!imageLoaded && !imageError && (
          <div
            className="absolute inset-0 bg-gradient-to-r from-slate-100 via-slate-200/60 to-slate-100 animate-pulse"
            aria-hidden="true"
          />
        )}

        {/* Graceful image error fallback */}
        {imageError ? (
          <div className="w-full h-full bg-slate-50 flex flex-col items-center justify-center p-4 text-center">
            <svg
              className="w-8 h-8 text-slate-300 mb-1"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
              <circle cx="9" cy="9" r="2" />
              <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
            </svg>
            <span className="text-xs text-slate-400 font-medium">Image unavailable</span>
          </div>
        ) : (
          <img
            src={imageUrl}
            alt={`Photo by ${photo.author}`}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            className={`w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        )}

        {/* Circular Heart Button Over Upper-Right Corner of Image */}
        <button
          type="button"
          id={`favourite-btn-${photo.id}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavourite(photo);
          }}
          aria-label={
            isFavourite
              ? `Remove photo by ${photo.author} from favourites`
              : `Add photo by ${photo.author} to favourites`
          }
          aria-pressed={isFavourite}
          className={`absolute top-3 right-3 z-10 w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-md transition-all duration-200 cursor-pointer select-none focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 ${
            isFavourite
              ? 'bg-white/95 text-rose-500 hover:bg-white hover:scale-110 active:scale-95 shadow-[0_2px_8px_rgba(244,63,94,0.25)] border border-rose-100'
              : 'bg-white/85 text-slate-700 hover:text-slate-900 hover:bg-white hover:scale-110 active:scale-95 shadow-[0_2px_6px_rgba(15,23,42,0.12)] border border-white/80'
          }`}
        >
          {/* Inline SVG Heart Icon - Navy/gray outlined for non-favourites, Filled red/pink for favourites */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className={`w-4 h-4 pointer-events-none transition-colors duration-200 ${
              isFavourite
                ? 'fill-rose-500 stroke-rose-500'
                : 'fill-none stroke-slate-700'
            }`}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
          </svg>
        </button>
      </div>

      {/* Clean White Card Footer Containing Photographer Label & Author Name */}
      <div className="px-4 py-3.5 bg-white flex flex-col justify-center">
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider leading-none mb-1">
          Photographer
        </p>
        <h3
          className="text-sm font-semibold text-slate-900 truncate leading-snug"
          title={photo.author}
        >
          {photo.author}
        </h3>
      </div>
    </article>
  );
}

export default PhotoCard;
