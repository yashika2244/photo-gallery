# Curated Photo Gallery — Celebrare Frontend React Internship Assignment

A modern, polished, responsive Photo Gallery web application built with **React**, **Vite**, and **Tailwind CSS**. The application fetches 30 curated photographs from the Picsum Photos API, displays them across responsive viewport breakpoints, supports instant real-time author-name filtering, and allows bookmarking favourites that persist across browser sessions using `localStorage`.

---

## 🌟 Features & Highlights

- **API Integration**: Fetches exactly 30 photos on initial mount via the custom `useFetchPhotos` hook from `https://picsum.photos/v2/list?limit=30`.
- **Responsive Layout**: Fluid CSS Grid conforming to exact specifications:
  - **Mobile (<640px)**: 1 column
  - **Tablet (640px – 1023px)**: 2 columns
  - **Desktop (≥1024px)**: 4 columns
- **Real-Time Author Search**: Fast, case-insensitive, whitespace-trimmed in-memory search filtering with zero redundant network requests.
- **Persistent Favourites State**: Managed cleanly using React's `useReducer` and synchronized with browser `localStorage`.
- **No Race Conditions**: Implements lazy state initialization (`initFavourites`) preventing initial empty array overwrites on reload.
- **Accessible & Minimal**: Pure semantic HTML5, inline SVG icons (no external icon libraries), descriptive ARIA labels, and keyboard focus states.

---

## 🛠️ Technology Stack

- **Framework**: [React 19](https://react.dev/) (Functional components with hooks)
- **Build Tool**: [Vite 8](https://vite.dev/)
- **Styling**: [Tailwind CSS v3](https://tailwindcss.com/) with PostCSS and Autoprefixer
- **State Management**: React `useReducer`, `useState`, `useCallback`, `useMemo`, and `useEffect`
- **Data Fetching**: Native Fetch API with `AbortController` cleanup
- **Persistence**: Browser `localStorage` API with defensive validation
- **Zero Prohibited Libraries**: No Material UI, Bootstrap, Ant Design, Redux, Zustand, or Lucide React.

---

## 📁 Project Architecture

```
photo-gallery/
├── public/
│   └── favicon.svg              # SVG camera favicon
├── src/
│   ├── components/
│   │   ├── Gallery.jsx          # Main gallery view, search input & status orchestration
│   │   └── PhotoCard.jsx        # Reusable card with image, photographer name & heart button
│   ├── hooks/
│   │   └── useFetchPhotos.js    # Custom hook encapsulating API fetching, loading & errors
│   ├── reducers/
│   │   └── favouritesReducer.js # Pure reducer, action types & lazy initializer for favourites
│   ├── App.jsx                  # Top-level shell layout with header, main container & footer
│   ├── index.css                # Tailwind directives & base design styles
│   └── main.jsx                 # Application entry point mounting to root
├── index.html                   # HTML template with SEO meta tags & Inter typography
├── package.json                 # Minimal dependencies and build/lint scripts
├── tailwind.config.js           # Tailwind configuration
├── postcss.config.js            # PostCSS configuration
├── README.md                    # Project documentation & manual testing checklist
└── RECORDING_GUIDE.md           # 5-minute video walkthrough guide and speaking script
```

---

## 🚀 Installation & Local Development

### Prerequisites
- Node.js (v18 or higher recommended; developed and tested on Node v24)
- npm (v9 or higher)

### Setup Instructions

1. **Clone or navigate into the workspace:**
   ```bash
   cd photo-gallery
   ```

2. **Install project dependencies:**
   ```bash
   npm install
   ```

3. **Start the local development server:**
   ```bash
   npm run dev
   ```
   Open your browser and navigate to `http://127.0.0.1:5173/`.

4. **Run code quality linting:**
   ```bash
   npm run lint
   ```

5. **Build for production:**
   ```bash
   npm run build
   ```

---

## 🧠 Architectural & Technical Implementation Details

### 1. Custom Hook: `useFetchPhotos` (`src/hooks/useFetchPhotos.js`)
- Encapsulates network operations using the native Fetch API.
- Implements `AbortController` in the `useEffect` cleanup return to cancel in-flight requests if unmounted.
- Strictly returns `{ photos, loading, error }`.
- Checks `response.ok` before JSON parsing and validates that the payload is an array.
- Ensures `loading` returns to `false` regardless of success or error.
- Never re-fetches when users type into the search bar.

### 2. State Management: `favouritesReducer` (`src/reducers/favouritesReducer.js`)
**Why `useReducer`?**
- **Centralized Logic**: Managing favourites involves complex logic: toggling membership, checking uniqueness, and hydrating bulk records from `localStorage`. A reducer keeps this logic pure, predictable, and isolated from UI components.
- **Single Source of Truth**: State transitions happen explicitly through documented actions (`TOGGLE_FAVOURITE` and `LOAD_FAVOURITES`).
- **Defensive Deduplication**: Both adding and bulk-loading sanitize inputs and deduplicate IDs.

### 3. Preventing LocalStorage Race Conditions
A common pitfall with `localStorage` and `useEffect` is initializing state with `[]` and immediately writing `[]` back to storage on mount before saved items are loaded.
We solve this using **lazy initialization** in `useReducer`:
```javascript
const [favouritesState, dispatchFavourites] = useReducer(
  favouritesReducer,
  initialFavouritesState,
  initFavourites // Runs synchronously before the first render!
);
```
`initFavourites` synchronously parses `localStorage` upon mount. When the persistence `useEffect` runs, it writes back the already-restored favourites, completely eliminating the blank overwrite bug.

### 4. Meaningful Usage of `useCallback` and `useMemo`
- **`useCallback` on `handleSearchChange`**:
  Wraps the input change handler with an empty dependency array `[]`. This preserves the function reference between renders so downstream components or effects do not re-trigger unnecessarily.
- **`useMemo` on `filteredPhotos`**:
  Computes the filtered list from `[photos, searchQuery]`. Avoids re-filtering an array of 30 objects on unrelated renders (such as when the user toggles a favourite or window resizes).
- **`useMemo` on `favouriteIdsSet`**:
  Builds a `Set` of favourite IDs so that every photo card performs an $O(1)$ constant-time lookup rather than an $O(N)$ linear scan.

---

## ✅ Manual Testing Checklist

| Test Item | Action | Expected Result | Pass? |
|-----------|--------|-----------------|-------|
| **Initial Load** | Open `http://127.0.0.1:5173/` | Centered spinner appears, then 30 cards render with photos and author names. Status says "Showing 30 of 30 photos". | ✅ |
| **Favourite Toggle** | Click the heart icon on any photo card | Heart immediately turns red/filled. Status indicates "1 favourite saved". | ✅ |
| **Unfavourite** | Click the filled heart icon again | Heart immediately reverts to outlined state. Status updates count. | ✅ |
| **Real-Time Search** | Type "Alejandro" in the search box | Grid instantly updates to only show photos by Alejandro. Favourited cards maintain their red heart state. | ✅ |
| **Case Insensitivity** | Type "aLeJaNdRo" | Matches identically to lowercase or uppercase. | ✅ |
| **Whitespace Trim** | Type "  Alejandro   " | Trims leading and trailing spaces without breaking matches. | ✅ |
| **Empty Search State** | Type "unknownartistxyz" | "No photos found for this author" message appears with a "Clear Search" button. | ✅ |
| **Reset Search** | Click "Clear Search" button | Search query clears and all 30 photos reappear immediately. | ✅ |
| **Storage Persistence** | Favourite 2 photos and refresh the browser | Both photos remain favourited upon page reload. | ✅ |
| **Storage Resilience** | Set `localStorage` key to `"{invalid_json"` in DevTools and refresh | App catches the syntax error gracefully and starts with empty favourites instead of crashing. | ✅ |
| **Responsive 1-Col** | Resize viewport to <640px (Mobile) | Grid renders exactly 1 column with no horizontal scrollbar. | ✅ |
| **Responsive 2-Col** | Resize viewport to 768px (Tablet) | Grid renders exactly 2 columns. | ✅ |
| **Responsive 4-Col** | Resize viewport to 1280px (Desktop) | Grid renders exactly 4 columns. | ✅ |
