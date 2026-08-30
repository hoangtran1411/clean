import React, { useState } from 'react'
import {
  X,
  Copy,
  Check,
  Share2,
  ExternalLink,
  MessageCircle,
  Send,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface DocShareModalProps {
  isOpen: boolean
  onClose: () => void
  docTitle: string
  categoryName: string
  url: string
}

export const DocShareModal: React.FC<DocShareModalProps> = ({
  isOpen,
  onClose,
  docTitle,
  categoryName,
  url,
}) => {
  const [copiedLink, setCopiedLink] = useState(false)
  const [copiedInstagram, setCopiedInstagram] = useState(false)

  if (!isOpen) return null

  const shareText = `Check out "${docTitle}" in ${categoryName} on the Clean Architecture .NET 10 & React 19 Hub!`

  const handleCopyLink = () => {
    navigator.clipboard.writeText(url)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  const handleShareX = () => {
    const xUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(url)}`
    window.open(xUrl, '_blank', 'noopener,noreferrer,width=600,height=500')
  }

  const handleShareLinkedIn = () => {
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
    window.open(linkedInUrl, '_blank', 'noopener,noreferrer,width=600,height=600')
  }

  const handleShareFacebook = () => {
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
    window.open(fbUrl, '_blank', 'noopener,noreferrer,width=600,height=500')
  }

  const handleShareTelegram = () => {
    const tgUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(shareText)}`
    window.open(tgUrl, '_blank', 'noopener,noreferrer,width=600,height=500')
  }

  const handleShareWhatsApp = () => {
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText} ${url}`)}`
    window.open(waUrl, '_blank', 'noopener,noreferrer,width=600,height=500')
  }

  const handleCopyInstagramCaption = () => {
    const igCaption = `📖 ${docTitle} (${categoryName})\n🔗 Read the full guide: ${url}\n#DotNet10 #React19 #CleanArchitecture #EnterpriseStack`
    navigator.clipboard.writeText(igCaption)
    setCopiedInstagram(true)
    setTimeout(() => setCopiedInstagram(false), 3000)
    window.open('https://www.instagram.com', '_blank', 'noopener,noreferrer')
  }

  return (
    <div
      className="fixed inset-0 z-[100] bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/90">
          <div className="flex items-center space-x-2 text-slate-900 dark:text-slate-100 font-bold text-base">
            <Share2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <span>Share This Guide</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
            title="Close (Esc)"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Document Preview Card */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 font-mono">
              {categoryName}
            </span>
            <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 line-clamp-2 mt-0.5">
              {docTitle}
            </h4>
          </div>

          {/* Social Platform Quick Share Grid */}
          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2.5 block">
              Share to Social Media & Channels
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {/* X (Twitter) */}
              <button
                onClick={handleShareX}
                className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-white transition-all shadow-2xs hover:scale-102"
                title="Share to X (Twitter)"
              >
                <svg className="h-5 w-5 fill-current mb-1.5" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 24.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                <span className="text-xs font-semibold">X (Twitter)</span>
              </button>

              {/* LinkedIn */}
              <button
                onClick={handleShareLinkedIn}
                className="flex flex-col items-center justify-center p-3 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/50 dark:bg-blue-950/30 hover:bg-blue-100/70 dark:hover:bg-blue-900/50 text-[#0A66C2] dark:text-blue-400 transition-all shadow-2xs hover:scale-102"
                title="Share to LinkedIn"
              >
                <svg className="h-5 w-5 fill-current mb-1.5" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
                <span className="text-xs font-semibold">LinkedIn</span>
              </button>

              {/* Facebook */}
              <button
                onClick={handleShareFacebook}
                className="flex flex-col items-center justify-center p-3 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/50 dark:bg-blue-950/30 hover:bg-blue-100/70 dark:hover:bg-blue-900/50 text-[#1877F2] dark:text-blue-400 transition-all shadow-2xs hover:scale-102"
                title="Share to Facebook"
              >
                <svg className="h-5 w-5 fill-current mb-1.5" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                <span className="text-xs font-semibold">Facebook</span>
              </button>

              {/* Instagram (Copy Caption & Link) */}
              <button
                onClick={handleCopyInstagramCaption}
                className="flex flex-col items-center justify-center p-3 rounded-xl border border-pink-200 dark:border-pink-900/60 bg-pink-50/50 dark:bg-pink-950/30 hover:bg-pink-100/70 dark:hover:bg-pink-900/50 text-[#E1306C] dark:text-pink-400 transition-all shadow-2xs hover:scale-102"
                title="Copy Caption & Open Instagram"
              >
                <svg className="h-5 w-5 fill-current mb-1.5" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
                <span className="text-xs font-semibold">
                  {copiedInstagram ? 'Copied & Open!' : 'Instagram'}
                </span>
              </button>

              {/* WhatsApp */}
              <button
                onClick={handleShareWhatsApp}
                className="flex flex-col items-center justify-center p-3 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/30 hover:bg-emerald-100/70 dark:hover:bg-emerald-900/50 text-[#25D366] dark:text-emerald-400 transition-all shadow-2xs hover:scale-102"
                title="Share to WhatsApp"
              >
                <MessageCircle className="h-5 w-5 mb-1.5" />
                <span className="text-xs font-semibold">WhatsApp</span>
              </button>

              {/* Telegram */}
              <button
                onClick={handleShareTelegram}
                className="flex flex-col items-center justify-center p-3 rounded-xl border border-sky-200 dark:border-sky-900/60 bg-sky-50/50 dark:bg-sky-950/30 hover:bg-sky-100/70 dark:hover:bg-sky-900/50 text-[#229ED9] dark:text-sky-400 transition-all shadow-2xs hover:scale-102"
                title="Share to Telegram"
              >
                <Send className="h-5 w-5 mb-1.5" />
                <span className="text-xs font-semibold">Telegram</span>
              </button>
            </div>
          </div>

          {/* Direct Link Input Box with Copy Action */}
          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 block">
              Direct Link
            </label>
            <div className="flex items-center space-x-2">
              <Input
                readOnly
                value={url}
                className="text-xs font-mono bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 h-10 truncate"
              />
              <Button
                onClick={handleCopyLink}
                className="h-10 px-4 shrink-0 font-semibold bg-blue-600 hover:bg-blue-700 text-white"
              >
                {copiedLink ? (
                  <>
                    <Check className="h-4 w-4 mr-1.5 text-white" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-1.5" />
                    <span>Copy</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
          Share Clean Architecture .NET 10 & React 19 knowledge with your engineering team
        </div>
      </div>
    </div>
  )
}
