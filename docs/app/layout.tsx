/* eslint-env node */
import { Footer, Layout, Navbar } from 'nextra-theme-docs'
import { Banner, Head } from 'nextra/components'
import { getPageMap } from 'nextra/page-map'
import 'nextra-theme-docs/style.css'
import './app.css'


export const { viewport } = Head

export const metadata = {
  metadataBase: new URL('https://nextra.site'),
  title: {
    template: '%s - Variables Xporter'
  },
  description: 'Variables Xporter: the Figma plugin for exporting variables',
  applicationName: 'Variables Xporter',
  generator: 'Next.js',
  appleWebApp: {
    title: 'Variables Xporter'
  },
  other: {
    'msapplication-TileImage': '/ms-icon-144x144.png',
    'msapplication-TileColor': '#fff'
  },
  twitter: {
    site: 'https://nextra.site'
  }
}

export default async function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  const navbar = (
    <Navbar
      logo={
        <div>
          <b>Variables Xporter</b>{' '}
          <span style={{ opacity: '60%' }}>The Figma plugin for exporting variables</span>
        </div>
      }
      // Next.js discord server
      chatLink="https://discord.gg/hEM84NMkRv"
    />
  )
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <Head faviconGlyph="✦" color={{
        hue:{
          light:51,
          dark:51
        },
        saturation: {
          light: 100,
          dark: 100
        },
        lightness: {
          light: 45,
          dark: 65
        },
      }}/>
      <body>
        <Layout
          banner={<Banner storageKey="Variables Xporter">Variables Xporter now supports Tailwind CSS 4.0 ✨</Banner>}
          navbar={navbar}
          footer={<Footer />}
          editLink="Edit this page on GitHub"
          docsRepositoryBase="https://github.com/shuding/nextra/blob/main/examples/docs"
          sidebar={{ defaultMenuCollapseLevel: 1 }}
          pageMap={await getPageMap()}
        >
          {children}
        </Layout>
      </body>
    </html>
  )
}
