/* eslint-env node */

import { Layout, LocaleSwitch, Navbar, ThemeSwitch } from "nextra-theme-docs";
import { Banner, Head } from "nextra/components";
import { getPageMap } from "nextra/page-map";
import "nextra-theme-docs/style.css";
import "./app.css";
import Image from "next/image";
import { Footer } from "../components/footer";
import { getDictionary, dictionaries } from "../_dictionaries/get-dictionary";
import { Locale } from "@app/_dictionaries/i18n-config";
import Logo from "@/public/logo.svg";
import lingoI18nConfig from "../../../i18n.json";
import { allLanguages } from "../_dictionaries/i18n-config";
import getConfig from 'next/config';
import { I18NConfig } from "next/dist/server/config-shared";
import LocalSwitch from "../components/local-switch";
import { GithubIcon } from "lucide-react";
import { Analytics } from "@vercel/analytics/next"


    
export const metadata = {
  metadataBase: new URL("https://www.variables-xporter.com"),
  title: {
    template: "%s - Variables Xporter",
    default: "Variables Xporter - Export Figma Variables to shadcn/ui & Tailwind CSS",
  },
  description: "Export Figma Variables as production-ready shadcn/ui theme variables, Tailwind CSS configuration files, or CSS Variables. Support for multi-mode design systems.",
  applicationName: "Variables Xporter",
  generator: "Next.js",
  keywords: [
    "Figma plugin",
    "design tokens",
    "shadcn/ui",
    "Tailwind CSS",
    "CSS variables",
    "design system",
    "variables export",
    "design to code",
  ],
  authors: [{ name: "Kinsey" }],
  creator: "Kinsey",
  publisher: "Variables Xporter",
  appleWebApp: {
    title: "Variables Xporter",
    statusBarStyle: "default",
    capable: true,
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  other: {
    "msapplication-TileImage": "/mstile-150x150.png",
    "msapplication-TileColor": "#fff",
    "msapplication-config": "/browserconfig.xml",
  },
  openGraph: {
    type: "website",
    siteName: "Variables Xporter",
    url: "https://www.variables-xporter.com",
    title: "Variables Xporter - Export Figma Variables to shadcn/ui & Tailwind CSS",
    description: "Export Figma Variables as production-ready shadcn/ui theme variables, Tailwind CSS configuration files, or CSS Variables. Support for multi-mode design systems.",
  },
  twitter: {
    card: "summary_large_image",
    site: "@kinsey57534670",
    creator: "@kinsey57534670",
    title: "Variables Xporter - Export Figma Variables to shadcn/ui & Tailwind CSS",
    description: "Export Figma Variables as production-ready shadcn/ui theme variables, Tailwind CSS configuration files, or CSS Variables.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "google-verification-code",
  },
};

export default async function RootLayout({ children, params }) {
  const { lang } = await params;
  const pageMap = await getPageMap(`/${lang}`);

  const dictionaries = await Promise.all(
    allLanguages.map(async (locale) => ({
      [locale]: await getDictionary(locale),
    }))
  );
  const allDictionaries = Object.assign({}, ...dictionaries);

  const i18n = allLanguages.map((locale) => ({
    locale: locale,
    name: allDictionaries[locale].language,
  }));

  console.log(i18n)

  const navbar = (
    <Navbar
      logo={
        <div className="flex items-center gap-2">
          <Image
            className="w-8 h-8"
            src={Logo}
            alt="Variables Xporter"
            width={100}
            height={100}
          />
          <b>Variables Xporter</b>{" "}
        </div>
      }
      // Next.js discord server
      chatLink="https://github.com/Kinsey-LKJ/variables-xporter"
      chatIcon={<GithubIcon />}
    >
      <>
        {/* <LocaleSwitch className="x-local-switch" /> */}
        <LocalSwitch i18n={i18n} lang={lang} />
      </>
    </Navbar>
  );

  return (
    <html lang={lang as Locale} suppressHydrationWarning>
      <Head
        // color={{
        //   hue: {
        //     light: 242,
        //     dark: 242,
        //   },
        //   saturation: {
        //     light: 50,
        //     dark: 100,
        //   },
        //   lightness: {
        //     light: 46,
        //     dark: 83,
        //   },
        // }}
        // backgroundColor={{
        //   light: "#fcfcfc",
        //   dark: "#111111",
        // }}
      />
      <body>
        <Layout
          i18n={i18n}
          navbar={navbar}
          footer={<Footer />}
          // editLink="Edit this page on GitHub"
          docsRepositoryBase="https://github.com/Kinsey-LKJ/variables-xporter"
          sidebar={{ defaultMenuCollapseLevel: 1 }}
          pageMap={pageMap}
          nextThemes={{
            defaultTheme: "dark",
            storageKey: "variables-xporter-theme",
          }}
        >
          {children}
        </Layout>
        <Analytics />
      </body>
    </html>
  );
}
