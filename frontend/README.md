# John Abah — portfolio frontend

React and TypeScript frontend built on the original Header, About, Projects, ProjectCard, and ProjectForm components.

## Run locally

Use Node.js 22.12 or newer with npm.

```sh
cd frontend
npm ci
npm run dev
```

`npm run build` checks TypeScript and creates `dist/`. `npm run lint` runs Oxlint. `npm run preview` serves a production build locally.

## Content and components

- `src/components/About.tsx`: introduction and engineering direction.
- `src/components/Projects.tsx`: existing project data and category filtering.
- `src/components/ProjectCard.tsx`: shared Project type and card presentation.
- `src/components/ProjectForm.tsx`: local project preview exercise.
- `src/App.tsx`: skills, journey, certification placeholder, and contact placeholder.
- `src/index.css` and `src/App.css`: global and responsive component styling.

Existing project titles and technologies are retained. AI and cybersecurity are described as learning directions. Add only earned credentials and real contact/profile links. There is no backend, contact submission, authentication, or project publishing yet.

## How the React exercise works

Projects owns the selected category in state and derives the visible list with `filter`. ProjectCard receives a typed project through props. ProjectForm keeps editable fields separate from the submitted preview, so typing does not change the preview until submission. Reset clears both. Reloading discards the preview.

Required fields, length limits, and trimming reject empty drafts. React renders the text without interpreting it as HTML. Any future API must independently validate input; browser validation is not a server security boundary.

Learning exercise: explain why `preview` is separate from `title` and `description`, then add a technology input that splits comma-separated values, trims whitespace, and removes duplicates.

## Manual checks

- Navigate to each section with the header and keyboard; verify visible focus and the skip link.
- Select Software (three projects), AI (empty state), then View all projects.
- Submit a draft, edit it without submitting, submit again, and reset.
- Try whitespace-only input and HTML-like text; the former should fail and the latter should display as text.
- Check narrow mobile and desktop layouts for horizontal overflow.

Hosting configuration, HTTPS, security headers, and abuse prevention for any future contact API remain deployment/backend work.
