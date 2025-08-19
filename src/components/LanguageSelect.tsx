import { useEffect, useRef, useState } from "react";
import { useLanguage } from "../i18n/LanguageContext";

const LABELS: Record<"HY" | "RU" | "EN", string> = {
  HY: "Հայերեն",
  RU: "Русский",
  EN: "English",
};

export default function LanguageSelect({ compact }: { compact?: boolean }) {
  const { language, setLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return (
    <div ref={ref} className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-2 rounded-md border px-3 ${compact ? "py-1" : "py-2"} shadow-sm 
          bg-white text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500
          dark:bg-gray-900 dark:text-white dark:border-gray-700 dark:hover:bg-gray-800`}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="text-sm font-medium">{LABELS[language]}</span>
        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-44 origin-top-right rounded-md border bg-white shadow-lg z-50
          dark:bg-gray-900 dark:border-gray-700">
          <ul role="listbox" className="py-1">
            {["HY", "RU", "EN"].map((code) => (
              <li key={code}>
                <button
                  type="button"
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 ${
                    language === code ? "font-semibold" : ""
                  }`}
                  onClick={() => {
                    setLanguage(code as any);
                    setOpen(false);
                  }}
                >
                  {LABELS[code as "HY" | "RU" | "EN"]}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

