# CV Builder

A fully client-side CV/resume builder with a live A4 preview and **ATS-friendly** export to
**PDF, DOCX, and PNG**. No backend — all data stays in your browser (`localStorage`).

## Features

- Structured form editor (personal details, experience, education, skills, projects, certifications, languages)
- Live A4 preview that scales to fit the viewport
- Three templates: **ATS Classic** (black, ruled), **Modern Accent** (indigo bar), and **Elegant Serif** (Georgia, borderless headings) — each with matching PDF/DOCX fonts
- Drag-and-drop reordering for both sections and individual entries (order flows through preview, PDF, and DOCX)
- Single-column, semantic layout optimized for applicant tracking systems
- Export to PDF (real selectable text), DOCX, and PNG
- Optional **AI assist**: one-click "Improve" on your summary and bullet points via any OpenAI-compatible endpoint
- Autosave to `localStorage`; import/export JSON; load sample data; reset
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
│  ├─ editor/            # One form per CV section + EditorPanel
│  ├─ ui/                # Field, inputs, SectionCard, EntryCard, list editors
│  └─ Toolbar.tsx        # Export/import/reset actions
├─ export/               # PdfDocument + exportPdf/exportDocx/exportPng
├─ lib/                  # helpers, Zod schema, templates, sample data
├─ preview/
│  └─ ResumePreview.tsx  # A4 page + fit-to-width scaling
├─ store/                # Zustand store with localStorage persistence
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
