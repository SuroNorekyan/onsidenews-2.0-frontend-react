interface TopPostCardProps {
  post: {
    postId: string;
    title: string;
    imageUrl: string | null;
  };
}

export default function TopPostCard({ post }: TopPostCardProps) {
  return (
    <div className="flex gap-2 items-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded">
      <img
        src={post.imageUrl || "/placeholder.jpg"}
        alt={post.title}
        className="w-16 h-12 object-cover rounded"
      />
      <div className="text-sm font-medium line-clamp-2">{post.title}</div>
    </div>
  );
}
