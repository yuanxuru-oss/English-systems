# Tauri Setup

This project is now organized to support a clean local-first desktop packaging workflow with Tauri.

## Current State

- Frontend build output: `dist/index.html`
- Single-file preview output: `preview.html`
- Desktop shell config: `src-tauri/`
- App version: read from `package.json`
- Data version: `2`

## What You Still Need On This Computer

Tauri requires Rust on Windows. Install these first:

1. Rust / Cargo
2. Microsoft Visual Studio C++ Build Tools

Official docs:
- https://v2.tauri.app/start/prerequisites/
- https://v2.tauri.app/distribute/windows-installer/

## After Installing Rust

Run these in the project folder:

```bash
npm install
npm run build
npm run tauri:dev
```

When you are ready to package:

```bash
npm run tauri:build
```

## Why This Structure

- `src/` stays focused on product logic
- `dist/` is the packaging-ready frontend output
- `src-tauri/` is only the desktop shell
- `package.json` is the only version source; `npm run build` synchronizes the desktop configuration automatically

## Packaging Notes

- `preview.html` remains useful for GitHub Pages and visual review
- `dist/index.html` is the canonical desktop packaging entry
- future desktop-only features should be added through Tauri APIs, not mixed into core learning modules unless necessary
