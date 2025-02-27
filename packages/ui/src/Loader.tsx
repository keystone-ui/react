import React from "react";
import { cn } from "./utils";

type LoaderProps = {
  size?: "xs" | "sm" | "md" | "lg";
  color?: "primary" | "secondary" | "tertiary" | "critical";
  className?: string;
};

const sizeClasses = {
  xs: "w-3 h-3",
  sm: "w-4 h-4",
  md: "w-5 h-5",
  lg: "w-6 h-6",
};

const colorClasses = {
  primary: "text-text-on-primary",
  secondary: "text-text-on-secondary",
  tertiary: "text-text-default",
  critical: "text-text-on-critical",
};

const Loader: React.FC<LoaderProps> = ({ 
  size = "md", 
  color = "primary", 
  className 
}) => {
  return (
    <svg
      className={cn(
        "animate-spin",
        sizeClasses[size],
        colorClasses[color],
        className
      )}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  );
};

export default Loader; 