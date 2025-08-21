// src/components/pages/HomePage.tsx
import { FC, useEffect, useState } from "react";
import { useQuery } from "@apollo/client";
import PostsSection from "../posts/PostsSection";
import Sidebar from "../posts/Sidebar";
import PostsCarousel from "../ui/PostsCarousel";
import Pagination from "../shared/Pagination";
import SortBar from "../shared/SortBar";
import { Clock, Eye } from "lucide-react";
import {
  POSTS_IN_LANG_PAGINATED,
  GET_TOP_POSTS_WITH_LANG,
} from "../../graphql/queries";
import { useLanguage } from "../../i18n/LanguageContext";

const PAGE_SIZE = 12;

const HomePage: FC<{ darkMode?: boolean }> = ({ darkMode }) => {
  const { language } = useLanguage();
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState<"newest" | "views">("newest");

  // LEFT: main list (paginated + language-aware)
  const { data, loading, error, refetch } = useQuery(POSTS_IN_LANG_PAGINATED, {
    variables: { page, pageSize: PAGE_SIZE, language },
    notifyOnNetworkStatusChange: true,
    fetchPolicy: "cache-and-network",
  });

  // RIGHT: Top posts (language-aware)
  const { data: topData, refetch: refetchTop } = useQuery(
    GET_TOP_POSTS_WITH_LANG,
    {
      variables: { limit: 12, language },
      notifyOnNetworkStatusChange: true,
      fetchPolicy: "cache-and-network",
    }
  );

  // Refetch both when language changes; reset page to 1
  useEffect(() => {
    setPage(1);
    refetch({ page: 1, pageSize: PAGE_SIZE, language });
    refetchTop({ limit: 12, language });
  }, [language, refetch, refetchTop]);

  const pageData = data?.postsInLangPaginated;
  const items = pageData?.items ?? [];
  const totalPages = pageData?.totalPages ?? 1;
  const currentPage = pageData?.page ?? page;
  const topPosts = topData?.topPosts ?? [];

  if (loading && !data) return <div className="p-10">Loading...</div>;
  if (error)
    return <div className="p-10 text-red-500">Error: {error.message}</div>;

  return (
    <div className="px-4 py-16 max-w-7xl mx-auto md:py-8">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* LEFT */}
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
            posts={[...items].sort((a: any, b: any) => {
              if (sortKey === "views") {
                return (b?.viewsCount ?? 0) - (a?.viewsCount ?? 0);
              }
              // default: newest by createdAt desc
              const ad = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
              const bd = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
              return bd - ad;
            })}
            darkMode={darkMode}
            selectedLang={language}
          />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setPage}
          />
          {/* Carousel fetches its own language-aware data internally */}
          <PostsCarousel seeAllHref="/" />
        </div>

        {/* RIGHT */}
        <Sidebar
          posts={topPosts}
          darkMode={darkMode}
          title="Top Posts"
          seeAllHref="/top-posts"
          className="mt-12"
        />
      </div>
    </div>
  );
};

export default HomePage;
