"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { adminPostsApi, postsApi, tagsApi } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import MarkdownEditor from "@/components/MarkdownEditor";
import type { Tag } from "@/types";

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams();
  const slugParam = params.slug as string;

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [contentMd, setContentMd] = useState("");
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [post, tags] = await Promise.all([
          // Note: public endpoint only returns published posts;
          // for editing drafts, we need admin endpoint to be added to backend
          postsApi.getBySlug(slugParam),
          tagsApi.list(),
        ]);
        setTitle(post.title);
        setSlug(post.slug);
        setContentMd(post.content_html);
        setStatus(post.status as "draft" | "published");
        setSelectedTags(post.tags.map((t) => t.id));
        setAllTags(tags);
      } catch (err) {
        console.error("Failed to load post:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slugParam]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminPostsApi.update(slugParam, {
        title,
        slug: slug !== slugParam ? slug : null,
        content_md: contentMd,
        status,
        tag_ids: selectedTags,
      });
      router.push("/admin/posts");
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "保存失败");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>加载中...</p>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">编辑文章</h2>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-3xl">
        <Input placeholder="标题" value={title} onChange={(e) => setTitle(e.target.value)} />
        <Input placeholder="slug" value={slug} onChange={(e) => setSlug(e.target.value)} />
        <div className="flex items-center gap-4 flex-wrap">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as "draft" | "published")}
            className="rounded-md border px-3 py-2 text-sm"
          >
            <option value="draft">草稿</option>
            <option value="published">发布</option>
          </select>
          <div className="flex flex-wrap gap-2">
            {allTags.map((tag) => (
              <label key={tag.id} className="flex items-center gap-1 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedTags.includes(tag.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedTags([...selectedTags, tag.id]);
                    } else {
                      setSelectedTags(selectedTags.filter((id) => id !== tag.id));
                    }
                  }}
                />
                {tag.name}
              </label>
            ))}
          </div>
        </div>
        <MarkdownEditor value={contentMd} onChange={setContentMd} />
        <Button type="submit" disabled={saving}>
          {saving ? "保存中..." : "保存"}
        </Button>
      </form>
    </div>
  );
}
