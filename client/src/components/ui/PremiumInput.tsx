import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const PremiumInput = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        <label className="text-sm font-medium text-foreground/80 ml-1">
          {label} {props.required && <span className="text-primary">*</span>}
        </label>
        <div className="relative group">
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/50 to-secondary/50 blur opacity-0 group-focus-within:opacity-30 transition-opacity duration-300" />
          <input
            type={type}
            className={cn(
              "flex h-12 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-foreground shadow-sm transition-all relative z-10",
              "file:border-0 file:bg-transparent file:text-sm file:font-medium",
              "placeholder:text-muted-foreground",
              "focus-visible:outline-none focus-visible:border-primary/50 focus-visible:bg-white/10",
              "disabled:cursor-not-allowed disabled:opacity-50",
              error && "border-destructive/50 focus-visible:border-destructive/50",
              className
            )}
            ref={ref}
            {...props}
          />
        </div>
        {error && <span className="text-xs text-destructive ml-1">{error}</span>}
      </div>
    );
  }
);
PremiumInput.displayName = "PremiumInput";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

export const PremiumTextarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        <label className="text-sm font-medium text-foreground/80 ml-1">
          {label} {props.required && <span className="text-primary">*</span>}
        </label>
        <div className="relative group">
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/50 to-secondary/50 blur opacity-0 group-focus-within:opacity-30 transition-opacity duration-300" />
          <textarea
            className={cn(
              "flex min-h-[100px] w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-foreground shadow-sm transition-all relative z-10 resize-y",
              "placeholder:text-muted-foreground",
              "focus-visible:outline-none focus-visible:border-primary/50 focus-visible:bg-white/10",
              "disabled:cursor-not-allowed disabled:opacity-50",
              error && "border-destructive/50 focus-visible:border-destructive/50",
              className
            )}
            ref={ref}
            {...props}
          />
        </div>
        {error && <span className="text-xs text-destructive ml-1">{error}</span>}
      </div>
    );
  }
);
PremiumTextarea.displayName = "PremiumTextarea";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const PremiumSelect = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        <label className="text-sm font-medium text-foreground/80 ml-1">
          {label} {props.required && <span className="text-primary">*</span>}
        </label>
        <div className="relative group">
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/50 to-secondary/50 blur opacity-0 group-focus-within:opacity-30 transition-opacity duration-300" />
          <select
            className={cn(
              "flex h-12 w-full rounded-xl border border-white/10 bg-[#0F0F13] px-4 py-2 text-sm text-foreground shadow-sm transition-all relative z-10 appearance-none",
              "focus-visible:outline-none focus-visible:border-primary/50 focus-visible:bg-[#15151A]",
              "disabled:cursor-not-allowed disabled:opacity-50",
              error && "border-destructive/50 focus-visible:border-destructive/50",
              className
            )}
            ref={ref}
            {...props}
          >
            <option value="" disabled hidden>Select an option...</option>
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none z-20 text-muted-foreground">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </div>
        </div>
        {error && <span className="text-xs text-destructive ml-1">{error}</span>}
      </div>
    );
  }
);
PremiumSelect.displayName = "PremiumSelect";
