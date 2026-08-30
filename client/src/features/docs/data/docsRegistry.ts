// Vite raw markdown glob import across all documentation modules in the workspace
export const docModules = import.meta.glob<string>('../../../../../docs-*/**/*.md', {
  query: '?raw',
  import: 'default',
})

export interface DocItem {
  id: string
  title: string
  category: string
  path: string
  slug: string
}

export interface DocCategory {
  id: string
  name: string
  icon: string
  description: string
  docs: DocItem[]
}

export const CATEGORY_METADATA: Record<string, { name: string; icon: string; description: string; order: number }> = {
  'docs-frontend': {
    name: 'Frontend Engineering',
    icon: '⚛️',
    description: 'React 19, Tailwind v4, shadcn/ui, TanStack Query, Axios & Workflows',
    order: 1,
  },
  'docs-backend': {
    name: '.NET 10 & Clean Architecture',
    icon: '🏛️',
    description: 'C# 13, MediatR CQRS, EF Core, Aspire, Idempotency & Workflow Engine',
    order: 2,
  },
  'docs-database': {
    name: 'Database & EF Core',
    icon: '🗄️',
    description: 'Relational Modeling, SQL Optimization, EF Core 10, Redis & Sharding',
    order: 3,
  },
  'docs-security': {
    name: 'Security & Zero Trust',
    icon: '🛡️',
    description: 'OWASP, JWT Hardening, Dynamic Permissions, PBKDF2 & Cryptography',
    order: 4,
  },
  'docs-runtime': {
    name: '.NET Runtime & Internals',
    icon: '⚙️',
    description: 'CoreCLR, GC Generational Model, RyuJIT, Memory Layout & Span<T>',
    order: 5,
  },
  'docs-system-design': {
    name: 'Distributed Systems',
    icon: '🌐',
    description: 'System Design, CAP Theorem, Microservices, Caching & Scalability',
    order: 6,
  },
  'docs-deploy': {
    name: 'DevOps & Deployment',
    icon: '🚀',
    description: 'Docker, Nginx, GitHub Actions CI/CD & Azure Container Apps',
    order: 7,
  },
  'docs-uiux': {
    name: 'UI/UX & Design Systems',
    icon: '🎨',
    description: 'Usability Heuristics, Token Architecture, Radix Primitives & a11y',
    order: 8,
  },
  'docs-network': {
    name: 'Network Protocols',
    icon: '🔌',
    description: 'OSI Model, TCP/IP, TLS Handshake, DNS & Reverse Proxies',
    order: 9,
  },
  'docs-cs-fundamentals': {
    name: 'CS Fundamentals',
    icon: '💻',
    description: 'Big-O Analysis, Data Structures, Algorithms, DP & OS Internals',
    order: 10,
  },
}

export function formatDocTitle(filename: string): string {
  // e.g. "09-permission-handling-rbac-and-dynamic-claim-policies.md"
  const cleanName = filename.replace(/\.md$/, '').replace(/^README$/, 'Overview & Curriculum')
  // Strip leading numbering e.g. "09-"
  const withoutNumber = cleanName.replace(/^\d+-/, '')
  // Convert hyphens to words with capitalization
  return withoutNumber
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export function parseDocsRegistry(): DocCategory[] {
  const categoriesMap: Record<string, DocItem[]> = {}

  for (const rawPath of Object.keys(docModules)) {
    // rawPath is like: "../../../../../docs-frontend/01-react19-and-techstack-overview.md"
    const match = rawPath.match(/docs-([a-zA-Z0-9-]+)\/(.+)\.md$/)
    if (!match) continue

    const categoryId = `docs-${match[1]}`
    const fileName = match[2]
    const slug = fileName.toLowerCase()

    if (!categoriesMap[categoryId]) {
      categoriesMap[categoryId] = []
    }

    categoriesMap[categoryId].push({
      id: `${categoryId}/${slug}`,
      title: formatDocTitle(fileName),
      category: categoryId,
      path: rawPath,
      slug,
    })
  }

  // Sort docs within each category alphabetically or by prefix
  for (const key of Object.keys(categoriesMap)) {
    categoriesMap[key].sort((a, b) => {
      // Prioritize README/overview first
      if (a.slug === 'readme') return -1
      if (b.slug === 'readme') return 1
      return a.slug.localeCompare(b.slug)
    })
  }

  // Build sorted categories list
  return Object.entries(CATEGORIES_CONFIG())
    .map(([catId, meta]) => ({
      id: catId,
      name: meta.name,
      icon: meta.icon,
      description: meta.description,
      docs: categoriesMap[catId] || [],
    }))
    .filter((cat) => cat.docs.length > 0)
}

function CATEGORIES_CONFIG() {
  return CATEGORY_METADATA
}
