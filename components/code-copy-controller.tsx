"use client";

import { useEffect } from "react";
import { copyCode } from "@/lib/code-copy";

export function CodeCopyController() {
  useEffect(() => {
    const timers = new Map<HTMLButtonElement, number>();

    async function handleClick(event: MouseEvent) {
      if (!(event.target instanceof Element)) return;
      const button = event.target.closest<HTMLButtonElement>(".article-code-copy");
      if (!button) return;

      const code = button.closest(".article-code-block")?.querySelector("pre code");
      const label = button.querySelector("span");
      if (!code || !label) return;

      const timer = await copyCode(code.textContent ?? "", timers.get(button), {
        clipboard: navigator.clipboard,
        clearTimeout: (id) => window.clearTimeout(id),
        setLabel: (text) => {
          label.textContent = text;
        },
        setTimeout: (callback, delay) => window.setTimeout(callback, delay),
      });

      if (timer === undefined) timers.delete(button);
      else timers.set(button, timer);
    }

    document.addEventListener("click", handleClick);
    return () => {
      document.removeEventListener("click", handleClick);
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  return null;
}
