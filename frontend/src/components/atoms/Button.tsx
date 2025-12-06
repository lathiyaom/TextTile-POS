import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "danger" | "ghost";
    size?: "sm" | "md" | "lg";
    isLoading?: boolean;
    children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
    variant = "primary",
    size = "md",
    isLoading = false,
    children,
    className = "",
    disabled,
    ...props
}) => {
    const baseStyles =
        "inline-flex items-center justify-center font-medium rounded-md text-sm leading-4 " +
        "transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 " +
        "disabled:opacity-50 disabled:cursor-not-allowed";

    const variants: Record<NonNullable<ButtonProps["variant"]>, string> = {
        primary:
            "bg-primary-600 text-white shadow-sm hover:bg-primary-700 focus:ring-primary-500",
        secondary:
            "bg-slate-100 text-slate-800 border border-slate-300 hover:bg-slate-200 focus:ring-slate-400",
        danger:
            "bg-red-600 text-white shadow-sm hover:bg-red-700 focus:ring-red-500",
        ghost:
            "bg-transparent text-slate-700 hover:bg-slate-100 focus:ring-slate-300",
    };

    const sizes: Record<NonNullable<ButtonProps["size"]>, string> = {
        sm: "px-2.5 py-1.5 text-xs",
        md: "px-3.5 py-2",
        lg: "px-4.5 py-2.5 text-base",
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading ? (
                <>
                    <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4"
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
                        />
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                    </svg>
                    Loading...
                </>
            ) : (
                children
            )}
        </button>
    );
};
