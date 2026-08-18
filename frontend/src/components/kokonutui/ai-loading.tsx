"use client";

/**
 * @author: @kokonutui
 * @description: AI Loading State
 * @version: 1.0.0
 * @date: 2025-06-26
 * @license: MIT
 * @website: https://kokonutui.com
 * @github: https://github.com/kokonut-labs/kokonutui
 */

import { useEffect, useRef, useState } from "react";

const TASK_SEQUENCES = [
  {
    status: "Fetching repository",
    lines: [
      "Fetching repository tree...",
      "Reading package manifests...",
      "Loading file contents...",
      "Detecting languages...",
      "Building file structure...",
    ],
  },
  {
    status: "Analyzing structure",
    lines: [
      "Scanning important files...",
      "Mapping dependencies...",
      "Measuring complexity...",
      "Tracing behavior...",
      "Checking for security risks...",
      "Reviewing test coverage...",
      "Evaluating entry points...",
      "Finalizing analysis...",
    ],
  },
  {
    status: "Generating summary",
    lines: [
      "Writing a plain-English overview...",
      "Highlighting key modules...",
      "Noting security concerns...",
      "Preparing your dashboard...",
      "Polishing recommendations...",
      "Finalizing your summary...",
    ],
  },
];

const LoadingAnimation = ({ progress }: { progress: number }) => (
  <div className="relative h-6 w-6">
    <svg
      aria-label={`Loading progress: ${Math.round(progress)}%`}
      className="h-full w-full"
      fill="none"
      viewBox="0 0 240 240"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>Loading Progress Indicator</title>

      <defs>
        <mask id="progress-mask">
          <rect fill="black" height="240" width="240" />
          <circle
            cx="120"
            cy="120"
            fill="white"
            r="120"
            strokeDasharray={`${(progress / 100) * 754}, 754`}
            transform="rotate(-90 120 120)"
          />
        </mask>
      </defs>

      <style>
        {`
                    @keyframes rotate-cw {
                        from { transform: rotate(0deg); }
                        to { transform: rotate(360deg); }
                    }
                    @keyframes rotate-ccw {
                        from { transform: rotate(360deg); }
                        to { transform: rotate(0deg); }
                    }
                    .g-spin circle {
                        transform-origin: 120px 120px;
                    }
                    .g-spin circle {
                        stroke: var(--text);
                    }
                    .g-spin circle:nth-child(1) { animation: rotate-cw 8s linear infinite; }
                    .g-spin circle:nth-child(2) { animation: rotate-ccw 8s linear infinite; }
                    .g-spin circle:nth-child(3) { animation: rotate-cw 8s linear infinite; }
                    .g-spin circle:nth-child(4) { animation: rotate-ccw 8s linear infinite; }
                    .g-spin circle:nth-child(5) { animation: rotate-cw 8s linear infinite; }
                    .g-spin circle:nth-child(6) { animation: rotate-ccw 8s linear infinite; }

                    .g-spin circle:nth-child(2n) { animation-delay: 0.2s; }
                    .g-spin circle:nth-child(3n) { animation-delay: 0.3s; }
                `}
      </style>

      <g
        className="g-spin"
        mask="url(#progress-mask)"
        strokeDasharray="18% 40%"
        strokeWidth="16"
      >
        <circle cx="120" cy="120" opacity="0.95" r="150" stroke="#FF2E7E" />
        <circle cx="120" cy="120" opacity="0.95" r="130" stroke="#00E5FF" />
        <circle cx="120" cy="120" opacity="0.95" r="110" stroke="#4ADE80" />
        <circle cx="120" cy="120" opacity="0.95" r="90" stroke="#FFA726" />
        <circle cx="120" cy="120" opacity="0.95" r="70" stroke="#FFEB3B" />
        <circle cx="120" cy="120" opacity="0.95" r="50" stroke="#FF4081" />
      </g>
    </svg>
  </div>
);

export default function AILoadingState() {
  const [sequenceIndex, setSequenceIndex] = useState(0);
  const [visibleLines, setVisibleLines] = useState<
    Array<{ text: string; number: number }>
  >([]);
  const [scrollPosition, setScrollPosition] = useState(0);
  const codeContainerRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(true);
  const lineHeight = 28;

  // Only animate while on screen — an off-screen interval keeps waking the
  // main thread and re-rendering for a component nobody can see.
  useEffect(() => {
    const element = rootRef.current;
    if (!element) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { rootMargin: "100px" }
    );
    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  const currentSequence = TASK_SEQUENCES[sequenceIndex];
  const totalLines = currentSequence.lines.length;

  useEffect(() => {
    const initialLines = [];
    for (let i = 0; i < Math.min(5, totalLines); i++) {
      initialLines.push({
        text: currentSequence.lines[i],
        number: i + 1,
      });
    }
    setVisibleLines(initialLines);
    setScrollPosition(0);
  }, [sequenceIndex, currentSequence.lines, totalLines]);

  // Handle line advancement
  useEffect(() => {
    if (!isVisible) {
      return;
    }

    const advanceTimer = setInterval(() => {
      // Get the current first visible line index
      const firstVisibleLineIndex = Math.floor(scrollPosition / lineHeight);
      const nextLineIndex = (firstVisibleLineIndex + 3) % totalLines;

      // If we're about to wrap around, move to next sequence
      if (nextLineIndex < firstVisibleLineIndex && nextLineIndex !== 0) {
        setSequenceIndex(
          (prevIndex) => (prevIndex + 1) % TASK_SEQUENCES.length
        );
        return;
      }

      // Add the next line if needed
      if (nextLineIndex >= visibleLines.length && nextLineIndex < totalLines) {
        setVisibleLines((prevLines) => [
          ...prevLines,
          {
            text: currentSequence.lines[nextLineIndex],
            number: nextLineIndex + 1,
          },
        ]);
      }

      // Scroll to the next line
      setScrollPosition((prevPosition) => prevPosition + lineHeight);
    }, 2000); // Slightly slower than the example for better readability

    return () => clearInterval(advanceTimer);
  }, [
    isVisible,
    scrollPosition,
    visibleLines,
    totalLines,
    sequenceIndex,
    currentSequence.lines,
    lineHeight,
  ]);

  // Apply scroll position
  useEffect(() => {
    if (codeContainerRef.current) {
      codeContainerRef.current.scrollTop = scrollPosition;
    }
  }, [scrollPosition]);

  return (
    <div
      className="flex min-h-full w-full items-center justify-center"
      ref={rootRef}
    >
      <div className="w-auto space-y-4">
        <div className="ml-2 flex items-center space-x-2 text-[var(--subtle)]">
          <LoadingAnimation
            progress={(sequenceIndex / TASK_SEQUENCES.length) * 100}
          />
          <span className="text-sm">{currentSequence.status}...</span>
        </div>

        <div className="relative">
          <div
            className="relative h-[84px] w-full overflow-hidden rounded-lg font-mono text-xs"
            ref={codeContainerRef}
            style={{ scrollBehavior: "smooth" }}
          >
            <div>
              {visibleLines.map((line, index) => (
                <div
                  className="flex h-[28px] items-center px-2"
                  key={`${line.number}-${line.text}`}
                >
                  <div className="w-6 select-none pr-3 text-right text-[var(--muted)]">
                    {line.number}
                  </div>

                  <div className="ml-1 flex-1 text-[var(--text)]">
                    {line.text}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div
            className="pointer-events-none absolute top-0 right-0 bottom-0 left-0 rounded-lg"
            style={{
              background:
                "linear-gradient(to bottom, color-mix(in srgb, var(--bg) 92%, transparent) 0%, color-mix(in srgb, var(--bg) 55%, transparent) 30%, transparent 100%)",
            }}
          />
        </div>
      </div>
    </div>
  );
}
