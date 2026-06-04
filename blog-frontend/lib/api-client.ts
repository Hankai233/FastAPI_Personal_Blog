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
