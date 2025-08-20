// src/components/ui/PostsCarousel.tsx
import { gql, useQuery } from "@apollo/client";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import clsx from "clsx";
import { Clock, Eye } from "lucide-react";
import Button from "../shared/Button";
import { safeTitleText } from "../../utils/shared/textHelpers";
import { scrollToTop } from "../../utils/shared/scrollBehaviour";
import { useLanguage } from "../../i18n/LanguageContext";

export interface PostsCarouselInterface {
  seeAllHref: string; // optional, so the button only renders if provided
}

/** Lightweight language-aware list for the carousel */
const POSTS_IN_LANG_LIST = gql`
  query Posts($language: LanguageCode) {
    posts(language: $language) {
      postId
      servedLanguage
      imageUrl
      createdAt
      viewsCount
      isTop
      contentResolved {
        language
        title
        content
        tags
      }
      title
      content
      tags
    }
  }
`;

type PostItem = {
  postId: number | string;
  imageUrl?: string | null;
  createdAt: string;
  viewsCount: number;
  servedLanguage?: "EN" | "RU" | "HY" | null;
  contentResolved?: {
    language: "EN" | "RU" | "HY";
    title: string;
    content: string;
    tags: string[];
  };
  title?: string | null; // legacy
};

export default function PostsCarousel({ seeAllHref }: PostsCarouselInterface) {
  const { language } = useLanguage();

  const { data, loading, refetch } = useQuery<{ posts: PostItem[] }>(
    POSTS_IN_LANG_LIST,
    {
      variables: { language },
      notifyOnNetworkStatusChange: true,
      fetchPolicy: "cache-and-network",
    }
  );

  // re-fetch when language changes
  useEffect(() => {
    refetch({ language });
  }, [language, refetch]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const navigate = useNavigate();

  if (loading && !data?.posts?.length) return <div>Loading carousel…</div>;
  const raw = data?.posts ?? [];
  if (!raw.length) return <div>No posts found</div>;

  const posts = raw.map((p) => ({
    ...p,
    postId: Number(p.postId),
    _title: p.contentResolved?.title ?? p.title ?? "",
  }));

  const post = posts[currentIndex];

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? posts.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === posts.length - 1 ? 0 : prev + 1));
  };

  const goToPost = (id: number) => {
    navigate(`/posts/${id}`);
  };

  const safeTitle = safeTitleText(post._title);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Posts</h2>
        {seeAllHref && (
          <Button
            onClick={() => {
              navigate(seeAllHref);
              scrollToTop();
            }}
            text="See All"
            className="px-3 py-1.5 rounded-xl text-red-500 hover:text-red-700 text-sm"
            bgColor=""
            textColor="text-red-500"
            hoverTextColor="hover:text-red-700"
          />
        )}
      </div>

      {/* Carousel */}
      <div
        className="relative w-full h-64 md:h-[450px] rounded-xl overflow-hidden cursor-pointer"
        onClick={() => goToPost(post.postId)}
        onTouchStart={(e) => setTouchStartX(e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touchStartX === null) return;
          const diff = touchStartX - e.changedTouches[0].clientX;
          if (Math.abs(diff) > 50) diff > 0 ? nextSlide() : prevSlide();
          setTouchStartX(null);
        }}
      >
        {/* Background image */}
        <div
          className="w-full h-full bg-center bg-cover"
          style={{
            backgroundImage: `url(${post.imageUrl || "/placeholder.jpg"})`,
          }}
        >
          {/* Overlay text */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent flex flex-col justify-end p-4">
            <div className="flex items-center justify-start text-gray-200 text-xs mb-1">
              <div className="flex items-center gap-1 mr-3">
                <Clock size={14} />
                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye size={14} />
                <span>{post.viewsCount}</span>
              </div>
            </div>
            <h3 className="text-white text-lg font-semibold break-words">
              {safeTitle}
            </h3>
          </div>
        </div>

        {/* Left button */}
        <Button
          onClick={(e) => {
            e.stopPropagation();
            prevSlide();
          }}
          text="‹"
          fontSize="lg"
          rounded="rounded-full"
          padding="p-5"
          className={clsx(
            "absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 text-white hover:bg-black/60"
          )}
          bgColor="bg-black/40"
          textColor="text-white"
          hoverBgColor="hover:bg-black/60"
        />

        {/* Right button */}
        <Button
          onClick={(e) => {
            e.stopPropagation();
            nextSlide();
          }}
          text="›"
          fontSize="lg"
          rounded="rounded-full"
          padding="p-5"
          className={clsx(
            "absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 text-white hover:bg-black/60"
          )}
          bgColor="bg-black/40"
          textColor="text-white"
          hoverBgColor="hover:bg-black/60"
        />
      </div>
    </div>
  );
}
