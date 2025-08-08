// Header.tsx
import { useState } from "react";
import { Menu, Sun, Moon } from "lucide-react";
import clsx from "clsx";
import dropdowns from "../../mocks/ui/dropdownMocks";
import Button from "../shared/Button";
import MainLogo from "../shared/MainLogo";
import SearchBar from "./SearchBar";
import FilterMenu from "./FilterMenu";
import MobileMenu from "./MobileMenu";
import { Link } from "react-router-dom";

interface Props {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

export default function Header({ darkMode, toggleDarkMode }: Props) {
  const [search, setSearch] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  return (
    <div className="relative z-50 overflow-visible">
      <header
        className={clsx(
          "w-full px-4 py-2 ",
          darkMode
            ? "bg-gray-900 text-white shadow-[0_2px_4px_rgba(255,255,255,0.1)]"
            : "bg-white text-gray-900 shadow-md"
        )}
      >
        {/* Desktop View */}
        <div className="hidden md:flex items-center justify-between gap-6 relative">
          {/* Logo */}
          <div className="w-40 flex flex-col items-center justify-center">
            <Link to="/" className="cursor-pointer">
              <MainLogo />
            </Link>
          </div>

          {/* Search Bar */}
          <div className="flex-grow max-w-3xl relative">
            <SearchBar
              search={search}
              setSearch={setSearch}
              filterOpen={filterOpen}
              setFilterOpen={setFilterOpen}
              darkMode={darkMode}
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 relative">
            <FilterMenu
              dropdowns={dropdowns}
              openDropdown={openDropdown}
              onToggle={(key) => setOpenDropdown(key)}
              darkMode={darkMode}
            />

            {/* Today’s News (no arrow) */}
            <Button
              text="Today’s News"
              border="border border-red-500"
              bgColor="bg-red-500"
              textColor="text-white"
              hoverBgColor="hover:bg-transparent"
              hoverTextColor="hover:text-red-500"
              fontWeight="bold"
              fontSize="sm"
              rounded="rounded-md"
              padding="px-3 py-1"
              darkMode={darkMode}
              darkModeClasses="dark:hover:text-white"
            />
          </div>
        </div>

        {/* Mobile View */}
        <div className="md:hidden flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              icon={<Menu size={32} />}
              onClick={() => setIsMobileMenuOpen(true)}
              padding="p-2"
              bgColor=""
              hoverBgColor=""
              textColor=""
            />
          </div>

          <div className="w-40 flex flex-col items-center justify-center">
            <Link to="/" className="cursor-pointer">
              <MainLogo />
            </Link>
          </div>

          <Button
            text="Today’s News"
            border="border border-red-500"
            bgColor="bg-red-500"
            textColor="text-white"
            hoverBgColor="hover:bg-transparent"
            hoverTextColor="hover:text-red-500"
            fontWeight="bold"
            fontSize="sm"
            rounded="rounded-md"
            padding="px-3 py-1"
            darkMode={darkMode}
            darkModeClasses="dark:hover:text-white"
          />
        </div>

        {/* Mobile Search */}
        <div className="md:hidden mt-3">
          <SearchBar
            search={search}
            setSearch={setSearch}
            filterOpen={filterOpen}
            setFilterOpen={setFilterOpen}
            darkMode={darkMode}
            placeholder="Search..."
          />
        </div>
      </header>

      {/* Mobile Fullscreen Menu */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        setIsOpen={setIsMobileMenuOpen}
        dropdowns={dropdowns}
        darkMode={darkMode}
      />

      {/* Dark Mode Toggle (fixed bottom-left) */}
      <div className="fixed bottom-2 left-2 z-50">
        <Button
          icon={darkMode ? <Sun size={18} color="white" /> : <Moon size={18} />}
          onClick={toggleDarkMode}
          padding="p-2"
          rounded="rounded-full"
          bgColor="bg-gray-300 dark:bg-gray-700"
          hoverBgColor="hover:bg-gray-400 dark:hover:bg-gray-600"
        />
      </div>
    </div>
  );
}
