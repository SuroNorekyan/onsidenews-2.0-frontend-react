// src/components/posts/Sidebar.tsx
import { useNavigate } from "react-router-dom";
import TopPostCard from "./TopPostCard";

interface SidebarProps {
  posts: any[];
  darkMode?: boolean;
  title?: string;
  seeAllHref?: string;
}

export default function Sidebar({
  posts,
  darkMode,
  title,
  seeAllHref,
}: SidebarProps) {
  const navigate = useNavigate();

  return (
    <div className="w-full lg:w-1/3 space-y-4">
      <div className="w-full h-32 bg-gray-300 rounded-lg flex items-center justify-center text-lg font-bold text-gray-700">
        ADS
      </div>

      <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow space-y-2">
        <h3 className="text-lg font-bold mb-2">{title ?? "Top Posts"}</h3>

        {posts.slice(0, 10).map((post) => (
          <TopPostCard key={post.postId} post={post} darkMode={darkMode} />
        ))}

        {seeAllHref && (
          <button
            onClick={() => navigate(seeAllHref)}
            className="w-full mt-2 text-red-500 hover:text-red-700 text-sm text-center"
          >
            See All
          </button>
        )}
      </div>
    </div>
  );
}
