# My Library

A personal reading tracker, built in five stages while learning full-stack development.

## Stages

- [x] **1. Static page** - hand-written HTML and CSS. No JavaScript.
- [x] **2. Browser JavaScript** - books live in a JS array; the page is rendered from it, with add and remove.
- [x] **3. Express server** - Node serves the page and a JSON API; the books live server-side.
- [x] **4. SQLite** - books persist in library.db and survive a restart.
- [x] **5. Deploy** - runs on Render, deployed from this repo on every push.

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

## Deploying

Hosted on Render's free tier, built from this repo. Pushing to `main`
triggers a redeploy automatically.

Two things make the app portable:

- `process.env.PORT` - the host chooses the port, not the code
- `NODE_VERSION` in `render.yaml` - `node:sqlite` needs Node 22.5+

### Known limitation

The free tier gives the app a temporary filesystem, and `library.db` is not
in git. So the database is rebuilt from the seed books whenever the service
restarts, redeploys, or wakes from sleep. The service also sleeps after
about 15 minutes of inactivity, making the next visit slow to load.

Fixing it properly means either a paid persistent disk or moving to a
managed Postgres.
