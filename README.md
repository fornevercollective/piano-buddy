# Piano Buddy

Mobile web app for piano lessons — rainbow key colors, scrolling sheet music, mirror mode (phone lights the keys), camera overlay, and family share links.

**Live site:** [fornevercollective.github.io/piano-buddy](https://fornevercollective.github.io/piano-buddy/)

## Run locally

ES modules need a local server (not `file://`):

```bash
cd piano-buddy
python3 -m http.server 8765
```

Open `http://localhost:8765` on your phone or laptop.

## GitHub Pages (one-time setup)

1. Push this repo to GitHub (`main` branch).
2. **Settings → Pages → Build and deployment → Source:** choose **GitHub Actions**.
3. Push to `main` (or run the **Deploy GitHub Pages** workflow manually). The workflow is [`.github/workflows/pages.yml`](.github/workflows/pages.yml).

After the first successful deploy, the app is live at:

`https://<owner>.github.io/piano-buddy/`

## Song catalog

Songs are grouped by album in [`catalog.js`](catalog.js) (Halloween, Lady Gaga, mgk, Limp Bizkit, practice tunes). Tracks marked **coming soon** are placeholders until charts are added.

## Stack

- Static HTML/CSS/JS (no build step)
- [VexFlow](https://vexflow.com/) for notation (CDN)
- Optional: hexcast / overview room links for live streaming