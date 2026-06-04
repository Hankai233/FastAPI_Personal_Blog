import Link from "next/link";
import type { Tag } from "@/types";

export default function TagBadge({ tag }: { tag: Tag }) {
  return (
    <Link
      href={`/tags/${tag.slug}`}
      className="inline-block rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-200 transition-colors"
    >
      {tag.name}
    </Link>
  );
}
