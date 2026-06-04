"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import SearchOverlay from "./SearchOverlay";

interface SearchContextType {
  searchOpen: boolean;
  openSearch: () => void;
  closeSearch: () => void;
}

const SearchContext = createContext<SearchContextType>({
  searchOpen: false,
  openSearch: () => {},
  closeSearch: () => {},
});

export const useSearch = () => useContext(SearchContext);

export function SearchProvider({ children }: { children: ReactNode }) {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <SearchContext.Provider
      value={{
        searchOpen,
        openSearch: () => setSearchOpen(true),
        closeSearch: () => setSearchOpen(false),
      }}
    >
      {children}
      {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} />}
    </SearchContext.Provider>
  );
}
