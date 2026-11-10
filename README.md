# 3d_Portfolio

Personal portfolio of Leonardo Guevara Atehortúa. The home page is a small 3D room where a character walks around and opens the sections of the site. Every section is also a normal page, so nothing depends on the room.

Live site: https://leonardog2005.github.io/3d_Portfolio/

## Stack

- React 19 + Vite, JavaScript (JSX)
- Tailwind CSS 4, Motion for React, React Router, lucide icons
- three.js through React Three Fiber. The room renders with WebGPU, falls back to WebGL 2, and falls back again to a 2D home when neither is available or the device asks for less motion or data.

## Run it

```bash
npm install
npm run dev
```

Open the URL Vite prints and add `/3d_Portfolio/` (the site is built for that subpath).

| Command | What it does |
|---|---|
| `npm run dev` | Development server |
| `npm test` | Unit tests (translations, assistant matching, collisions, pathfinding, contribution stats) |
| `npm run build` | Production build in `dist/`, plus one `index.html` per route and a `404.html` |
| `npm run preview` | Serves `dist/` locally, the same way GitHub Pages will |
| `npm run snapshot:contributions` | Refreshes the saved GitHub contribution data |

Useful while testing: add `?renderer=webgl` to force the WebGL 2 backend or `?renderer=lite` to force the 2D home.

## Where things live

```
src/
  app/          App shell, route table, theme and experience providers
  components/   Layout (top bar, menu, page frame) and small UI pieces
  data/         Facts: profile, projects, skills, journey, assistant intents
  i18n/         All visible text, en.js and es.js
  features/
    room/           The 3D room (loaded only on the home page)
    lite-home/      The 2D home
    music/          Music button and player
    assistant/      Scripted question assistant
    github-activity/ Contribution calendar
  pages/        One file per route
public/         Files served as they are (CVs, music, images)
scripts/        Build helpers
```

## Editing content

You do not need to touch the 3D code to maintain the site.

| I want to change | Edit |
|---|---|
| Any text, in either language | `src/i18n/en.js` and `src/i18n/es.js` (keep the same keys in both, a test checks it) |
| Email, links | `src/data/profile.js` |
| Skills | `src/data/skills.js` |
| A project's links, tech list or images | `src/data/projects.js` |
| A project's description | `projects.items.<slug>` in both i18n files |
| Timeline entries | `src/data/journey.js` plus `journey.items` in both i18n files |
| Assistant answers | `chat.answers` in both i18n files, keywords in `src/data/faqs.js` |

To add a project: add an entry to `src/data/projects.js`, add its texts under `projects.items.<slug>` in both i18n files, and put its images in `public/images/projects/<slug>/`. The detail page and its URL are created automatically.

## Replacing files

Drop the new file at the same path. Nothing else has to change.

| File | Path |
|---|---|
| Background music | `public/audio/portfolio-track.mp3` |
| CV in English | `public/cv/Leonardo_Guevara_CV_EN.pdf` |
| CV in Spanish | `public/cv/Leonardo_Guevara_CV_ES.pdf` |
| Profile photo | `public/images/profile/leonardo.jpg` |
| Project cover | `public/images/projects/<slug>/cover.jpg` (path set in `src/data/projects.js`) |
| Project screenshots | Add files to `public/images/projects/<slug>/` and list them in that project's `gallery` |

If a CV or the music file is missing, its button hides or disables itself. If an image is missing, a generated placeholder is shown instead.

## The room, briefly

- `src/features/room/config.js` holds the layout numbers: furniture footprints for collisions and the list of interactive objects with the page each one opens.
- `scene/layout.js` draws the furniture from boxes, cylinders and spheres and bakes it into one mesh. `scene/palette.js` has the colours for the dark and light themes.
- `Character.jsx` is the character and its movement. `SceneSystems.jsx` has the camera, click handling and object markers.

To make an object open a different page, change its `route` in `config.js`.

## Deployment

Pushing to `main` runs `.github/workflows/deploy.yml`, which tests, builds and publishes `dist/` to GitHub Pages. The repository's Pages source must be set to "GitHub Actions".

The site is served from `/3d_Portfolio/`. If it ever moves to a root domain, build with `VITE_BASE=/`.

GitHub Pages has no server-side routing, so the build writes a real `index.html` for each route (see `scripts/postbuild-routes.mjs`). Direct links and refreshes work without redirects.
