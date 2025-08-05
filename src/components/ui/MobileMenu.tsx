import React from "react";
import { X } from "lucide-react";
import Button from "../shared/Button";

interface MobileMenuProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  dropdowns: Record<string, string[]>;
  darkMode: boolean;
}

const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  setIsOpen,
  dropdowns,
  darkMode,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 bg-black/80 flex flex-col p-6 space-y-4 overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <span className="text-xl font-bold text-white">Advanced Filters</span>
        <Button
          icon={<X size={28} />}
          textColor="text-white"
          bgColor="bg-transparent"
          hoverTextColor="hover:text-red-400"
          onClick={() => setIsOpen(false)}
        />
      </div>

      {Object.entries(dropdowns).map(([key, items]) => (
        <div key={key} className="bg-white dark:bg-gray-800 rounded-lg p-4">
          <h3 className="font-semibold mb-2 text-gray-800 dark:text-white">
            {key}
          </h3>
          <ul className="flex flex-wrap gap-2">
            {items.map((item) => (
              <li
                key={item}
                className="px-3 py-1 rounded-full text-sm bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default MobileMenu;
