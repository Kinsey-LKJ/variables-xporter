import { Callout } from '@/components/Callout'
import { FileTree } from '@/components/FileTree'
import { QuickLink, QuickLinks } from '../components/QuickLinks'

const tags = {
  callout: {
    attributes: {
      title: { type: String },
      type: {
        type: String,
        default: 'note',
        matches: ['note', 'warning', 'error', 'info'],
        errorLevel: 'critical',
      },
    },
    render: Callout,
  },
  figure: {
    selfClosing: true,
    attributes: {
      src: { type: String },
      alt: { type: String },
      caption: { type: String },
    },
    render: ({ src, alt = '', caption }) => (
      <figure className="my-8">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} className="rounded-lg shadow-md" />
        {caption && <figcaption className="mt-4 text-sm text-gray-500 text-center">{caption}</figcaption>}
      </figure>
    ),
  },
  'file-tree': {
    render: FileTree,
  },
  folder: {
    render: ({ name, children }) => (
      <div className="ml-4">
        {name && <div className="text-blue-400">📁 {name}/</div>}
        {children}
      </div>
    ),
    attributes: {
      name: { type: String },
    },
  },
  file: {
    selfClosing: true,
    render: ({ name }) => (
      <div className="ml-4 text-gray-300">📄 {name}</div>
    ),
    attributes: {
      name: { type: String },
    },
  },
  'quick-links': {
    render: QuickLinks,
    description: 'Display a grid of quick links',
    children: ['quick-link'],
  },
  'quick-link': {
    selfClosing: true,
    render: QuickLink,
    attributes: {
      title: { type: String },
      description: { type: String },
      icon: {
        type: String,
        matches: ['BoxIcon', 'PaletteIcon', 'TypeIcon', 'installation', 'presets', 'plugins', 'theming', 'lightbulb', 'warning'],
      },
      href: { type: String },
    },
  },
  details: {
    render: ({ title, children }) => (
      <details className="my-4">
        <summary className="font-medium cursor-pointer">{title}</summary>
        <div className="mt-2 pl-4">{children}</div>
      </details>
    ),
    attributes: {
      title: { type: String },
    },
  },
}

export default tags
