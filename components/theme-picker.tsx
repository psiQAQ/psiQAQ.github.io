"use client";

import { useEffect, useRef } from "react";

export function ThemePicker() {
  const select = useRef<HTMLSelectElement>(null);
  useEffect(() => { if (select.current) select.current.value = document.documentElement.dataset.theme || "system"; }, []);
  return (
    <label className="theme-picker"><span>主题</span>
      <select ref={select} aria-label="颜色主题" defaultValue="system" onChange={(event) => {
        const value = event.target.value;
        document.documentElement.dataset.theme = value;
        try { localStorage.setItem("agent-lab-notes-theme", value); } catch { /* Storage is optional; the selected theme still applies to this page. */ }
      }}>
        <option value="system">跟随系统</option><option value="light">浅色</option><option value="dark">深色</option>
      </select>
    </label>
  );
}
