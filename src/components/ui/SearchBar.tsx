// components/shared/SearchBar.tsx
import React from "react";
import clsx from "clsx";
import Button from "../shared/Button";
import { Search } from "lucide-react";

interface SearchBarProps {
  search: string;
  setSearch: (value: string) => void;
  darkMode: boolean;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  search,
  setSearch,
  darkMode,
  placeholder = "Search matches, teams, tournaments...",
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
