import { postsApi, tagsApi } from "@/lib/api-client";
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
    <div>
      {/* Hero section — only shown on first page without tag filter */}
      {page === 1 && !params.tag && (
        <section className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-3">
            My Blog
          </h1>
          <p className="text-lg text-gray-500 max-w-xl mx-auto">
            Python、FastAPI、DevOps — 记录技术旅程中的思考与实践
          </p>
        </section>
      )}

      <PostList
        posts={postsData.data}
        total={postsData.total}
        page={page}
        pageSize={10}
        tags={tags}
        currentTag={params.tag}
      />
    </div>
  );
}
