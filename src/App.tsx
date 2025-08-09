// app.tsx
import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/ui/Header";
import PostPage from "./components/pages/PostPage";
import HomePage from "./components/pages";
import Footer from "./components/ui/Footer";
import TopPostsPage from "./components/pages/TopPostsPage";
import AdminRoute from "./auth/AdminRoute";
import AdminDashboard from "./components/pages/AdminDashboard";
import AdminLogin from "./components/pages/AdminLogin";

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
        <main className="pt-20 min-h-screen">
          <Routes>
            <Route path="/" element={<HomePage darkMode={darkMode} />} />
            <Route path="/posts/:id" element={<PostPage />} />
            <Route
              path="/top-posts"
              element={<TopPostsPage darkMode={darkMode} />}
            />

            {/* Admin */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />
          </Routes>
          <Footer darkMode={true} />
        </main>
      </Router>
    </div>
  );
}

export default App;
