# CV Builder

The CV Builder is one tool inside **Tinker Tools**, a growing hub of free, browser-first tools
served from a single static site. The landing page (`#/`) shows all tools and upcoming ones; the
CV Builder lives at `#/cv-builder` via a zero-dependency hash router. Add a future tool by
dropping an entry into `src/home/tools.ts` (with a unique `slug`) — routing and the hub card are
derived from that registry automatically.

A fully client-side CV/resume and cover-letter builder with a live A4 preview and
**ATS-friendly** export to **PDF, DOCX, and PNG**. No backend — all data stays in your
browser (`localStorage`).

## Features

- Structured form editor (personal details, experience, education, skills, projects, certifications, languages)
- **Résumé strength** meter highlighting what to add next
- **Job match** card — paste a job description (plus optional extra keywords) to see which extracted keywords your résumé already covers, copy the missing ones, or add them straight to your skills as a group
- **Cover letter** tab with a "Generate from résumé" draft and matching PDF/DOCX/PNG export
- **Application tracker** tab: wishlist → applied → interview → offer → rejected, with notes and CSV export
- Live A4 preview that scales to fit the viewport, with **automatic multi-page pagination** and page indicators (PDF adds "Page x of y" footers)
- Six templates: **ATS Classic**, **Modern Accent**, **Elegant Serif**, **Teal Accent**, **Technical Mono**, **Burgundy Serif** — each with matching PDF/DOCX fonts, chosen from a thumbnail picker
- **Header layout** toggle — stacked (centred contact line) or two columns (name/headline left, contact details right-aligned), applied to preview, PDF, and DOCX
- **Design panel** with one-click presets (Classic / Compact / Modern / Airy) plus **save/load your own named presets** (persisted), and per-property overrides of the template: font family (six web-safe faces), base font size (9–13px), page margins (vertical/horizontal), line height, heading letter spacing / case / weight, name size & letter spacing, heading size, section spacing, bullet style (disc/circle/square/dash/none), rule colour & thickness, accent/name/link/**body** colors, **optional contact icons**, **per-section heading style** (rule / accent bar / plain), and the accent bar / heading rule toggles — applied consistently to preview, PDF, and DOCX
- **Clickable, colored hyperlinks** for email, website, profile links, and project links in preview, PDF, and DOCX
- Drag-and-drop reordering for sections, entries, links, and bullet points (order flows through preview, PDF, and DOCX)
- Show/hide any section to tailor the CV per application
- Undo/redo for resume edits (toolbar buttons and `Ctrl/Cmd+Z` / `Ctrl/Cmd+Shift+Z`)
- Single-column, semantic layout optimized for applicant tracking systems
- Export to PDF (real selectable text), DOCX, and PNG
- Optional **AI assist**: one-click "Improve" on your summary, bullet points, and cover-letter body via any OpenAI-compatible endpoint
- Autosave to `localStorage`; import/export JSON (résumé + cover letter + applications + template + customization); load sample data; reset
- Lazy-loaded exports keep the initial bundle small

## Deployment: hub + tool subdomains

The same static build is served from the apex domain **and** every tool subdomain. The tool is
chosen from `window.location.hostname`: `cv.example.com` boots the CV Builder, while the apex
(`example.com`) shows the hub. Unknown subdomains fall back to the hub. In development
(`localhost`, `127.0.0.1`, `::1`) the hub uses in-page hash navigation instead of real subdomains.

- Point each tool subdomain (e.g. `cv.example.com`) and the apex at the same build output.
- Set `VITE_ROOT_DOMAIN=example.com` at build time to pin the root domain explicitly (optional;
  otherwise it is inferred by stripping a known tool label from the hostname).
- Add a tool by giving it a `slug` in `src/home/tools.ts` and creating the matching subdomain.

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
`@react-pdf/renderer` (PDF) · `docx` (Word) · `html-to-image` (PNG)

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
├─ components/
│  ├─ editor/            # One form per CV section, CompletenessCard, CoverLetterForm, EditorPanel
│  ├─ tracker/           # Application tracker view
│  ├─ ui/                # Field, inputs, cards, AiButton, TemplatePicker, DesignPanel, modals
│  └─ Toolbar.tsx        # Résumé/cover/tracker tabs, template picker, export/import/reset
├─ export/               # PdfDocument/CoverLetterDocument + export{Pdf,Docx,Png}
├─ home/                 # Hub: landing page, tool registry, host-aware view/hash routing + navigation
├─ lib/                  # helpers, Zod schema, templates + fonts, coverLetter, applications, AI, sample data
│  ├─ host.ts            # Hostname → tool subdomain / root host parsing
│  ├─ crossOrigin.ts     # Root-origin bridge client (mirror + last-write-wins)
│  └─ match.ts           # Job-description keyword extraction + résumé matching
├─ preview/
│  ├─ ResumePreview.tsx       # A4 pages + fit-to-width scaling + pagination
│  ├─ CoverLetterPreview.tsx  # Cover-letter A4 preview
│  └─ useFitScale.ts          # Shared fit-to-width hook + A4 constants
├─ store/                # Zustand store with cross-origin persistence
├─ types.ts              # Resume + CoverLetter data models
└─ App.tsx

public/
└─ bridge.html           # Root-origin storage bridge embedded by every tool subdomain
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
