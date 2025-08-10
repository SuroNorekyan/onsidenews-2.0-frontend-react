import { useNavigate } from "react-router-dom";
import { Clock, Eye } from "lucide-react";
import { FC } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Plain-text teaser from markdown (no syntax chars)
function markdownToText(md: string) {
  return (md || "")
    .replace(/<[^>]*>/g, "") // remove all HTML tags
    .replace(/```[\s\S]*?```/g, "") // fenced code blocks
    .replace(/`[^`]*`/g, "") // inline code
    .replace(/!\[[^\]]*\]\([^)]+\)/g, "") // images
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // links -> text
    .replace(/^[#>*+-]\s+/gm, "") // list/quote/heading markers
    .replace(/[_*~`>#-]/g, "") // leftover md chars
    .replace(/\n+/g, " ")
    .trim();
}

interface PostCardProps {
  post: {
    postId: number | string;
    title: string;
    content: string;
    imageUrl: string | null;
    createdAt: string;
    viewsCount: number;
  };
  darkMode?: boolean;
}

const PostCard: FC<PostCardProps> = ({ post, darkMode }) => {
  const navigate = useNavigate();

  const cardBg = darkMode ? "bg-gray-800" : "bg-white";
  const titleColor = darkMode ? "text-white" : "text-black";
  const textColor = darkMode ? "text-gray-200" : "text-gray-600";
  const metaColor = "text-gray-400";

  const cleanText = markdownToText(post.content);
  const teaser =
    cleanText.length > 140 ? cleanText.slice(0, 140) + "…" : cleanText;

  const safeTitle = protectShortWords(
    post.title.length > 70 ? post.title.slice(0, 70) + "…" : post.title
  );

  const safeTeaser = protectShortWords(teaser);

  function protectShortWords(text: string, minLength = 15) {
    return text
      .split(/\s+/)
      .map((word) => {
        if (word.length < minLength) {
          return word.replace(/ /g, "\u00A0"); // Non-breaking for short words
        }
        return word; // Keep long words normal so browser can wrap
      })
      .join(" ");
  }

  return (
    <div
      className={`${cardBg} rounded-lg shadow hover:shadow-lg dark:hover:bg-gray-700 cursor-pointer transition overflow-hidden`}
      onClick={() => navigate(`/posts/${post.postId}`)}
    >
      {post.imageUrl && (
        <img
          src={post.imageUrl}
          alt={post.title}
          className="w-full h-48 object-cover object-[50%_30%]"
        />
      )}

      <div className="p-4">
        <h2
          className={`text-lg font-bold ${titleColor}  break-words overflow-hidden text-ellipsis prevent-short-break`}
          title={post.title}
        >
          {safeTitle}
        </h2>

        {/* clean teaser text */}
        <div
          className={`text-sm ${textColor} break-words line-clamp-3 overflow-hidden text-ellipsis prevent-short-break`}
        >
          {safeTeaser}
        </div>

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
