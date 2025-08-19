import { useNavigate } from "react-router-dom";
import { Clock, Eye, Globe } from "lucide-react";
import { FC } from "react";

// Plain-text teaser from markdown (no syntax chars)
function markdownToText(md: string) {
  return (md || "")
    .replace(/<[^>]*>/g, "") // remove HTML tags
    .replace(/```[\s\S]*?```/g, "") // fenced code blocks
    .replace(/`[^`]*`/g, "") // inline code
    .replace(/!\[[^\]]*\]\([^)]+\)/g, "") // images
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // links -> text
    .replace(/^[#>*+-]\s+/gm, "") // list/quote/heading markers
    .replace(/[_*~`>#-]/g, "") // leftover md chars
    .replace(/\n+/g, " ")
    .trim();
}

type Lang = "HY" | "RU" | "EN";

interface ApiPost {
  postId: number | string;
  imageUrl?: string | null;
  createdAt?: string | null;
  viewsCount?: number | null;
  isTop?: boolean;
  servedLanguage?: Lang;
  contentResolved?: {
    language?: Lang;
    title?: string;
    content?: string;
    tags?: string[] | null;
  } | null;
}

interface PostCardProps {
  post: ApiPost;
  darkMode?: boolean;
  selectedLang?: Lang;
}

const PostCard: FC<PostCardProps> = ({ post, darkMode, selectedLang }) => {
  const navigate = useNavigate();

  const cardBg = darkMode ? "bg-gray-800" : "bg-white";
  const titleColor = darkMode ? "text-white" : "text-black";
  const textColor = darkMode ? "text-gray-200" : "text-gray-600";
  const metaColor = "text-gray-400";

  const title = post.contentResolved?.title || "";
  const cleanText = markdownToText(post.contentResolved?.content || "");
  const teaser = cleanText.length > 140 ? cleanText.slice(0, 140) + "…" : cleanText;

  const langBadge = (post.servedLanguage || post.contentResolved?.language) as Lang | undefined;

  return (
    <div
      className={`${cardBg} rounded-lg shadow hover:shadow-lg dark:hover:bg-gray-700 cursor-pointer transition overflow-hidden`}
      onClick={() => navigate(`/posts/${post.postId}` + (selectedLang ? `?lang=${selectedLang}` : ""))}
    >
      {post.imageUrl && (
        <img
          src={post.imageUrl}
          alt={title}
          className="w-full h-48 object-cover object-[50%_30%]"
        />
      )}

      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h2
            className={`text-lg font-bold ${titleColor} break-words overflow-hidden text-ellipsis prevent-short-break`}
            title={title}
          >
            {title}
          </h2>
          {langBadge && (
            <span className="shrink-0 inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
              <Globe size={12} /> {langBadge}
            </span>
          )}
        </div>

        {/* Teaser */}
        <div className={`text-sm ${textColor} break-words line-clamp-3 overflow-hidden text-ellipsis prevent-short-break`}>
          {teaser}
        </div>

        <div className={`flex items-center justify-between mt-2 text-xs ${metaColor}`}>
          {post.createdAt && (
            <div className="flex items-center gap-1">
              <Clock size={14} />
              <span>{new Date(post.createdAt).toLocaleDateString()}</span>
            </div>
          )}
          {typeof post.viewsCount === "number" && (
            <div className="flex items-center gap-1">
              <Eye size={14} />
              <span>{post.viewsCount}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostCard;
