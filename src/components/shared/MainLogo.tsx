// components/shared/MainLogo.tsx
import React from "react";
import clsx from "clsx";

interface MainLogoProps {
  titleSize?: string; // e.g. text-xl
  subtitleSize?: string; // e.g. text-sm
  subtitleColor?: string; // e.g. text-red-600
  titleColor?: string;
  center?: boolean;
}

const MainLogo: React.FC<MainLogoProps> = ({
  titleSize = "text-xl",
  subtitleSize = "text-sm",
  subtitleColor = "text-red-600",
  titleColor = "text-black dark:text-white",
  center = true,
}) => {
  return (
    <div
      className={clsx(
        "flex flex-col justify-center leading-tight",
        center && "items-center text-center"
      )}
    >
      <span className={clsx(titleSize, "font-bold", titleColor)}>Onside</span>
      <span
        className={clsx(
          subtitleSize,
          "font-bold border border-red-500 px-1 w-fit",
          subtitleColor
        )}
      >
        NEWS
      </span>
    </div>
  );
};

export default MainLogo;
