# CV Builder

A fully client-side CV/resume and cover-letter builder with a live A4 preview and
**ATS-friendly** export to **PDF, DOCX, and PNG**. No backend — all data stays in your
browser (`localStorage`).

## Features

- Structured form editor (personal details, experience, education, skills, projects, certifications, languages)
- **Résumé strength** meter highlighting what to add next
- **Cover letter** tab with a "Generate from résumé" draft and matching PDF/DOCX/PNG export
- **Application tracker** tab: wishlist → applied → interview → offer → rejected, with notes and CSV export
- Live A4 preview that scales to fit the viewport, with **automatic multi-page pagination** and page indicators (PDF adds "Page x of y" footers)
- Six templates: **ATS Classic**, **Modern Accent**, **Elegant Serif**, **Teal Accent**, **Technical Mono**, **Burgundy Serif** — each with matching PDF/DOCX fonts, chosen from a thumbnail picker
- **Design panel** with one-click presets (Classic / Compact / Modern / Airy) and per-property overrides of the template: font family (six web-safe faces), base font size (9–13px), page margins (vertical/horizontal), line height, heading letter spacing / case / weight, name size & letter spacing, heading size, section spacing, bullet style (disc/circle/square/dash/none), rule colour & thickness, accent/name/link colors, and the accent bar / heading rule toggles — applied consistently to preview, PDF, and DOCX
- **Clickable, colored hyperlinks** for email, website, profile links, and project links in preview, PDF, and DOCX
- Drag-and-drop reordering for sections, entries, links, and bullet points (order flows through preview, PDF, and DOCX)
- Show/hide any section to tailor the CV per application
- Undo/redo for resume edits (toolbar buttons and `Ctrl/Cmd+Z` / `Ctrl/Cmd+Shift+Z`)
- Single-column, semantic layout optimized for applicant tracking systems
- Export to PDF (real selectable text), DOCX, and PNG
- Optional **AI assist**: one-click "Improve" on your summary, bullet points, and cover-letter body via any OpenAI-compatible endpoint
- Autosave to `localStorage`; import/export JSON (résumé + cover letter + applications + template + customization); load sample data; reset
- Lazy-loaded exports keep the initial bundle small

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
├─ lib/                  # helpers, Zod schema, templates + fonts, coverLetter, applications, AI, sample data
├─ preview/
│  ├─ ResumePreview.tsx       # A4 pages + fit-to-width scaling + pagination
│  ├─ CoverLetterPreview.tsx  # Cover-letter A4 preview
│  └─ useFitScale.ts          # Shared fit-to-width hook + A4 constants
├─ store/                # Zustand store with localStorage persistence
├─ types.ts              # Resume + CoverLetter data models
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
