import { Callout } from '@/components/Callout'
import { QuickLink, QuickLinks } from '@/components/QuickLinks'
import clsx from 'clsx'
import { Steps, Step } from '@/components/Steps'
import { FileTree } from '@/components/FileTree'

const tags = {
  callout: {
    attributes: {
      title: { type: String },
      type: {
        type: String,
        default: 'note',
        matches: ['note', 'warning'],
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
      className: { type: String },
    },
    render: ({ src, alt = '', caption, className }) => (
      <figure className={clsx('text-center', className)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} />
        <figcaption>{caption}</figcaption>
      </figure>
    ),
  },
  'quick-links': {
    render: QuickLinks,
  },
  'quick-link': {
    selfClosing: true,
    render: QuickLink,
    attributes: {
      title: { type: String },
      description: { type: String },
      icon: { type: String },
      href: { type: String },
    },
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
  steps: {
    render: Steps,
  },
  step: {
    render: Step,
    attributes: {
      title: { type: String },
    },
  },
}

export default tags
