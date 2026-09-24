# John Abah — portfolio frontend

React and TypeScript portfolio with file-backed project content. No sample projects are published.

## Run locally

Use Node.js 22.12 or newer with npm.

```sh
cd frontend
npm ci
npm run dev
```

Open the localhost address printed by Vite. `npm run build` creates the production site in `dist/`; `npm run lint` and `npm test` check the code and project persistence.

## Owner access setup

Before editing, run this in your own terminal:

```sh
cd frontend
npm run owner:setup
```

Choose a private password of at least 12 characters and confirm it. Input is hidden. The command writes only a salted scrypt hash to the git-ignored `frontend/.env.local`, with file permissions restricted to your OS account. Do not use a `VITE_` prefix for the credential: those variables are public frontend configuration.

Restart the dev server after setup. Open `http://localhost:5173/#manage-projects` and sign in. There is no default password, public registration, or password setup web endpoint. Without valid server-side credentials, editing is disabled.

Owner sessions use a random token in an HttpOnly, SameSite=Strict cookie, expire after one hour, and are invalidated on logout or server restart. Five login attempts within 15 minutes trigger a temporary limit. Sign out when done. To change or recover the password, rerun the setup command and restart the server; this also invalidates prior sessions.

Anyone with access to your OS account or repository files remains trusted and can modify the files directly. This owner login protects the web editor; it does not replace operating-system access controls.

## Manage projects

1. Click **Owner login** in the footer of the local development website, or open `http://localhost:5173/#manage-projects`.
2. Sign in with your owner password, then choose **Add project**, fill in your details, and click **Save project**.
3. Use **Edit** to update a project or **Delete**, then **Confirm deletion**, to remove it.
4. Return to the portfolio. The list reads the saved content; an already-open tab updates on focus or within 15 seconds while visible.

Projects are saved to `public/projects.json`, not browser storage. Restarting the dev server or switching browsers retains saved content. You can also edit that JSON file manually. Keep project IDs unique; the editor generates IDs automatically. The file starts with an empty array.

**Publishing:** commit the changed content file, build, and deploy to update a hosted website. A static deployment serves the saved content to every visitor, but cannot accept edits through this manager. The manager is available only during local development, using localhost on the same computer as Vite. A protected backend or CMS is needed for editing directly on a hosted website.

Do not put secrets or private data in project content: it is public.

## How it works

- `src/data/projects.ts` defines the Project shape and validates both frontend and server input.
- `src/data/useProjects.ts` loads published JSON and refreshes it on focus and periodically.
- `src/components/Projects.tsx` filters the supplied project list.
- `src/components/ProjectCard.tsx` renders project text and optional HTTP/HTTPS links.
- `src/components/ProjectManager.tsx` coordinates additions, edits, deletion, and save status.
- `src/components/ProjectForm.tsx` holds editable fields until Save is clicked.
- `server/projects-api.ts` writes validated content atomically. Revision checks prevent one editor from silently overwriting another editor's work.
- `vite.config.ts` mounts the editing endpoint only in the development server. It is absent from the production build and preview server.

The write endpoint checks loopback connections, the Host and Origin headers, JSON content type, body size, and content validity. Every management read and write additionally requires a valid owner session. This remains a localhost-only authoring tool; the static production website has no editing API or login endpoint. The cookie uses local HTTP in this workflow. Any future hosted editing backend must use HTTPS and Secure cookies. Public visitors cannot publish content. Failed saves keep the form available and show an error. A conflict requires reloading the manager before retrying; copy any unsaved changes first.

Learning exercise: trace a field from form state through validation, the save request, the JSON file, and the public project list. Explain why saving only React state would lose content on reload.

## Verification

`npm test` covers validation, persistent add/edit/delete operations, invalid and unsafe input, origin/host restrictions, concurrent-edit conflicts, unauthenticated/forged-session rejection, login rate limits, logout, and session expiry. Tests use temporary files and never modify your portfolio content.

Browser checks: add a project, edit it, reload, cancel and confirm deletion, filter categories, and test keyboard navigation and mobile layouts. Contact functionality, real profile links, and earned credentials remain separate work.
