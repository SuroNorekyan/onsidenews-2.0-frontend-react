import clsx from "clsx";
import { FC, ReactNode } from "react";

export type SortOption = {
  key: string;
  label: string;
  icon?: ReactNode;
};

type SortBarProps = {
  options: SortOption[];
  value: string;
  onChange: (key: string) => void;
  className?: string;
  darkMode?: boolean;
};

const SortBar: FC<SortBarProps> = ({ options, value, onChange, className, darkMode }) => {
  return (
    <div className={clsx("flex flex-wrap items-center gap-2 mb-4", className)}>
      <span className="text-sm opacity-70 mr-1">Sort:</span>
      <div className="flex gap-2">
        {options.map((opt) => (
          <button
            key={opt.key}
            type="button"
            onClick={() => onChange(opt.key)}
            className={clsx(
              "px-3 py-1.5 rounded-lg border text-sm inline-flex items-center gap-2",
              value === opt.key
                ? darkMode
                  ? "bg-gray-100 text-black"
                  : "bg-gray-900 text-white"
                : "bg-transparent"
            )}
          >
            {opt.icon}
            <span>{opt.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SortBar;
