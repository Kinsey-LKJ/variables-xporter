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
import Logo from "@/public/website/Logo.png";
import lingoI18nConfig from "../../../i18n.json";
import { allLanguages } from "../_dictionaries/i18n-config";
import getConfig from 'next/config';
import { I18NConfig } from "next/dist/server/config-shared";
import LocalSwitch from "../components/local-switch";

    
export const metadata = {
  metadataBase: new URL("https://nextra.site"),
  title: {
    template: "%s - Variables Xporter",
  },
  description: "Variables Xporter: the Figma plugin for exporting variables",
  applicationName: "Variables Xporter",
  generator: "Next.js",
  appleWebApp: {
    title: "Variables Xporter",
  },
  other: {
    "msapplication-TileImage": "/mstile-150x150.png",
    "msapplication-TileColor": "#fff",
  },
  twitter: {
    site: "https://nextra.site",
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
      // chatLink="https://discord.gg/hEM84NMkRv"
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
          // docsRepositoryBase="https://github.com/shuding/nextra/blob/main/examples/docs"
          sidebar={{ defaultMenuCollapseLevel: 1 }}
          pageMap={pageMap}
          nextThemes={{
            defaultTheme: "dark",
            storageKey: "variables-xporter-theme",
          }}
        >
          {children}
        </Layout>
      </body>
    </html>
  );
}
