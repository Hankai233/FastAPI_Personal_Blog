"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiGet } from "@/lib/api";
import { postsApi } from "@/lib/api-client";
import type { Tag, PostListItem } from "@/types";

interface PopularTag {
  id: number;
  name: string;
  slug: string;
  post_count: number;
}

interface TimelineItem {
  year: number;
  month: number;
  title: string;
  slug: string;
}

export default function ArticleSidebar() {
  const [popularTags, setPopularTags] = useState<PopularTag[]>([]);
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);

  useEffect(() => {
    // Load popular tags
    apiGet<PopularTag[]>("/tags/popular", { limit: "10" })
      .then(setPopularTags)
      .catch(() => {});

    // Load posts for timeline
    postsApi
      .list({ page_size: 50 })
      .then((data) => {
        const items: TimelineItem[] = data.data.map((p: PostListItem) => ({
          year: new Date(p.published_at || p.created_at).getFullYear(),
          month: new Date(p.published_at || p.created_at).getMonth() + 1,
          title: p.title,
          slug: p.slug,
        }));
        setTimeline(items.slice(0, 20));
      })
      .catch(() => {});
  }, []);

  // Group timeline by year-month
  const groupedTimeline = timeline.reduce(
    (acc, item) => {
      const key = `${item.year}-${String(item.month).padStart(2, "0")}`;
      if (!acc[key]) acc[key] = { year: item.year, month: item.month, posts: [] };
      acc[key].posts.push(item);
      return acc;
    },
    {} as Record<string, { year: number; month: number; posts: TimelineItem[] }>
  );

  return (
    <aside className="space-y-8">
      {/* Author Info */}
      <div className="rounded-lg border bg-white p-5">
        <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">关于作者</h3>
        <p className="text-sm text-gray-600 mb-3">
          全栈开发者，热爱 Python、FastAPI 和开源技术。
        </p>
        <div className="space-y-2 text-sm">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            GitHub
          </a>
          <a
            href="mailto:admin@blog.local"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Email
          </a>
        </div>
      </div>

      {/* Popular Tags */}
      {popularTags.length > 0 && (
        <div className="rounded-lg border bg-white p-5">
          <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wide">
            热门标签
          </h3>
          <div className="space-y-2">
            {popularTags.map((tag) => (
              <Link
                key={tag.id}
                href={`/tags/${tag.slug}`}
                className="flex items-center justify-between text-sm text-gray-600 hover:text-blue-600 transition-colors py-0.5"
              >
                <span>{tag.name}</span>
                <span className="text-xs text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">
                  {tag.post_count}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Timeline */}
      {timeline.length > 0 && (
        <div className="rounded-lg border bg-white p-5">
          <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wide">时间线</h3>
          <div className="space-y-4">
            {Object.entries(groupedTimeline)
              .sort((a, b) => b[0].localeCompare(a[0]))
              .slice(0, 12)
              .map(([key, group]) => (
                <div key={key}>
                  <h4 className="text-xs font-semibold text-gray-400 mb-2">
                    {group.year} 年 {group.month} 月
                  </h4>
                  <ul className="space-y-1">
                    {group.posts.map((post) => (
                      <li key={post.slug}>
                        <Link
                          href={`/posts/${post.slug}`}
                          className="text-sm text-gray-600 hover:text-blue-600 transition-colors line-clamp-1"
                        >
                          {post.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
          </div>
        </div>
      )}
    </aside>
  );
}
