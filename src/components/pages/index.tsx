import { useQuery } from "@apollo/client";
import PostsSection from "../posts/PostsSection";
import { GET_ALL_POSTS } from "../../graphql/queries";
import Sidebar from "../posts/Sidebar";

export default function HomePage() {
  const { data, loading, error } = useQuery(GET_ALL_POSTS);

  if (loading) return <div className="p-10">Loading...</div>;
  if (error)
    return <div className="p-10 text-red-500">Error: {error.message}</div>;

  const posts = data?.posts || [];

  return (
    <div className="px-4 py-8 max-w-7xl mx-auto">
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 lg:w-2/3">
          <PostsSection posts={posts} />
          <div className="flex justify-center mt-8">
            {/* Simple Pagination Placeholder */}
            <div className="flex gap-2 text-sm">
              {[1, 2, 3, "...", "W"].map((p) => (
                <button
                  key={p}
                  className="px-3 py-1 border rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>
        <Sidebar posts={posts} />
      </div>
    </div>
  );
}
