import { searchApi, tagsApi } from "@/lib/api-client";
import PostList from "@/components/PostList";
import type { PaginatedResponse, PostListItem } from "@/types";

interface Props {
  searchParams: Promise<{ q?: string; page?: string }>;
}

export default async function SearchPage({ searchParams }: Props) {
  const params = await searchParams;
  const q = params.q || "";
  const page = Number(params.page) || 1;

  let postsData: PaginatedResponse<PostListItem> = { data: [], total: 0, page: 1, page_size: 10 };
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
