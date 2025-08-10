import { Clock, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface TopPostCardProps {
  post: {
    postId: string;
    title: string;
    imageUrl: string | null;
    createdAt?: string;
    viewsCount?: number;
  };
  darkMode?: boolean;
}

export default function TopPostCard({ post }: TopPostCardProps) {
  const navigate = useNavigate();

  return (
    <div
      className={`flex gap-2 items-start cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 bg-white dark:bg-gray-800 p-2 rounded`}
      onClick={() => navigate(`/posts/${post.postId}`)}
    >
      <div className="w-1/3 aspect-[5/3] overflow-hidden rounded">
        <img
        src={post.imageUrl || "/placeholder.jpg"}
        alt={post.title.slice(0,5) + "..."} 
        className=" w-full h-full object-cover object-[50%_10%] rounded " //break-all overflow-hidden text-ellipsis
      />
      </div>
      <div className="flex flex-col justify-between">
        <div
          className="text-sm font-medium text-black dark:text-white break-all overflow-hidden text-ellipsis line-clamp-2"
          title={post.title} // optional: show full text on hover
        >
          {post.title}
        </div>

        <div
          className={`flex items-center gap-4 text-xs mt-1 text-gray-500 dark:text-gray-400`}
        >
          {post.createdAt && (
            <div className="flex items-center gap-1">
              <Clock size={14} />
              <span>{new Date(post.createdAt).toLocaleDateString()}</span>
            </div>
          )}
          {post.viewsCount !== undefined && (
            <div className="flex items-center gap-1">
              <Eye size={14} />
              <span>{post.viewsCount}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
