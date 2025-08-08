import { FC } from "react";
import Button from "./Button";

interface PaginationProps {
  pages: (number | string)[];
  onPageChange?: (page: number | string) => void;
  darkMode?: boolean
}

const Pagination: FC<PaginationProps> = ({ pages, onPageChange }) => {
  return (
    <div className="flex justify-center mt-8">
      <div className="flex gap-2 text-sm">
        {pages.map((p, index) => (
          <Button
            key={index}
            text={String(p)}
            fontSize="sm"
            fontWeight="medium"
            textColor="text-black dark:text-white"
            bgColor="bg-transparent"
            hoverBgColor="hover:bg-red-500"
            padding="px-3 py-1"
            onClick={() => onPageChange?.(p)}
          />
        ))}
      </div>
    </div>
  );
};

export default Pagination;
