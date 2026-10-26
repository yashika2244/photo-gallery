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

  // Optimized Picsum image URL based on photo ID for fast loading and uniform dimensions
  // Falls back to download_url if ID is absent
  const imageUrl = photo.id
    ? `https://picsum.photos/id/${photo.id}/600/450`
    : photo.download_url;

  return (
    <article
      id={`photo-card-${photo.id}`}
      className="group relative flex flex-col bg-white rounded-2xl border border-slate-200/80 shadow-[0_2px_8px_-2px_rgba(15,23,42,0.06)] hover:shadow-[0_8px_20px_-4px_rgba(15,23,42,0.08)] hover:border-slate-300/80 transition-all duration-300 overflow-hidden"
    >
      {/* Photo Container with fixed 4:3 Aspect Ratio */}
      <div className="relative aspect-[4/3] w-full bg-slate-100 overflow-hidden">
        {/* Subtle Loading Placeholder shimmer until image is ready */}
        {!imageLoaded && (
          <div
            className="absolute inset-0 bg-gradient-to-r from-slate-100 via-slate-200/60 to-slate-100 animate-pulse"
            aria-hidden="true"
          />
        )}

        <img
          src={imageUrl}
          alt={`Photo by ${photo.author}`}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          className={`w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03] ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      </div>

      {/* Card Details & Action Bar */}
      <div className="p-4 flex items-center justify-between gap-3 bg-white">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">
            Photographer
          </p>
          <h3
            className="text-sm font-semibold text-slate-800 truncate"
            title={photo.author}
          >
            {photo.author}
          </h3>
        </div>

        {/* Heart Favourite Button */}
        <button
          type="button"
          id={`favourite-btn-${photo.id}`}
          onClick={() => onToggleFavourite(photo)}
          aria-label={
            isFavourite
              ? `Remove photo by ${photo.author} from favourites`
              : `Add photo by ${photo.author} to favourites`
          }
          aria-pressed={isFavourite}
          className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer select-none focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2 ${
            isFavourite
              ? 'text-rose-500 bg-rose-50 hover:bg-rose-100 hover:scale-105 active:scale-95'
              : 'text-slate-400 bg-slate-50 hover:text-rose-500 hover:bg-rose-50/80 hover:scale-105 active:scale-95'
          }`}
        >
          {/* Inline SVG Heart Icon - Outlined for non-favourites, Filled for favourites */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className={`w-4 h-4 pointer-events-none transition-colors duration-200 ${
              isFavourite
                ? 'fill-rose-500 stroke-rose-500'
                : 'fill-none stroke-current'
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
    </article>
  );
}

export default PhotoCard;
