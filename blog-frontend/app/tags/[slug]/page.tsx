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
