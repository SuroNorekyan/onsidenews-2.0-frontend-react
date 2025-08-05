import { useParams } from "react-router-dom";
import { useQuery } from "@apollo/client";
import Sidebar from "../posts/Sidebar";
import { GET_ALL_POSTS, GET_SINGLE_POST } from "../../graphql/queries";

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
    <div className="px-4 py-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
      {post.imageUrl && (
        <img
          src={post.imageUrl}
          alt={post.title}
          className="w-full h-80 object-cover rounded mb-6"
        />
      )}
      <p className="text-lg leading-relaxed mb-10">{post.content}</p>
      aaaaaaaa
      <Sidebar posts={topPosts} />
    </div>
  );
}
