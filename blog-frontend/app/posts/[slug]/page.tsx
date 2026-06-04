import Link from "next/link";
import { notFound } from "next/navigation";
import { postsApi } from "@/lib/api-client";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import CommentSection from "@/components/CommentSection";
import TagBadge from "@/components/TagBadge";
import ArticleSidebar from "@/components/ArticleSidebar";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;

  let post;
  try {
    post = await postsApi.getBySlug(slug);
  } catch {
    notFound();
  }

  return (
    <div>
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 transition-colors mb-6"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        返回首页
      </Link>

      <div className="flex gap-8">
        {/* Main content */}
        <article className="flex-1 min-w-0">
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">{post.title}</h1>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {post.tags.map((tag) => (
                <TagBadge key={tag.id} tag={tag} />
              ))}
            </div>
            {post.published_at && (
              <time className="mt-2 block text-sm text-gray-400">
                发布于{" "}
                {new Date(post.published_at).toLocaleDateString("zh-CN", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
            )}
          </header>

          <MarkdownRenderer content={post.content_html} />

          <CommentSection postSlug={slug} />
        </article>

        {/* Sidebar */}
        <div className="hidden lg:block w-72 shrink-0">
          <div className="sticky top-20">
            <ArticleSidebar />
          </div>
        </div>
      </div>
    </div>
  );
}
