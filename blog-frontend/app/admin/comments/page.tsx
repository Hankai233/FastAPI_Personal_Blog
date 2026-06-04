"use client";

import { useEffect, useState } from "react";
import { adminCommentsApi } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Comment } from "@/types";

export default function AdminCommentsPage() {
  const [comments, setComments] = useState<Comment[]>([]);

  const loadComments = async () => {
    const data = await adminCommentsApi.listPending();
    setComments(data);
  };

  useEffect(() => { loadComments(); }, []);

  const handleApprove = async (id: number) => {
    try {
      await adminCommentsApi.approve(id);
      loadComments();
    } catch (e) {
      alert(e instanceof Error ? e.message : "操作失败");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("确认删除?")) return;
    try {
      await adminCommentsApi.delete(id);
      loadComments();
    } catch (e) {
      alert(e instanceof Error ? e.message : "删除失败");
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">评论审核</h2>
      {comments.length === 0 ? (
        <p className="text-gray-500">暂无待审核评论</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>作者</TableHead>
              <TableHead>内容</TableHead>
              <TableHead>时间</TableHead>
              <TableHead>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {comments.map((comment) => (
              <TableRow key={comment.id}>
                <TableCell className="font-medium">{comment.author_name}</TableCell>
                <TableCell className="max-w-md truncate">{comment.content}</TableCell>
                <TableCell className="text-sm text-gray-500">
                  {new Date(comment.created_at).toLocaleDateString("zh-CN")}
                </TableCell>
                <TableCell className="flex gap-2">
                  <Button size="sm" onClick={() => handleApprove(comment.id)}>通过</Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(comment.id)}>
                    删除
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
