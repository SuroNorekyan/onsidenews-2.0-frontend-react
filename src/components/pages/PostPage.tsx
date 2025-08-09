// src/components/pages/PostPage.tsx
import { useParams } from "react-router-dom";
import { useQuery } from "@apollo/client";
import Sidebar from "../posts/Sidebar";
import { GET_TOP_POSTS, GET_SINGLE_POST } from "../../graphql/queries";
import { Clock } from "lucide-react";

export default function PostPage() {
  const { id } = useParams<{ id: string }>();
  const { data: postData } = useQuery(GET_SINGLE_POST, {
    variables: { id: Number(id) },
  });

  // Sidebar shows top posts
  const { data: topData } = useQuery(GET_TOP_POSTS, {
    variables: { limit: 10, sortByCreatedAt: "DESC" },
  });

  const post = postData?.post;
  const topPosts = topData?.topPosts || [];

  if (!post) return <div className="p-10">Loading...</div>;

  return (
    <div className="px-4 py-8 max-w-6xl mx-auto">
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-2/3">
          <h1 className="text-3xl font-bold mb-2">{post.title}</h1>
          <div className="flex items-center text-gray-500 mb-6">
            <Clock className="w-4 h-4 mr-2" />
            <span>{new Date(post.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="w-full h-80 rounded mb-6">
            {post.imageUrl && (
              <img
                src={post.imageUrl}
                alt={post.title}
                className="w-full h-80 object-cover object-[50%_10%]"
              />
            )}
          </div>
          <p className="text-lg leading-relaxed whitespace-pre-line">
            {post.content}
          </p>
        </div>

        {/* Sidebar: Top posts */}
        <Sidebar posts={topPosts} seeAllHref="/top-posts" />
      </div>
    </div>
  );
}
