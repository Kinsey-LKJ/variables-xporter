/* eslint-env node */

import { Layout, Navbar } from 'nextra-theme-docs'
import { Banner, Head } from 'nextra/components'
import { getPageMap } from 'nextra/page-map'
import 'nextra-theme-docs/style.css'
import './app.css'
import Image from 'next/image'
import { Footer } from './components/footer'

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
        <div className='flex items-center gap-2'>
          <Image className='w-8 h-8' src="/Logo.png" alt="Variables Xporter" width={100} height={100} />
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
      <Head faviconGlyph="✦" 
      backgroundColor={{
        dark:'#0A1122',
        light:'#F5F5F5'
      }}
      color={{
        hue:{
          light:242,
          dark:242
        },
        saturation: {
          light: 100,
          dark: 100
        },
        lightness: {
          light: 83,
          dark: 83
        },
        
      }}
      />
      <body>
        <div className='bg-primary blur-[383px] w-[736px] h-[177px] absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2'></div>
        <Layout
          banner={<Banner storageKey="Variables Xporter">Variables Xporter now supports Tailwind CSS 4.0 ✨</Banner>}
          navbar={navbar}
          footer={<Footer />}
          editLink="Edit this page on GitHub"
          docsRepositoryBase="https://github.com/shuding/nextra/blob/main/examples/docs"
          sidebar={{ defaultMenuCollapseLevel: 1 }}
          pageMap={await getPageMap()}
          nextThemes={{
            defaultTheme: 'dark',
            storageKey: 'variables-xporter-theme',
          }}
        >
          {children}
        </Layout>
      </body>
    </html>
  )
}
