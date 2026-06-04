"use client";

import { Search } from "lucide-react";
import { useSearch } from "./SearchProvider";

export default function SearchBar() {
  const { openSearch } = useSearch();

  return (
    <button
      onClick={openSearch}
      className="inline-flex items-center gap-2 rounded-full border px-4 py-2
                 text-sm text-gray-500 hover:border-gray-400 hover:text-gray-700 transition-colors"
      aria-label="打开搜索"
    >
      <Search className="h-4 w-4" />
      <span className="hidden sm:inline">搜索文章...</span>
    </button>
  );
}
