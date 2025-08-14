import { useQuery } from "@apollo/client";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GET_ALL_POSTS } from "../../graphql/queries";
import clsx from "clsx";
import { safeTitleText } from "../../utils/shared/textHelpers";
import { Clock, Eye } from "lucide-react";
import Button from "../shared/Button";
import { scrollToTop } from "../../utils/shared/scrollBehaviour";

export interface PostsCarouselInterface {
  seeAllHref: string; // optional, so the button only renders if provided
}

type PostItem = {
  postId: number;
  title: string;
  imageUrl?: string | null;
  createdAt: string;
  viewsCount: number;
};

export default function PostsCarousel({ seeAllHref }: PostsCarouselInterface) {
  const { data, loading } = useQuery<{ posts: PostItem[] }>(GET_ALL_POSTS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const navigate = useNavigate();

  if (loading) return <div>Loading carousel…</div>;
  if (!data?.posts?.length) return <div>No posts found</div>;

  const posts = data.posts.map((p) => ({
    ...p,
    postId: Number(p.postId),
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

  const safeTitle = safeTitleText(post.title);

  // Handle touch events for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;

    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        nextSlide(); // swipe left
      } else {
        prevSlide(); // swipe right
      }
    }
    setTouchStartX(null);
  };

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

      {/* Carousel container */}
      <div
        className="relative w-full h-64 md:h-[450px] rounded-xl overflow-hidden cursor-pointer"
        onClick={() => goToPost(post.postId)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Background image */}
        <div
          className="w-full h-full bg-center bg-cover"
          style={{
            backgroundImage: `url(${post.imageUrl || "/placeholder.jpg"})`,
          }}
        >
          {/* Overlay text block */}
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
            e.stopPropagation(); // prevent post click
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
            e.stopPropagation(); // prevent post click
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
