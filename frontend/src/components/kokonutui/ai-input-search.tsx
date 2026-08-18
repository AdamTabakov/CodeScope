"use client";

/**
 * @author: @kokonutui
 * @description: AI Input Search
 * @version: 1.0.0
 * @date: 2025-06-26
 * @license: MIT
 * @website: https://kokonutui.com
 * @github: https://github.com/kokonut-labs/kokonutui
 */

import { Globe, Send } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { useAutoResizeTextarea } from "@/hooks/use-auto-resize-textarea";
import { cn } from "@/lib/utils";

interface AIInputSearchProps {
  placeholder?: string;
  searchLabel?: string;
  onSubmit?: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

export default function AI_Input_Search({
  placeholder = "Search the web...",
  searchLabel = "Search",
  onSubmit,
  disabled = false,
  className,
}: AIInputSearchProps) {
  const [value, setValue] = useState("");
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: 52,
    maxHeight: 200,
  });
  const [showSearch, setShowSearch] = useState(true);
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = () => {
    if (disabled || !value.trim()) return;
    onSubmit?.(value);
    setValue("");
    adjustHeight(true);
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const handleContainerClick = () => {
    if (disabled) return;
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  return (
    <div className={cn("w-full py-4", className)}>
      <div className="relative mx-auto w-full max-w-xl">
        <div
          aria-label="Search input container"
          className={cn(
            "relative flex w-full cursor-text flex-col rounded-xl text-left transition-all duration-200",
            "ring-1 ring-[var(--border)]",
            isFocused && "ring-[var(--border-focus)]"
          )}
          onClick={handleContainerClick}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              handleContainerClick();
            }
          }}
          role="textbox"
          tabIndex={0}
        >
          <div className="max-h-[200px] overflow-y-auto">
            <Textarea
              className="w-full resize-none rounded-xl rounded-b-none border-none bg-[var(--primary-glow)] px-4 py-3 leading-[1.2] text-[var(--text)] placeholder:text-[var(--muted)] focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-[var(--primary-glow)]"
              id="ai-input-04"
              disabled={disabled}
              onBlur={handleBlur}
              onChange={(e) => {
                setValue(e.target.value);
                adjustHeight();
              }}
              onFocus={handleFocus}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              placeholder={placeholder}
              ref={textareaRef}
              value={value}
            />
          </div>

          <div className="h-12 rounded-b-xl bg-[var(--primary-glow)]">
            <div className="absolute bottom-3 left-3 flex items-center gap-2">
              <button
                className={cn(
                  "flex h-8 cursor-pointer items-center gap-2 rounded-full border px-1.5 py-1 transition-all",
                  showSearch
                    ? "border-[var(--primary)] bg-[var(--primary-glow)] text-[var(--primary)]"
                    : "border-transparent bg-[var(--primary-glow)] text-[var(--muted)] hover:text-[var(--text)]"
                )}
                onClick={() => {
                  setShowSearch(!showSearch);
                }}
                type="button"
              >
                <div className="flex h-4 w-4 shrink-0 items-center justify-center">
                  <motion.div
                    animate={{
                      rotate: showSearch ? 180 : 0,
                      scale: showSearch ? 1.1 : 1,
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 260,
                      damping: 25,
                    }}
                    whileHover={{
                      rotate: showSearch ? 180 : 15,
                      scale: 1.1,
                      transition: {
                        type: "spring",
                        stiffness: 300,
                        damping: 10,
                      },
                    }}
                  >
                    <Globe
                      className={cn(
                        "h-4 w-4",
                        showSearch ? "text-[var(--primary)]" : "text-inherit"
                      )}
                    />
                  </motion.div>
                </div>
                <AnimatePresence>
                  {showSearch && (
                    <motion.span
                      animate={{
                        width: "auto",
                        opacity: 1,
                      }}
                      className="shrink-0 overflow-hidden whitespace-nowrap text-sm text-[var(--primary)]"
                      exit={{ width: 0, opacity: 0 }}
                      initial={{ width: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {searchLabel}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </div>
            <div className="absolute right-3 bottom-3">
              <button
                className={cn(
                  "rounded-lg p-2 transition-colors",
                  value && !disabled
                    ? "bg-[var(--primary-glow)] text-[var(--primary)]"
                    : "cursor-pointer bg-[var(--primary-glow)] text-[var(--muted)] hover:text-[var(--text)]"
                )}
                disabled={disabled || !value}
                onClick={handleSubmit}
                type="button"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
