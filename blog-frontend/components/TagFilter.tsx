"use client";

import Link from "next/link";
import type { Tag } from "@/types";

interface Props {
  tags: Tag[];
  currentTag?: string;
}

export default function TagFilter({ tags, currentTag }: Props) {
  return (
    <div className="mb-6 flex flex-wrap items-center gap-2">
      <Link
        href="/"
        className={`rounded-full px-3 py-1 text-sm ${
          !currentTag
            ? "bg-blue-600 text-white"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
        }`}
      >
        全部
      </Link>
      {tags.map((tag) => (
        <Link
          key={tag.id}
          href={`/tags/${tag.slug}`}
          className={`rounded-full px-3 py-1 text-sm ${
            currentTag === tag.slug
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          {tag.name}
        </Link>
      ))}
    </div>
  );
}
