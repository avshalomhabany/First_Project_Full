/* ==========================================================================
   My Library - the server

   Run it with:  npm start
   Then open:    http://localhost:3000
   Stop it with: Ctrl+C in the terminal

   Stage 4: the books live in library.db, handled by db.js. This file is now
   only about HTTP - reading requests, checking them, and sending answers.
   It contains no SQL and no book data.
   ========================================================================== */

'use strict';

const express = require('express');
const path = require('path');

/* Our own file, so the path starts with ./ - that is how Node tells the
   difference between a local file and a package in node_modules. */
const { listBooks, addBook, removeBook, DB_FILE } = require('./db');

const app = express();

/* --- The port ------------------------------------------------------------
   On your machine there is no PORT set, so this falls back to 3000 and
   nothing changes.

   A host like Render picks the port itself and passes it in as an
   environment variable - a setting handed to the program from outside,
   rather than written in the code. Hard-coding 3000 here would mean the
   host looks for your app on a port it is not using, decides it is broken,
   and kills it. This one line is the difference between deploying and not. */
const PORT = process.env.PORT || 3000;

const STATUS_KEYS = ['want', 'reading', 'finished'];

/* --- 1. Middleware ------------------------------------------------------- */
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

/* --- 2. Route: list every book -------------------------------------------
   GET /api/books

   Was: res.json(books) - straight off an array in memory.
   Now: the same JSON, read from disk. The browser cannot tell the
   difference, which is why public/app.js did not need touching. */
app.get('/api/books', (req, res) => {
  res.json(listBooks());
});

/* --- 3. Route: add a book ------------------------------------------------
   POST /api/books

   The checks here are unchanged. The database has its own rules too
   (NOT NULL, CHECK on status), but a database error would reach the user as
   an ugly 500. Checking first means a clear 400 with a readable message.
   Two layers on purpose - the outer one for humans, the inner one as a
   guarantee that nothing malformed can ever get stored. */
app.post('/api/books', (req, res) => {
  const title = String(req.body.title || '').trim();
  const author = String(req.body.author || '').trim();
  const status = req.body.status;

  if (!title || !author) {
    return res.status(400).json({ error: 'Title and author are both required.' });
  }

  if (!STATUS_KEYS.includes(status)) {
    return res.status(400).json({ error: 'Unknown status: ' + status });
  }

  const book = addBook({ title: title, author: author, status: status });
  res.status(201).json(book);
});

/* --- 4. Route: delete a book ---------------------------------------------
   DELETE /api/books/5

   removeBook() reports whether it actually deleted anything, which is how
   we still tell 204 (gone) apart from 404 (never existed). */
app.delete('/api/books/:id', (req, res) => {
  const id = Number(req.params.id);

  if (!removeBook(id)) {
    return res.status(404).json({ error: 'No book with id ' + id });
  }

  res.status(204).end();
});

/* --- 5. Start listening -------------------------------------------------- */
app.listen(PORT, () => {
  console.log('Library running at http://localhost:' + PORT);
  console.log('Database: ' + DB_FILE);
  console.log('Press Ctrl+C to stop.');
});
