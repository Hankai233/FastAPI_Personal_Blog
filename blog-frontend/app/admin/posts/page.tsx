"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { adminPostsApi } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import type { PostListItem } from "@/types";

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<PostListItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPosts = async () => {
    try {
      const data = await adminPostsApi.list({ page_size: "50" as unknown as number });
      setPosts(data.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadPosts(); }, []);

  const handleDelete = async (slug: string) => {
    if (!confirm("确认删除?")) return;
    try {
      await adminPostsApi.delete(slug);
      setPosts((prev) => prev.filter((p) => p.slug !== slug));
    } catch (e) {
      alert(e instanceof Error ? e.message : "删除失败");
    }
  };

  if (loading) return <p>加载中...</p>;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">文章管理</h2>
        <Link href="/admin/posts/new">
          <Button>+ 新建文章</Button>
        </Link>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>标题</TableHead>
            <TableHead>状态</TableHead>
            <TableHead>发布时间</TableHead>
            <TableHead>操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {posts.map((post) => (
            <TableRow key={post.id}>
              <TableCell className="font-medium">{post.title}</TableCell>
              <TableCell>
                <Badge variant={post.status === "published" ? "default" : "secondary"}>
                  {post.status === "published" ? "已发布" : "草稿"}
                </Badge>
              </TableCell>
              <TableCell className="text-sm text-gray-500">
                {post.published_at
                  ? new Date(post.published_at).toLocaleDateString("zh-CN")
                  : "-"}
              </TableCell>
              <TableCell className="flex gap-2">
                <Link href={`/admin/posts/${post.slug}/edit`}>
                  <Button variant="outline" size="sm">编辑</Button>
                </Link>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(post.slug)}
                >
                  删除
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
