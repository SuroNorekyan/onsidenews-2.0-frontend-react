import { useNavigate } from "react-router-dom";

interface PostCardProps {
  post: {
    postId: string;
    title: string;
    content: string;
    imageUrl: string | null;
    createdAt: string;
  };
}

export default function PostCard({ post }: PostCardProps) {
  const navigate = useNavigate();

  return (
    <div
      className="bg-white rounded-lg shadow hover:shadow-lg cursor-pointer transition overflow-hidden"
      onClick={() => navigate(`/posts/${post.postId}`)}
    >
      {post.imageUrl && (
        <img
          src={post.imageUrl}
          alt={post.title}
          className="w-full h-48 object-cover"
        />
      )}
      <div className="p-4">
        <h2 className="text-lg font-bold">{post.title}</h2>
        <p className="text-sm text-gray-600">{post.content.slice(0, 50)}...</p>
        <p className="text-xs text-gray-400 mt-2">
          {new Date(post.createdAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}
