// src/components/shared/Pagination.tsx
import { FC, useMemo } from "react";
import Button from "./Button";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  siblingCount?: number; // how many neighbors around current page
  className?: string;
}

function makePageRange(current: number, total: number, siblingCount: number) {
  const range: (number | string)[] = [];
  const first = 1;
  const last = total;

  const left = Math.max(first, current - siblingCount);
  const right = Math.min(last, current + siblingCount);

  if (left > first + 1) {
    range.push(first, "…");
  } else {
    for (let i = first; i < left; i++) range.push(i);
  }

  for (let i = left; i <= right; i++) range.push(i);

  if (right < last - 1) {
    range.push("…", last);
  } else {
    for (let i = right + 1; i <= last; i++) range.push(i);
  }

  return range;
}

const Pagination: FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1,
  className = "",
}) => {
  const pages = useMemo(
    () => makePageRange(currentPage, totalPages, siblingCount),
    [currentPage, totalPages, siblingCount]
  );

  if (totalPages <= 1) return null;

  return (
    <nav
      className={`flex justify-center mt-8 ${className}`}
      role="navigation"
      aria-label="Pagination"
    >
      <div className="flex items-center gap-2 text-sm">
        <Button
          text="« First"
          disabled={currentPage === 1}
          onClick={() => onPageChange(1)}
          padding="px-3 py-1"
          bgColor="bg-transparent"
          hoverBgColor="hover:bg-gray-200 dark:hover:bg-gray-700"
          textColor="text-black dark:text-white"
          aria-label="First page"
        />
        <Button
          text="‹ Prev"
          disabled={currentPage === 1}
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          padding="px-3 py-1"
          bgColor="bg-transparent"
          hoverBgColor="hover:bg-gray-200 dark:hover:bg-gray-700"
          textColor="text-black dark:text-white"
          aria-label="Previous page"
        />

        {pages.map((p, i) =>
          typeof p === "string" ? (
            <Button
              key={`${p}-${i}`}
              text={p}
              padding="px-3 py-1"
              bgColor="bg-transparent"
              textColor="text-gray-400"
              disabled
              aria-hidden="true"
            />
          ) : (
            <Button
              key={p}
              text={String(p)}
              fontSize="sm"
              fontWeight={p === currentPage ? "bold" : "medium"}
              textColor={
                p === currentPage ? "text-white" : "text-black dark:text-white"
              }
              bgColor={p === currentPage ? "bg-red-500" : "bg-transparent"}
              hoverBgColor={
                p === currentPage
                  ? ""
                  : "hover:bg-gray-200 dark:hover:bg-gray-700"
              }
              padding="px-3 py-1"
              onClick={() => onPageChange(p)}
              aria-current={p === currentPage ? "page" : undefined}
              aria-label={`Page ${p}`}
            />
          )
        )}

        <Button
          text="Next ›"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          padding="px-3 py-1"
          bgColor="bg-transparent"
          hoverBgColor="hover:bg-gray-200 dark:hover:bg-gray-700"
          textColor="text-black dark:text-white"
          aria-label="Next page"
        />
        <Button
          text="Last »"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(totalPages)}
          padding="px-3 py-1"
          bgColor="bg-transparent"
          hoverBgColor="hover:bg-gray-200 dark:hover:bg-gray-700"
          textColor="text-black dark:text-white"
          aria-label="Last page"
        />
      </div>
    </nav>
  );
};

export default Pagination;
