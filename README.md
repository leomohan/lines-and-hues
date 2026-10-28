# Lines & Hues — Companion Gallery

The online companion to the book *Lines & Hues: A Global Journey Through Drawing and Painting Styles*
by Modo Bhaik. Every **(Gallery X.Y)** reference in the book has an entry here: the work, the
artist or culture, where it is held, why it matters to the chapter, and a link to view it.

Live site (once published): **https://leomohan.github.io/lines-and-hues/**

Built to run for free on **GitHub Pages** — plain HTML, CSS and JavaScript, no build step, no
server, no tracking.

## How the numbering works

`Gallery 4.3` = the third reference in Chapter 4. The site accepts direct links such as
`…/lines-and-hues/#4.3` (opens and highlights that entry) and `…/#ch4` (jumps to Chapter 4).

## Repository structure

| Path | What it is |
|---|---|
| `index.html` | The gallery page |
| `assets/style.css`, `assets/app.js` | Styling and behaviour (search, filters, deep links) |
| `data/gallery.js` | **All the content** — chapters and the 91 gallery entries |
| `tools/check-links.mjs` | Checks every link and lists any that are broken |
| `.github/workflows/link-check.yml` | Runs the link check on the 1st of every month |

## Updating an entry or a link

Edit `data/gallery.js`. Each entry looks like this:

```js
{
  "id": "4.3",
  "chapter": 4,
  "title": "Shiva as Nataraja (Chola bronze)",
  "creator": "Chola bronze-casters",
  "date": "c. 11th century",
  "place": "Government Museum, Chennai, and museums worldwide",
  "status": "pd",            // "pd" public domain · "link" in copyright · "respect" culturally sensitive
  "purpose": "The cosmic dance in lost-wax bronze …",
  "note": "",                // optional — shown highlighted on the card
  "links": [ { "label": "Read & view on Wikipedia", "url": "https://en.wikipedia.org/wiki/Nataraja" } ]
}
```

**Keep the `id` values unchanged** — they are printed in the book. If you add an entry to the
book later, give it the next free number in that chapter rather than renumbering.

Every card automatically adds an "Archived copy" link (Internet Archive) as a fallback.

## Testing locally

Open `index.html` directly in a browser — no server needed. Try `index.html#4.3`.

To check links on your machine: `node tools/check-links.mjs` (Node 18 or newer).

## Publishing on GitHub Pages

1. Create an empty public repository named `lines-and-hues` under `leomohan` on GitHub.
2. From this folder: `git push -u origin main`.
3. On GitHub: **Settings → Pages → Build and deployment → Deploy from a branch → `main` / root**.
4. After a minute the site is live at `https://leomohan.github.io/lines-and-hues/`.

The monthly link check appears under the **Actions** tab. If any link breaks, the run fails and
GitHub emails you; the run summary lists exactly which entries to fix.

## Copyright approach

This site does not host images of the works. It links to encyclopedia, museum and archive pages.
Works still in copyright are only linked, never reproduced. Sacred or restricted works (for example
kiva murals, Wandjina, Dogon ritual drawings) are not shown; their entries link to background or to
the community's own art centre and explain why.
