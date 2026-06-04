# FastAPI 个人博客前端 — 设计文档

**日期**: 2026-06-04
**状态**: 设计中

---

## 1. 概述

为 FastAPI 博客 API 构建前端界面，前后端分离。使用 Next.js (App Router) + Tailwind CSS + shadcn/ui。

**后端 API 地址**: `http://localhost:8000/api`（通过 `NEXT_PUBLIC_API_URL` 配置）

## 2. 环境与技术栈

| 层 | 选型 | 说明 |
|---|---|---|
| 框架 | Next.js 15 (App Router) | 文件路由、Server Components、SSG 可选 |
| 样式 | Tailwind CSS 4 + shadcn/ui | 原子化 CSS + 可定制组件库 |
| 语言 | TypeScript | 类型安全 |
| HTTP 客户端 | fetch + 拦截器封装 | 轻量，无需额外依赖 |
| Markdown 渲染 | react-markdown + rehype-highlight | 客户端渲染 |
| 表单 | react-hook-form + zod | 验证 + 类型推导 |
| 状态管理 | React Context (auth) + URL state | 够用不复杂 |
| 包管理 | pnpm | 快速、磁盘高效 |

## 3. 架构

### 3.1 目录结构

```
blog-frontend/
├── app/
│   ├── layout.tsx                # 根布局（主题 Provider、导航栏、页脚）
│   ├── page.tsx                  # 首页 — 文章列表（分页 + 标签筛选）
│   ├── posts/
│   │   └── [slug]/
│   │       └── page.tsx          # 文章详情 + Markdown 渲染 + 评论
│   ├── search/
│   │   └── page.tsx              # 搜索结果（?q=）
│   ├── tags/
│   │   └── [slug]/
│   │       └── page.tsx          # 标签下文章列表
│   ├── login/
│   │   └── page.tsx              # 登录页
│   └── admin/
│       ├── layout.tsx            # 管理后台布局（侧边栏 + 认证守卫 + Toaster）
│       ├── page.tsx              # 仪表盘（概览统计）
│       ├── posts/
│       │   ├── page.tsx          # 文章列表（含草稿）+ 删除
│       │   ├── new/
│       │   │   └── page.tsx      # 新建文章（Markdown 编辑器）
│       │   └── [slug]/
│       │       └── edit/
│       │           └── page.tsx  # 编辑文章
│       ├── tags/
│       │   └── page.tsx          # 标签管理（CRUD 行内编辑）
│       └── comments/
│           └── page.tsx          # 待审核评论列表 + 审核/删除
├── components/
│   ├── ui/                       # shadcn/ui 组件（button, card, input, dialog, ...）
│   ├── Navbar.tsx                # 顶部导航（首页/搜索 + 登录状态）
│   ├── Footer.tsx                # 页脚
│   ├── PostCard.tsx              # 文章摘要卡片
│   ├── PostList.tsx              # 文章列表 + 分页
│   ├── Pagination.tsx            # 通用分页组件
│   ├── MarkdownRenderer.tsx      # react-markdown 封装
│   ├── MarkdownEditor.tsx        # 管理端 Markdown 编辑器（textarea + 预览切换）
│   ├── CommentSection.tsx        # 评论列表 + 发表表单
│   ├── TagBadge.tsx              # 标签徽章
│   ├── TagFilter.tsx             # 标签筛选栏
│   ├── SearchBar.tsx             # 搜索框
│   ├── LoginForm.tsx             # 登录表单
│   ├── AdminSidebar.tsx          # 管理后台侧边栏导航
│   ├── AuthGuard.tsx             # 认证守卫（未登录重定向）
│   └── TokenRefreshProvider.tsx  # Token 自动刷新 Context
├── lib/
│   ├── api.ts                    # fetch 封装（base URL、JSON 解析、错误处理）
│   ├── api-client.ts             # 按资源的 API 方法（posts, tags, comments, auth, search）
│   ├── auth.ts                   # Token 存储/读取/清除/刷新
│   └── utils.ts                  # 工具函数（日期格式化、截断等）
├── types/
│   └── index.ts                  # TypeScript 类型定义（Post, Tag, Comment, User, ...）
├── public/                       # 静态资源
├── .env.local                    # NEXT_PUBLIC_API_URL=http://localhost:8000/api
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

### 3.2 数据流

```
浏览器 ←→ Next.js (App Router) ←→ fetch(API_URL) ←→ FastAPI 后端 ←→ MariaDB
        │
        ├── 公开页面: Server Components (SSR 首屏) 或 Client Components
        └── 管理页面: Client Components (需认证状态)
```

- **公开页面**：首屏文章列表可 SSR（Server Component 直接 fetch），动态交互（评论、搜索）用 Client Component
- **管理页面**：全部 Client Component，需要 token 注入

### 3.3 API 客户端设计

```typescript
// lib/api.ts — 基础 fetch 封装
class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(path: string, options?: RequestInit): Promise<T> {
    // 1. 自动注入 Authorization header（从 auth.ts 读取 token）
    // 2. 发送请求
    // 3. 如果是 401 → 尝试 refresh token → 重试原请求
    // 4. refresh 失败 → 清除 token → 抛出 AuthError
    // 5. 非 2xx → 抛出 ApiError（含 status + detail）
    // 6. 返回 JSON 数据
  }

  get<T>(path: string, params?: Record<string, string>): Promise<T>
  post<T>(path: string, body?: unknown): Promise<T>
  put<T>(path: string, body?: unknown): Promise<T>
  delete(path: string): Promise<void>
}
```

## 4. 页面设计

### 4.1 首页 — 文章列表 `/`

```
┌──────────────────────────────────────────────┐
│  [Navbar: Logo | 搜索框 | 管理/登录]         │
├──────────────────────────────────────────────┤
│  [TagFilter: All | Python | FastAPI | ...]   │
├──────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ PostCard │  │ PostCard │  │ PostCard │   │
│  │ 标题     │  │ 标题     │  │ 标题     │   │
│  │ 摘要     │  │ 摘要     │  │ 摘要     │   │
│  │ 标签·时间│  │ 标签·时间│  │ 标签·时间│   │
│  └──────────┘  └──────────┘  └──────────┘   │
├──────────────────────────────────────────────┤
│         [Pagination: < 1 2 3 ... >]          │
└──────────────────────────────────────────────┘
```

### 4.2 文章详情 `/posts/[slug]`

```
┌──────────────────────────────────────────────┐
│  [Navbar]                                    │
├──────────────────────────────────────────────┤
│  # 文章标题                                  │
│  标签: [Python] [FastAPI]  发布于 2026-06-04 │
│  ──────────────────────────────────────       │
│  (Markdown 渲染内容)                         │
│  ──────────────────────────────────────       │
│  💬 评论 (N)                                 │
│  ┌──────────────────────────────┐            │
│  │ 昵称: [____]  邮箱: [______] │            │
│  │ 内容: [____________________] │            │
│  │ [提交]                       │            │
│  └──────────────────────────────┘            │
│  ┌──────────────────────────────┐            │
│  │ Bob · 2026-06-04             │            │
│  │ Nice post!                   │            │
│  └──────────────────────────────┘            │
└──────────────────────────────────────────────┘
```

### 4.3 管理后台 `/admin`

```
┌──────┬───────────────────────────────────────┐
│Sidebar│  [仪表盘 / 文章管理 / 标签管理]       │
│      │                                       │
│ 仪表盘│  文章数: 10  标签数: 5  待审核: 3     │
│      │                                       │
│ 文章  │                                       │
│ 标签  │                                       │
│ 评论  │                                       │
└──────┴───────────────────────────────────────┘
```

### 4.4 文章管理 `/admin/posts`

```
┌──────┬───────────────────────────────────────┐
│Sidebar│  [+ 新建文章]                        │
│      │                                       │
│      │  标题        状态     操作            │
│      │  ───────────────────────────          │
│      │  Hello World  published  编辑 删除    │
│      │  Draft Post   draft      编辑 删除    │
└──────┴───────────────────────────────────────┘
```

### 4.5 文章编辑器 `/admin/posts/new` 和 `/admin/posts/[slug]/edit`

```
┌──────┬───────────────────────────────────────┐
│Sidebar│                                       │
│      │  标题: [________________]             │
│      │  Slug:  [________________]             │
│      │  标签:  [x Python] [x FastAPI] [+]    │
│      │  状态:  [草稿] / [发布]               │
│      │  ───────────────────────────           │
│      │  ┌─────────┬───────────┐              │
│      │  │ Markdown│  预览     │              │
│      │  │ 编辑器  │  (HTML)   │              │
│      │  │         │           │              │
│      │  └─────────┴───────────┘              │
│      │  [保存]                               │
└──────┴───────────────────────────────────────┘
```

## 5. 认证

### 5.1 Token 管理

```typescript
// lib/auth.ts
const TOKEN_KEY = "blog_tokens";

interface Tokens {
  access_token: string;
  refresh_token: string;
}

export function getAccessToken(): string | null { ... }
export function setTokens(tokens: Tokens): void { ... }  // 存储到 localStorage
export function clearTokens(): void { ... }
export async function refreshAccessToken(): Promise<string> { ... }
```

- `access_token` 和 `refresh_token` 存 localStorage
- 每次请求前 `api.ts` 读取 `access_token` 注入 header
- 管理页面用 `AuthGuard` 组件包裹，未登录重定向到 `/login`
- 用户信息通过 `GET /api/auth/me` 获取，存入 AuthContext

### 5.2 认证流程

```
访问 /admin → AuthGuard 检查 token
  ├── 无 token → 重定向 /login
  ├── 有 token → 渲染页面
  │   └── API 调用返回 401 → 尝试 refresh
  │       ├── refresh 成功 → 重试原请求
  │       └── refresh 失败 → 清除 token → 重定向 /login
```

## 6. 错误处理

- **网络错误**：toast 提示 "网络连接失败，请检查后端服务"
- **API 错误**：根据 status code 显示 `detail` 消息
- **401**：自动刷新 token，失败则跳转登录
- **404**：文章/标签不存在页面显示 "未找到"
- **表单验证**：zod schema + react-hook-form 前端校验，提交后在 UI 显示字段级错误

## 7. 组件职责

| 组件 | 职责 | 类型 |
|---|---|---|
| `Navbar` | 导航 + 搜索入口 + 登录状态 | Client |
| `PostCard` | 文章摘要卡片（标题、摘要、标签、日期） | Server/Client |
| `PostList` | 文章网格 + 分页控件 | Server/Client |
| `Pagination` | 页码、上一页/下一页 | Client |
| `MarkdownRenderer` | react-markdown 渲染（代码高亮、图片、表格） | Client |
| `MarkdownEditor` | textarea + 实时预览切换 | Client |
| `CommentSection` | 评论列表 + 发表表单（嵌套回复） | Client |
| `TagBadge` | 彩色标签徽章 | Server |
| `TagFilter` | 标签横向滚动筛选栏 | Client |
| `SearchBar` | 搜索输入框（带防抖） | Client |
| `LoginForm` | 用户名/密码表单 | Client |
| `AdminSidebar` | 管理后台侧边栏导航（当前页高亮） | Client |
| `AuthGuard` | 检查 token，未登录重定向 | Client |

## 8. 测试

- 组件单元测试：vitest + @testing-library/react
- E2E 测试（可选）：Playwright
- 覆盖：登录流程、文章 CRUD、评论提交流程、认证过期刷新、表单校验
