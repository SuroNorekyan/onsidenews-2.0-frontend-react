// src/components/ui/MarkdownEditor.tsx
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import * as React from "react";
import { useMemo } from "react";

type Props = { value: string; onChange: (v: string) => void };

export default function MarkdownEditor({ value, onChange }: Props) {
  const toolbar = useMemo(
    () => [
      { label: "B", title: "Bold", wrap: "**" },
      { label: "I", title: "Italic", wrap: "_" },
      { label: "U", title: "Underline (HTML)", wrap: "<u>", wrapRight: "</u>" },
      { label: "H1", title: "Heading 1", prefix: "# " },
      { label: "H2", title: "Heading 2", prefix: "## " },
      { label: "•", title: "Bullet List", prefix: "- " },
      { label: "1.", title: "Numbered List", prefix: "1. " },
      { label: "Link", title: "Insert Link", template: "[text](https://)" },
      { label: "Quote", title: "Blockquote", prefix: "> " },
      { label: "HR", title: "Horizontal rule", template: "\n\n---\n\n" },
      {
        label: "Tbl",
        title: "Table",
        template: "\n\n| Col1 | Col2 |\n| --- | --- |\n| A | B |\n\n",
      },
    ],
    []
  );

  const sanitizeSchema = React.useMemo(() => {
    const s: any = structuredClone(defaultSchema);
    s.tagNames = Array.from(
      new Set([
        ...(s.tagNames || []),
        "u",
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
      href: ["http", "https", "mailto", "tel", "#", "relative"],
    };
    return s;
  }, []);

  const apply = (tool: any) => {
    const el = document.getElementById(
      "markdown-area"
    ) as HTMLTextAreaElement | null;
    if (!el) return;
    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? 0;
    const selected = value.slice(start, end) || "text";
    let next = value;

    if (tool.block) {
      next =
        value.slice(0, start) +
        tool.block.replace("$SEL", selected) +
        value.slice(end);
    } else if (tool.wrap || tool.wrapRight) {
      const left = tool.wrap ?? "";
      const right = tool.wrapRight ?? tool.wrap ?? "";
      next = value.slice(0, start) + left + selected + right + value.slice(end);
    } else if (tool.prefix) {
      next = value.slice(0, start) + tool.prefix + selected + value.slice(end);
    } else if (tool.template) {
      next = value.slice(0, start) + tool.template + value.slice(end);
    }

    onChange(next);
    setTimeout(() => {
      el.focus();
      el.selectionStart = el.selectionEnd =
        start + (tool.prefix ? tool.prefix.length : tool.wrap?.length ?? 0);
    }, 0);
  };

  const setSize = (cls: string) => {
    const el = document.getElementById(
      "markdown-area"
    ) as HTMLTextAreaElement | null;
    if (!el) return;
    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? 0;
    const selected = value.slice(start, end) || "text";
    const snippet = `<span class="${cls}">${selected}</span>`;
    const next = value.slice(0, start) + snippet + value.slice(end);
    onChange(next);
  };

  return (
     <div className="grid md:grid-cols-2 gap-4 min-h-[360px]">
      {/* Editor column: make it a column flex container and allow children to shrink */}
      <div className="rounded-2xl border bg-white dark:bg-gray-900 flex flex-col min-h-0">
        <div className="flex flex-wrap gap-2 p-2 border-b items-center">
          {toolbar.map((t: any) => (
            <button
              key={t.title}
              type="button"
              className="px-3 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-sm"
              title={t.title}
              onClick={() => apply(t)}
            >
              {t.label}
            </button>
          ))}
          {/* Commenting size until better UI approach is introduced */}

          {/* <div className="ml-auto flex items-center gap-1 text-sm">
            <span className="opacity-70">Size</span>
            <select
              onChange={(e) => e.target.value && setSize(e.target.value)}
              className="rounded-md border bg-transparent px-2 py-1"
              defaultValue=""
            >
              <option value="" disabled>
                —
              </option>
              <option value="text-sm">S</option>
              <option value="text-base">M</option>
              <option value="text-lg">L</option>
              <option value="text-xl">XL</option>
              <option value="text-2xl">2XL</option>
            </select>
          </div> */}
        </div>

        {/* Textarea: flex-1 to fill remaining height, min-h-0 to allow proper flex sizing,
            overflow-auto so it scrolls only when content truly exceeds the available area */}
        <textarea
          id="markdown-area"
          className="w-full flex-1 min-h-0 p-3 bg-transparent outline-none resize-none overflow-auto"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Write your post in Markdown…"
        />
      </div>

      {/* Preview: allow it to scroll if it grows beyond the shared height */}
      <div className="rounded-2xl border p-3 prose prose-lg dark:prose-invert max-w-none min-h-0 overflow-auto">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw, [rehypeSanitize, sanitizeSchema]]}
        >
          {value || "*Preview…*"}
        </ReactMarkdown>
      </div>
    </div>
  );
}
