"use client";

import { useLayoutEffect, useRef } from "react";

export function useReorderAnimation(ids: string[]) {
  const rootRef = useRef<HTMLDivElement>(null);
  const prevTops = useRef(new Map<string, number>());
  const signature = ids.join("|");

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const nodes = [
      ...root.querySelectorAll<HTMLElement>("[data-flip-id]"),
    ];
    const nextTops = new Map<string, number>();
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    for (const node of nodes) {
      const id = node.dataset.flipId;
      if (!id) continue;
      const top = node.getBoundingClientRect().top;
      nextTops.set(id, top);
      if (reduced) continue;
      const from = prevTops.current.get(id);
      if (from == null) continue;
      const dy = from - top;
      if (Math.abs(dy) < 1) continue;
      node.animate(
        [
          { transform: `translateY(${dy}px)` },
          { transform: "translateY(0px)" },
        ],
        { duration: 560, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
      );
    }

    prevTops.current = nextTops;
  }, [signature]);

  return rootRef;
}
