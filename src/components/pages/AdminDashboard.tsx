import {
  useMutation,
  useQuery,
  useApolloClient,
  useLazyQuery,
} from "@apollo/client";
import { useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import { useAuth } from "../../auth/AuthContext";
import { CREATE_POST_ML, UPDATE_POST_ML, DELETE_POST } from "../../graphql/mutations";
import {
  GET_ALL_POSTS,
  GET_POST_WITH_CONTENTS,
  SEARCH_POSTS,
  DID_YOU_MEAN,
} from "../../graphql/queries";
import MarkdownEditor from "../ui/MarkdownEditor";
import Pagination from "../shared/Pagination";
import { protectShortWords, safeTitleText } from "../../utils/shared/textHelpers";


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

// --- Multilingual Admin form types ---
export const LANGS = ["HY", "RU", "EN"] as const;
export type Lang = typeof LANGS[number];
export const LANG_LABEL: Record<Lang, string> = {
  HY: "Հայերեն",
  RU: "Русский",
  EN: "English",
};

type LangBundle = { title: string; content: string; tags: string };
const emptyBundle: LangBundle = { title: "", content: "", tags: "" };

type AdminFormML = {
  postId?: number;
  bundles: Record<Lang, LangBundle>;
  baseLanguage: Lang;
  imageUrl: string;
  isTop: boolean;
};

const emptyFormML: AdminFormML = {
  postId: undefined,
  bundles: { HY: { ...emptyBundle }, RU: { ...emptyBundle }, EN: { ...emptyBundle } },
  baseLanguage: "EN",
  imageUrl: "",
  isTop: false,
};

export default function AdminDashboard() {
  const apollo = useApolloClient();
  const { user, logout } = useAuth();

  // --- form/edit state ---
  const [form, setForm] = useState<AdminFormML>({ ...emptyFormML });
  const [activeLang, setActiveLang] = useState<Lang>("EN");
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
  const [createPost, { loading: creating }] = useMutation(CREATE_POST_ML, {
    onCompleted: () => {
      setFeedback("Post created");
      setForm({ ...emptyFormML });
      refreshLists();
    },
    onError: (e) => setFeedback(e.message),
  });

  const [updatePost, { loading: updating }] = useMutation(UPDATE_POST_ML, {
    onCompleted: () => {
      setFeedback("Post updated");
      setForm({ ...emptyFormML });
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

    // Build multilingual contents array from non-empty bundles
    const contents = LANGS.map((code) => {
      const b = form.bundles[code];
      const tags = b.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      const hasAny = (b.title && b.title.trim()) || (b.content && b.content.trim()) || tags.length > 0;
      if (!hasAny) return null;
      return { language: code, title: b.title.trim(), content: b.content, tags };
    }).filter(Boolean);

    const input: any = {
      imageUrl: form.imageUrl?.trim() || undefined,
      isTop: !!form.isTop,
      baseLanguage: form.baseLanguage,
      contents,
    };

    if (editingId !== null) {
      updatePost({ variables: { id: Number(editingId), input } });
    } else {
      createPost({ variables: { input } });
    }
  };

  const fetchPostForEdit = async (id: number | string) => {
    try {
      const numericId = Number(id);
      const { data } = await apollo.query({
        query: GET_POST_WITH_CONTENTS,
        variables: { id: numericId },
        fetchPolicy: "network-only",
      });
      const post = data.post;
      const bundles: Record<Lang, LangBundle> = { HY: { ...emptyBundle }, RU: { ...emptyBundle }, EN: { ...emptyBundle } };
      for (const c of post.contents || []) {
        if (!c?.language) continue;
        const code = c.language as Lang;
        bundles[code] = {
          title: c.title || "",
          content: c.content || "",
          tags: Array.isArray(c.tags) ? c.tags.join(", ") : (c.tags || ""),
        };
      }
      setForm({
        postId: Number(post.postId),
        bundles,
        baseLanguage: (post.baseLanguage || "EN") as Lang,
        imageUrl: post.imageUrl || "",
        isTop: !!post.isTop,
      });
      setActiveLang((post.baseLanguage || "EN") as Lang);
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
    setForm({ ...emptyFormML });
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
    <div className="max-w-6xl mx-auto px-4 py-16 space-y-8 md:py-8">
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
        <div className="rounded-xl bg-green-100 dark:bg-green-600/30 text-green-800 dark:text-green-200 px-4 py-2">
          {feedback}
        </div>
      )}

      {/* Post Form (Multilingual) */}
      <section className="rounded-2xl border p-4 space-y-4">
        <h2 className="text-xl font-semibold">
          {editingId ? "Edit Post" : "Create Post"}
        </h2>
        <form onSubmit={submit} className="space-y-4">
          {/* Settings row */}
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm mb-1">Base Language</label>
              <select
                className="w-full rounded-lg border px-3 py-2 bg-transparent"
                value={form.baseLanguage}
                onChange={(e) => setForm({ ...form, baseLanguage: e.target.value as Lang })}
              >
                {LANGS.map((l) => (
                  <option key={l} value={l}>
                    {l} — {LANG_LABEL[l]}
                  </option>
                ))}
              </select>
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
            <div className="flex items-center gap-2 pt-6">
              <input
                id="isTop"
                type="checkbox"
                className="w-4 h-4"
                checked={form.isTop}
                onChange={(e) => setForm({ ...form, isTop: e.target.checked })}
              />
              <label htmlFor="isTop" className="text-sm">Mark as Top</label>
            </div>
          </div>

          {/* Language tabs */}
          <div>
            <div className="flex gap-2 mb-3">
              {LANGS.map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setActiveLang(l)}
                  className={clsx(
                    "px-3 py-1.5 rounded-lg border text-sm",
                    activeLang === l ? "bg-gray-900 text-white dark:bg-gray-100 dark:text-black" : "bg-transparent"
                  )}
                >
                  {l} — {LANG_LABEL[l]}
                </button>
              ))}
            </div>

            {/* Active language bundle */}
            {(() => {
              const b = form.bundles[activeLang];
              return (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm mb-1">Title ({activeLang})</label>
                    <input
                      className="w-full rounded-lg border px-3 py-2 bg-transparent"
                      value={b.title}
                      onChange={(e) => setForm({ ...form, bundles: { ...form.bundles, [activeLang]: { ...b, title: e.target.value } } })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Content ({activeLang})</label>
                    <MarkdownEditor
                      value={b.content}
                      onChange={(v: any) => setForm({ ...form, bundles: { ...form.bundles, [activeLang]: { ...b, content: v } } })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Tags CSV ({activeLang})</label>
                    <input
                      className="w-full rounded-lg border px-3 py-2 bg-transparent"
                      value={b.tags}
                      onChange={(e) => setForm({ ...form, bundles: { ...form.bundles, [activeLang]: { ...b, tags: e.target.value } } })}
                      placeholder="news, example"
                    />
                  </div>
                </div>
              );
            })()}
          </div>

          <div className="flex items-center gap-3 pt-2">
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
                  <div className="flex items-start justify-between">
                    <h3
                      className="font-semibold break-all  overflow-hidden text-ellipsis prevent-short-break"
                    >
                      {safeTitleText(p.title)}
                    </h3>
                    {p.isTop && (
                      <span className="text-xs px-2 py-0.5 ml-2 mt-1 rounded bg-amber-100 dark:bg-amber-500/30">
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
