import React, { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
  Copy,
  Check,
  Info,
  Lightbulb,
  AlertTriangle,
  ShieldAlert,
  Terminal,
  FileCode,
  Layers,
  Database,
  Hash,
} from 'lucide-react'
import { Highlight, themes } from 'prism-react-renderer'
import { useTheme } from '@/components/theme/ThemeProvider'
import { MermaidViewer } from './MermaidViewer'

export type DocFontSize = 'normal' | 'large' | 'xlarge'

interface DocMarkdownViewerProps {
  content: string
  fontSize?: DocFontSize
}

export const DocMarkdownViewer: React.FC<DocMarkdownViewerProps> = ({ content, fontSize = 'large' }) => {
  // Dynamic scale classes tuned for maximum reading comfort in both Light & Dark modes
  const sizeClasses = {
    normal: {
      body: 'text-base sm:text-lg leading-[1.8] text-slate-800 dark:text-slate-200 font-normal',
      h1: 'text-3xl sm:text-4xl font-extrabold pb-3 mb-6 text-slate-900 dark:text-white tracking-tight',
      h2: 'text-2xl sm:text-3xl font-bold pb-2 mt-10 mb-4 text-slate-900 dark:text-slate-100 border-b border-slate-200/80 dark:border-slate-800',
      h3: 'text-xl sm:text-2xl font-bold mt-7 mb-3 text-slate-900 dark:text-slate-100',
      h4: 'text-lg font-semibold mt-5 mb-2 text-slate-900 dark:text-slate-100',
      codeInline: 'text-xs sm:text-sm px-2 py-0.5',
      codeBlock: 'text-xs sm:text-sm py-4 px-5',
      table: 'text-sm p-3',
      alert: 'text-sm p-4',
    },
    large: {
      body: 'text-lg sm:text-xl 2xl:text-2xl leading-[1.85] text-slate-800 dark:text-slate-200 font-normal',
      h1: 'text-4xl sm:text-5xl 2xl:text-6xl font-extrabold pb-4 mb-8 text-slate-900 dark:text-white tracking-tight',
      h2: 'text-3xl sm:text-4xl 2xl:text-5xl font-bold pb-3 mt-12 mb-6 text-slate-900 dark:text-slate-100 border-b border-slate-200/80 dark:border-slate-800',
      h3: 'text-2xl sm:text-3xl 2xl:text-4xl font-bold mt-9 mb-4 text-slate-900 dark:text-slate-100',
      h4: 'text-xl sm:text-2xl 2xl:text-3xl font-semibold mt-7 mb-3 text-slate-900 dark:text-slate-100',
      codeInline: 'text-sm sm:text-base 2xl:text-lg px-2.5 py-0.5',
      codeBlock: 'text-sm sm:text-base 2xl:text-lg py-5 px-6',
      table: 'text-base sm:text-lg 2xl:text-xl p-4',
      alert: 'text-base sm:text-lg 2xl:text-xl p-5',
    },
    xlarge: {
      body: 'text-xl sm:text-2xl 2xl:text-3xl leading-[1.9] text-slate-800 dark:text-slate-200 font-normal',
      h1: 'text-5xl sm:text-6xl 2xl:text-7xl font-extrabold pb-5 mb-10 text-slate-900 dark:text-white tracking-tight',
      h2: 'text-4xl sm:text-5xl 2xl:text-6xl font-bold pb-4 mt-16 mb-8 text-slate-900 dark:text-slate-100 border-b border-slate-300 dark:border-slate-800',
      h3: 'text-3xl sm:text-4xl 2xl:text-5xl font-bold mt-12 mb-5 text-slate-900 dark:text-slate-100',
      h4: 'text-2xl sm:text-3xl 2xl:text-4xl font-semibold mt-9 mb-4 text-slate-900 dark:text-slate-100',
      codeInline: 'text-base sm:text-lg 2xl:text-xl px-3 py-1',
      codeBlock: 'text-base sm:text-lg 2xl:text-xl py-6 px-7',
      table: 'text-lg sm:text-xl 2xl:text-2xl p-5',
      alert: 'text-lg sm:text-xl 2xl:text-2xl p-6',
    },
  }[fontSize]

  return (
    <div className={`prose prose-slate dark:prose-invert max-w-none prose-headings:scroll-mt-24 ${sizeClasses.body}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Code Block Component with Syntax Highlighting & Copy Button
          code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '')
            const isInline = !match && !String(children).includes('\n')
            const codeString = String(children).replace(/\n$/, '')

            if (isInline) {
              return (
                <code
                  className={`bg-slate-100/90 dark:bg-slate-800 text-indigo-950 dark:text-blue-300 font-mono rounded-md border border-slate-200/90 dark:border-slate-700 font-semibold shadow-2xs ${sizeClasses.codeInline}`}
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

            return <HighlightedCodeBlock language={language} code={codeString} sizeClass={sizeClasses.codeBlock} />
          },

          // Headings with Auto-Anchor ID
          h1({ children }) {
            const id = slugify(String(children))
            return (
              <h1 id={id} className={`${sizeClasses.h1} border-b border-slate-200/80 dark:border-slate-800`}>
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
                <a href={`#${id}`} className="hover:underline text-slate-900 dark:text-slate-100">
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
            return <p className="my-4 text-slate-800 dark:text-slate-200 leading-[1.8]">{children}</p>
          },
          ul({ children }) {
            return <ul className="list-disc list-inside my-4 space-y-2 text-slate-800 dark:text-slate-200">{children}</ul>
          },
          ol({ children }) {
            return <ol className="list-decimal list-inside my-4 space-y-2 text-slate-800 dark:text-slate-200">{children}</ol>
          },
          li({ children }) {
            return <li className="my-1.5 leading-[1.75] text-slate-800 dark:text-slate-200">{children}</li>
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
              <blockquote className="border-l-4 border-blue-500 bg-blue-50/70 dark:bg-blue-950/30 pl-5 py-3.5 my-5 rounded-r-xl text-slate-800 dark:text-slate-200 italic font-medium shadow-2xs">
                {children}
              </blockquote>
            )
          },

          // Table Custom Styling
          table({ children }) {
            return (
              <div className="overflow-x-auto my-8 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs bg-white dark:bg-slate-900">
                <table className={`min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-left ${sizeClasses.table}`}>
                  {children}
                </table>
              </div>
            )
          },
          thead({ children }) {
            return <thead className="bg-slate-100/90 dark:bg-slate-800 font-bold text-slate-900 dark:text-slate-100">{children}</thead>
          },
          th({ children }) {
            return <th className="px-5 py-3.5 font-bold text-slate-900 dark:text-slate-100 tracking-wide border-b border-slate-200 dark:border-slate-700">{children}</th>
          },
          td({ children }) {
            return <td className="px-5 py-3.5 text-slate-800 dark:text-slate-200 border-t border-slate-100 dark:border-slate-800">{children}</td>
          },

          // Links
          a({ href, children }) {
            const isExternal = href?.startsWith('http')
            return (
              <a
                href={href}
                target={isExternal ? '_blank' : undefined}
                rel={isExternal ? 'noopener noreferrer' : undefined}
                className="text-blue-600 dark:text-blue-400 font-semibold hover:text-blue-800 dark:hover:text-blue-300 underline decoration-blue-300 dark:decoration-blue-700 hover:decoration-blue-600 transition-colors"
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

// Language normalization map
function normalizeLanguage(lang: string): string {
  const l = lang.toLowerCase()
  if (['cs', 'csharp', 'dotnet'].includes(l)) return 'csharp'
  if (['ts', 'typescript'].includes(l)) return 'tsx'
  if (['js', 'javascript'].includes(l)) return 'jsx'
  if (['sh', 'bash', 'shell', 'powershell', 'ps1', 'zsh'].includes(l)) return 'bash'
  if (['yml', 'yaml'].includes(l)) return 'yaml'
  if (['dockerfile', 'docker'].includes(l)) return 'docker'
  if (['sql', 'mysql', 'pgsql', 'tsql'].includes(l)) return 'sql'
  if (['html', 'xml', 'svg'].includes(l)) return 'markup'
  if (['json'].includes(l)) return 'json'
  if (['css'].includes(l)) return 'css'
  if (['markdown', 'md'].includes(l)) return 'markdown'
  if (['http'].includes(l)) return 'http'
  return l || 'text'
}

function getLanguageIcon(lang: string) {
  const l = lang.toLowerCase()
  if (['cs', 'csharp', 'dotnet'].includes(l)) return <Hash className="h-4 w-4 text-purple-600 dark:text-purple-400" />
  if (['ts', 'tsx', 'js', 'jsx'].includes(l)) return <FileCode className="h-4 w-4 text-blue-600 dark:text-blue-400" />
  if (['sql', 'mysql', 'pgsql'].includes(l)) return <Database className="h-4 w-4 text-amber-600 dark:text-amber-400" />
  if (['sh', 'bash', 'powershell', 'shell'].includes(l)) return <Terminal className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
  return <Layers className="h-4 w-4 text-slate-500 dark:text-slate-400" />
}

// Code Block Component with Prism Syntax Highlighting, Line Numbers & Copy Action
const HighlightedCodeBlock: React.FC<{ language: string; code: string; sizeClass: string }> = ({
  language,
  code,
  sizeClass,
}) => {
  const { resolvedTheme } = useTheme()
  const [copied, setCopied] = useState(false)
  const isDark = resolvedTheme === 'dark'

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const prismLang = normalizeLanguage(language)
  const theme = isDark ? themes.vsDark : themes.github

  return (
    <div className="my-6 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm bg-slate-50/50 dark:bg-slate-950 transition-colors">
      {/* Code Header Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-100/90 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
        <div className="flex items-center space-x-2">
          {getLanguageIcon(language)}
          <span className="font-mono uppercase tracking-wider font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200">
            {language}
          </span>
          <span className="text-slate-400 dark:text-slate-600 text-xs">•</span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
            {code.split('\n').length} lines
          </span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center space-x-1.5 hover:text-slate-900 dark:hover:text-white transition-colors px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-semibold border border-slate-200 dark:border-slate-700 shadow-2xs"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
              <span className="text-green-600 dark:text-green-400 font-semibold">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Syntax Highlighted Code Content */}
      <Highlight theme={theme} code={code} language={prismLang}>
        {({ className, style, tokens, getLineProps, getTokenProps }) => (
          <pre
            className={`overflow-x-auto font-mono leading-relaxed m-0 ${className} ${sizeClass}`}
            style={{
              ...style,
              backgroundColor: isDark ? '#090d16' : '#f8fafc',
            }}
          >
            <code>
              {tokens.map((line, i) => {
                const { key: _lineKey, ...lineProps } = getLineProps({ line })
                return (
                  <div key={i} {...lineProps} className="table-row">
                    {/* Line Numbers Column */}
                    <span className="table-cell pr-4 text-right select-none text-slate-400 dark:text-slate-600 text-xs sm:text-sm font-mono border-r border-slate-200 dark:border-slate-800/80 mr-4 w-8">
                      {i + 1}
                    </span>
                    {/* Code Line Tokens */}
                    <span className="table-cell pl-4 text-slate-900 dark:text-slate-100">
                      {line.map((token, key) => {
                        const { key: _tokenKey, ...tokenProps } = getTokenProps({ token })
                        return <span key={key} {...tokenProps} />
                      })}
                    </span>
                  </div>
                )
              })}
            </code>
          </pre>
        )}
      </Highlight>
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
      border: 'border-blue-500 bg-blue-50/80 dark:bg-blue-950/40 text-slate-800 dark:text-blue-100',
      icon: <Info className="h-6 w-6 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />,
      title: 'Note',
    },
    tip: {
      border: 'border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/40 text-slate-800 dark:text-emerald-100',
      icon: <Lightbulb className="h-6 w-6 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />,
      title: 'Tip',
    },
    important: {
      border: 'border-purple-500 bg-purple-50/80 dark:bg-purple-950/40 text-slate-800 dark:text-purple-100',
      icon: <AlertTriangle className="h-6 w-6 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />,
      title: 'Important',
    },
    warning: {
      border: 'border-amber-500 bg-amber-50/80 dark:bg-amber-950/40 text-slate-800 dark:text-amber-100',
      icon: <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />,
      title: 'Warning',
    },
    caution: {
      border: 'border-rose-500 bg-rose-50/80 dark:bg-rose-950/40 text-slate-800 dark:text-rose-100',
      icon: <ShieldAlert className="h-6 w-6 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />,
      title: 'Caution',
    },
  }[type]

  return (
    <div className={`my-6 rounded-xl border-l-4 ${styles.border} flex items-start gap-4 shadow-2xs ${sizeClass}`}>
      {styles.icon}
      <div className="leading-relaxed overflow-hidden prose-p:my-1 flex-1 font-normal">{children}</div>
    </div>
  )
}
