# CV Builder

The CV Builder is one tool inside **Tinker Tools**, a growing hub of free, browser-first tools
served from a single static site. The landing page (`#/`) groups every tool by **category**
(Career, Design, Health & life, Productivity, Finance, Utilities) so it is easy to find what you
need, and the topbar has a **tool search** (type-to-filter with keyboard navigation) plus a
**Tools dropdown** that lists every tool by category. Live tools are reachable via a zero-dependency hash router: the CV Builder at `#/cv-builder`,
the ATS Scanner at `#/ats-scanner`, the Banner Maker at `#/banner-maker`, the Portfolio Page at
`#/portfolio`, the Hydration Tracker at `#/hydrate`, the Job Tracker at `#/job-tracker`, and every other
live tool under its own `#/…` route (see the list below). Add a
future tool by dropping an entry into `src/home/tools.ts` (with a unique `slug`) — routing, the
categorized hub cards, and the hero preview carousel are all derived from that registry
automatically, so every tool (including new ones) gets **equal billing** on the landing page. Tools
that are registered but not yet built show as "Coming soon" in their category. Give a tool a bespoke
hero preview by adding a case in `ToolPreview`; otherwise it falls back to a generic on-brand slide.

## Tools

- **CV Builder** (`#/cv-builder`) — a fully client-side CV/resume builder with a live A4 preview and
  ATS-friendly export to PDF and PNG. No backend — all data stays in your browser (`localStorage`).
- **ATS Scanner** (`#/ats-scanner`) — paste, upload, or import a CV to get an instant 0–100
  applicant-tracking-system score with a category breakdown and optional job-description keyword
  matching. Runs entirely in the browser.
- **Job Tracker** (`#/job-tracker`) — track every application through wishlist → applied → interview
  → offer → rejected with a **list view or drag-and-drop Kanban board**, plus a stats panel (pipeline,
  response rate, 12-week activity sparkline, a configurable 30-day application goal, follow-up/stale
  alerts). Rich records (salary, source,
  contact, follow-up date, résumé version, priority stars, tags, job description, and a per-application
  timeline with note logging, **saved filter views**), search, sort,
  status/tag/starred/follow-up/**needs-attention**/archived filters, bulk select (move / archive /
  delete with undo), duplicate, archive, keyboard shortcuts (`N` new, `/` search, `B` board/list), and
  CSV + JSON import/export plus a **calendar (`.ics`) export** of follow-ups and interviews. A
  standalone tool with its own store (`job-tracker-v1`) that migrates applications previously saved
  inside the CV Builder.
- **Portfolio Page** (`#/portfolio`) — turn your details into a clean, self-contained portfolio web
  page, with a profile picture, themes, light/dark modes, section toggles, a live preview, and
  single-link sharing.
- **Banner Maker** (`#/banner-maker`) — design social and LinkedIn banners from presets (LinkedIn,
  X, Facebook, GitHub, email, YouTube) or a custom size, with gradient/solid/image backgrounds,
  editable text and badge, and 2× PNG export. Runs entirely in the browser.
- **Hydration Tracker** (`#/hydrate`) — log water and drinks with quick presets, a daily goal,
  streaks, freezes, achievements, and insights. Runs entirely in the browser (`localStorage`).
- **Password Generator** (`#/password`) — build strong passwords (length, character sets, ambiguous
  character filter) or diceware passphrases, with a live entropy-based strength meter. Uses the
  Web Crypto RNG; nothing is stored or sent.
- **Unit Converter** (`#/convert`) — convert length, mass, volume, area, speed, temperature, digital
  storage, and time instantly and offline.
- **Text Diff** (`#/text-diff`) — compare two blocks of text with a line- or word-level diff, optional
  ignore-case / ignore-whitespace, change counts, and line numbers. Runs entirely in the browser.
- **Lorem Ipsum Generator** (`#/lorem`) — generate placeholder text by words, sentences, or
  paragraphs, in classic Latin or modern English, with an optional “Lorem ipsum…” opener and one-click copy.
- **Color Studio** (`#/color-studio`) — build a Tailwind-style colour ramp from any base colour, check
  WCAG contrast ratios, and copy the result as CSS variables or a Tailwind palette. Runs in the browser.
- **Cover Letter Builder** (`#/cover-letter`) — manage multiple letters with reusable tone presets and a
  sample body, a live preview, and copy / download / print-to-PDF export.
- **Interview Prep** (`#/interview-prep`) — a 16-question bank across behavioural, technical, culture, and
  closing categories, with a timed practice mode, STAR hints, and saved STAR answers.
- **LinkedIn Optimizer** (`/linkedin`) — score your headline, about section, and skills against length,
  first-person, action-verb, quantified-result, and keyword checks, with headline suggestions.
- **CV ↔ Job Matcher** (`/job-matcher`) — paste a job description to score your CV, see matched vs missing
  keywords (plus custom extras), and save past analyses. Reuses the same keyword engine as the ATS Scanner.
- **Offer Comparison** (`/offer-compare`) — compare offers on base, bonus, equity, and benefits, with
  cost-of-living-adjusted totals and your best offer highlighted.
- **Logo & Icon Maker** (`/logo-maker`) — monogram/wordmark logos with shapes, palettes, and fonts, exported
  as SVG or PNG. Everything is generated as inline SVG.
- **Email Signature Builder** (`/email-signature`) — build a table-based HTML signature with accent colour
  and social links, then copy rich HTML or plain text.
- **Favicon Generator** (`/favicon`) — letter-based favicons in square, rounded, or circular shapes, previewed
  at 16–512px, with SVG/PNG export and a copy-ready `<link>` tag.
- **SEO & Social Preview** (`/seo-preview`) — length checks and live Google, X/Twitter, and Facebook/Open
  Graph previews with copy-ready meta tags.
- **Expense Splitter** (`/split-bill`) — add people and shared expenses, split each evenly across its
  participants, and settle up with the fewest transfers.
- **Invoice Generator** (`/invoice`) — line items, tax, and totals with saved sender details and past
  invoices, printed to PDF from the preview.
- **Habit Tracker** (`/habits`), **Sleep Tracker** (`/sleep`), **Mood & Gratitude Journal** (`/mood`),
  **Workout Logger** (`/workout`), and **Medicine Reminder** (`/medicine`) — the *Health & life* suite, each
  with its own local store, streaks/averages, and progress views.
- **Focus Timer** (`/focus`), **Kanban Board** (`/kanban`), **Markdown Notes** (`/notes`), **JSON & CSV
  Studio** (`/json-csv`), and **Date & Time Tools** (`/date-time`) — the *Productivity* suite, including a
  Pomodoro timer with an SVG ring, a drag-and-drop board, a hand-written safe Markdown renderer, JSON/CSV
  conversion, and date/time-zone maths.

## Features

- Structured form editor (personal details, experience, education, skills, projects, certifications, languages)
- **Résumé strength** meter highlighting what to add next
- **Job match** card — paste a job description (plus optional extra keywords) to see which extracted keywords your résumé already covers, copy the missing ones, or add them straight to your skills as a group
- Application tracking now lives in its own **Job Tracker** tool (`#/job-tracker`), separate from the CV Builder
- Live A4 preview that scales to fit the viewport, with **automatic multi-page pagination** and page indicators (PDF adds "Page x of y" footers)
- Six templates: **ATS Classic**, **Modern Accent**, **Elegant Serif**, **Teal Accent**, **Technical Mono**, **Burgundy Serif** — each with matching PDF fonts, chosen from a thumbnail picker
- **Header layout** toggle — stacked (centred contact line) or two columns (name/headline left, contact details right-aligned), applied to preview and PDF
- **Design panel** with one-click presets (Classic / Compact / Modern / Airy) plus **save/load your own named presets** (persisted), and per-property overrides of the template: font family (six web-safe faces), base font size (9–13px), page margins (vertical/horizontal), line height, heading letter spacing / case / weight, name size & letter spacing, heading size, section spacing, bullet style (disc/circle/square/dash/none), rule colour & thickness, accent/name/link/**body** colors, **optional contact icons**, **per-section heading style** (rule / accent bar / plain), and the accent bar / heading rule toggles — applied consistently to preview and PDF
- **Clickable, colored hyperlinks** for email, website, profile links, and project links in preview and PDF
- Drag-and-drop reordering for sections, entries, links, and bullet points (order flows through preview and PDF)
- Show/hide any section to tailor the CV per application
- Undo/redo for resume edits (toolbar buttons and `Ctrl/Cmd+Z` / `Ctrl/Cmd+Shift+Z`)
- Single-column, semantic layout optimized for applicant tracking systems
- Export to PDF (real selectable text) and PNG
- Optional **AI assist**: one-click "Improve" on your summary and bullet points via any OpenAI-compatible endpoint
- Autosave to `localStorage`; import/export JSON (résumé + template + customization); load sample data; reset
- Lazy-loaded exports keep the initial bundle small

## ATS Scanner

An instant, privacy-first check of how well a CV will survive applicant tracking systems. It never
uploads anything — the analysis runs in the browser and the draft is kept in `localStorage`.

- **Input any way you like**: paste the text, upload a **PDF** or **DOCX** (parsed in-browser with
  `pdfjs-dist` + `mammoth`, loaded lazily), a `.txt`/`.md`/`.json`/`.html` file, or **import directly
  from the CV Builder** in the same browser. Scanned/image-only PDFs and images are not supported —
  paste the text instead.
- **Instant 0–100 score** (graded Poor → Excellent) as you type, with a progress bar.
- **Four weighted categories**:
  - *Contact & essentials* — name, email, phone, location, and links.
  - *Structure & length* — standard section headings, sensible word count, dated entries, summary.
  - *Content quality* — quantified achievements, strong action verbs, bullet usage, and flags for
    first-person pronouns and buzzword stuffing.
  - *Formatting & parseability* — emoji/symbol noise, multi-column layouts, and all-caps headings.
- **Keyword match** (optional) — paste a job description to see matched vs. missing keywords
  against your CV; reuses the same extractor as the CV Builder's job-match card.
- **Download report** as a plain-text summary; load the built-in example or clear everything.

## Banner Maker

A quick, privacy-first banner designer. Everything renders locally and the design is kept in
`localStorage` under `banner-maker-v1`.

- **Preset sizes** for LinkedIn, X, Facebook, GitHub, email signature, and YouTube — or dial in a
  custom width/height. The live preview scales to fit the panel without affecting the export.
- **Themes** (one-click palettes) plus full control: solid / gradient / uploaded image background
  (with an overlay slider), background and gradient colors/angle.
- **Text** — title, subtitle, and an optional badge, with font, title-size slider, horizontal
  alignment, vertical alignment, and text/accent colors.
- **Import** your name and headline straight from the CV Builder, and **Download PNG** at 2×
  resolution via `html-to-image`.

## Portfolio Page

Turn your CV details into a clean, self-contained portfolio web page. The preview is the *actual*
generated HTML (rendered in an iframe), so what you see is exactly what visitors see. The draft lives
in `localStorage` under `portfolio-page-v1`.

- **Import from the CV Builder** (or load the example) to pull in your name, headline, about,
  contact links, skills, projects, experience, and education — then **edit everything** in place:
  add/remove/reorder projects, roles, education, and skills, and type or paste your own bio, links,
  and highlights (one per line).
- **Profile picture**: upload an image (PNG/JPEG) and it is centre-cropped to a square, downscaled,
  and embedded as a data URL — no external assets, so it travels with the shared link. Falls back to
  an accent-coloured initial when none is set.
- **Tabbed editor**: a *Content* tab for all of the above plus a *Design* tab with six accent
  themes, a custom accent color, light/dark modes, comfortable vs. compact density, a font picker,
  avatar/layout toggles, and per-section visibility.
- **Share with a link**: the whole page is compressed (`lz-string`) and packed straight into the URL
  (`#/p/<payload>`) — no account or server. Anyone who opens the link sees a read-only version via a
  dedicated viewer, whether they are on the hub or a tool subdomain. Copy the link, or open it in a
  new tab, right from the editor.
- The page is fully self-contained — inline CSS, no external assets or scripts — and all user text is
  HTML-escaped with links scheme-checked. Sharing is **link-only**: the raw HTML cannot be downloaded
  or copied out of the tool.

## Hydration Tracker

A faithful web port of the "Hydration" module from the *Life Basics* Flutter app. Your log, daily
target, and calculator profile live in `localStorage` under `hydration.v1.*`.

- **Quick log** — pick a drink (water, coffee, tea, juice, soda, sports drink) and tap a preset
  (250 / 330 / 500 / 1000 ml), or dial in a **custom amount** and **backfill** entries up to
  yesterday. Drinks log by their hydration factor (e.g. coffee counts 90%) and track caffeine
  against a 400 mg cap.
- **Daily goal** — edit the target (500–10000 ml) in ml, litres, or ounces, or use the **goal
  calculator** (weight, age, activity, climate) for a recommended intake.
- **Progress dashboard** — a goal progress bar, a "Today" list with smart per-drink rows
  (edit/delete), a **pace reminder** nagging you to catch up through the day, and a **caffeine
  alert** when you pass the cap.
- **Insights** — 7-day totals chart, a 14-day goal sparkline, your streak (with a 3-freeze bank so
  a missed day doesn't always break it), hydration score, unlocked **achievements**, and
  **challenges** (weekend warrior, perfect week). Copy a text summary or **export CSV**.

## Deployment: hub + tool subdomains

The same static build is served from the apex domain **and** every tool subdomain. The tool is
chosen from `window.location.hostname`: `cv.example.com` boots the CV Builder, while the apex
(`example.com`) shows the hub. Unknown subdomains fall back to the hub. In development
(`localhost`, `127.0.0.1`, `::1`) the hub uses in-page hash navigation instead of real subdomains.

- Point each tool subdomain (e.g. `cv.example.com`, `ats.example.com`, `banner.example.com`,
  `portfolio.example.com`, `hydrate.example.com`, `jobs.example.com`) and the apex at the same build
  output.
- Set `VITE_ROOT_DOMAIN=example.com` at build time to pin the root domain explicitly (optional;
  otherwise it is inferred by stripping a known tool label from the hostname).
- Add a tool by giving it a `slug` in `src/home/tools.ts` and creating the matching subdomain —
  e.g. the Hydration Tracker's `hydrate` slug maps to `hydrate.example.com`.

### Cross-subdomain data (`public/bridge.html`)

Each subdomain is a **separate origin**, so they cannot share `localStorage` directly. To let all
tools read and write the user's data, every page embeds a hidden iframe pointing at
`/bridge.html` on the **root origin**, which owns the authoritative store and syncs via
`postMessage`:

- `src/lib/crossOrigin.ts` — mirror-first client: reads are served instantly from a local mirror
  (`tinker:mirror:*`) and reconciled with the bridge; writes hit the mirror and the bridge.
- Conflicts resolve **last-write-wins** using a per-key timestamp. Messages are origin-validated
  and the client degrades silently to local-only storage if the iframe is blocked.

## Tech stack

React 19 · TypeScript · Vite · Tailwind CSS v4 · Zustand (+ immer, persist) · Zod ·
`@react-pdf/renderer` (PDF export) · `docx` (Word export) · `html-to-image` (PNG export) ·
`pdfjs-dist` + `mammoth` (PDF/DOCX text extraction, lazy)

## Getting started

Requires Node 20+ (this project was set up with Node 22 via nvm).

```bash
npm install
npm run dev      # http://localhost:5173
```

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start dev server |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build |
| `npm run lint` | Lint with oxlint |
| `npm test` | Run the Vitest suite |
| `npm run test:watch` | Run tests in watch mode |

## Project structure

```
src/
├─ ats/                  # ATS Scanner tool (AtsApp.tsx, extract.ts + tests)
├─ banner/               # Banner Maker tool (BannerApp.tsx, design.ts + tests)
├─ portfolio/            # Portfolio Page tool (PortfolioApp.tsx, PortfolioViewer.tsx, model.ts, share.ts + tests)
├─ hydration/            # Hydration Tracker tool (HydrationApp.tsx, model.ts + tests)
├─ jobs/                 # Job Tracker tool (JobTrackerApp.tsx, model.ts, store.ts, StatsPanel, ApplicationCard, BoardView, ApplicationFormModal + tests)
├─ password/             # Password Generator tool (PasswordApp.tsx, generate.ts + tests)
├─ convert/              # Unit Converter tool (ConvertApp.tsx, convert.ts + tests)
├─ diff/                 # Text Diff tool (DiffApp.tsx, diff.ts + tests)
├─ lorem/                # Lorem Ipsum Generator tool (LoremApp.tsx, lorem.ts + tests)
├─ color/                # Color Studio tool (ColorApp.tsx, color.ts + tests)
├─ cover/                # Cover Letter Builder tool (CoverLetterApp.tsx, model.ts, store.ts + tests)
├─ interview/            # Interview Prep tool (InterviewApp.tsx, model.ts, store.ts + tests)
├─ linkedin/             # LinkedIn Optimizer tool (LinkedinOptimizerApp.tsx, model.ts + tests)
├─ cvjob/                # CV ↔ Job Matcher tool (CvJobMatcherApp.tsx, model.ts, store.ts + tests)
├─ offer/                # Offer Comparison tool (OfferCompareApp.tsx, model.ts, store.ts + tests)
├─ logo/                 # Logo & Icon Maker tool (LogoApp.tsx, model.ts, store.ts + tests)
├─ signature/            # Email Signature Builder tool (SignatureApp.tsx, model.ts + tests)
├─ favicon/              # Favicon Generator tool (FaviconApp.tsx, model.ts, store.ts + tests)
├─ seo/                  # SEO & Social Preview tool (SeoPreviewApp.tsx, model.ts + tests)
├─ split/                # Expense Splitter tool (SplitApp.tsx, model.ts, store.ts + tests)
├─ invoice/              # Invoice Generator tool (InvoiceApp.tsx, model.ts, store.ts + tests)
├─ habits/ sleep/ mood/ workout/ medicine/   # Health & life tools (App + model + store + tests)
├─ focus/ kanban/ notes/ json/ datetime/     # Productivity tools (App + model + store + tests)
├─ components/
│  ├─ editor/            # One form per CV section, CompletenessCard, EditorPanel
│  ├─ ui/                # Field, inputs, cards, AiButton, TemplatePicker, DesignPanel, modals, Toaster
│  └─ Toolbar.tsx        # Template picker, export/import/reset
├─ export/               # PdfDocument + export{Pdf,Docx,Png}
├─ home/                 # Hub: landing page, tool registry/search (ToolSearch, ToolMenu), host-aware view/hash routing + navigation
├─ lib/                  # helpers, Zod schema, templates + fonts, applications, AI, sample data
│  ├─ ats.ts             # ATS scoring engine (categories, checks, report formatting)
│  ├─ host.ts            # Hostname → tool subdomain / root host parsing
│  ├─ crossOrigin.ts     # Root-origin bridge client (mirror + last-write-wins)
│  ├─ toast.ts           # Toast store + confirm/loading helpers
│  └─ match.ts           # Job-description keyword extraction + résumé matching
├─ preview/
│  ├─ ResumePreview.tsx       # A4 pages + fit-to-width scaling + pagination
│  └─ useFitScale.ts          # Shared fit-to-width hook + A4 constants
├─ store/                # Zustand store with cross-origin persistence
├─ types.ts              # Resume data model
└─ App.tsx
```

## ATS notes

The template and PDF export deliberately avoid tables, columns, text boxes, headers/footers,
and images for content. Text is real and selectable, headings are standard, and the reading
order matches the visual order.

## AI assist

AI assist is optional and off by default. Open **AI** in the toolbar and enter an
OpenAI-compatible API key, model, and base URL. The key is kept only in your browser's
`localStorage` and is sent directly to the endpoint you configure — there is no backend.
Leave the key blank to keep the "Improve" buttons disabled (clicking one will prompt you to
configure a key).
