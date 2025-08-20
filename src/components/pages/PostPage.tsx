// src/components/pages/PostPage.tsx
import * as React from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useQuery } from "@apollo/client";
import Sidebar from "../posts/Sidebar";
import { POST_IN_LANG, GET_TOP_POSTS_WITH_LANG } from "../../graphql/queries";
import { Clock } from "lucide-react";
import ReactMarkdown, { Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import { useLanguage } from "../../i18n/LanguageContext";

interface MarkdownCodeProps extends React.HTMLAttributes<HTMLElement> {
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export default function PostPage() {
  const { id } = useParams<{ id: string }>();
  const { language, setLanguage } = useLanguage();
  const [params, setParams] = useSearchParams();

  const langFromUrl = params.get("lang") as "HY" | "RU" | "EN" | null;

  // --- One-time init from URL, then let context be the source of truth.
  const didInitFromUrl = React.useRef(false);

  // Reset the one-time init when navigating to a different post id.
  React.useEffect(() => {
    didInitFromUrl.current = false;
  }, [id]);

  React.useEffect(() => {
    if (!didInitFromUrl.current) {
      if (langFromUrl && langFromUrl !== language) {
        setLanguage(langFromUrl);
      }
      didInitFromUrl.current = true;
    }
  }, [langFromUrl, language, setLanguage]);

  // Keep the URL in sync with the current context language.
  React.useEffect(() => {
    const current = params.get("lang");
    if (language && current !== language) {
      const next = new URLSearchParams(params);
      next.set("lang", language);
      setParams(next, { replace: true });
    }
  }, [language, params, setParams]);

  // Markdown sanitize schema
  const sanitizeSchema = React.useMemo(() => {
    const s: any = structuredClone(defaultSchema);
    s.tagNames = Array.from(
      new Set([
        ...(s.tagNames || []),
        "span",
        "table",
        "thead",
        "tbody",
        "tr",
        "th",
        "td",
      ])
    );
    s.attributes = {
      ...(s.attributes || {}),
      span: ["className"],
      code: [...(s.attributes?.code || []), "className"],
      a: [...(s.attributes?.a || []), "href", "title", "target", "rel"],
    };
    s.protocols = {
      ...(s.protocols || {}),
      href: [
        "http",
        "https",
        "mailto",
        "tel",
        "irc",
        "ircs",
        "xmpp",
        "sip",
        "sips",
        "#",
        "relative",
      ],
    };
    return s;
  }, []);

  // Single post: header-only language → refetch on language change
  const {
    data: postData,
    loading: postLoading,
    refetch: refetchPost,
  } = useQuery(POST_IN_LANG, {
    variables: { id: Number(id) },
    notifyOnNetworkStatusChange: true,
    fetchPolicy: "cache-and-network",
  });

  // Top posts: explicit language arg
  const { data: topData, refetch: refetchTop } = useQuery(
    GET_TOP_POSTS_WITH_LANG,
    {
      variables: { limit: 12, language },
      notifyOnNetworkStatusChange: true,
      fetchPolicy: "cache-and-network",
    }
  );

  // Refetch on language change
  React.useEffect(() => {
    refetchPost();
    refetchTop({ limit: 12, language });
  }, [language, refetchPost, refetchTop]);

  const post = postData?.post;
  const topPosts = topData?.topPosts || [];

  if (postLoading && !post) return <div className="p-10">Loading...</div>;
  if (!post) return <div className="p-10 text-red-500">Post not found.</div>;

  const CodeBlock = ({
    inline,
    className,
    children,
    ...rest
  }: MarkdownCodeProps) =>
    inline ? (
      <code className={className} {...rest}>
        {children}
      </code>
    ) : (
      <pre className="p-3 rounded-lg overflow-x-auto bg-gray-100 dark:bg-gray-800">
        <code className={className} {...rest}>
          {children}
        </code>
      </pre>
    );

  const mdComponents: Components = {
    a: (props) => <a {...props} target="_blank" rel="noopener noreferrer" />,
    code: CodeBlock,
  };

  return (
    <div className="px-4 py-16 max-w-6xl mx-auto md:py-4">
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-2/3 ">
          <h1 className="text-3xl font-bold mb-1 break-words">
            {post?.contentResolved?.title ?? post?.title}
          </h1>

          {post?.servedLanguage &&
            language &&
            post.servedLanguage !== language && (
              <span className="inline-block text-xs mb-3 px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                shown in {post.servedLanguage}
              </span>
            )}

          {post.createdAt && (
            <div className="flex items-center text-gray-500 mb-6">
              <Clock className="w-4 h-4 mr-2" />
              <span>{new Date(post.createdAt).toLocaleDateString()}</span>
            </div>
          )}

          {post.imageUrl && (
            <div className="w-full h-200 rounded mb-6 overflow-hidden">
              <img
                src={post.imageUrl}
                alt={post?.contentResolved?.title ?? post?.title}
                className="w-full h-200 object-cover object-[50%_10%]"
              />
            </div>
          )}

          <div
            className="prose prose-lg dark:prose-invert max-w-none break-words
             prose-headings:font-semibold
             prose-a:text-blue-600 hover:prose-a:text-blue-700
             prose-blockquote:border-l-4
             prose-img:rounded-xl prose-hr:my-6"
          >
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw, [rehypeSanitize, sanitizeSchema]]}
              components={mdComponents}
            >
              {post?.contentResolved?.content || post?.content || ""}
            </ReactMarkdown>
          </div>
        </div>

        {/* Sidebar: Top posts */}
        <Sidebar posts={topPosts} seeAllHref="/top-posts" />
      </div>
    </div>
  );
}
