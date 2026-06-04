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
        <div className="space-y-6">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
      <Pagination currentPage={page} totalPages={totalPages} />
    </div>
  );
}
