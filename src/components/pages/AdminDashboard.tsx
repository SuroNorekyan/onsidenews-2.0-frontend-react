//src/components/pages/AdminDashboard.tsx
import { useMutation, useQuery, useApolloClient } from "@apollo/client";
import { useState } from "react";
import clsx from "clsx";
import { useAuth } from "../../auth/AuthContext";
import { CREATE_POST, UPDATE_POST, DELETE_POST } from "../../graphql/mutations";
import { GET_ALL_POSTS, GET_SINGLE_POST } from "../../graphql/queries";
import MarkdownEditor from "../ui/MarkdownEditor";

type PostListItem = {
  postId: number;
  title: string;
  imageUrl?: string | null;
  createdAt: string;
  viewsCount: number;
  isTop: boolean;
};

const emptyForm = {
  postId: 0,
  title: "",
  content: "",
  imageUrl: "",
  tags: "" as string, // CSV in UI, backend expects string[]
  isTop: false,
};

export default function AdminDashboard() {
  const apollo = useApolloClient(); // ✅ Hooks go inside the component
  const { user, logout } = useAuth();
  const [form, setForm] = useState({ ...emptyForm });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string>("");

  const { data, loading, refetch } = useQuery<{ posts: PostListItem[] }>(
    GET_ALL_POSTS
  );

  const [createPost, { loading: creating }] = useMutation(CREATE_POST, {
    onCompleted: () => {
      setFeedback("Post created");
      setForm({ ...emptyForm });
      refetch();
    },
    onError: (e) => setFeedback(e.message),
  });

  const [updatePost, { loading: updating }] = useMutation(UPDATE_POST, {
    onCompleted: () => {
      setFeedback("Post updated");
      setForm({ ...emptyForm });
      setEditingId(null);
      refetch();
    },
    onError: (e) => setFeedback(e.message),
  });

  const [deletePost, { loading: deleting }] = useMutation(DELETE_POST, {
    onCompleted: () => {
      setFeedback("Post deleted");
      if (editingId) setEditingId(null);
      refetch();
    },
    onError: (e) => setFeedback(e.message),
  });

  const isBusy = creating || updating || deleting;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback("");
    const payload = {
      title: form.title.trim(),
      content: form.content,
      imageUrl: form.imageUrl?.trim() || undefined,
      tags: form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      isTop: !!form.isTop,
    };

    if (editingId) {
      updatePost({ variables: { id: editingId, input: payload } });
    } else {
      createPost({ variables: { input: payload } });
    }
  };

  const fetchPostForEdit = async (id: number) => {
    try {
      const { data } = await apollo.query({
        query: GET_SINGLE_POST,
        variables: { id },
        fetchPolicy: "network-only",
      });
      const post = data.post;
      setForm({
        postId: post.postId,
        title: post.title,
        content: post.content ?? "",
        imageUrl: post.imageUrl ?? "",
        tags: "",
        isTop: !!post.isTop,
      });
    } catch (e) {
      console.error(e);
      setFeedback("Failed to load post body");
    }
  };

  const startEdit = (p: PostListItem) => {
    setEditingId(p.postId);
    fetchPostForEdit(p.postId);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({ ...emptyForm });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-sm opacity-80">
            Signed in as <b>{user?.username}</b>
          </p>
        </div>
        <button
          className="px-3 py-1.5 rounded-xl bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700"
          onClick={logout}
        >
          Log out
        </button>
      </div>

      {/* Feedback */}
      {feedback && (
        <div className="rounded-xl bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 px-4 py-2">
          {feedback}
        </div>
      )}

      {/* Post Form */}
      <section className="rounded-2xl border p-4 space-y-4">
        <h2 className="text-xl font-semibold">
          {editingId ? "Edit Post" : "Create Post"}
        </h2>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1">Title</label>
              <input
                className="w-full rounded-lg border px-3 py-2 bg-transparent"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Image URL</label>
              <input
                className="w-full rounded-lg border px-3 py-2 bg-transparent"
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                placeholder="https://…"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">
                Tags (comma separated)
              </label>
              <input
                className="w-full rounded-lg border px-3 py-2 bg-transparent"
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                placeholder="barcelona, messi, laliga"
              />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <input
                id="isTop"
                type="checkbox"
                className="w-4 h-4"
                checked={form.isTop}
                onChange={(e) => setForm({ ...form, isTop: e.target.checked })}
              />
              <label htmlFor="isTop" className="text-sm">
                Mark as Top
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm mb-2">Content (Markdown)</label>
            <MarkdownEditor
              value={form.content}
              onChange={(v: any) => setForm({ ...form, content: v })}
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={isBusy}
              className={clsx(
                "px-4 py-2 rounded-xl text-white",
                isBusy ? "bg-gray-400" : "bg-red-600 hover:bg-red-700"
              )}
            >
              {editingId
                ? isBusy
                  ? "Saving…"
                  : "Save Changes"
                : isBusy
                ? "Creating…"
                : "Create Post"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={cancelEdit}
                className="px-4 py-2 rounded-xl bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      {/* Posts List */}
      <section className="rounded-2xl border p-4 space-y-4">
        <h2 className="text-xl font-semibold">All Posts</h2>
        {loading ? (
          <div>Loading…</div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {data?.posts?.map((p) => (
              <article
                key={p.postId}
                className="rounded-xl border p-3 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{p.title}</h3>
                  {p.isTop && (
                    <span className="text-xs px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-900/30">
                      TOP
                    </span>
                  )}
                </div>
                <div className="text-xs opacity-70">
                  {new Date(p.createdAt).toLocaleString()} • {p.viewsCount}{" "}
                  views
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <button
                    className="px-3 py-1.5 rounded-lg bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-sm"
                    onClick={() => startEdit(p)}
                  >
                    Edit
                  </button>
                  <button
                    className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm"
                    onClick={() => deletePost({ variables: { id: p.postId } })}
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
