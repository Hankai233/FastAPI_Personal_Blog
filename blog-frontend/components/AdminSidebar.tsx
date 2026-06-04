"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin", label: "仪表盘" },
  { href: "/admin/posts", label: "文章管理" },
  { href: "/admin/tags", label: "标签管理" },
  { href: "/admin/comments", label: "评论审核" },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-48 shrink-0">
      <nav className="space-y-1">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`block rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              pathname === link.href
                ? "bg-blue-50 text-blue-700"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <Link
        href="/"
        className="mt-4 block rounded-md px-3 py-2 text-sm text-gray-400 hover:text-gray-600"
      >
        ← 返回前台
      </Link>
    </aside>
  );
}
