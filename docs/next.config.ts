import bundleAnalyzer from "@next/bundle-analyzer";
import nextra from "nextra";
import lingoI18nConfig from "../i18n.json";
import { I18NConfig } from "next/dist/server/config-shared";
import TerserPlugin from "terser-webpack-plugin";

const withNextra = nextra({
  defaultShowCopyCode: true,
  latex: true,
  contentDirBasePath: "/",
});

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig = withBundleAnalyzer(
  withNextra({
    reactStrictMode: true,
    eslint: {
      // Warning: This allows production builds to successfully complete even if
      // your project has ESLint errors.
      ignoreDuringBuilds: true,
    },
    i18n: {
      locales: [
        lingoI18nConfig.locale.source,
        ...lingoI18nConfig.locale.targets,
      ],
      defaultLocale: lingoI18nConfig.locale.source,
      localeDetection: false,
    },
    publicRuntimeConfig: {
      i18n: {
        locales: [
          lingoI18nConfig.locale.source,
          ...lingoI18nConfig.locale.targets,
        ],
        defaultLocale: lingoI18nConfig.locale.source,
        localeDetection: false,
      } as I18NConfig,
    },
    webpack(config, { dev }) {
      // rule.exclude doesn't work starting from Next.js 15
      const { test: _test, ...imageLoaderOptions } = config.module.rules.find(
        (rule) => rule.test?.test?.(".svg")
      );
      config.module.rules.push({
        test: /\.svg$/,
        oneOf: [
          {
            resourceQuery: /svgr/,
            use: ["@svgr/webpack"],
          },
          imageLoaderOptions,
        ],
      });

      // 生产环境下移除 console.log
      if (!dev) {
        config.optimization.minimizer = [
          new TerserPlugin({
            terserOptions: {
              compress: {
                // 移除 console 语句
                drop_console: true,
                drop_debugger: true,
                // 移除未使用的代码
                dead_code: true,
                // 移除无用的函数参数
                unused: true,
              },
              mangle: {
                // 混淆变量名
                toplevel: true,
              },
              format: {
                // 移除注释
                comments: false,
              },
            },
          }),
        ];
      }

      return config;
    },
    experimental: {
      turbo: {
        rules: {
          "./app/_icons/*.svg": {
            loaders: ["@svgr/webpack"],
            as: "*.js",
          },
        },
      },
      optimizePackageImports: [
        // '@app/_icons'
      ],
    },
  })
);

export default nextConfig;
