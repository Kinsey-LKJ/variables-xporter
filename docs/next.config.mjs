/** @type {import('next').NextConfig} */
import withMarkdoc from '@markdoc/next.js'
import withSearch from './src/markdoc/search.mjs'

const nextConfig = {
  pageExtensions: ['js', 'jsx', 'md', 'ts', 'tsx'],
}

export default withSearch(
  withMarkdoc({ schemaPath: './src/markdoc' })(nextConfig)
)
