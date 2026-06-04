"use client";

import { useState, useEffect } from "react";
import { commentsApi } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Comment } from "@/types";

export default function CommentSection({ postSlug }: { postSlug: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [authorName, setAuthorName] = useState("");
  const [authorEmail, setAuthorEmail] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const loadComments = async () => {
    try {
      const data = await commentsApi.list(postSlug);
      setComments(data);
    } catch {
      // silently fail
    }
  };

  useEffect(() => { loadComments(); }, [postSlug]);

  const handleSubmit = async () => {
    if (!authorName || !authorEmail || !content) return;
    setSubmitting(true);
    try {
      await commentsApi.create(postSlug, {
        author_name: authorName,
        author_email: authorEmail,
        content,
      });
      setAuthorName("");
      setAuthorEmail("");
      setContent("");
      setMessage("评论已提交，等待审核");
      loadComments();
    } catch (e: unknown) {
      setMessage(e instanceof Error ? e.message : "提交失败");
    } finally {
      setSubmitting(false);
    }
  };

  const renderComment = (comment: Comment) => (
    <div key={comment.id} className="border-b py-4 last:border-b-0">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <span className="font-medium text-gray-900">{comment.author_name}</span>
        <span>·</span>
        <time>{new Date(comment.created_at).toLocaleDateString("zh-CN")}</time>
      </div>
      <p className="mt-2 text-gray-700">{comment.content}</p>
      {comment.replies?.length > 0 && (
        <div className="ml-6 mt-2 border-l-2 border-gray-100 pl-4">
          {comment.replies.map(renderComment)}
        </div>
      )}
    </div>
  );

  return (
    <section className="mt-12">
      <h3 className="text-xl font-bold mb-6">评论 ({comments.length})</h3>
      <div className="space-y-1">{comments.map(renderComment)}</div>

      <div className="mt-8 rounded-lg border bg-gray-50 p-6">
        <h4 className="font-semibold mb-4">发表评论</h4>
        {message && (
          <p className={`mb-4 text-sm ${message.includes("失败") ? "text-red-600" : "text-green-600"}`}>
            {message}
          </p>
        )}
        <div className="flex gap-4 mb-4">
          <Input
            placeholder="昵称"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
          />
          <Input
            type="email"
            placeholder="邮箱（不公开）"
            value={authorEmail}
            onChange={(e) => setAuthorEmail(e.target.value)}
          />
        </div>
        <Textarea
          placeholder="写下你的评论..."
          rows={4}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="mb-4"
        />
        <Button onClick={handleSubmit} disabled={submitting}>
          {submitting ? "提交中..." : "提交评论"}
        </Button>
      </div>
    </section>
  );
}
