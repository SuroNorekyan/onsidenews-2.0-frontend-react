import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/ui/Header";
import HomePage from "./components/pages";
import PostPage from "./components/pages/PostPage";

function App() {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div
      className={
        darkMode ? "dark bg-gray-900 text-white" : "bg-white text-black"
      }
    >
      <Router>
        <Header
          darkMode={darkMode}
          toggleDarkMode={() => setDarkMode(!darkMode)}
        />

        <main className="pt-4 min-h-screen">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/posts/:id" element={<PostPage />} />
            {/* Future: <Route path="/top-posts" element={<TopPostsPage />} /> */}
          </Routes>
        </main>
      </Router>
    </div>
  );
}

export default App;
