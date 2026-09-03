/* ==========================================================================
   My Library - the server

   Run it with:  npm start
   Then open:    http://localhost:3000
   Stop it with: Ctrl+C in the terminal

   Stage 3b: the server now owns the books. The browser asks for them over
   HTTP instead of having its own copy.

   The list lives in memory, so restarting the server resets it to the six
   seed books. Stage 4 fixes that with a real database.
   ========================================================================== */

'use strict';

const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

/* --- 1. Middleware -------------------------------------------------------
   app.use() registers something that runs on EVERY request, before the
   routes below get a look.

   express.json() reads the body of an incoming request and, if it is JSON,
   turns it into a normal JavaScript object on req.body. Without this line,
   req.body would be undefined and the POST route could not see the book
   you are trying to add. */
app.use(express.json());

/* Serve everything in public/ - unchanged from stage 3a. */
app.use(express.static(path.join(__dirname, 'public')));

/* --- 2. The data ---------------------------------------------------------
   These are the exact objects that used to live at the top of app.js. They
   have simply moved to the other side of the wire. */
const STATUS_KEYS = ['want', 'reading', 'finished'];

let books = [
  {
    id: 1,
    title: 'The Left Hand of Darkness',
    author: 'Ursula K. Le Guin',
    status: 'want',
    rating: null,
    notes: 'Recommended by three different people now. Time to give in.',
    cover: 'covers/left-hand-of-darkness.svg',
  },
  {
    id: 2,
    title: 'Thinking in Systems',
    author: 'Donella H. Meadows',
    status: 'want',
    rating: null,
    notes: 'Short, apparently. Good for a slow week.',
    cover: 'covers/thinking-in-systems.svg',
  },
  {
    id: 3,
    title: 'Eloquent JavaScript',
    author: 'Marijn Haverbeke',
    status: 'reading',
    rating: null,
    notes: 'On chapter 5. The higher-order functions chapter is the one everybody warns you about.',
    cover: 'covers/eloquent-javascript.svg',
  },
  {
    id: 4,
    title: 'The Pragmatic Programmer',
    author: 'Andrew Hunt and David Thomas',
    status: 'reading',
    rating: null,
    notes: 'Reading a chapter at a time, out of order.',
    cover: 'covers/pragmatic-programmer.svg',
  },
  {
    id: 5,
    title: 'The Hobbit',
    author: 'J.R.R. Tolkien',
    status: 'finished',
    rating: 5,
    notes: 'Reread of a childhood favourite. Still holds up completely.',
    cover: 'covers/the-hobbit.svg',
  },
  {
    id: 6,
    title: 'Project Hail Mary',
    author: 'Andy Weir',
    status: 'finished',
    rating: 4,
    notes: 'Finished it in two sittings. The middle third drags a little.',
    cover: 'covers/project-hail-mary.svg',
  },
];

let nextId = 7;

/* --- 3. Route: list every book -------------------------------------------
   GET /api/books

   `req` describes what was asked for. `res` is how we answer.
   res.json() converts the array to JSON text and sends it back. */
app.get('/api/books', (req, res) => {
  res.json(books);
});

/* --- 4. Route: add a book ------------------------------------------------
   POST /api/books

   The new book arrives in req.body (thanks to express.json above).

   Never trust what arrives. The browser is not the only thing that can send
   a request here - anyone can. So we check it ourselves rather than assuming
   the form did it for us. */
app.post('/api/books', (req, res) => {
  const title = String(req.body.title || '').trim();
  const author = String(req.body.author || '').trim();
  const status = req.body.status;

  if (!title || !author) {
    // 400 = "you sent me something wrong"
    return res.status(400).json({ error: 'Title and author are both required.' });
  }

  if (!STATUS_KEYS.includes(status)) {
    return res.status(400).json({ error: 'Unknown status: ' + status });
  }

  const book = {
    id: nextId,
    title: title,
    author: author,
    status: status,
    rating: null,
    notes: '',
    cover: '',
  };
  nextId = nextId + 1;

  books.push(book);

  // 201 = "created". Sending the book back lets the browser see its new id.
  res.status(201).json(book);
});

/* --- 5. Route: delete a book ---------------------------------------------
   DELETE /api/books/5

   The :id in the path is a placeholder. Whatever is in that position ends up
   in req.params.id - as text, so it needs converting to a number. */
app.delete('/api/books/:id', (req, res) => {
  const id = Number(req.params.id);
  const countBefore = books.length;

  books = books.filter(book => book.id !== id);

  if (books.length === countBefore) {
    // Nothing was removed, so there was no such book.
    return res.status(404).json({ error: 'No book with id ' + id });
  }

  // 204 = "done, and there is nothing to send back"
  res.status(204).end();
});

/* --- 6. Start listening -------------------------------------------------- */
app.listen(PORT, () => {
  console.log('Library running at http://localhost:' + PORT);
  console.log('Press Ctrl+C to stop.');
});
