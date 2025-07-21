"use client";

import { useTheme, useThemeConfig } from "nextra-theme-docs";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useParams } from "next/navigation";
import Link from "next/link";
import Blurer from "@/components/blurer";
import { BuyMeACoffee } from "@/components/buy-me-a-coffee";

const PREVIOUS_THEME_KEY = "previous-theme";

export const Footer = () => {
  const {
    resolvedTheme, // 最终解析后的主题
    setTheme,
  } = useTheme();
  const pathname = usePathname();
  console.log(resolvedTheme);
  const config = useThemeConfig();

  useEffect(() => {
    if (!resolvedTheme) return;

    const langs = config.i18n;
    console.log(pathname, langs);
    if (
      pathname === "/" ||
      langs.some((lang) => pathname === `/${lang.locale}`)
    ) {
      console.log(resolvedTheme);
      localStorage.setItem(PREVIOUS_THEME_KEY, `!${resolvedTheme}`);
      setTheme("dark");

    } else {
      const previousTheme = localStorage.getItem(PREVIOUS_THEME_KEY);
      if (previousTheme?.startsWith("!")) {
        setTheme(previousTheme.slice(1));
      }
    }
  }, [pathname]);

  useEffect(() => {
    if (!resolvedTheme) return;
    const langs = config.i18n;
    if (pathname !== "/" && !langs.some(lang => pathname === `/${lang.locale}`)) {
      localStorage.setItem(PREVIOUS_THEME_KEY, resolvedTheme);
    }
  }, [resolvedTheme]);

  return (
    <div className="text-center p-6 relative flex flex-col items-center overflow-hidden  pt-32 lg:pt-48">
      {pathname === "/" && (
        <Blurer className="w-[736px] h-[137px] blur-[140px] translate-y-[150%] bottom-0"></Blurer>
      )}
      <div className="flex flex-col items-center gap-4">
        <div>
          Built with ❤️ by {" "}
          <Link href="https://lkj.design" className=" underline" target="_blank">
             Kinsey
          </Link>
          .
        </div>
        {/* <BuyMeACoffee /> */}
      </div>
    </div>
  );
};
