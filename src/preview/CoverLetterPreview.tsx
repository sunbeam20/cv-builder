import type { RefObject } from 'react'
import type { CoverLetter, Profile } from '../types'
import type { TemplateTheme } from '../lib/templates'
import { A4_WIDTH, A4_HEIGHT, useFitScale } from './useFitScale'

interface Props {
  letter: CoverLetter
  profile: Profile
  pageRef: RefObject<HTMLDivElement | null>
  theme: TemplateTheme
}

export function CoverLetterPage({ letter, profile, pageRef, theme }: Props) {
  const contactParts = [profile.location, profile.phone, profile.email, profile.website]
    .map((s) => s.trim())
    .filter(Boolean)

  const paragraphs = letter.body
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)

  return (
    <div
      ref={pageRef}
      className="resume-page relative"
      style={{ fontFamily: theme.fontFamily, minHeight: A4_HEIGHT }}
    >
      {theme.accentBar ? (
        <div className="absolute inset-x-0 top-0 h-1.5" style={{ background: theme.accent }} />
      ) : null}
      <header>
        <h1
          className="text-[24px] font-bold leading-tight tracking-tight"
          style={{ color: theme.nameColor }}
        >
          {profile.fullName || 'Your Name'}
        </h1>
        {profile.headline ? (
          <p className="mt-0.5 text-[12.5px] font-medium text-slate-600">{profile.headline}</p>
        ) : null}
        {contactParts.length > 0 ? (
          <p className="mt-2 text-[10.5px] text-slate-600">{contactParts.join('  |  ')}</p>
        ) : null}
      </header>

      <div className="mt-8 text-[11px] leading-relaxed text-slate-700">
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
