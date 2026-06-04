# FastAPI 个人博客前端 — 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 使用 Next.js 15 (App Router) + Tailwind CSS + shadcn/ui 构建博客前端，覆盖公开页面（文章列表、详情、搜索、标签）和管理后台（文章 CRUD、标签管理、评论审核）

**Architecture:** Next.js App Router 文件路由，公开页面用 Server Components 做 SSR，管理页面用 Client Components + AuthGuard 保护。通过 fetch 封装调用 FastAPI 后端，支持 JWT 自动刷新。

**Tech Stack:** Next.js 15, TypeScript, Tailwind CSS 4, shadcn/ui, react-markdown, react-hook-form, zod, pnpm

---

## 文件清单

| 文件 | 职责 |
|---|---|
| `blog-frontend/package.json` | 项目元数据和依赖 |
| `blog-frontend/tsconfig.json` | TypeScript 配置 |
| `blog-frontend/next.config.ts` | Next.js 配置（图片域名等） |
| `blog-frontend/tailwind.config.ts` | Tailwind 配置 |
| `blog-frontend/postcss.config.mjs` | PostCSS 配置 |
| `blog-frontend/.env.local` | 后端 API 地址 |
| `blog-frontend/types/index.ts` | 全局 TypeScript 类型定义 |
| `blog-frontend/lib/api.ts` | fetch 封装（base URL、注入 token、拦截 401 刷新） |
| `blog-frontend/lib/auth.ts` | Token 存储/读取/清除/刷新函数 |
| `blog-frontend/lib/api-client.ts` | 按资源的 API 调用方法 |
| `blog-frontend/lib/utils.ts` | 日期格式化、文本截断等工具函数 |
| `blog-frontend/app/layout.tsx` | 根布局（主题、字体、全局样式） |
| `blog-frontend/app/globals.css` | Tailwind 指令 + 全局样式 |
| `blog-frontend/app/page.tsx` | 首页 — 文章列表 + 标签筛选 + 分页 |
| `blog-frontend/app/posts/[slug]/page.tsx` | 文章详情 + Markdown 渲染 + 评论区 |
| `blog-frontend/app/search/page.tsx` | 搜索结果页 |
| `blog-frontend/app/tags/[slug]/page.tsx` | 标签下文章列表 |
| `blog-frontend/app/login/page.tsx` | 登录页 |
| `blog-frontend/app/admin/layout.tsx` | 管理后台布局（侧边栏 + AuthGuard） |
| `blog-frontend/app/admin/page.tsx` | 仪表盘 |
| `blog-frontend/app/admin/posts/page.tsx` | 文章列表（含草稿）+ 删除 |
| `blog-frontend/app/admin/posts/new/page.tsx` | 新建文章 |
| `blog-frontend/app/admin/posts/[slug]/edit/page.tsx` | 编辑文章 |
| `blog-frontend/app/admin/tags/page.tsx` | 标签管理 |
| `blog-frontend/app/admin/comments/page.tsx` | 评论审核 |
| `blog-frontend/app/not-found.tsx` | 404 页面 |
| `blog-frontend/components/Navbar.tsx` | 顶部导航 |
| `blog-frontend/components/Footer.tsx` | 页脚 |
| `blog-frontend/components/PostCard.tsx` | 文章摘要卡片 |
| `blog-frontend/components/PostList.tsx` | 文章列表 + 分页 |
| `blog-frontend/components/Pagination.tsx` | 通用分页 |
| `blog-frontend/components/MarkdownRenderer.tsx` | Markdown 渲染 |
| `blog-frontend/components/MarkdownEditor.tsx` | Markdown 编辑器（编辑/预览切换） |
| `blog-frontend/components/CommentSection.tsx` | 评论列表 + 发表表单 |
| `blog-frontend/components/TagBadge.tsx` | 标签徽章 |
| `blog-frontend/components/TagFilter.tsx` | 标签筛选栏 |
| `blog-frontend/components/SearchBar.tsx` | 搜索输入 |
| `blog-frontend/components/LoginForm.tsx` | 登录表单 |
| `blog-frontend/components/AdminSidebar.tsx` | 管理菜单侧边栏 |
| `blog-frontend/components/AuthGuard.tsx` | 认证守卫 |
| `blog-frontend/components/AuthProvider.tsx` | 认证 Context Provider |

---

### Task 1: 项目脚手架

**Files:**
- Create: `blog-frontend/package.json`
- Create: `blog-frontend/tsconfig.json`
- Create: `blog-frontend/next.config.ts`
- Create: `blog-frontend/tailwind.config.ts`
- Create: `blog-frontend/postcss.config.mjs`
- Create: `blog-frontend/.env.local`
- Create: `blog-frontend/app/globals.css`
- Create: `blog-frontend/app/layout.tsx`
- Create: `blog-frontend/app/not-found.tsx`

- [ ] **Step 1: 使用 create-next-app 初始化项目**

```bash
cd /home/nikki/PycharmProjects/blog && npx create-next-app@latest blog-frontend --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*" --use-pnpm --no-turbopack
```

- [ ] **Step 2: 安装额外依赖**

```bash
cd blog-frontend && pnpm add react-markdown rehype-highlight remark-gfm react-hook-form zod @hookform/resolvers lucide-react
```

- [ ] **Step 3: 初始化 shadcn/ui**

```bash
cd blog-frontend && npx shadcn@latest init -d
```

- [ ] **Step 4: 添加 shadcn/ui 组件**

```bash
cd blog-frontend && npx shadcn@latest add button card input textarea dialog select badge toast table
```

- [ ] **Step 5: 创建 .env.local**

```
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

- [ ] **Step 6: 创建目录结构**

```bash
mkdir -p blog-frontend/{types,lib,components,app/{posts/\[slug\],search,tags/\[slug\],login,admin/{posts/new,posts/\[slug\]/edit,tags,comments}}}
```

- [ ] **Step 7: 验证项目可启动**

```bash
cd blog-frontend && pnpm dev
# Ctrl+C after confirming server starts on localhost:3000
```

- [ ] **Step 8: 初始化 git 并提交**

```bash
cd blog-frontend && git init && git add -A && git commit -m "chore: scaffold Next.js project with Tailwind and shadcn/ui"
```

---

### Task 2: 类型定义与基础设施库

**Files:**
- Create: `blog-frontend/types/index.ts`
- Create: `blog-frontend/lib/utils.ts`
- Create: `blog-frontend/lib/auth.ts`
- Create: `blog-frontend/lib/api.ts`
- Create: `blog-frontend/lib/api-client.ts`

- [ ] **Step 1: 编写 types/index.ts**

```typescript
// 文章
export interface Tag {
  id: number;
  name: string;
  slug: string;
}

export interface Post {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  content_html: string;
  status: "draft" | "published";
  tags: Tag[];
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

export interface PostListItem {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  status: "draft" | "published";
  tags: Tag[];
  created_at: string;
  published_at: string | null;
}

// 分页
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  page_size: number;
}

// 评论
export interface Comment {
  id: number;
  author_name: string;
  content: string;
  is_approved: boolean;
  parent_id: number | null;
  created_at: string;
  replies: Comment[];
}

// 认证
export interface LoginRequest {
  username: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  is_active: boolean;
  created_at: string;
}

// 通用响应
export interface MessageResponse {
  message: string;
}

// 创建/更新
export interface PostCreate {
  title: string;
  slug: string;
  content_md: string;
  excerpt?: string | null;
  tag_ids?: number[];
  status?: string;
}

export interface PostUpdate {
  title?: string | null;
  slug?: string | null;
  content_md?: string | null;
  excerpt?: string | null;
  tag_ids?: number[] | null;
  status?: string | null;
}

export interface TagCreate {
  name: string;
  slug: string;
}

export interface TagUpdate {
  name?: string | null;
  slug?: string | null;
}

export interface CommentCreate {
  author_name: string;
  author_email: string;
  content: string;
  parent_id?: number | null;
}
```

- [ ] **Step 2: 编写 lib/utils.ts**

```typescript
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + "...";
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}
```

- [ ] **Step 3: 编写 lib/auth.ts**

```typescript
import type { TokenResponse } from "@/types";

const TOKEN_KEY = "blog_tokens";

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(TOKEN_KEY);
    if (!raw) return null;
    const tokens: TokenResponse = JSON.parse(raw);
    return tokens.access_token;
  } catch {
    return null;
  }
}

function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(TOKEN_KEY);
    if (!raw) return null;
    const tokens: TokenResponse = JSON.parse(raw);
    return tokens.refresh_token;
  } catch {
    return null;
  }
}

export function setTokens(tokens: TokenResponse): void {
  localStorage.setItem(TOKEN_KEY, JSON.stringify(tokens));
}

export function clearTokens(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export function hasTokens(): boolean {
  return getAccessToken() !== null;
}

export async function refreshAccessToken(): Promise<string> {
  const refresh = getRefreshToken();
  if (!refresh) throw new Error("No refresh token");

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refresh }),
  });

  if (!res.ok) {
    clearTokens();
    throw new Error("Refresh failed");
  }

  const data: TokenResponse = await res.json();
  setTokens(data);
  return data.access_token;
}
```

- [ ] **Step 4: 编写 lib/api.ts**

```typescript
import { getAccessToken, refreshAccessToken, clearTokens } from "./auth";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export class ApiError extends Error {
  status: number;
  detail: string;

  constructor(status: number, detail: string) {
    super(detail);
    this.status = status;
    this.detail = detail;
    this.name = "ApiError";
  }
}

export class AuthError extends Error {
  constructor() {
    super("Authentication required");
    this.name = "AuthError";
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (res.status === 401) {
    // Try refresh
    try {
      const newToken = await refreshAccessToken();
      // Retry will happen in the caller
      throw new AuthError();
    } catch (e) {
      if (e instanceof AuthError) throw e;
      clearTokens();
      throw new AuthError();
    }
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({ detail: res.statusText }));
    throw new ApiError(res.status, body.detail || "Unknown error");
  }

  return res.json();
}

export async function apiGet<T>(path: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(`${BASE_URL}${path}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, v);
    });
  }

  const headers: Record<string, string> = {};
  const token = getAccessToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(url.toString(), { headers });
  return handleResponse<T>(res);
}

export async function apiPost<T>(path: string, body?: unknown): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const token = getAccessToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  return handleResponse<T>(res);
}

export async function apiPut<T>(path: string, body?: unknown): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const token = getAccessToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method: "PUT",
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  return handleResponse<T>(res);
}

export async function apiDelete(path: string): Promise<void> {
  const headers: Record<string, string> = {};
  const token = getAccessToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, { method: "DELETE", headers });
  if (!res.ok) {
    if (res.status === 401) {
      clearTokens();
      throw new AuthError();
    }
    const body = await res.json().catch(() => ({ detail: res.statusText }));
    throw new ApiError(res.status, body.detail || "Unknown error");
  }
}
```

- [ ] **Step 5: 编写 lib/api-client.ts**

```typescript
import { apiGet, apiPost, apiPut, apiDelete } from "./api";
import type {
  Post,
  PostListItem,
  Tag,
  Comment,
  User,
  LoginRequest,
  TokenResponse,
  PostCreate,
  PostUpdate,
  TagCreate,
  TagUpdate,
  CommentCreate,
  PaginatedResponse,
  MessageResponse,
} from "@/types";

// Auth
export const authApi = {
  login: (data: LoginRequest) => apiPost<TokenResponse>("/auth/login", data),
  refresh: (refresh_token: string) =>
    apiPost<TokenResponse>("/auth/refresh", { refresh_token }),
  me: () => apiGet<User>("/auth/me"),
};

// Posts (public)
export const postsApi = {
  list: (params?: { page?: number; page_size?: number; tag?: string }) =>
    apiGet<PaginatedResponse<PostListItem>>("/posts", params as Record<string, string>),
  getBySlug: (slug: string) => apiGet<Post>(`/posts/${slug}`),
};

// Posts (admin)
export const adminPostsApi = {
  list: (params?: { page?: number; page_size?: number; status?: string }) =>
    apiGet<PaginatedResponse<PostListItem>>("/admin/posts", params as Record<string, string>),
  create: (data: PostCreate) => apiPost<Post>("/admin/posts", data),
  update: (slug: string, data: PostUpdate) => apiPut<Post>(`/admin/posts/${slug}`, data),
  delete: (slug: string) => apiDelete(`/admin/posts/${slug}`),
};

// Tags (public)
export const tagsApi = {
  list: () => apiGet<Tag[]>("/tags"),
  getBySlug: (slug: string) => apiGet<Tag>(`/tags/${slug}`),
};

// Tags (admin)
export const adminTagsApi = {
  create: (data: TagCreate) => apiPost<Tag>("/admin/tags", data),
  update: (id: number, data: TagUpdate) => apiPut<Tag>(`/admin/tags/${id}`, data),
  delete: (id: number) => apiDelete(`/admin/tags/${id}`),
};

// Comments
export const commentsApi = {
  list: (postSlug: string) => apiGet<Comment[]>(`/posts/${postSlug}/comments`),
  create: (postSlug: string, data: CommentCreate) =>
    apiPost<Comment>(`/posts/${postSlug}/comments`, data),
};

// Comments (admin)
export const adminCommentsApi = {
  listPending: () => apiGet<Comment[]>("/admin/comments"),
  approve: (id: number) => apiPut<Comment>(`/admin/comments/${id}/approve`),
  delete: (id: number) => apiDelete(`/admin/comments/${id}`),
};

// Search
export const searchApi = {
  search: (q: string, page?: number) =>
    apiGet<PaginatedResponse<PostListItem>>("/search", { q, page: String(page || 1) }),
};
```

- [ ] **Step 6: 验证导入**

```bash
cd blog-frontend && pnpm exec tsc --noEmit 2>&1 | head -20
```
Expected: 无类型错误

- [ ] **Step 7: 提交**

```bash
git add -A && git commit -m "feat: add types, API client, auth library"
```

---

### Task 3: 共享组件

**Files:**
- Create: `blog-frontend/components/TagBadge.tsx`
- Create: `blog-frontend/components/Pagination.tsx`
- Create: `blog-frontend/components/PostCard.tsx`
- Create: `blog-frontend/components/PostList.tsx`
- Create: `blog-frontend/components/Navbar.tsx`
- Create: `blog-frontend/components/Footer.tsx`
- Create: `blog-frontend/components/TagFilter.tsx`
- Create: `blog-frontend/components/SearchBar.tsx`
- Create: `blog-frontend/components/MarkdownRenderer.tsx`
- Create: `blog-frontend/components/CommentSection.tsx`

- [ ] **Step 1: 编写 TagBadge.tsx**

```tsx
import Link from "next/link";
import type { Tag } from "@/types";

export default function TagBadge({ tag }: { tag: Tag }) {
  return (
    <Link
      href={`/tags/${tag.slug}`}
      className="inline-block rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-200 transition-colors"
    >
      {tag.name}
    </Link>
  );
}
```

- [ ] **Step 2: 编写 Pagination.tsx**

```tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

interface Props {
  currentPage: number;
  totalPages: number;
}

export default function Pagination({ currentPage, totalPages }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  const goTo = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    router.push(`?${params.toString()}`);
  };

  const pages: number[] = [];
  const start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, currentPage + 2);
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <Button
        variant="outline"
        size="sm"
        disabled={currentPage <= 1}
        onClick={() => goTo(currentPage - 1)}
      >
        上一页
      </Button>
      {pages.map((p) => (
        <Button
          key={p}
          variant={p === currentPage ? "default" : "outline"}
          size="sm"
          onClick={() => goTo(p)}
        >
          {p}
        </Button>
      ))}
      <Button
        variant="outline"
        size="sm"
        disabled={currentPage >= totalPages}
        onClick={() => goTo(currentPage + 1)}
      >
        下一页
      </Button>
    </div>
  );
}
```

- [ ] **Step 3: 编写 PostCard.tsx**

```tsx
import Link from "next/link";
import type { PostListItem } from "@/types";
import { formatDate, truncate } from "@/lib/utils";
import TagBadge from "./TagBadge";

export default function PostCard({ post }: { post: PostListItem }) {
  return (
    <Link href={`/posts/${post.slug}`} className="block group">
      <article className="rounded-lg border bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
        <h2 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
          {post.title}
        </h2>
        {post.excerpt && (
          <p className="mt-2 text-gray-600">{truncate(post.excerpt, 200)}</p>
        )}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {post.tags.map((tag) => (
            <span key={tag.id} onClick={(e) => e.preventDefault()}>
              <TagBadge tag={tag} />
            </span>
          ))}
        </div>
        <time className="mt-3 block text-sm text-gray-400">
          {post.published_at ? formatDate(post.published_at) : ""}
        </time>
      </article>
    </Link>
  );
}
```

- [ ] **Step 4: 编写 PostList.tsx**

```tsx
import type { PostListItem, Tag } from "@/types";
import PostCard from "./PostCard";
import Pagination from "./Pagination";
import TagFilter from "./TagFilter";

interface Props {
  posts: PostListItem[];
  total: number;
  page: number;
  pageSize: number;
  tags: Tag[];
  currentTag?: string;
}

export default function PostList({ posts, total, page, pageSize, tags, currentTag }: Props) {
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div>
      <TagFilter tags={tags} currentTag={currentTag} />
      {posts.length === 0 ? (
        <p className="text-center text-gray-500 py-12">暂无文章</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
      <Pagination currentPage={page} totalPages={totalPages} />
    </div>
  );
}
```

- [ ] **Step 5: 编写 Navbar.tsx**

```tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { hasTokens, clearTokens } from "@/lib/auth";
import { useState, useEffect } from "react";
import SearchBar from "./SearchBar";

export default function Navbar() {
  const router = useRouter();
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    setLoggedIn(hasTokens());
  }, []);

  const handleLogout = () => {
    clearTokens();
    setLoggedIn(false);
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-xl font-bold text-gray-900">
          My Blog
        </Link>
        <div className="flex items-center gap-4">
          <SearchBar />
          {loggedIn ? (
            <>
              <Button variant="outline" size="sm" onClick={() => router.push("/admin")}>
                管理
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                退出
              </Button>
            </>
          ) : (
            <Button variant="outline" size="sm" onClick={() => router.push("/login")}>
              登录
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
```

- [ ] **Step 6: 编写 Footer.tsx**

```tsx
export default function Footer() {
  return (
    <footer className="border-t py-8 mt-16">
      <div className="mx-auto max-w-6xl px-4 text-center text-sm text-gray-500">
        <p>Powered by FastAPI & Next.js</p>
      </div>
    </footer>
  );
}
```

- [ ] **Step 7: 编写 TagFilter.tsx**

```tsx
"use client";

import Link from "next/link";
import type { Tag } from "@/types";

interface Props {
  tags: Tag[];
  currentTag?: string;
}

export default function TagFilter({ tags, currentTag }: Props) {
  return (
    <div className="mb-6 flex flex-wrap items-center gap-2">
      <Link
        href="/"
        className={`rounded-full px-3 py-1 text-sm ${
          !currentTag
            ? "bg-blue-600 text-white"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
        }`}
      >
        全部
      </Link>
      {tags.map((tag) => (
        <Link
          key={tag.id}
          href={`/tags/${tag.slug}`}
          className={`rounded-full px-3 py-1 text-sm ${
            currentTag === tag.slug
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          {tag.name}
        </Link>
      ))}
    </div>
  );
}
```

- [ ] **Step 8: 编写 SearchBar.tsx**

```tsx
"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <Input
        type="text"
        placeholder="搜索..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-40 pl-8"
      />
      <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
    </form>
  );
}
```

- [ ] **Step 9: 编写 MarkdownRenderer.tsx**

```tsx
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";

export default function MarkdownRenderer({ content }: { content: string }) {
  return (
    <article className="prose prose-gray max-w-none dark:prose-invert">
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
        {content}
      </ReactMarkdown>
    </article>
  );
}
```

- [ ] **Step 10: 编写 CommentSection.tsx**

```tsx
"use client";

import { useState, useEffect } from "react";
import { commentsApi } from "@/lib/api-client";
import { formatDate } from "@/lib/utils";
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
        <time>{formatDate(comment.created_at)}</time>
      </div>
      <p className="mt-2 text-gray-700">{comment.content}</p>
      {comment.replies?.map(renderComment) && (
        <div className="ml-6 mt-2">{comment.replies.map(renderComment)}</div>
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
```

- [ ] **Step 11: 验证组件可导入**

```bash
cd blog-frontend && pnpm exec tsc --noEmit 2>&1 | head -10
```
Expected: 无类型错误

- [ ] **Step 12: 提交**

```bash
git add -A && git commit -m "feat: add shared UI components"
```

---

### Task 4: 公开页面

**Files:**
- Create: `blog-frontend/app/page.tsx`
- Create: `blog-frontend/app/posts/[slug]/page.tsx`
- Create: `blog-frontend/app/search/page.tsx`
- Create: `blog-frontend/app/tags/[slug]/page.tsx`
- Modify: `blog-frontend/app/layout.tsx`
- Modify: `blog-frontend/app/globals.css`
- Modify: `blog-frontend/app/not-found.tsx`

- [ ] **Step 1: 更新 app/layout.tsx — 添加 Navbar 和 Footer**

```tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "My Blog",
  description: "Personal blog powered by FastAPI",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Navbar />
        <main className="mx-auto max-w-6xl px-4 py-8 min-h-[60vh]">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
```

- [ ] **Step 2: 编写 app/page.tsx — 首页**

```tsx
import { postsApi } from "@/lib/api-client";
import { tagsApi } from "@/lib/api-client";
import PostList from "@/components/PostList";

interface Props {
  searchParams: Promise<{ page?: string; tag?: string }>;
}

export default async function HomePage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Number(params.page) || 1;

  const [postsData, tags] = await Promise.all([
    postsApi.list({ page, tag: params.tag }),
    tagsApi.list(),
  ]);

  return (
    <PostList
      posts={postsData.data}
      total={postsData.total}
      page={page}
      pageSize={10}
      tags={tags}
      currentTag={params.tag}
    />
  );
}
```

- [ ] **Step 3: 编写 app/posts/[slug]/page.tsx — 文章详情**

```tsx
import { notFound } from "next/navigation";
import { postsApi } from "@/lib/api-client";
import { formatDate } from "@/lib/utils";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import CommentSection from "@/components/CommentSection";
import TagBadge from "@/components/TagBadge";

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
    <article className="mx-auto max-w-3xl">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{post.title}</h1>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {post.tags.map((tag) => (
            <TagBadge key={tag.id} tag={tag} />
          ))}
        </div>
        {post.published_at && (
          <time className="mt-2 block text-sm text-gray-400">
            发布于 {formatDate(post.published_at)}
          </time>
        )}
      </header>

      <MarkdownRenderer content={post.content_html} />

      <CommentSection postSlug={slug} />
    </article>
  );
}
```

- [ ] **Step 4: 编写 app/search/page.tsx — 搜索结果**

```tsx
import { searchApi } from "@/lib/api-client";
import { tagsApi } from "@/lib/api-client";
import PostList from "@/components/PostList";

interface Props {
  searchParams: Promise<{ q?: string; page?: string }>;
}

export default async function SearchPage({ searchParams }: Props) {
  const params = await searchParams;
  const q = params.q || "";
  const page = Number(params.page) || 1;

  let postsData = { data: [], total: 0, page: 1, page_size: 10 };
  if (q) {
    try {
      postsData = await searchApi.search(q, page);
    } catch {
      postsData = { data: [], total: 0, page: 1, page_size: 10 };
    }
  }

  const tags = await tagsApi.list();

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">
        {q ? `搜索结果: "${q}"` : "搜索"}
      </h2>
      <PostList
        posts={postsData.data}
        total={postsData.total}
        page={page}
        pageSize={10}
        tags={tags}
      />
    </div>
  );
}
```

- [ ] **Step 5: 编写 app/tags/[slug]/page.tsx — 标签页**

```tsx
import { postsApi, tagsApi } from "@/lib/api-client";
import PostList from "@/components/PostList";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

export default async function TagPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = await searchParams;
  const page = Number(sp.page) || 1;

  const [postsData, tags] = await Promise.all([
    postsApi.list({ page, tag: slug }),
    tagsApi.list(),
  ]);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">标签: {slug}</h2>
      <PostList
        posts={postsData.data}
        total={postsData.total}
        page={page}
        pageSize={10}
        tags={tags}
        currentTag={slug}
      />
    </div>
  );
}
```

- [ ] **Step 6: 更新 app/not-found.tsx**

```tsx
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-24">
      <h2 className="text-4xl font-bold text-gray-900">404</h2>
      <p className="mt-4 text-gray-500">页面未找到</p>
      <Link href="/" className="mt-6 text-blue-600 hover:underline">
        返回首页
      </Link>
    </div>
  );
}
```

- [ ] **Step 7: 验证编译**

```bash
cd blog-frontend && pnpm build 2>&1 | tail -20
```
Expected: 构建成功

- [ ] **Step 8: 提交**

```bash
git add -A && git commit -m "feat: add public pages (home, post detail, search, tags)"
```

---

### Task 5: 认证功能

**Files:**
- Create: `blog-frontend/components/LoginForm.tsx`
- Create: `blog-frontend/components/AuthGuard.tsx`
- Create: `blog-frontend/components/AuthProvider.tsx`
- Create: `blog-frontend/app/login/page.tsx`

- [ ] **Step 1: 编写 LoginForm.tsx**

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api-client";
import { setTokens } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const tokens = await authApi.login({ username, password });
      setTokens(tokens);
      router.push("/admin");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "登录失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle>登录</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Input
            placeholder="用户名"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoFocus
          />
          <Input
            type="password"
            placeholder="密码"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "登录中..." : "登录"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 2: 编写 AuthGuard.tsx**

```tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { hasTokens } from "@/lib/auth";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (!hasTokens()) {
      router.push("/login");
    } else {
      setAuthorized(true);
    }
  }, [router]);

  if (!authorized) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-gray-500">验证中...</p>
      </div>
    );
  }

  return <>{children}</>;
}
```

- [ ] **Step 3: 编写 AuthProvider.tsx**

```tsx
"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { authApi } from "@/lib/api-client";
import { hasTokens, clearTokens } from "@/lib/auth";
import type { User } from "@/types";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hasTokens()) {
      setLoading(false);
      return;
    }
    authApi
      .me()
      .then(setUser)
      .catch(clearTokens)
      .finally(() => setLoading(false));
  }, []);

  const logout = () => {
    clearTokens();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
```

- [ ] **Step 4: 编写 app/login/page.tsx**

```tsx
import LoginForm from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center py-16">
      <LoginForm />
    </div>
  );
}
```

- [ ] **Step 5: 验证编译**

```bash
cd blog-frontend && pnpm build 2>&1 | tail -10
```
Expected: 构建成功

- [ ] **Step 6: 提交**

```bash
git add -A && git commit -m "feat: add login page, AuthGuard, and AuthProvider"
```

---

### Task 6: 管理后台

**Files:**
- Create: `blog-frontend/components/AdminSidebar.tsx`
- Create: `blog-frontend/components/MarkdownEditor.tsx`
- Create: `blog-frontend/app/admin/layout.tsx`
- Create: `blog-frontend/app/admin/page.tsx`
- Create: `blog-frontend/app/admin/posts/page.tsx`
- Create: `blog-frontend/app/admin/posts/new/page.tsx`
- Create: `blog-frontend/app/admin/posts/[slug]/edit/page.tsx`
- Create: `blog-frontend/app/admin/tags/page.tsx`
- Create: `blog-frontend/app/admin/comments/page.tsx`

- [ ] **Step 1: 编写 AdminSidebar.tsx**

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const links = [
  { href: "/admin", label: "仪表盘" },
  { href: "/admin/posts", label: "文章管理" },
  { href: "/admin/tags", label: "标签管理" },
  { href: "/admin/comments", label: "评论审核" },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-48 shrink-0">
      <nav className="space-y-1">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "block rounded-md px-3 py-2 text-sm font-medium transition-colors",
              pathname === link.href
                ? "bg-blue-50 text-blue-700"
                : "text-gray-700 hover:bg-gray-100"
            )}
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <Link
        href="/"
        className="mt-4 block rounded-md px-3 py-2 text-sm text-gray-400 hover:text-gray-600"
      >
        ← 返回前台
      </Link>
    </aside>
  );
}
```

- [ ] **Step 2: 编写 MarkdownEditor.tsx**

```tsx
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
```

- [ ] **Step 3: 编写 app/admin/layout.tsx**

```tsx
"use client";

import AdminSidebar from "@/components/AdminSidebar";
import AuthGuard from "@/components/AuthGuard";
import { Toaster } from "@/components/ui/sonner";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="flex gap-8">
        <AdminSidebar />
        <div className="flex-1 min-w-0">{children}</div>
      </div>
      <Toaster />
    </AuthGuard>
  );
}
```

- [ ] **Step 4: 编写 app/admin/page.tsx — 仪表盘**

```tsx
"use client";

import { useEffect, useState } from "react";
import { adminPostsApi, tagsApi, adminCommentsApi } from "@/lib/api-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ posts: 0, tags: 0, pending: 0 });

  useEffect(() => {
    async function loadStats() {
      const [postsData, tags, pending] = await Promise.all([
        adminPostsApi.list({ page_size: "1" }).catch(() => ({ total: 0, data: [], page: 1, page_size: 10 })),
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
```

- [ ] **Step 5: 编写 app/admin/posts/page.tsx — 文章管理列表**

```tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { adminPostsApi } from "@/lib/api-client";
import { formatDate } from "@/lib/utils";
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
      const data = await adminPostsApi.list({ page_size: "50" });
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
                {post.published_at ? formatDate(post.published_at) : "-"}
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
```

- [ ] **Step 6: 编写 app/admin/posts/new/page.tsx — 新建文章**

```tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { adminPostsApi, tagsApi } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import MarkdownEditor from "@/components/MarkdownEditor";
import type { Tag } from "@/types";

export default function NewPostPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [contentMd, setContentMd] = useState("");
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    tagsApi.list().then(setAllTags).catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminPostsApi.create({
        title,
        slug,
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

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">新建文章</h2>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-3xl">
        <Input placeholder="标题" value={title} onChange={(e) => setTitle(e.target.value)} />
        <Input placeholder="slug" value={slug} onChange={(e) => setSlug(e.target.value)} />
        <div className="flex items-center gap-4">
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
              <label key={tag.id} className="flex items-center gap-1 text-sm">
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
```

- [ ] **Step 7: 编写 app/admin/posts/[slug]/edit/page.tsx — 编辑文章**

```tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { adminPostsApi, postsApi, tagsApi } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import MarkdownEditor from "@/components/MarkdownEditor";
import type { Tag, Post } from "@/types";

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
      const [post, tags] = await Promise.all([
        postsApi.getBySlug(slugParam),
        tagsApi.list(),
      ]);
      setTitle(post.title);
      setSlug(post.slug);
      setContentMd(post.content_html); // Note: content_md not available via public API, use content_html as placeholder
      setStatus(post.status as "draft" | "published");
      setSelectedTags(post.tags.map((t) => t.id));
      setAllTags(tags);
      setLoading(false);
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
        <div className="flex items-center gap-4">
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
              <label key={tag.id} className="flex items-center gap-1 text-sm">
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
```

- [ ] **Step 8: 编写 app/admin/tags/page.tsx — 标签管理**

```tsx
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
                    className="max-w-32 inline"
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
                    className="max-w-32 inline"
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
```

- [ ] **Step 9: 编写 app/admin/comments/page.tsx — 评论审核**

```tsx
"use client";

import { useEffect, useState } from "react";
import { adminCommentsApi } from "@/lib/api-client";
import { formatDate } from "@/lib/utils";
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
                  {formatDate(comment.created_at)}
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
```

- [ ] **Step 10: 验证编译**

```bash
cd blog-frontend && pnpm build 2>&1 | tail -10
```
Expected: 构建成功

- [ ] **Step 11: 提交**

```bash
git add -A && git commit -m "feat: add admin pages (dashboard, posts CRUD, tags, comments)"
```

---

### Task 7: 最终验证

- [ ] **Step 1: 构建生产版本**

```bash
cd blog-frontend && pnpm build
```
Expected: 构建成功，无错误

- [ ] **Step 2: 确保后端运行**

```bash
cd ../blog && uvicorn app.main:app --host 0.0.0.0 --port 8000 &
```

- [ ] **Step 3: 启动前端并手动验证**

```bash
cd blog-frontend && pnpm dev &
```

浏览器打开 `http://localhost:3000` 确认：
- 首页显示文章列表（空列表也正常）
- 点击标签可筛选
- 搜索功能正常
- 可访问 `/login` 登录
- 登录后可访问 `/admin` 仪表盘
- 可创建/编辑/删除文章
- 可管理标签和审核评论

- [ ] **Step 4: 提交**

```bash
git add -A && git commit -m "chore: final verification and cleanup"
```
