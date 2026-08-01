"use client";

import { useState } from "react";

export function CopySourceButton({ filename, source }: { filename: string; source: string }) {
  const [status, setStatus] = useState("复制源码");

  async function copy() {
    try {
      await navigator.clipboard.writeText(source);
      setStatus("已复制");
      window.setTimeout(() => setStatus("复制源码"), 1800);
    } catch {
      setStatus("复制失败");
    }
  }

  return (
    <button aria-label={`复制 ${filename} 源码`} onClick={copy} type="button">
      <span aria-live="polite">{status}</span>
    </button>
  );
}
