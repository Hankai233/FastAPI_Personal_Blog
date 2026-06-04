"use client";

import { useEffect, useState } from "react";
import { tagsApi, adminTagsApi } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Tag } from "@/types";

export default function AdminTagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editSlug, setEditSlug] = useState("");

  const loadTags = async () => {
    const data = await tagsApi.list();
    setTags(data);
  };

  useEffect(() => { loadTags(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !slug) return;
    try {
      await adminTagsApi.create({ name, slug });
      setName(""); setSlug("");
      loadTags();
    } catch (e) {
      alert(e instanceof Error ? e.message : "创建失败");
    }
  };

  const handleUpdate = async (id: number) => {
    try {
      await adminTagsApi.update(id, { name: editName, slug: editSlug });
      setEditingId(null);
      loadTags();
    } catch (e) {
      alert(e instanceof Error ? e.message : "更新失败");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("确认删除?")) return;
    try {
      await adminTagsApi.delete(id);
      loadTags();
    } catch (e) {
      alert(e instanceof Error ? e.message : "删除失败");
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">标签管理</h2>
      <form onSubmit={handleCreate} className="mb-6 flex gap-2">
        <Input
          placeholder="标签名"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="max-w-xs"
        />
        <Input
          placeholder="slug"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          className="max-w-xs"
        />
        <Button type="submit">添加</Button>
      </form>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>名称</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead>操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tags.map((tag) => (
            <TableRow key={tag.id}>
              <TableCell>{tag.id}</TableCell>
              <TableCell>
                {editingId === tag.id ? (
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="max-w-32"
                  />
                ) : (
                  tag.name
                )}
              </TableCell>
              <TableCell>
                {editingId === tag.id ? (
                  <Input
                    value={editSlug}
                    onChange={(e) => setEditSlug(e.target.value)}
                    className="max-w-32"
                  />
                ) : (
                  tag.slug
                )}
              </TableCell>
              <TableCell className="flex gap-2">
                {editingId === tag.id ? (
                  <>
                    <Button size="sm" onClick={() => handleUpdate(tag.id)}>保存</Button>
                    <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>取消</Button>
                  </>
                ) : (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingId(tag.id);
                        setEditName(tag.name);
                        setEditSlug(tag.slug);
                      }}
                    >
                      编辑
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(tag.id)}>
                      删除
                    </Button>
                  </>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
