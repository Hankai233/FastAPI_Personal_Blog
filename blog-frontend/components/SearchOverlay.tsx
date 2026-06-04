"use client";

import { useState, useRef, useEffect } from "react";
import { Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { searchApi } from "@/lib/api-client";
import type { PostListItem } from "@/types";

interface Props {
  onClose: () => void;
}

export default function SearchOverlay({ onClose }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PostListItem[]>([]);
  const [closing, setClosing] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Exit animation: trigger CSS transition, unmount after 300ms
  const startClose = () => setClosing(true);
  useEffect(() => {
    if (closing) {
      const timer = setTimeout(onClose, 300);
      return () => clearTimeout(timer);
    }
  }, [closing, onClose]);

  // Auto-focus + Esc + lock background scroll (preserve scrollbar width)
  useEffect(() => {
    inputRef.current?.focus();
    const prevOverflow = document.body.style.overflow;
    const prevPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    document.body.style.paddingRight = `${scrollbarWidth}px`;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") startClose();
    };
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPaddingRight;
      document.removeEventListener("keydown", handleEsc);
    };
  }, []);

  const handleSearch = async (value: string) => {
    setQuery(value);
    if (!value.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const data = await searchApi.search(value, 1);
      setResults(data.data);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (slug: string) => {
    startClose();
    router.push(`/posts/${slug}`);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]"
      onClick={startClose}
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/40 backdrop-blur-sm
                    transition-opacity duration-300 ${
          closing ? "opacity-0" : "opacity-100"
        }`}
      />

      {/* Search dialog */}
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative z-10 w-full max-w-lg mx-4
                    transition-all duration-300 ${
          closing
            ? "opacity-0 translate-y-2 scale-95"
            : "opacity-100 translate-y-0 scale-100"
        }`}
      >
        <div className="relative rounded-xl bg-white shadow-2xl overflow-hidden">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="输入关键词搜索文章..."
            className="w-full py-4 pl-12 pr-12 text-lg bg-transparent
                       outline-none text-gray-900 placeholder:text-gray-400"
          />
          {query && (
            <button
              type="button"
              onClick={() => handleSearch("")}
              className="absolute right-4 top-1/2 -translate-y-1/2
                         text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="清除搜索"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Results */}
        {query && (
          <div className="mt-2 rounded-xl bg-white shadow-2xl overflow-hidden max-h-72 overflow-y-auto">
            {loading ? (
              <p className="px-5 py-4 text-sm text-gray-400 text-center">搜索中...</p>
            ) : results.length > 0 ? (
              results.map((post) => (
                <button
                  key={post.id}
                  onClick={() => handleSelect(post.slug)}
                  className="w-full text-left px-5 py-3 hover:bg-gray-50 border-b last:border-b-0 transition-colors"
                >
                  <div className="font-medium text-sm text-gray-900">{post.title}</div>
                  {post.excerpt && (
                    <div className="text-xs text-gray-500 mt-0.5 line-clamp-1">{post.excerpt}</div>
                  )}
                </button>
              ))
            ) : (
              <p className="px-5 py-4 text-sm text-gray-400 text-center">未找到相关文章</p>
            )}
          </div>
        )}

        <p className="mt-3 text-center text-sm text-white/70">
          按 Esc 关闭 · 输入即时搜索
        </p>
      </div>
    </div>
  );
}
