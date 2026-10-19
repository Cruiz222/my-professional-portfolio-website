# CruizTech online admin setup

This update adds Vercel API functions, Supabase Postgres content/session storage and Supabase image storage. It does not require a new frontend framework or new npm dependencies.

## 1. Create your database

Create a project at https://supabase.com/dashboard. Keep its database password private. In that project's SQL Editor, create a query, paste the complete contents of `supabase/setup.sql`, and run it once. This creates private content/session tables, atomic save and login-limit functions, and a public-read image bucket. The bucket contains portfolio pictures intended for public display. No anonymous database or image-write policies are created. Do not add public write policies.

Leave content tables empty initially: the online site and admin load the existing committed projects and profile until you save each section online for the first time. Existing project content is not replaced with sample data.

## 2. Set Vercel environment variables

In your existing Vercel project, open Settings → Environment Variables. Add these four variables to Production (not only Development). None may use a `VITE_` prefix.

| Name | Value |
| --- | --- |
| SUPABASE_URL | Your Supabase project URL, like `https://your-project-ref.supabase.co` |
| SUPABASE_SECRET_KEY | The server secret API key from your Supabase project's API Keys settings (`sb_secret_…`), not a publishable key |
| OWNER_PASSWORD_HASH | The existing salted hash value from `frontend/.env.local`, without `OWNER_PASSWORD_HASH=` |
| SITE_URL | `https://my-professional-portfolio-website-i.vercel.app` |

The Supabase key and password hash are server-only secrets. Enter them directly into Vercel; don't share them in chat, GitHub, screenshots, or frontend source. Your existing owner password works with its existing hash. If you haven't set one, run `npm run owner:setup` in `frontend` first. To view the local hash for copying, open `.env.local` in your local editor. Copy only the value after the equals sign. Keep the file untracked.

Use the exact public domain you sign in through for SITE_URL. If you later change domains, update SITE_URL and redeploy. This intentionally prevents saves from other origins, including unconfigured preview domains. If enabling previews, configure their own SITE_URL and use an isolated Supabase project rather than your production database.

## 3. Apply and publish the code

Stop the local dev server. Download the updated ZIP. From the repository root, extract while preserving your current content and credentials:

```bash
unzip -o ~/Downloads/portfolio-website.zip -d . \
  -x 'frontend/public/projects.json' \
     'frontend/public/profile.json' \
     'frontend/public/profile.png'
cd frontend
npm ci
npm run build
npm test
cd ..
git add frontend
git diff --cached --name-only
```

Confirm `.env.local` is absent, then:

```bash
git commit -m "Enable hosted portfolio admin with persistent content and image storage"
git push origin main
```

The Vercel project Root Directory stays `frontend`, framework Vite, build `npm run build`, output `dist`. API files and vercel.json must be committed. Node.js 24 is supported by this project. Environment changes take effect on a new deployment: if you added them after the push, redeploy the latest commit.

## 4. Sign in from any device

After Vercel reports Ready, open:

https://my-professional-portfolio-website-i.vercel.app/#admin

Sign in with your existing owner password. The dashboard has separate profile and background images, plus project pictures. Online saves publish immediately; existing open tabs refresh project content within 15 seconds or on focus. Profile images refresh on page reload or focus. Images upload before you save, then the Save button publishes their URLs. Removing an image from a project does not erase its underlying storage object, to avoid breaking links or older content; clean unused objects manually in Supabase Storage when appropriate.

Local `npm run dev` remains a file-based editor with a separate local session. Once you start editing online, use the online dashboard as the source of truth. Committing local JSON afterward does not overwrite online database content. To carry all current baseline content into Supabase immediately, save the profile section, then edit and save one existing project (the dashboard saves the full loaded project list). An empty project list is stored when you delete its final project.

## Verification after deployment

- Sign in, change a project, save, and verify from a separate browser/private window.
- Upload distinct profile and background pictures and confirm they remain separate after refresh.
- Add multiple project pictures, save, and check the public gallery.
- Sign out and confirm the editor requires a password again.
- Redeploy the same commit and confirm online edits remain.

## Session and recovery details

Owner cookies are HttpOnly, Secure and SameSite=Strict. Only token hashes are stored in Postgres; sessions expire after one hour. Logout removes the session immediately. Changing OWNER_PASSWORD_HASH invalidates all older sessions after redeployment. A shared database counter permits five login attempts in 15 minutes, across Vercel instances. Repeated incorrect attempts can therefore temporarily lock the single owner login; wait 15 minutes to retry. There is no public registration or password-reset endpoint. Concurrent edits use revision checks and show a conflict instead of overwriting another editor.

If the dashboard says setup is incomplete, check all four Production variables and redeploy. If storage is unavailable, confirm setup.sql ran in the same Supabase project as the URL/key. If saving returns an origin error, make sure you are visiting exactly SITE_URL. Keep the Supabase project available and retain your own backups of live content.

## Validation performed

The build type-checks server functions and client code. Automated tests cover the original local editor plus hosted login, secure cookies, stored sessions, expiration, logout, forged sessions, cross-origin rejection, persistent saves, revision conflicts, public reads, image upload validation, and fail-closed configuration. Hosted tests mock Supabase; actual SQL installation and Vercel/Supabase integration must still be verified after your account setup.
