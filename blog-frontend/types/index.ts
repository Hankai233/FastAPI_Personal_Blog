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
