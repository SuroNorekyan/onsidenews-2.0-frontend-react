// src/components/pages/TopPostsPage.tsx
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@apollo/client";
import PostsSection from "../posts/PostsSection";
import Sidebar from "../posts/Sidebar";
import Pagination from "../shared/Pagination";
import {
  GET_POSTS_PAGINATED,
  GET_TOP_POSTS_PAGINATED,
} from "../../graphql/queries";

const PAGE_SIZE = 12;

export default function TopPostsPage({ darkMode }: { darkMode?: boolean }) {
  const [params, setParams] = useSearchParams();
  const pageFromUrl = Number(params.get("page") || 1);
  const page = Number.isNaN(pageFromUrl) || pageFromUrl < 1 ? 1 : pageFromUrl;

  // LEFT: Top posts paginated (primary list)
  const {
    data: topData,
    loading,
    error,
  } = useQuery(GET_TOP_POSTS_PAGINATED, {
    variables: { page, pageSize: PAGE_SIZE },
    notifyOnNetworkStatusChange: true,
  });

  // RIGHT: Sidebar shows ALL posts (first page for freshness)
  const { data: allPage1 } = useQuery(GET_POSTS_PAGINATED, {
    variables: { page: 1, pageSize: 10 },
  });

  const topItems = topData?.topPostsPaginated?.items ?? [];
  const totalPages = topData?.topPostsPaginated?.totalPages ?? 1;
  const currentPage = topData?.topPostsPaginated?.page ?? page;

  const sidebarAllPosts = allPage1?.postsPaginated?.items ?? [];

  const handlePageChange = (nextPage: number) => {
    setParams((prev) => {
      const p = new URLSearchParams(prev);
      p.set("page", String(nextPage));
      return p;
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading && !topData) return <div className="p-10">Loading...</div>;
  if (error)
    return <div className="p-10 text-red-500">Error: {error.message}</div>;

  return (
    <div className="px-4 py-8 max-w-7xl mx-auto">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* LEFT: Top posts */}
        <div className="flex-1 lg:w-2/3">
          <PostsSection posts={topItems} darkMode={darkMode} />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>

        {/* RIGHT: Sidebar shows ALL posts */}
        <Sidebar
          posts={sidebarAllPosts}
          darkMode={darkMode}
          title="All Posts"
          seeAllHref="/"
        />
      </div>
    </div>
  );
}
