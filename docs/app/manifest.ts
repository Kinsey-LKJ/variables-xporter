import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Variables Xporter',
    short_name: 'Variables Xporter',
    theme_color: '#fff',
    background_color: '#fff',
    display: 'standalone'
  }
}
