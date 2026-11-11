# WriteSpace

WriteSpace is a browser-only blogging MVP built with Vite, React, React Router, and Tailwind CSS. It includes a public landing page, local demo authentication, post reading/writing, and a small administrator dashboard and account panel. All accounts, posts, and the active session are stored in the current browser profile's localStorage; there is no backend or cross-device synchronization.

## Requirements

- Node.js 20 or newer
- npm

## Run locally

```sh
npm install
npm run dev
```

Open the Vite URL printed in the terminal (normally `http://localhost:5173`).

## Demo administrator

- Username: `admin`
- Password: `admin`

You may create user accounts from the registration page. This is a non-sensitive demonstration application: credentials are stored as plain text in localStorage, and client-side route checks are not a security boundary. Do not enter real passwords or sensitive information.

## Build and tests

```sh
npm test
npm run build
npm run e2e
```

`npm test` runs Vitest component and local-storage tests. `npm run e2e` runs Playwright against the Vite preview server.

## Deployment

The application is a static SPA intended for Vercel. The root `vercel.json` contains the PRD-prescribed rewrite to `/index.html` for direct client routes. Posts, accounts, and sessions remain local to each browser; publishing a static bundle does not create shared server-side data.
