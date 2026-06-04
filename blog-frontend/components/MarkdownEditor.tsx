"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import MarkdownRenderer from "./MarkdownRenderer";

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export default function MarkdownEditor({ value, onChange }: Props) {
  const [preview, setPreview] = useState(false);

  return (
    <div>
      <div className="mb-2 flex gap-2">
        <Button
          type="button"
          variant={preview ? "outline" : "default"}
          size="sm"
          onClick={() => setPreview(false)}
        >
          编辑
        </Button>
        <Button
          type="button"
          variant={preview ? "default" : "outline"}
          size="sm"
          onClick={() => setPreview(true)}
        >
          预览
        </Button>
      </div>
      {preview ? (
        <div className="min-h-[400px] rounded-lg border p-6 bg-white">
          <MarkdownRenderer content={value} />
        </div>
      ) : (
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Markdown 内容..."
          rows={20}
          className="font-mono"
        />
      )}
    </div>
  );
}
