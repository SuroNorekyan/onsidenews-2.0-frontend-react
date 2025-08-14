// src/components/pages/index.tsx
import { FC } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@apollo/client";
import PostsSection from "../posts/PostsSection";
import Sidebar from "../posts/Sidebar";
import Pagination from "../shared/Pagination";
import { GET_POSTS_PAGINATED, GET_TOP_POSTS } from "../../graphql/queries";
import PostsCarousel from "../ui/PostsCarousel";

interface HomePageProps {
  darkMode?: boolean;
}

const PAGE_SIZE = 12;

const HomePage: FC<HomePageProps> = ({ darkMode }) => {
  const [params, setParams] = useSearchParams();
  const pageFromUrl = Number(params.get("page") || 1);
  const page = Number.isNaN(pageFromUrl) || pageFromUrl < 1 ? 1 : pageFromUrl;

  const { data, loading, error } = useQuery(GET_POSTS_PAGINATED, {
    variables: { page, pageSize: PAGE_SIZE },
    notifyOnNetworkStatusChange: true,
  });

  // fetch top posts for sidebar (sorted by date DESC)
  const { data: topData } = useQuery(GET_TOP_POSTS, {
    variables: { limit: 10 },
  });

  const items = data?.postsPaginated?.items ?? [];
  const totalPages = data?.postsPaginated?.totalPages ?? 1;
  const currentPage = data?.postsPaginated?.page ?? page;

  const topPosts = topData?.topPosts ?? [];

  const handlePageChange = (nextPage: number) => {
    setParams((prev) => {
      const p = new URLSearchParams(prev);
      p.set("page", String(nextPage));
      return p;
    });
  };

  if (loading && !data) return <div className="p-10">Loading...</div>;
  if (error)
    return <div className="p-10 text-red-500">Error: {error.message}</div>;

  return (
    <div className="px-4 py-16 max-w-7xl mx-auto md:py-8">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* LEFT: all posts */}
        <div className="flex-1 lg:w-2/3">
          <PostsSection posts={items} darkMode={darkMode} />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
          <PostsCarousel seeAllHref="/"/>
        </div>

        {/* RIGHT: sidebar shows TOP posts */}
        <Sidebar
          posts={topPosts}
          darkMode={darkMode}
          title="Top Posts"
          seeAllHref="/top-posts"
        />
      </div>
    </div>
  );
};

export default HomePage;
