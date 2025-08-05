import React from "react";
import clsx from "clsx";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text?: string;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  fontSize?: "xs" | "sm" | "base" | "lg";
  fontWeight?: "normal" | "medium" | "semibold" | "bold";
  hoverBgColor?: string;
  hoverTextColor?: string;
  textAlign?: "left" | "center" | "right";
  bgColor?: string;
  textColor?: string;
  padding?: string;
  rounded?: string;
  border?: string;
  gap?: string;
  className?: string;
  darkMode?: boolean;
  darkModeClasses?: string;
}

const Button: React.FC<ButtonProps> = ({
  text,
  icon,
  iconPosition = "left",
  fontSize = "sm",
  fontWeight = "normal",
  hoverBgColor = "",
  hoverTextColor = "",
  textAlign = "center",
  bgColor = "bg-gray-200",
  textColor = "text-black",
  padding = "px-3 py-1",
  rounded = "rounded-md",
  border = "",
  gap = "gap-1",
  className = "",
  darkMode = false,
  darkModeClasses = "",
  ...props
}) => {
  const justifyMap = {
    left: "justify-start",
    center: "justify-center",
    right: "justify-end",
  };

  const fontWeightMap = {
    normal: "font-normal",
    medium: "font-medium",
    semibold: "font-semibold",
    bold: "font-bold",
  };

  const isIconOnly = !!icon && !text;

  return (
    <button
      className={clsx(
        "flex items-center transition",
        padding,
        fontSize && `text-${fontSize}`,
        fontWeightMap[fontWeight],
        bgColor,
        textColor,
        rounded,
        border,
        hoverBgColor,
        hoverTextColor,
        justifyMap[isIconOnly ? textAlign : "center"],
        isIconOnly ? "justify-center" : justifyMap[textAlign],
        gap,
        darkMode ? darkModeClasses : "",
        className
      )}
      {...props}
    >
      {icon && !text && <span>{icon}</span>}

      {!isIconOnly && (
        <>
          {icon && iconPosition === "left" && <span>{icon}</span>}
          <span>{text}</span>
          {icon && iconPosition === "right" && <span>{icon}</span>}
        </>
      )}
    </button>
  );
};

export default Button;
