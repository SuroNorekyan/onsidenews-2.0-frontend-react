// src/components/pages/PostPage.tsx
import * as React from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useQuery } from "@apollo/client";
import Sidebar from "../posts/Sidebar";
import { GET_TOP_POSTS, POST_IN_LANG } from "../../graphql/queries";
import { Clock } from "lucide-react";
import ReactMarkdown, { Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import { useLanguage } from "../../i18n/LanguageContext";

// Minimal, correct typing for the `code` renderer props
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
  const effectiveLang = (langFromUrl === "HY" || langFromUrl === "RU" || langFromUrl === "EN") ? langFromUrl : language;

  // Ensure URL stays in sync with effective language
  React.useEffect(() => {
    const current = params.get("lang");
    if (effectiveLang && current !== effectiveLang) {
      const next = new URLSearchParams(params);
      next.set("lang", effectiveLang);
      setParams(next, { replace: true });
    }
  }, [effectiveLang]);

  // If URL has ?lang= and differs from context, update the header selection
  // (moved after query to avoid TS "used before declared" on refetch in some setups)
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
    // allow common URL protocols in links
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

  const { data: postData, loading: postLoading, refetch } = useQuery(POST_IN_LANG, {
    variables: { id: Number(id) },
  });

  const { data: topData } = useQuery(GET_TOP_POSTS, {
    variables: { limit: 10 },
  });

  // If URL has ?lang= and differs from context, update the header selection
  React.useEffect(() => {
    if (langFromUrl && langFromUrl !== language) {
      setLanguage(langFromUrl);
    }
  }, [langFromUrl]);

  // Refetch when language changes to apply header-only language preference
  React.useEffect(() => {
    refetch();
  }, [language, refetch]);

  const post = postData?.post;
  const topPosts = topData?.topPosts || [];

  if (postLoading && !post) return <div className="p-10">Loading...</div>;
  if (!post) return <div className="p-10 text-red-500">Post not found.</div>;

  // Extend the default sanitize schema to allow our needs (span className, a attrs)

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
          <h1 className="text-3xl font-bold mb-1 break-words">{post?.contentResolved?.title ?? post?.title}</h1>

          {post?.servedLanguage && effectiveLang && post.servedLanguage !== effectiveLang && (
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

          {/* Markdown-rendered content with pretty typography */}
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
