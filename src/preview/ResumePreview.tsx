import { useEffect, useState } from 'react'
import type { CSSProperties, ReactNode, RefObject } from 'react'
import type { Resume, SectionId } from '../types'
import type { TemplateTheme } from '../lib/templates'
import { SECTION_LABELS, formatRange } from '../lib/helpers'
import { A4_WIDTH, A4_HEIGHT, useFitScale } from './useFitScale'

export { A4_WIDTH, A4_HEIGHT } from './useFitScale'

interface PreviewProps {
  resume: Resume
  pageRef: RefObject<HTMLDivElement | null>
  theme: TemplateTheme
}

interface PageProps {
  resume: Resume
  theme: TemplateTheme
  pageRef?: RefObject<HTMLDivElement | null>
}

function SectionTitle({
  children,
  accent,
  rule,
}: {
  children: ReactNode
  accent: string
  rule: boolean
}) {
  return (
    <h2
      className={`mb-2 text-[11px] font-bold uppercase tracking-[0.14em] ${
        rule ? 'border-b pb-1' : ''
      }`}
      style={rule ? { color: accent, borderColor: accent } : { color: accent }}
    >
      {children}
    </h2>
  )
}

function Bullets({ items }: { items: string[] }) {
  const bullets = items.map((b) => b.trim()).filter(Boolean)
  if (bullets.length === 0) return null
  return (
    <ul className="mt-1 list-disc space-y-0.5 pl-4">
      {bullets.map((bullet, i) => (
        <li key={i} className="text-[11px] leading-snug text-slate-700">
          {bullet}
        </li>
      ))}
    </ul>
  )
}

export function ResumePage({ resume, theme, pageRef }: PageProps) {
  const {
    profile,
    sectionOrder,
    hiddenSections,
    experience,
    education,
    skills,
    projects,
    certifications,
    languages,
  } = resume

  const contactParts = [
    profile.location,
    profile.phone,
    profile.email,
    profile.website,
    ...profile.links.map((l) => l.url || l.label),
  ]
    .map((s) => s.trim())
    .filter(Boolean)

  const sections: Record<SectionId, ReactNode> = {
    summary: profile.summary.trim() ? (
      <section className="mt-4">
        <SectionTitle accent={theme.accent} rule={theme.headingRule}>{SECTION_LABELS.summary}</SectionTitle>
        <p className="text-[11px] leading-relaxed text-slate-700">{profile.summary}</p>
      </section>
    ) : null,

    experience:
      experience.length > 0 ? (
        <section className="mt-4">
          <SectionTitle accent={theme.accent} rule={theme.headingRule}>{SECTION_LABELS.experience}</SectionTitle>
          <div className="flex flex-col gap-3">
            {experience.map((exp) => (
              <div key={exp.id}>
                <div className="flex items-baseline justify-between gap-3">
                  <p className="text-[11.5px] font-semibold text-slate-900">
                    {exp.role || 'Role'}
                  </p>
                  <p className="shrink-0 text-[10.5px] text-slate-500">
                    {formatRange(exp.start, exp.end, exp.current)}
                  </p>
                </div>
                <p className="text-[11px] italic text-slate-600">
                  {[exp.company, exp.location].map((s) => s.trim()).filter(Boolean).join(', ')}
                </p>
                <Bullets items={exp.bullets} />
              </div>
            ))}
          </div>
        </section>
      ) : null,

    education:
      education.length > 0 ? (
        <section className="mt-4">
          <SectionTitle accent={theme.accent} rule={theme.headingRule}>{SECTION_LABELS.education}</SectionTitle>
          <div className="flex flex-col gap-2.5">
            {education.map((edu) => (
              <div key={edu.id}>
                <div className="flex items-baseline justify-between gap-3">
                  <p className="text-[11.5px] font-semibold text-slate-900">
                    {edu.school || 'School'}
                  </p>
                  <p className="shrink-0 text-[10.5px] text-slate-500">
                    {formatRange(edu.start, edu.end, false)}
                  </p>
                </div>
                <p className="text-[11px] italic text-slate-600">
                  {[edu.degree, edu.field].map((s) => s.trim()).filter(Boolean).join(', ')}
                  {edu.location ? ` — ${edu.location}` : ''}
                </p>
                {edu.details.trim() ? (
                  <p className="text-[11px] leading-snug text-slate-700">{edu.details}</p>
                ) : null}
              </div>
            ))}
          </div>
        </section>
      ) : null,

    skills:
      skills.length > 0 ? (
        <section className="mt-4">
          <SectionTitle accent={theme.accent} rule={theme.headingRule}>{SECTION_LABELS.skills}</SectionTitle>
          <div className="flex flex-col gap-1">
            {skills.map((group) => (
              <p key={group.id} className="text-[11px] text-slate-700">
                {group.category ? (
                  <span className="font-semibold text-slate-900">{group.category}: </span>
                ) : null}
                {group.items.join(', ')}
              </p>
            ))}
          </div>
        </section>
      ) : null,

    projects:
      projects.length > 0 ? (
        <section className="mt-4">
          <SectionTitle accent={theme.accent} rule={theme.headingRule}>{SECTION_LABELS.projects}</SectionTitle>
          <div className="flex flex-col gap-2.5">
            {projects.map((project) => (
              <div key={project.id}>
                <p className="text-[11.5px] font-semibold text-slate-900">
                  {project.name}
                  {project.link.trim() ? (
                    <span className="ml-2 text-[10.5px] font-normal text-slate-500">
                      {project.link}
                    </span>
                  ) : null}
                </p>
                {project.description.trim() ? (
                  <p className="text-[11px] text-slate-700">{project.description}</p>
                ) : null}
                <Bullets items={project.bullets} />
              </div>
            ))}
          </div>
        </section>
      ) : null,

    certifications:
      certifications.length > 0 ? (
        <section className="mt-4">
          <SectionTitle accent={theme.accent} rule={theme.headingRule}>{SECTION_LABELS.certifications}</SectionTitle>
          <div className="flex flex-col gap-1">
            {certifications.map((cert) => (
              <p key={cert.id} className="text-[11px] text-slate-700">
                {cert.name}
                {cert.issuer ? ` — ${cert.issuer}` : ''}
                {cert.date ? ` (${cert.date})` : ''}
              </p>
            ))}
          </div>
        </section>
      ) : null,

    languages:
      languages.length > 0 ? (
        <section className="mt-4">
          <SectionTitle accent={theme.accent} rule={theme.headingRule}>{SECTION_LABELS.languages}</SectionTitle>
          <p className="text-[11px] text-slate-700">
            {languages
              .map((l) => [l.name, l.proficiency].filter(Boolean).join(' '))
              .filter(Boolean)
              .join('  •  ')}
          </p>
        </section>
      ) : null,
  }

  return (
    <div
      ref={pageRef}
      className="resume-page relative shadow-xl ring-1 ring-slate-200"
      style={{ fontFamily: theme.fontFamily }}
    >
      {theme.accentBar ? (
        <div className="absolute inset-x-0 top-0 h-1.5" style={{ background: theme.accent }} />
      ) : null}
      <header>
        <h1
          className="text-[26px] font-bold leading-tight tracking-tight"
          style={{ color: theme.nameColor }}
        >
          {profile.fullName || 'Your Name'}
        </h1>
        {profile.headline ? (
          <p className="mt-0.5 text-[13px] font-medium text-slate-600">{profile.headline}</p>
        ) : null}
        {contactParts.length > 0 ? (
          <p className="mt-2 text-[10.5px] text-slate-600">{contactParts.join('  |  ')}</p>
        ) : null}
      </header>

      {sectionOrder
        .filter((id) => !hiddenSections.includes(id))
        .map((id) => (
          <div key={id} className="contents">
            {sections[id]}
          </div>
        ))}
    </div>
  )
}

export function ResumePreview({ resume, pageRef, theme }: PreviewProps) {
  const { ref: containerRef, scale } = useFitScale()
  const [pageCount, setPageCount] = useState(1)

  useEffect(() => {
    const node = pageRef.current
    if (!node) return
    const update = () => {
      const height = node.offsetHeight
      setPageCount(Math.max(1, Math.ceil((height - 0.5) / A4_HEIGHT)))
    }
    update()
    const observer = new ResizeObserver(update)
    observer.observe(node)
    return () => observer.disconnect()
  }, [pageRef, resume])

  const pageStyle: CSSProperties = {
    width: A4_WIDTH,
    height: A4_HEIGHT,
    transform: `scale(${scale})`,
    transformOrigin: 'top left',
    overflow: 'hidden',
    background: '#ffffff',
  }

  return (
    <div ref={containerRef} className="w-full">
      <div
        aria-hidden
        className="export-node pointer-events-none fixed left-[-10000px] top-0"
        style={{ width: A4_WIDTH }}
      >
        <ResumePage resume={resume} pageRef={pageRef} theme={theme} />
      </div>

      <div className="paginated-preview mx-auto flex flex-col items-center gap-4">
        {Array.from({ length: pageCount }).map((_, index) => (
          <div
            key={index}
            className="preview-page-box relative shadow-xl ring-1 ring-slate-200"
            style={{ width: A4_WIDTH * scale, height: A4_HEIGHT * scale }}
          >
            <div className="preview-scaler" style={pageStyle}>
              <div style={{ transform: `translateY(${-index * A4_HEIGHT}px)` }}>
                <ResumePage resume={resume} theme={theme} />
              </div>
            </div>
            <div className="no-print mt-1 text-center text-[11px] font-medium text-slate-400">
              Page {index + 1} of {pageCount}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
