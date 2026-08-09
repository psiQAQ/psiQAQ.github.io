"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { handleTableOfContentsNavigation } from "@/lib/table-of-contents-navigation";

export function TableOfContentsLink({
  children,
  className,
  id,
}: {
  children: ReactNode;
  className?: string;
  id: string;
}) {
  return (
    <Link
      className={className}
      href={`#${id}`}
      onNavigate={(event) => handleTableOfContentsNavigation(event, id)}
      prefetch={false}
    >
      {children}
    </Link>
  );
}
