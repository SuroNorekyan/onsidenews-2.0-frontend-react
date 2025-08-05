import PostCard from "./PostCard";

interface Props {
  posts: any[];
}

export default function PostsSection({ posts }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {posts.map((post) => (
        <PostCard key={post.postId} post={post} />
      ))}
    </div>
  );
}
