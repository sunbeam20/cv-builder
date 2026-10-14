import { useEffect, useState } from 'react'
import type { CSSProperties, ReactNode, RefObject } from 'react'
import type { Resume, SectionId } from '../types'
import type { TemplateTheme } from '../lib/templates'
import { SECTION_LABELS, formatRange } from '../lib/helpers'
import { BULLET_GLYPH, CONTACT_ICONS, sectionHeadingStyle } from '../lib/templates'
import type { ContactIconKind, SectionHeadingStyle } from '../lib/templates'
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

/** Convert a design-px size (baseline 11px) to an em value relative to the page font size. */
const em = (px: number): string => `${(px / 11).toFixed(4)}em`

const normalizeUrl = (url: string): string => (/^https?:\/\//i.test(url) ? url : `https://${url}`)

function SectionTitle({
  children,
  theme,
  section,
}: {
  children: ReactNode
  theme: TemplateTheme
  section: SectionId
}) {
  const style: SectionHeadingStyle = sectionHeadingStyle(theme, section)
  const base: CSSProperties = {
    fontSize: em(11 * theme.headingScale),
    letterSpacing: `${theme.headingTracking}em`,
    fontWeight: theme.headingWeight,
    textTransform: theme.headingCase,
    color: theme.accent,
  }
  if (style === 'bar') {
    return (
      <h2 className="mb-2 flex items-center gap-2" style={base}>
        <span
          aria-hidden
          style={{
            flex: '0 0 auto',
            width: '3px',
            height: em(11 * theme.headingScale),
            background: theme.accent,
            borderRadius: '1px',
          }}
        />
        {children}
      </h2>
    )
  }
  return (
    <h2
      className={`mb-2 ${style === 'rule' ? 'pb-1' : ''}`}
      style={{
        ...base,
        ...(style === 'rule'
          ? { borderBottom: `${theme.ruleThickness}px solid ${theme.ruleColor}` }
          : {}),
      }}
    >
      {children}
    </h2>
  )
}

function Bullets({ items, theme }: { items: string[]; theme: TemplateTheme }) {
  const bullets = items.map((b) => b.trim()).filter(Boolean)
  if (bullets.length === 0) return null
  const glyph = BULLET_GLYPH[theme.bulletStyle]
  return (
    <div className="mt-1 flex flex-col gap-0.5 pl-1">
      {bullets.map((bullet, i) => (
        <div key={i} className="flex" style={{ fontSize: em(11) }}>
          {glyph ? (
            <span className="mr-1.5 shrink-0" style={{ width: '0.9em' }}>
              {glyph}
            </span>
          ) : null}
          <span>{bullet}</span>
        </div>
      ))}
    </div>
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

  const linkStyle: CSSProperties = { color: theme.linkColor, textDecoration: 'underline' }

  const iconFor = (kind: ContactIconKind) =>
    theme.contactIcons ? (
      <span key={`icon-${kind}`} className="mr-1" style={{ color: theme.accent }}>
        {CONTACT_ICONS[kind]}
      </span>
    ) : null

  const contacts: { key: string; kind: ContactIconKind; node: ReactNode }[] = []
  const addContact = (kind: ContactIconKind, node: ReactNode, key: string) =>
    contacts.push({ key, kind, node })
  if (profile.location.trim()) addContact('location', profile.location.trim(), 'location')
  if (profile.phone.trim()) addContact('phone', profile.phone.trim(), 'phone')
  if (profile.email.trim()) {
    addContact(
      'email',
      <a key="email" href={`mailto:${profile.email.trim()}`} style={linkStyle}>
        {profile.email.trim()}
      </a>,
      'email',
    )
  }
  if (profile.website.trim()) {
    addContact(
      'website',
      <a
        key="website"
        href={normalizeUrl(profile.website.trim())}
        target="_blank"
        rel="noreferrer"
        style={linkStyle}
      >
        {profile.website.trim()}
      </a>,
      'website',
    )
  }
  profile.links.forEach((link, index) => {
    const label = (link.label || link.url).trim()
    if (!label) return
    addContact(
      'link',
      link.url.trim() ? (
        <a
          key={`link-${index}`}
          href={normalizeUrl(link.url.trim())}
          target="_blank"
          rel="noreferrer"
          style={linkStyle}
        >
          {label}
        </a>
      ) : (
        <span key={`link-${index}`}>{label}</span>
      ),
      `link-${index}`,
    )
  })
  const contactNodes = contacts.map((c) => (
    <span key={c.key}>
      {iconFor(c.kind)}
      {c.node}
    </span>
  ))

  const sections: Record<SectionId, ReactNode> = {
    summary: profile.summary.trim() ? (
      <section style={{ marginTop: theme.sectionSpacing }}>
        <SectionTitle theme={theme} section="summary">{SECTION_LABELS.summary}</SectionTitle>
        <p style={{ fontSize: em(11) }}>
          {profile.summary}
        </p>
      </section>
    ) : null,

    experience:
      experience.length > 0 ? (
        <section style={{ marginTop: theme.sectionSpacing }}>
          <SectionTitle theme={theme} section="experience">{SECTION_LABELS.experience}</SectionTitle>
          <div className="flex flex-col gap-3">
            {experience.map((exp) => (
              <div key={exp.id}>
                <div className="flex items-baseline justify-between gap-3">
                  <p className="font-semibold text-slate-900 dark:text-slate-50" style={{ fontSize: em(11.5) }}>
                    {exp.role || 'Role'}
                  </p>
                  <p className="shrink-0 text-slate-500 dark:text-slate-400" style={{ fontSize: em(10.5) }}>
                    {formatRange(exp.start, exp.end, exp.current)}
                  </p>
                </div>
                <p className="italic text-slate-600 dark:text-slate-300" style={{ fontSize: em(11) }}>
                  {[exp.company, exp.location].map((s) => s.trim()).filter(Boolean).join(', ')}
                </p>
                <Bullets items={exp.bullets} theme={theme} />
              </div>
            ))}
          </div>
        </section>
      ) : null,

    education:
      education.length > 0 ? (
        <section style={{ marginTop: theme.sectionSpacing }}>
          <SectionTitle theme={theme} section="education">{SECTION_LABELS.education}</SectionTitle>
          <div className="flex flex-col gap-2.5">
            {education.map((edu) => (
              <div key={edu.id}>
                <div className="flex items-baseline justify-between gap-3">
                  <p className="font-semibold text-slate-900 dark:text-slate-50" style={{ fontSize: em(11.5) }}>
                    {edu.school || 'School'}
                  </p>
                  <p className="shrink-0 text-slate-500 dark:text-slate-400" style={{ fontSize: em(10.5) }}>
                    {formatRange(edu.start, edu.end, false)}
                  </p>
                </div>
                <p className="italic text-slate-600 dark:text-slate-300" style={{ fontSize: em(11) }}>
                  {[edu.degree, edu.field].map((s) => s.trim()).filter(Boolean).join(', ')}
                  {edu.location ? ` — ${edu.location}` : ''}
                </p>
                {edu.details.trim() ? (
                  <p style={{ fontSize: em(11) }}>
                    {edu.details}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        </section>
      ) : null,

    skills:
      skills.length > 0 ? (
        <section style={{ marginTop: theme.sectionSpacing }}>
          <SectionTitle theme={theme} section="skills">{SECTION_LABELS.skills}</SectionTitle>
          <div className="flex flex-col gap-1">
            {skills.map((group) => (
              <p key={group.id} style={{ fontSize: em(11) }}>
                {group.category ? (
                  <span className="font-semibold text-slate-900 dark:text-slate-50">{group.category}: </span>
                ) : null}
                {group.items.join(', ')}
              </p>
            ))}
          </div>
        </section>
      ) : null,

    projects:
      projects.length > 0 ? (
        <section style={{ marginTop: theme.sectionSpacing }}>
          <SectionTitle theme={theme} section="projects">{SECTION_LABELS.projects}</SectionTitle>
          <div className="flex flex-col gap-2.5">
            {projects.map((project) => (
              <div key={project.id}>
                <p className="font-semibold text-slate-900 dark:text-slate-50" style={{ fontSize: em(11.5) }}>
                  {project.name}
                  {project.link.trim() ? (
                    <a
                      href={normalizeUrl(project.link.trim())}
                      target="_blank"
                      rel="noreferrer"
                      className="ml-2 font-normal"
                      style={{ fontSize: em(10.5), ...linkStyle }}
                    >
                      {project.link.trim()}
                    </a>
                  ) : null}
                </p>
                {project.description.trim() ? (
                  <p style={{ fontSize: em(11) }}>
                    {project.description}
                  </p>
                ) : null}
                <Bullets items={project.bullets} theme={theme} />
              </div>
            ))}
          </div>
        </section>
      ) : null,

    certifications:
      certifications.length > 0 ? (
        <section style={{ marginTop: theme.sectionSpacing }}>
          <SectionTitle theme={theme} section="certifications">{SECTION_LABELS.certifications}</SectionTitle>
          <div className="flex flex-col gap-1">
            {certifications.map((cert) => (
              <p key={cert.id} style={{ fontSize: em(11) }}>
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
        <section style={{ marginTop: theme.sectionSpacing }}>
          <SectionTitle theme={theme} section="languages">{SECTION_LABELS.languages}</SectionTitle>
          <p style={{ fontSize: em(11) }}>
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
      className="resume-page relative shadow-xl ring-1 ring-slate-200 dark:ring-slate-700"
      style={{
        fontFamily: theme.fontFamily,
        fontSize: `${theme.baseFontSize}px`,
        lineHeight: theme.lineHeight,
        color: theme.bodyColor,
        padding: `${theme.pageMarginY}px ${theme.pageMarginX}px`,
      }}
    >
      {theme.accentBar ? (
        <div className="absolute inset-x-0 top-0 h-1.5" style={{ background: theme.accent }} />
      ) : null}
      <header>
        {theme.headerLayout === 'split' ? (
          <div className="flex items-start justify-between gap-6">
            <div>
              <h1
                className="font-bold leading-tight"
                style={{
                  fontSize: em(26 * theme.nameScale),
                  letterSpacing: `${theme.nameTracking}em`,
                  color: theme.nameColor,
                }}
              >
                {profile.fullName || 'Your Name'}
              </h1>
              {profile.headline ? (
                <p className="mt-0.5 font-medium text-slate-600 dark:text-slate-300" style={{ fontSize: em(13) }}>
                  {profile.headline}
                </p>
              ) : null}
            </div>
            {contactNodes.length > 0 ? (
              <div className="text-right text-slate-600 dark:text-slate-300" style={{ fontSize: em(10.5) }}>
                {contactNodes.map((node, index) => (
                  <div key={index}>{node}</div>
                ))}
              </div>
            ) : null}
          </div>
        ) : (
          <>
            <h1
              className="font-bold leading-tight"
              style={{
                fontSize: em(26 * theme.nameScale),
                letterSpacing: `${theme.nameTracking}em`,
                color: theme.nameColor,
              }}
            >
              {profile.fullName || 'Your Name'}
            </h1>
            {profile.headline ? (
              <p className="mt-0.5 font-medium text-slate-600 dark:text-slate-300" style={{ fontSize: em(13) }}>
                {profile.headline}
              </p>
            ) : null}
            {contactNodes.length > 0 ? (
              <p className="mt-2 text-slate-600 dark:text-slate-300" style={{ fontSize: em(10.5) }}>
                {contactNodes.map((node, index) => (
                  <span key={index}>
                    {index > 0 ? '  |  ' : ''}
                    {node}
                  </span>
                ))}
              </p>
            ) : null}
          </>
        )}
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
            className="preview-page-box relative shadow-xl ring-1 ring-slate-200 dark:ring-slate-700"
            style={{ width: A4_WIDTH * scale, height: A4_HEIGHT * scale }}
          >
            <div className="preview-scaler" style={pageStyle}>
              <div style={{ transform: `translateY(${-index * A4_HEIGHT}px)` }}>
                <ResumePage resume={resume} theme={theme} />
              </div>
            </div>
            <div className="no-print mt-1 text-center text-[11px] font-medium text-slate-400 dark:text-slate-500">
              Page {index + 1} of {pageCount}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
