"use client";

import { ReactNode } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { SearchProvider, useSearch } from "./SearchProvider";

function MainContent({ children }: { children: ReactNode }) {
  const { searchOpen } = useSearch();

  return (
    <main
      className={`mx-auto max-w-6xl px-4 py-8 min-h-[60vh] transition-all duration-300 ${
        searchOpen ? "blur-sm pointer-events-none select-none" : ""
      }`}
      aria-hidden={searchOpen}
    >
      {children}
    </main>
  );
}

export default function BodyWrapper({ children }: { children: ReactNode }) {
  return (
    <SearchProvider>
      <Navbar />
      <MainContent>{children}</MainContent>
      <Footer />
    </SearchProvider>
  );
}
