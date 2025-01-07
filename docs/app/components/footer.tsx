"use client";

import { useTheme } from "nextra-theme-docs";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

const PREVIOUS_THEME_KEY = 'previous-theme';

export const Footer = () => {
  const {
    resolvedTheme,   // 最终解析后的主题
    setTheme,
  } = useTheme();
  const pathname = usePathname();

  useEffect(() => {
    if (!resolvedTheme) return;
    if (pathname === "/") {
      // 在进入首页前保存当前主题
      if (resolvedTheme !== 'dark') {
        localStorage.setItem(PREVIOUS_THEME_KEY, resolvedTheme);
        setTheme("dark");
      }
    } else {
      // 在离开首页时恢复之前的主题
      const previousTheme = localStorage.getItem(PREVIOUS_THEME_KEY);
      if (previousTheme) {
        setTheme(previousTheme);
      }
    }
  }, [pathname]);

  return (
    <div className="text-center">
        MIT 2025 © <Link href="https://kinsey.design" className=" underline">Kinsey</Link>.
    </div>
  );
};
