"use client";

import Link from "next/link";
import SearchBar from "./SearchBar";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-xl font-bold text-gray-900">
          My Blog
        </Link>
        <div className="flex items-center gap-4">
          <SearchBar />
        </div>
      </div>
    </header>
  );
}
