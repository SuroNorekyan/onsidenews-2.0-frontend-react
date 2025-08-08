// components/shared/SearchBar.tsx
import React from "react";
import clsx from "clsx";
import Button from "../shared/Button";
import { Filter, Search } from "lucide-react";

interface SearchBarProps {
  search: string;
  setSearch: (value: string) => void;
  filterOpen: boolean;
  setFilterOpen: (state: boolean) => void;
  darkMode: boolean;
  placeholder?: string;
  dropdownItems?: string[];
}

const SearchBar: React.FC<SearchBarProps> = ({
  search,
  setSearch,
  filterOpen,
  setFilterOpen,
  darkMode,
  placeholder = "Search matches, teams, tournaments...",
  dropdownItems = ["Most Viewed", "Recent", "Trending"],
}) => {
  return (
    <div
      className={clsx(
        "flex rounded-lg border transition relative overflow-hidden",
        darkMode ? "bg-gray-800 border-gray-700" : "bg-gray-100 border-gray-300"
      )}
    >
      <input
        type="text"
        placeholder={placeholder}
        className={clsx(
          "flex-grow px-4 py-2 text-sm focus:outline-none",
          darkMode ? "bg-gray-800 text-white" : "bg-gray-100 text-black"
        )}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div className="relative">
        <Button
          icon={<Filter size={18} />}
          onClick={() => setFilterOpen(!filterOpen)}
          padding="px-3 py-2"
          hoverBgColor="hover:bg-gray-700"
          darkMode={darkMode}
        />
        {filterOpen && (
          <div
            className={clsx(
              "absolute top-full right-0 mt-2 w-40 rounded-md shadow-lg z-30 transition-all duration-300",
              darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"
            )}
          >
            <ul className="py-2 text-sm">
              {dropdownItems.map((item) => (
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
      <Button
        icon={<Search size={18} />}
        padding="px-3"
        bgColor="bg-red-500"
        hoverBgColor="hover:bg-red-700"
        textColor="text-white"
      />
    </div>
  );
};

export default SearchBar;
