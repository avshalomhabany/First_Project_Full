/* ==========================================================================
   My Library - the database layer

   Everything that touches SQLite lives in this file. server.js handles HTTP
   and calls the functions at the bottom; it never writes SQL itself.

   Keeping the two apart means you can change how books are stored without
   touching a single route - which is exactly what this stage does to the
   array that used to live in server.js.
   ========================================================================== */

'use strict';

/* node:sqlite is built into Node - there is nothing to npm install. */
const { DatabaseSync } = require('node:sqlite');
const path = require('path');

/* --- 1. Open the database -----------------------------------------------
   The whole database is this one file. If it does not exist yet, opening it
   creates it. Delete the file and you get a clean slate. */
const DB_FILE = process.env.DATABASE_FILE || path.join(__dirname, 'library.db');
const db = new DatabaseSync(DB_FILE);

/* --- 2. The schema -------------------------------------------------------
   CREATE TABLE IF NOT EXISTS runs safely every startup: it builds the table
   the first time and does nothing on every run after that.

   The rules in here are enforced by the database itself, no matter what code
   is talking to it:

     INTEGER PRIMARY KEY AUTOINCREMENT - ids are assigned automatically and
                                         never reused, so `nextId` is gone
     NOT NULL                          - this column cannot be left empty
     CHECK (status IN (...))           - refuses any status but these three
     DEFAULT ''                        - what to use when nothing is given */
db.exec(`
  CREATE TABLE IF NOT EXISTS books (
    id      INTEGER PRIMARY KEY AUTOINCREMENT,
    title   TEXT    NOT NULL,
    author  TEXT    NOT NULL,
    status  TEXT    NOT NULL CHECK (status IN ('want', 'reading', 'finished')),
    rating  INTEGER,
    notes   TEXT    NOT NULL DEFAULT '',
    cover   TEXT    NOT NULL DEFAULT ''
  )
`);

/* --- 3. Seed the first run ----------------------------------------------
   Only when the table is completely empty. On every later start the books
   are already on disk and this is skipped - which is the entire point of
   this stage. */
const SEED_BOOKS = [
  {
    title: 'The Left Hand of Darkness',
    author: 'Ursula K. Le Guin',
    status: 'want',
    rating: null,
    notes: 'Recommended by three different people now. Time to give in.',
    cover: 'covers/left-hand-of-darkness.svg',
  },
  {
    title: 'Thinking in Systems',
    author: 'Donella H. Meadows',
    status: 'want',
    rating: null,
    notes: 'Short, apparently. Good for a slow week.',
    cover: 'covers/thinking-in-systems.svg',
  },
  {
    title: 'Eloquent JavaScript',
    author: 'Marijn Haverbeke',
    status: 'reading',
    rating: null,
    notes: 'On chapter 5. The higher-order functions chapter is the one everybody warns you about.',
    cover: 'covers/eloquent-javascript.svg',
  },
  {
    title: 'The Pragmatic Programmer',
    author: 'Andrew Hunt and David Thomas',
    status: 'reading',
    rating: null,
    notes: 'Reading a chapter at a time, out of order.',
    cover: 'covers/pragmatic-programmer.svg',
  },
  {
    title: 'The Hobbit',
    author: 'J.R.R. Tolkien',
    status: 'finished',
    rating: 5,
    notes: 'Reread of a childhood favourite. Still holds up completely.',
    cover: 'covers/the-hobbit.svg',
  },
  {
    title: 'Project Hail Mary',
    author: 'Andy Weir',
    status: 'finished',
    rating: 4,
    notes: 'Finished it in two sittings. The middle third drags a little.',
    cover: 'covers/project-hail-mary.svg',
  },
];

function seedIfEmpty() {
  // .get() returns a single row. COUNT(*) counts the rows in the table.
  const row = db.prepare('SELECT COUNT(*) AS total FROM books').get();
  if (row.total > 0) return;

  const insert = db.prepare(`
    INSERT INTO books (title, author, status, rating, notes, cover)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  for (const book of SEED_BOOKS) {
    insert.run(book.title, book.author, book.status, book.rating, book.notes, book.cover);
  }

  console.log('Seeded the database with ' + SEED_BOOKS.length + ' books.');
}

seedIfEmpty();

/* --- 4. The three things server.js needs ---------------------------------
   Note the ? placeholders. Values are handed to .run()/.get() separately and
   never glued into the SQL text, so a book titled  '); DROP TABLE books; --
   is stored as that harmless string rather than executed. */

function listBooks() {
  // ORDER BY id keeps the shelves in a stable, predictable order.
  return db.prepare('SELECT * FROM books ORDER BY id').all();
}

function addBook(book) {
  const result = db.prepare(`
    INSERT INTO books (title, author, status, rating, notes, cover)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(book.title, book.author, book.status, null, '', '');

  // The database chose the id. Fetch the finished row back so the caller
  // sees exactly what was stored.
  return db.prepare('SELECT * FROM books WHERE id = ?').get(Number(result.lastInsertRowid));
}

function removeBook(id) {
  const result = db.prepare('DELETE FROM books WHERE id = ?').run(id);
  // `changes` is how many rows were affected: 1 if it existed, 0 if not.
  return result.changes > 0;
}

module.exports = { listBooks, addBook, removeBook, DB_FILE };
