import * as markdoc from '@markdoc/markdoc'

/** @type {import('@markdoc/markdoc').Config} */
const config = {
  functions: {},
  nodes: {
    document: {
      render: null,
    },
    heading: {
      render: 'Heading',
      attributes: {
        id: { type: String },
        level: { type: Number, required: true },
      },
    },
  },
  tags: {
    'table-of-contents': {
      render: 'TableOfContents',
      selfClosing: true
    },
    'prev-next-links': {
      render: 'PrevNextLinks',
      selfClosing: true
    },
    callout: {
      render: 'Callout',
      attributes: {
        type: {
          type: String,
          default: 'note',
          matches: ['note', 'warning', 'error'],
        },
      },
    },
    'quick-links': {
      render: 'QuickLinks',
      children: ['quick-link']
    },
    'quick-link': {
      render: 'QuickLink',
      selfClosing: true,
      attributes: {
        title: { type: String },
        description: { type: String },
        icon: { 
          type: String,
          matches: ['installation', 'presets', 'plugins', 'theming', 'lightbulb', 'warning']
        },
        href: { type: String }
      }
    },
  },
  variables: {
    projectName: 'Variables Xporter',
    description: 'Export Figma variables to Tailwind CSS and CSS Variables',
    repository: {
      url: 'https://github.com/Kinsey-LKJ/variables-xporter-doc',
      editUrl: 'https://github.com/Kinsey-LKJ/variables-xporter-doc/edit/main/docs',
      blobUrl: 'https://github.com/Kinsey-LKJ/variables-xporter-doc/blob/main/docs',
    }
  }
}

export default config
