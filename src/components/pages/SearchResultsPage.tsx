import { FC, useEffect, useMemo, useState } from "react";
import { useLazyQuery, useQuery } from "@apollo/client";
import { useSearchParams } from "react-router-dom";
import PostsSection from "../posts/PostsSection";
import Sidebar from "../posts/Sidebar";
import PostsCarousel from "../ui/PostsCarousel";
import Pagination from "../shared/Pagination";
import { DID_YOU_MEAN, GET_TOP_POSTS_WITH_LANG, SEARCH_POSTS } from "../../graphql/queries";
import { useLanguage } from "../../i18n/LanguageContext";

const PAGE_SIZE = 12;

const SearchResultsPage: FC<{ darkMode?: boolean }> = ({ darkMode }) => {
  const { language } = useLanguage();
  const [params, setParams] = useSearchParams();
  const q = (params.get("q") || "").trim();
  const [page, setPage] = useState(1);

  const [runSearch, { data: searchData, loading: searching, refetch: refetchSearch } ] = useLazyQuery(SEARCH_POSTS, {
    fetchPolicy: "network-only",
    notifyOnNetworkStatusChange: true,
  });

  const { data: topData, refetch: refetchTop } = useQuery(GET_TOP_POSTS_WITH_LANG, {
    variables: { limit: 12, language },
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
  });

  const [runDYM, { data: dymData }] = useLazyQuery(DID_YOU_MEAN);

  // Run search when q or language changes
  useEffect(() => {
    setPage(1);
    if (q) {
      runSearch({ variables: { filter: { containsText: q, sortByRelevance: "DESC" }, language } });
      runDYM({ variables: { query: q } });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, language]);

  // If suggestion differs, allow user to click to accept it
  const suggestion = dymData?.didYouMean;

  const items = useMemo(() => {
    const arr = searchData?.searchPosts || [];
    // Map to PostCard shape (contentResolved)
    return arr.map((p: any) => ({
      postId: p.postId,
      servedLanguage: p.servedLanguage,
      imageUrl: p.imageUrl,
      createdAt: p.createdAt,
      viewsCount: p.viewsCount,
      isTop: p.isTop,
      contentResolved: {
        language: p.servedLanguage,
        title: p.title,
        content: p.content,
        tags: p.tags,
      },
    }));
  }, [searchData]);

  // Client-side pagination
  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;
  const pageItems = items.slice(start, start + PAGE_SIZE);

  const topPosts = topData?.topPosts || [];

  if (!q) {
    return (
      <div className="px-4 py-16 max-w-7xl mx-auto md:py-8">
        <div className="text-center text-gray-600">Enter a keyword to search.</div>
      </div>
    );
  }

  return (
    <div className="px-4 py-16 max-w-7xl mx-auto md:py-8">
      <div className="flex items-baseline justify-between mb-4">
        <h1 className="text-2xl font-semibold">Results for “{q}”</h1>
        {suggestion && suggestion !== q && (
          <div className="text-sm">
            Did you mean {" "}
            <button
              className="underline text-blue-600 dark:text-blue-400"
              onClick={() => setParams({ q: suggestion })}
            >
              {suggestion}
            </button>
            ?
          </div>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* LEFT: Search results */}
        <div className="flex-1 lg:w-2/3">
          {searching && !searchData ? (
            <div className="p-4">Searching…</div>
          ) : items.length === 0 ? (
            <div className="p-4 text-gray-600">No posts found.</div>
          ) : (
            <>
              <PostsSection posts={pageItems} darkMode={darkMode} selectedLang={language} />
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setPage} />
              <PostsCarousel seeAllHref={`/search?q=${encodeURIComponent(q)}`} />
            </>
          )}
        </div>

        {/* RIGHT: Top posts */}
        <Sidebar posts={topPosts} darkMode={darkMode} title="Top Posts" seeAllHref="/top-posts" />
      </div>
    </div>
  );
};

export default SearchResultsPage;

