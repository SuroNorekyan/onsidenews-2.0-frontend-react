// components/Header/FilterMenu.tsx
import React, { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { ChevronDown } from "lucide-react";
import Button from "../shared/Button";

interface FilterMenuProps {
  dropdowns: Record<string, string[]>;
  openDropdown: string | null;
  onToggle: (key: string | null) => void;
  darkMode: boolean;
  bgColor?: string;
  textColor?: string;
  hoverBgColor?: string;
  hoverTextColor?: string;
}

const FilterMenu: React.FC<FilterMenuProps> = ({
  dropdowns,
  openDropdown,
  onToggle,
  darkMode,
  bgColor = "bg-gray-200",
  textColor = "text-black",
  hoverBgColor = "hover:bg-gray-300",
  hoverTextColor = "",
}) => {
  const [canHover, setCanHover] = useState(false);
  const closeTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    // Detect if device supports hover (desktop)
    if (typeof window !== "undefined" && window.matchMedia) {
      try {
        setCanHover(window.matchMedia("(hover: hover)").matches);
      } catch {
        setCanHover(false);
      }
    }
  }, []);

  const clearCloseTimeout = () => {
    if (closeTimeoutRef.current !== null) {
      window.clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  };

  const scheduleClose = (delay = 150) => {
    clearCloseTimeout();
    closeTimeoutRef.current = window.setTimeout(() => {
      onToggle(null);
      closeTimeoutRef.current = null;
    }, delay);
  };

  const openNow = (key: string) => {
    clearCloseTimeout();
    onToggle(key);
  };

  return (
    <div className="flex items-center gap-2 relative">
      {Object.entries(dropdowns).map(([key, items]) => (
        <div
          key={key}
          // Put hover handlers on the wrapper; also we'll add them to the menu itself below
          className="relative"
          onMouseEnter={canHover ? () => openNow(key) : undefined}
          onMouseLeave={canHover ? () => scheduleClose() : undefined}
        >
          <Button
            text={key}
            icon={<ChevronDown size={16} />}
            iconPosition="right"
            padding="px-3 py-1"
            fontSize="sm"
            rounded="rounded-md"
            gap="gap-1"
            bgColor={bgColor}
            textColor={textColor}
            hoverBgColor={hoverBgColor}
            hoverTextColor={hoverTextColor}
            darkMode={darkMode}
            darkModeClasses="dark:bg-gray-200 dark:hover:bg-gray-400"
            onClick={() => {
              // On touch devices we toggle by click. On hover-capable devices clicking also toggles.
              clearCloseTimeout();
              onToggle(openDropdown === key ? null : key);
            }}
          />

          {openDropdown === key && (
            <div
              // ensure dropdown aligns with the button and is inside the same wrapper
              className={clsx(
                "absolute left-0 top-full mt-1 w-48 rounded-md shadow-lg z-50 transition-all duration-150",
                darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"
              )}
              // also keep it open while hovering over the menu itself
              onMouseEnter={canHover ? () => openNow(key) : undefined}
              onMouseLeave={canHover ? () => scheduleClose() : undefined}
            >
              <ul className="py-1 text-sm">
                {items.map((item) => (
                  <li
                    key={item}
                    // small padding + hover states that respect dark mode
                    className={clsx(
                      "px-4 py-2 cursor-pointer select-none",
                      "hover:bg-gray-100 dark:hover:bg-gray-700"
                    )}
                    onClick={() => {
                      // close after selecting. Replace with navigation or handler as needed.
                      onToggle(null);
                      // TODO: add your item click handler here (navigate / filter / dispatch)
                    }}
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default FilterMenu;
