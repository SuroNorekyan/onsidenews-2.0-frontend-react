// src/components/pages/index.tsx
import { FC } from "react";
import { useQuery } from "@apollo/client";
import PostsSection from "../posts/PostsSection";
import Sidebar from "../posts/Sidebar";
import { GET_TOP_POSTS, POSTS_IN_LANG } from "../../graphql/queries";
import PostsCarousel from "../ui/PostsCarousel";
import { useLanguage } from "../../i18n/LanguageContext";
import { useEffect } from "react";

interface HomePageProps {
  darkMode?: boolean;
}

const HomePage: FC<HomePageProps> = ({ darkMode }) => {
  const { language } = useLanguage();

  // Language-aware posts
  const { data, loading, error, refetch } = useQuery(POSTS_IN_LANG, {
    notifyOnNetworkStatusChange: true,
  });

  // Refetch when language changes to apply header-only language preference
  useEffect(() => {
    refetch();
  }, [language, refetch]);

  // fetch top posts for sidebar (sorted by date DESC)
  const { data: topData } = useQuery(GET_TOP_POSTS, {
    variables: { limit: 10 },
  });

  const topPosts = topData?.topPosts ?? [];
  const items = data?.posts ?? [];

  if (loading && !data) return <div className="p-10">Loading...</div>;
  if (error)
    return <div className="p-10 text-red-500">Error: {error.message}</div>;

  return (
    <div className="px-4 py-16 max-w-7xl mx-auto md:py-8">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* LEFT: all posts */}
        <div className="flex-1 lg:w-2/3">
          <PostsSection posts={items} darkMode={darkMode} selectedLang={language} />
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
