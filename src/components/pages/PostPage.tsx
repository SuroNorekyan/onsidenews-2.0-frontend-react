// src/pages/PostPage.tsx

import { useParams } from "react-router-dom";
import { useQuery } from "@apollo/client";
import Sidebar from "../posts/Sidebar";
import { GET_ALL_POSTS, GET_SINGLE_POST } from "../../graphql/queries";
import { Clock } from "lucide-react";

export default function PostPage() {
  const { id } = useParams<{ id: string }>();
  const { data: postData } = useQuery(GET_SINGLE_POST, {
    variables: { id: Number(id) },
  });
  const { data: allPostsData } = useQuery(GET_ALL_POSTS);

  const post = postData?.post;
  const topPosts = allPostsData?.posts || [];

  if (!post) return <div className="p-10">Loading...</div>;

  return (
    <div className="px-4 py-8 max-w-6xl mx-auto">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Post content (left) */}
        <div className="w-full lg:w-2/3">
          <h1 className="text-3xl font-bold mb-2">{post.title}</h1>

          {/* Date + Clock Icon */}
          <div className="flex items-center text-gray-500 mb-6">
            <Clock className="w-4 h-4 mr-2" />
            <span>{new Date(post.createdAt).toLocaleDateString()}</span>
          </div>

          {/* Image */}
          <div className="w-full h-80  rounded mb-6">
            {post.imageUrl && (
            <img
              src={post.imageUrl}
              alt={post.title}
              className="w-full h-80 object-cover object-[50%_10%] "
            />
          )}
          </div>
          

          {/* Content */}
          <p className="text-lg leading-relaxed whitespace-pre-line">
            {post.content}
          </p>
        </div>

        {/* Sidebar (right) */}
        
          <Sidebar posts={topPosts} />
        
      </div>
    </div>
  );
}
