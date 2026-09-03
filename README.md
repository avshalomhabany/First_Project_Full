# My Library

A personal reading tracker, built in five stages while learning full-stack development.

## Stages

- [x] **1. Static page** - hand-written HTML and CSS. No JavaScript.
- [x] **2. Browser JavaScript** - books live in a JS array; the page is rendered from it, with add and remove.
- [x] **3. Express server** - Node serves the page and a JSON API; the books live server-side.
- [x] **4. SQLite** - books persist in library.db and survive a restart.
- [ ] 5. Deploy - put it on the internet.

## Running it

Run `npm install` once, then `npm start`, and open http://localhost:3000

## Files

| Path | What it is |
| --- | --- |
| `server.js` | Express server: routes and HTTP |
| `db.js` | SQLite: schema, seed data, queries |
| `library.db` | The database itself (created on first run, not committed) |
| `public/index.html` | Page structure |
| `public/styles.css` | All styling |
| `public/app.js` | Browser code: fetches books and draws them |
| `public/covers/` | Placeholder cover art (SVG) |
