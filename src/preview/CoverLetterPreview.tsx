import type { CSSProperties, ReactNode, RefObject } from 'react'
import type { CoverLetter, Profile } from '../types'
import type { TemplateTheme } from '../lib/templates'
import { A4_WIDTH, A4_HEIGHT, useFitScale } from './useFitScale'

interface Props {
  letter: CoverLetter
  profile: Profile
  pageRef: RefObject<HTMLDivElement | null>
  theme: TemplateTheme
}

const em = (px: number): string => `${(px / 11).toFixed(4)}em`

const normalizeUrl = (url: string): string => (/^https?:\/\//i.test(url) ? url : `https://${url}`)

export function CoverLetterPage({ letter, profile, pageRef, theme }: Props) {
  const linkStyle: CSSProperties = { color: theme.linkColor, textDecoration: 'underline' }
  const contactNodes: ReactNode[] = []
  if (profile.location.trim()) contactNodes.push(profile.location.trim())
  if (profile.phone.trim()) contactNodes.push(profile.phone.trim())
  if (profile.email.trim()) {
    contactNodes.push(
      <a key="email" href={`mailto:${profile.email.trim()}`} style={linkStyle}>
        {profile.email.trim()}
      </a>,
    )
  }
  if (profile.website.trim()) {
    contactNodes.push(
      <a
        key="website"
        href={normalizeUrl(profile.website.trim())}
        target="_blank"
        rel="noreferrer"
        style={linkStyle}
      >
        {profile.website.trim()}
      </a>,
    )
  }

  const paragraphs = letter.body
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)

  return (
    <div
      ref={pageRef}
      className="resume-page relative"
      style={{
        fontFamily: theme.fontFamily,
        fontSize: `${theme.baseFontSize}px`,
        minHeight: A4_HEIGHT,
      }}
    >
      {theme.accentBar ? (
        <div className="absolute inset-x-0 top-0 h-1.5" style={{ background: theme.accent }} />
      ) : null}
      <header>
        <h1
          className="font-bold leading-tight tracking-tight"
          style={{ fontSize: em(24), color: theme.nameColor }}
        >
          {profile.fullName || 'Your Name'}
        </h1>
        {profile.headline ? (
          <p className="mt-0.5 font-medium text-slate-600" style={{ fontSize: em(12.5) }}>
            {profile.headline}
          </p>
        ) : null}
        {contactNodes.length > 0 ? (
          <p className="mt-2 text-slate-600" style={{ fontSize: em(10.5) }}>
            {contactNodes.map((node, index) => (
              <span key={index}>
                {index > 0 ? '  |  ' : ''}
                {node}
              </span>
            ))}
          </p>
        ) : null}
      </header>

      <div className="mt-8 leading-relaxed text-slate-700" style={{ fontSize: em(11) }}>
        {letter.date ? <p>{letter.date}</p> : null}

        {letter.recipient || letter.company ? (
          <div className="mt-5">
            {letter.recipient ? <p>{letter.recipient}</p> : null}
            {letter.company ? <p className="font-semibold text-slate-800">{letter.company}</p> : null}
          </div>
        ) : null}

        {letter.greeting ? <p className="mt-5">{letter.greeting}</p> : null}

        {paragraphs.map((paragraph, i) => (
          <p key={i} className="mt-3 whitespace-pre-line">
            {paragraph}
          </p>
        ))}

        {letter.closing ? <p className="mt-5">{letter.closing}</p> : null}
        {letter.signature ? <p className="mt-6 font-semibold text-slate-900">{letter.signature}</p> : null}
      </div>
    </div>
  )
}

export function CoverLetterPreview({ letter, profile, pageRef, theme }: Props) {
  const { ref: containerRef, scale } = useFitScale()

  return (
    <div ref={containerRef} className="w-full">
      <div
        className="preview-page-box relative mx-auto shadow-xl ring-1 ring-slate-200"
        style={{ width: A4_WIDTH * scale, height: A4_HEIGHT * scale }}
      >
        <div
          className="preview-scaler"
          style={{
            width: A4_WIDTH,
            height: A4_HEIGHT,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            overflow: 'hidden',
          }}
        >
          <CoverLetterPage letter={letter} profile={profile} pageRef={pageRef} theme={theme} />
        </div>
      </div>
    </div>
  )
}
