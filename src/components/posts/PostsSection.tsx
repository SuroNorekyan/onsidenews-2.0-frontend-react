//src/components/posts/PostsSection.tsx
import PostCard from "./PostCard";

interface PostSectionProps {
  posts: any[];
  darkMode?: boolean;
  selectedLang?: "HY" | "RU" | "EN";
}

export default function PostsSection({ posts, darkMode, selectedLang }: PostSectionProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {posts.map((post) => (
        <PostCard key={post.postId} post={post} darkMode={darkMode} selectedLang={selectedLang} />
      ))}
    </div>
  );
}
