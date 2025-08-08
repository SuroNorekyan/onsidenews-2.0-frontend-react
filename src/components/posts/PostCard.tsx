import { useNavigate } from "react-router-dom";
import { Clock, Eye } from "lucide-react";
import { FC } from "react";

interface PostCardProps {
  post: {
    postId: string;
    title: string;
    content: string;
    imageUrl: string | null;
    createdAt: string;
    viewsCount: number;
  };
  darkMode?: boolean;
}

const PostCard: FC<PostCardProps> = ({ post, darkMode }: PostCardProps) => {
  const navigate = useNavigate();

  const cardBg = darkMode ? "bg-gray-800" : "bg-white";
  const titleColor = darkMode ? "text-white" : "text-black";
  const textColor = darkMode ? "text-gray-200" : "text-gray-600";
  const metaColor = darkMode ? "text-gray-400" : "text-gray-400";

  return (
    <div
      className={`${cardBg} rounded-lg shadow hover:shadow-lg dark:hover:bg-gray-700 dark:bg-gray-800 cursor-pointer transition overflow-hidden`}
      onClick={() => navigate(`/posts/${post.postId}`)}
    >
      <div>
        {post.imageUrl && (
        <img
          src={post.imageUrl}
          alt={post.title}
          className="w-full h-48 object-cover object-[50%_30%]"
        />
      )}
      </div>
      
      <div className="p-4">
        <h2 className={`text-lg font-bold ${titleColor}`}>{post.title}</h2>
        <p className={`text-sm ${textColor}`}>{post.content.slice(0, 50)}...</p>

        <div
          className={`flex items-center justify-between mt-2 text-xs ${metaColor}`}
        >
          <div className="flex items-center gap-1">
            <Clock size={14} />
            <span>{new Date(post.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-1">
            <Eye size={14} />
            <span>{post.viewsCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
export default PostCard;
