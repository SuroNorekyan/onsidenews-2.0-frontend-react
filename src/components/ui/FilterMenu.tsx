import React from "react";
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
  return (
    <div className="flex items-center gap-2 relative">
      {Object.entries(dropdowns).map(([key, items]) => (
        <div
          key={key}
          className="relative group"
          onMouseEnter={() => onToggle(key)}
          onMouseLeave={() => onToggle(null)}
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
            darkModeClasses="dark:bg-gray-200 dark:hover:bg-gray-700"
            onClick={() => onToggle(key)}
          />
          {openDropdown === key && (
            <div
              className={clsx(
                "absolute top-full mt-2 w-48 rounded-md shadow-lg z-20 transition-all duration-300",
                darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"
              )}
            >
              <ul className="py-2 text-sm">
                {items.map((item) => (
                  <li
                    key={item}
                    className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
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
