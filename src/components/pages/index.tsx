import { useQuery } from "@apollo/client";
import PostsSection from "../posts/PostsSection";
import { GET_ALL_POSTS } from "../../graphql/queries";
import Sidebar from "../posts/Sidebar";
import Pagination from "../shared/Pagination";
import { FC } from "react";

interface HomePageProps {
  darkMode?: boolean;
}

const HomePage: FC<HomePageProps> = ({ darkMode }) => {
  const { data, loading, error } = useQuery(GET_ALL_POSTS);

  if (loading) return <div className="p-10">Loading...</div>;
  if (error)
    return <div className="p-10 text-red-500">Error: {error.message}</div>;

  const posts = data?.posts || [];

  return (
    <div className="px-4 py-8 max-w-7xl mx-auto">
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 lg:w-2/3">
          <PostsSection posts={posts} darkMode={darkMode} />
          <Pagination pages={[1, 2, 3, "...", "w"]} />
        </div>
        <Sidebar posts={posts} darkMode={darkMode} />
      </div>
    </div>
  );
};

export default HomePage;
