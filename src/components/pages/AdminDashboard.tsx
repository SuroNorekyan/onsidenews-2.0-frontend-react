import {
  useMutation,
  useQuery,
  useApolloClient,
  useLazyQuery,
} from "@apollo/client";
import { useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import { useAuth } from "../../auth/AuthContext";
import { CREATE_POST, UPDATE_POST, DELETE_POST } from "../../graphql/mutations";
import {
  GET_ALL_POSTS,
  GET_SINGLE_POST,
  SEARCH_POSTS,
  DID_YOU_MEAN,
} from "../../graphql/queries";
import MarkdownEditor from "../ui/MarkdownEditor";
import Pagination from "../shared/Pagination";

type PostItem = {
  postId: number; // we’ll normalize to number even if backend returns string sometimes
  title: string;
  imageUrl?: string | null;
  createdAt: string;
  viewsCount: number;
  isTop: boolean;
  content?: string | null;
  tags?: string[] | null;
};

const emptyForm = {
  postId: 0,
  title: "",
  content: "",
  imageUrl: "",
  tags: "", // CSV in UI, backend expects string[]
  isTop: false,
};

export default function AdminDashboard() {
  const apollo = useApolloClient();
  const { user, logout } = useAuth();

  // --- form/edit state ---
  const [form, setForm] = useState({ ...emptyForm });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string>("");

  // --- list/search/pagination state ---
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [pageSize, setPageSize] = useState<number>(8);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const { data, loading, refetch } = useQuery<{ posts: PostItem[] }>(
    GET_ALL_POSTS
  );

  // Lazy search + suggestion
  const [runSearch, { data: searchData, loading: searching }] = useLazyQuery(
    SEARCH_POSTS,
    { fetchPolicy: "network-only" }
  );
  const [runDidYouMean, { data: dymData }] = useLazyQuery(DID_YOU_MEAN, {
    fetchPolicy: "network-only",
  });

  // --- mutations ---
  const [createPost, { loading: creating }] = useMutation(CREATE_POST, {
    onCompleted: () => {
      setFeedback("Post created");
      setForm({ ...emptyForm });
      refreshLists();
    },
    onError: (e) => setFeedback(e.message),
  });

  const [updatePost, { loading: updating }] = useMutation(UPDATE_POST, {
    onCompleted: () => {
      setFeedback("Post updated");
      setForm({ ...emptyForm });
      setEditingId(null);
      refreshLists();
    },
    onError: (e) => setFeedback(e.message),
  });

  const [deletePost, { loading: deleting }] = useMutation(DELETE_POST, {
    onCompleted: () => {
      setFeedback("Post deleted");
      if (editingId) setEditingId(null);
      refreshLists();
    },
    onError: (e) => setFeedback(e.message),
  });

  const isBusy = creating || updating || deleting;

  // ---- helpers ----
  const refreshLists = () => {
    refetch();
    if (searchTerm.trim()) {
      runSearch({
        variables: {
          filter: {
            containsText: searchTerm.trim(),
            sortByRelevance: "DESC",
          },
        },
      });
      runDidYouMean({ variables: { query: searchTerm.trim() } });
    }
  };

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

    if (editingId !== null) {
      updatePost({
        variables: { id: Number(editingId), input: payload },
      });
    } else {
      createPost({ variables: { input: payload } });
    }
  };

  const fetchPostForEdit = async (id: number | string) => {
    try {
      const numericId = Number(id);
      const { data } = await apollo.query({
        query: GET_SINGLE_POST,
        variables: { id: numericId },
        fetchPolicy: "network-only",
      });
      const post = data.post;
      setForm({
        postId: Number(post.postId),
        title: post.title,
        content: post.content ?? "",
        imageUrl: post.imageUrl ?? "",
        tags: "",
        isTop: !!post.isTop,
      });
    } catch {
      setFeedback("Failed to load post");
    }
  };

  const startEdit = (p: PostItem) => {
    setEditingId(Number(p.postId));
    fetchPostForEdit(p.postId);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({ ...emptyForm });
  };

  const handleDelete = (id: number | string) => {
    deletePost({ variables: { id: Number(id) } });
  };

  // ---- search logic with debounce + suggestion ----
  const debounceRef = useRef<number | null>(null);

  useEffect(() => {
    // reset pagination when searching
    setCurrentPage(1);

    const q = searchTerm.trim();
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    if (!q) {
      setSuggestion(null);
      return; // show all posts below
    }

    debounceRef.current = window.setTimeout(() => {
      runSearch({
        variables: {
          filter: { containsText: q, sortByRelevance: "DESC" },
        },
      });
      runDidYouMean({ variables: { query: q } });
    }, 250);
  }, [searchTerm, runSearch, runDidYouMean]);

  useEffect(() => {
    setSuggestion(dymData?.didYouMean ?? null);
  }, [dymData]);

  const useSearch = Boolean(searchTerm.trim());

  // Normalize list so postId is always number
  const allPosts: PostItem[] = useMemo(() => {
    return (data?.posts ?? []).map((p) => ({ ...p, postId: Number(p.postId) }));
  }, [data]);

  const searchedPosts: PostItem[] = useMemo(() => {
    const list = searchData?.searchPosts ?? [];
    return list.map((p: any) => ({ ...p, postId: Number(p.postId) }));
  }, [searchData]);

  const activeList = useSearch ? searchedPosts : allPosts;

  // ---- client-side pagination (backend search returns array) ----
  const totalPages = Math.max(1, Math.ceil(activeList.length / pageSize));
  const page = Math.min(currentPage, totalPages);
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const pagedItems = activeList.slice(start, end);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-8">
      {/* Header */}
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

      {/* 🔎 Search Bar */}
      <section className="rounded-2xl border p-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <div className="flex flex-1 items-center gap-2">
            <input
              className="flex-1 rounded-lg border px-3 py-2 bg-transparent"
              placeholder="Search posts (e.g., atletico)…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                className="px-3 py-2 rounded-lg bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-sm"
                onClick={() => setSearchTerm("")}
              >
                Clear
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm opacity-80">Page size</label>
            <select
              className="rounded-lg border px-2 py-1 bg-transparent"
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              {[5, 8, 12, 16, 24].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* “Did you mean … ?” */}
        {useSearch &&
          !searching &&
          suggestion &&
          suggestion !== searchTerm.trim() && (
            <div className="text-sm">
              Did you mean{" "}
              <button
                className="underline text-blue-600 dark:text-blue-400"
                onClick={() => setSearchTerm(suggestion)}
              >
                {suggestion}
              </button>
              ?
            </div>
          )}
      </section>

      {/* Posts List (search-aware + paginated) */}
      <section className="rounded-2xl border p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {useSearch ? "Search Results" : "All Posts"}
          </h2>
          {useSearch && (
            <span className="text-sm opacity-70">
              {searching ? "Searching…" : `${activeList.length} result(s)`}
            </span>
          )}
        </div>

        {loading || (useSearch && searching) ? (
          <div>Loading…</div>
        ) : activeList.length === 0 ? (
          <div className="opacity-80 text-sm">No posts found.</div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 gap-4">
              {pagedItems.map((p) => (
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
                      onClick={() => handleDelete(p.postId)}
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>

            {/* Pagination */}
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={(p) => setCurrentPage(Number(p))}
              className="mt-6"
            />
          </>
        )}
      </section>
    </div>
  );
}
