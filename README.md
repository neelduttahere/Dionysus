# Dionysus
A React-based satellite imagery composer for loading public STAC items, rendering them through TiTiler, and comparing scenes on an interactive map.

## Development

Install dependencies with pnpm:

```bash
pnpm install
pnpm dev
```

The local app defaults to the public TiTiler demo unless `VITE_DEFAULT_TITILER_URL`
is set.

## Local Full Stack

Run the frontend and a local TiTiler instance together:

```bash
docker compose up --build
```

Services:

- Frontend: `http://localhost:5173`
- TiTiler: `http://localhost:8000`

## Hosted Demo

The static GitHub Pages build should set:

```bash
VITE_DEFAULT_TITILER_URL=https://titiler.xyz
```

Composer state is URL-shareable through `/map/compose?s=...`. Local preferences
such as TiTiler endpoint, basemap, and area unit are stored in the browser.
