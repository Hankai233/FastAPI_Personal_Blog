"use client";

import { useRouter } from "next/navigation";
import type { PostListItem } from "@/types";
import TagBadge from "./TagBadge";

export default function PostCard({ post }: { post: PostListItem }) {
  const router = useRouter();

  return (
    <article
      onClick={() => router.push(`/posts/${post.slug}`)}
      className="rounded-lg border bg-white p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
    >
      <h2 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
        {post.title}
      </h2>
      {post.excerpt && (
        <p className="mt-2 text-gray-600 line-clamp-3">{post.excerpt}</p>
      )}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {post.tags.map((tag) => (
          <TagBadge key={tag.id} tag={tag} />
        ))}
      </div>
      <time className="mt-3 block text-sm text-gray-400">
        {post.published_at
          ? new Date(post.published_at).toLocaleDateString("zh-CN", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })
          : ""}
      </time>
    </article>
  );
}
