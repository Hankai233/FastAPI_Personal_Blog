"use client";

import { useEffect, useState } from "react";
import { adminPostsApi, tagsApi, adminCommentsApi } from "@/lib/api-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ posts: 0, tags: 0, pending: 0 });

  useEffect(() => {
    async function loadStats() {
      const [postsData, tags, pending] = await Promise.all([
        adminPostsApi.list({ page_size: "1" as unknown as number }).catch(() => ({ total: 0, data: [], page: 1, page_size: 10 })),
        tagsApi.list().catch(() => []),
        adminCommentsApi.listPending().catch(() => []),
      ]);
      setStats({
        posts: postsData.total,
        tags: tags.length,
        pending: pending.length,
      });
    }
    loadStats();
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">仪表盘</h2>
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader><CardTitle className="text-lg">文章数</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold">{stats.posts}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-lg">标签数</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold">{stats.tags}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-lg">待审核评论</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold">{stats.pending}</p></CardContent>
        </Card>
      </div>
    </div>
  );
}
