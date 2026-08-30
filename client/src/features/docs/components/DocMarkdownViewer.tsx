import React, { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Copy, Check, Info, Lightbulb, AlertTriangle, ShieldAlert, Terminal } from 'lucide-react'
import { MermaidViewer } from './MermaidViewer'

export type DocFontSize = 'normal' | 'large' | 'xlarge'

interface DocMarkdownViewerProps {
  content: string
  fontSize?: DocFontSize
}

export const DocMarkdownViewer: React.FC<DocMarkdownViewerProps> = ({ content, fontSize = 'large' }) => {
  // Dynamic scale classes based on chosen font size mode (optimized for 2K/4K displays)
  const sizeClasses = {
    normal: {
      body: 'text-base leading-7',
      h1: 'text-3xl sm:text-4xl font-extrabold pb-3 mb-6',
      h2: 'text-2xl sm:text-3xl font-bold pb-2 mt-10 mb-4',
      h3: 'text-xl sm:text-2xl font-semibold mt-7 mb-3',
      h4: 'text-lg font-semibold mt-5 mb-2',
      codeInline: 'text-xs px-1.5 py-0.5',
      codeBlock: 'text-xs sm:text-sm p-4',
      table: 'text-sm p-3',
      alert: 'text-sm p-4',
    },
    large: {
      body: 'text-lg sm:text-xl 2xl:text-2xl leading-relaxed text-slate-800 dark:text-slate-200 font-normal',
      h1: 'text-4xl sm:text-5xl 2xl:text-6xl font-extrabold pb-4 mb-8 text-slate-950 dark:text-white tracking-tight',
      h2: 'text-3xl sm:text-4xl 2xl:text-5xl font-bold pb-3 mt-12 mb-6 text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800',
      h3: 'text-2xl sm:text-3xl 2xl:text-4xl font-semibold mt-9 mb-4 text-slate-800 dark:text-slate-200',
      h4: 'text-xl sm:text-2xl 2xl:text-3xl font-semibold mt-7 mb-3 text-slate-800 dark:text-slate-200',
      codeInline: 'text-sm sm:text-base 2xl:text-lg px-2 py-0.5',
      codeBlock: 'text-sm sm:text-base 2xl:text-lg p-5 sm:p-6',
      table: 'text-base sm:text-lg 2xl:text-xl p-4',
      alert: 'text-base sm:text-lg 2xl:text-xl p-5',
    },
    xlarge: {
      body: 'text-xl sm:text-2xl 2xl:text-3xl leading-loose text-slate-800 dark:text-slate-200 font-normal',
      h1: 'text-5xl sm:text-6xl 2xl:text-7xl font-extrabold pb-5 mb-10 text-slate-950 dark:text-white',
      h2: 'text-4xl sm:text-5xl 2xl:text-6xl font-bold pb-4 mt-16 mb-8 text-slate-900 dark:text-slate-100 border-b border-slate-300 dark:border-slate-800',
      h3: 'text-3xl sm:text-4xl 2xl:text-5xl font-semibold mt-12 mb-5 text-slate-800 dark:text-slate-200',
      h4: 'text-2xl sm:text-3xl 2xl:text-4xl font-semibold mt-9 mb-4 text-slate-800 dark:text-slate-200',
      codeInline: 'text-base sm:text-lg 2xl:text-xl px-2.5 py-1',
      codeBlock: 'text-base sm:text-lg 2xl:text-xl p-6',
      table: 'text-lg sm:text-xl 2xl:text-2xl p-5',
      alert: 'text-lg sm:text-xl 2xl:text-2xl p-6',
    },
  }[fontSize]

  return (
    <div className={`prose prose-slate dark:prose-invert max-w-none prose-headings:scroll-mt-24 prose-a:text-blue-600 dark:prose-a:text-blue-400 hover:prose-a:text-blue-800 dark:hover:prose-a:text-blue-300 ${sizeClasses.body}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Code Block Component with Copy Button
          code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '')
            const isInline = !match && !String(children).includes('\n')
            const codeString = String(children).replace(/\n$/, '')

            if (isInline) {
              return (
                <code
                  className={`bg-slate-100 dark:bg-slate-800 text-blue-800 dark:text-blue-300 font-mono rounded border border-slate-200 dark:border-slate-700 font-medium ${sizeClasses.codeInline}`}
                  {...props}
                >
                  {children}
                </code>
              )
            }

            const language = match ? match[1] : 'text'

            // Render Mermaid visual vector diagram if language is mermaid
            if (language === 'mermaid') {
              return <MermaidViewer chart={codeString} />
            }

            return <CodeBlock language={language} code={codeString} sizeClass={sizeClasses.codeBlock} />
          },

          // Heading with Auto-Anchor ID
          h1({ children }) {
            const id = slugify(String(children))
            return (
              <h1 id={id} className={`${sizeClasses.h1} border-b border-slate-200 dark:border-slate-800`}>
                {children}
              </h1>
            )
          },
          h2({ children }) {
            const id = slugify(String(children))
            return (
              <h2 id={id} className={`${sizeClasses.h2} flex items-center group`}>
                <a href={`#${id}`} className="hover:underline text-slate-900 dark:text-slate-100">
                  {children}
                </a>
              </h2>
            )
          },
          h3({ children }) {
            const id = slugify(String(children))
            return (
              <h3 id={id} className={sizeClasses.h3}>
                <a href={`#${id}`} className="hover:underline text-slate-800 dark:text-slate-200">
                  {children}
                </a>
              </h3>
            )
          },
          h4({ children }) {
            const id = slugify(String(children))
            return (
              <h4 id={id} className={sizeClasses.h4}>
                {children}
              </h4>
            )
          },
          p({ children }) {
            return <p className="my-4 text-slate-700 dark:text-slate-300">{children}</p>
          },
          ul({ children }) {
            return <ul className="list-disc list-inside my-4 space-y-2 text-slate-700 dark:text-slate-300">{children}</ul>
          },
          ol({ children }) {
            return <ol className="list-decimal list-inside my-4 space-y-2 text-slate-700 dark:text-slate-300">{children}</ol>
          },
          li({ children }) {
            return <li className="my-1.5 leading-relaxed text-slate-700 dark:text-slate-300">{children}</li>
          },

          // Blockquote with GitHub Alert Styling Support
          blockquote({ children }) {
            const text = String(children)

            if (text.includes('[!NOTE]')) {
              return <AlertBanner type="note" sizeClass={sizeClasses.alert}>{children}</AlertBanner>
            }
            if (text.includes('[!TIP]')) {
              return <AlertBanner type="tip" sizeClass={sizeClasses.alert}>{children}</AlertBanner>
            }
            if (text.includes('[!IMPORTANT]')) {
              return <AlertBanner type="important" sizeClass={sizeClasses.alert}>{children}</AlertBanner>
            }
            if (text.includes('[!WARNING]')) {
              return <AlertBanner type="warning" sizeClass={sizeClasses.alert}>{children}</AlertBanner>
            }
            if (text.includes('[!CAUTION]')) {
              return <AlertBanner type="caution" sizeClass={sizeClasses.alert}>{children}</AlertBanner>
            }

            return (
              <blockquote className="border-l-4 border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 pl-5 py-3 my-5 rounded-r text-slate-700 dark:text-slate-300 italic">
                {children}
              </blockquote>
            )
          },

          // Table Custom Styling
          table({ children }) {
            return (
              <div className="overflow-x-auto my-8 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
                <table className={`min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-left ${sizeClasses.table}`}>
                  {children}
                </table>
              </div>
            )
          },
          thead({ children }) {
            return <thead className="bg-slate-100/80 dark:bg-slate-800 font-bold text-slate-900 dark:text-slate-100">{children}</thead>
          },
          th({ children }) {
            return <th className="px-5 py-4 font-bold text-slate-800 dark:text-slate-200 tracking-wide border-b border-slate-200 dark:border-slate-800">{children}</th>
          },
          td({ children }) {
            return <td className="px-5 py-4 text-slate-700 dark:text-slate-300 border-t border-slate-100 dark:border-slate-800">{children}</td>
          },

          // Links
          a({ href, children }) {
            const isExternal = href?.startsWith('http')
            return (
              <a
                href={href}
                target={isExternal ? '_blank' : undefined}
                rel={isExternal ? 'noopener noreferrer' : undefined}
                className="text-blue-600 dark:text-blue-400 font-medium hover:text-blue-800 dark:hover:text-blue-300 underline decoration-blue-300 dark:decoration-blue-700 hover:decoration-blue-600 transition-colors"
              >
                {children}
              </a>
            )
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

// Code Block Component with Copy Action & Header
const CodeBlock: React.FC<{ language: string; code: string; sizeClass: string }> = ({ language, code, sizeClass }) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="my-6 rounded-xl overflow-hidden border border-slate-800 bg-slate-950 shadow-lg">
      {/* Code Header Bar */}
      <div className="flex items-center justify-between px-5 py-3 bg-slate-900 border-b border-slate-800 text-slate-400">
        <div className="flex items-center space-x-2">
          <Terminal className="h-4 w-4 text-blue-400" />
          <span className="font-mono uppercase tracking-wider font-semibold text-xs sm:text-sm text-slate-300">
            {language}
          </span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center space-x-1.5 hover:text-white transition-colors px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-xs sm:text-sm font-medium"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 text-green-400" />
              <span className="text-green-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code Content */}
      <pre className={`overflow-x-auto font-mono text-slate-200 leading-relaxed m-0 bg-transparent ${sizeClass}`}>
        <code>{code}</code>
      </pre>
    </div>
  )
}

// GitHub-Style Alert Banner Component
const AlertBanner: React.FC<{
  type: 'note' | 'tip' | 'important' | 'warning' | 'caution'
  children: React.ReactNode
  sizeClass: string
}> = ({ type, children, sizeClass }) => {
  const styles = {
    note: {
      border: 'border-blue-500 bg-blue-50/90 dark:bg-blue-950/40 text-blue-950 dark:text-blue-200',
      icon: <Info className="h-6 w-6 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />,
      title: 'Note',
    },
    tip: {
      border: 'border-emerald-500 bg-emerald-50/90 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-200',
      icon: <Lightbulb className="h-6 w-6 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />,
      title: 'Tip',
    },
    important: {
      border: 'border-purple-500 bg-purple-50/90 dark:bg-purple-950/40 text-purple-950 dark:text-purple-200',
      icon: <AlertTriangle className="h-6 w-6 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />,
      title: 'Important',
    },
    warning: {
      border: 'border-amber-500 bg-amber-50/90 dark:bg-amber-950/40 text-amber-950 dark:text-amber-200',
      icon: <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />,
      title: 'Warning',
    },
    caution: {
      border: 'border-rose-500 bg-rose-50/90 dark:bg-rose-950/40 text-rose-950 dark:text-rose-200',
      icon: <ShieldAlert className="h-6 w-6 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />,
      title: 'Caution',
    },
  }[type]

  return (
    <div className={`my-6 rounded-xl border-l-4 ${styles.border} flex items-start gap-4 shadow-sm ${sizeClass}`}>
      {styles.icon}
      <div className="leading-relaxed overflow-hidden prose-p:my-1 flex-1">{children}</div>
    </div>
  )
}
