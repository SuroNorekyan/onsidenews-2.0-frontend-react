// src/components/pages/TopPostsPage.tsx
import React from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@apollo/client";
import PostsSection from "../posts/PostsSection";
import Sidebar from "../posts/Sidebar";
import Pagination from "../shared/Pagination";
import {
  GET_POSTS_PAGINATED,
  GET_TOP_POSTS_IN_LANG_PAGINATED,
} from "../../graphql/queries";
import PostsCarousel from "../ui/PostsCarousel";
import SortBar from "../shared/SortBar";
import { Clock, Eye } from "lucide-react";
import { useLanguage } from "../../i18n/LanguageContext";

const PAGE_SIZE = 12;

export default function TopPostsPage({ darkMode }: { darkMode?: boolean }) {
  const [params, setParams] = useSearchParams();
  const pageFromUrl = Number(params.get("page") || 1);
  const page = Number.isNaN(pageFromUrl) || pageFromUrl < 1 ? 1 : pageFromUrl;
  const [sortKey, setSortKey] = React.useState<"newest" | "views">("newest");
  const { language } = useLanguage();

  // LEFT: Top posts paginated (primary list)
  const {
    data: topData,
    loading,
    error,
  } = useQuery(GET_TOP_POSTS_IN_LANG_PAGINATED, {
    variables: { page, pageSize: PAGE_SIZE, language },
    notifyOnNetworkStatusChange: true,
  });

  // RIGHT: Sidebar shows ALL posts (first page for freshness)
  const { data: allPage1 } = useQuery(GET_POSTS_PAGINATED, {
    variables: { page: 1, pageSize: 10 },
  });

  const topItems = topData?.topPostsInLangPaginated?.items ?? [];
  const totalPages = topData?.topPostsInLangPaginated?.totalPages ?? 1;
  const currentPage = topData?.topPostsInLangPaginated?.page ?? page;

  const sidebarAllPosts = allPage1?.postsPaginated?.items ?? [];

  const handlePageChange = (nextPage: number) => {
    setParams((prev) => {
      const p = new URLSearchParams(prev);
      p.set("page", String(nextPage));
      return p;
    });
  };

  if (loading && !topData) return <div className="p-10">Loading...</div>;
  if (error)
    return <div className="p-10 text-red-500">Error: {error.message}</div>;

  return (
    <div className="px-4 py-16 max-w-7xl mx-auto md:py-8">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* LEFT: Top posts */}
        <div className="flex-1 lg:w-2/3">
          <SortBar
            darkMode={darkMode}
            options={[
              { key: "newest", label: "Newest", icon: <Clock size={16} /> },
              { key: "views", label: "Most Viewed", icon: <Eye size={16} /> },
            ]}
            value={sortKey}
            onChange={(k) => setSortKey(k as any)}
          />
          <PostsSection
            posts={[...topItems].sort((a: any, b: any) => {
              if (sortKey === "views") {
                return (b?.viewsCount ?? 0) - (a?.viewsCount ?? 0);
              }
              const ad = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
              const bd = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
              return bd - ad;
            })}
            darkMode={darkMode}
          />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
          <PostsCarousel seeAllHref="/"/>
        </div>

        {/* RIGHT: Sidebar shows ALL posts */}
        <Sidebar
          posts={sidebarAllPosts}
          darkMode={darkMode}
          title="All Posts"
          seeAllHref="/"
          className="mt-12"
        />
      </div>
    </div>
  );
}
