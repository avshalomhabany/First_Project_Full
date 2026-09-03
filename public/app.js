/* ==========================================================================
   My Library - application code

   The whole app follows one rule:
       change the `books` array, then call render().
   Nothing else ever touches the page directly.
   ========================================================================== */

'use strict';   // makes the browser complain about sloppy mistakes instead of
                // silently doing something surprising

/* --- 1. The three statuses ----------------------------------------------
   `key` is what we store on a book and put in the HTML.
   `label` is what a human reads. Keeping them separate means we can change
   the wording later without touching any book data. */
const STATUSES = [
  { key: 'want',     label: 'Want to Read' },
  { key: 'reading',  label: 'Reading' },
  { key: 'finished', label: 'Finished' },
];

function labelFor(statusKey) {
  const match = STATUSES.find(status => status.key === statusKey);
  return match ? match.label : statusKey;
}

/* --- 2. The data ---------------------------------------------------------
   These are the same six books that used to be typed out in index.html,
   now expressed as plain objects. `let` (not `const`) because deleting a
   book replaces the whole array with a filtered copy.

   Every book needs a unique `id`. That is how the Remove button knows which
   one to drop - titles could collide, positions shift when things are
   removed, but an id is stable. */
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

// The id to hand to the next book added. Six seed books, so the next is 7.
let nextId = 7;

/* --- 3. Building one book card ------------------------------------------
   Produces exactly the markup stage 1 had, but built element by element.

   Note textContent, never innerHTML. textContent treats whatever you give it
   as plain text, so a book title containing angle brackets shows up as those
   characters on screen instead of being run as markup. Building HTML by
   pasting strings together is how that bug gets in. */
function createBookCard(book) {
  const li = document.createElement('li');

  const article = document.createElement('article');
  article.className = 'book';

  const cover = document.createElement('img');
  cover.className = 'book__cover';
  cover.src = book.cover || 'covers/placeholder.svg';  // || = "or this if empty"
  cover.alt = 'Cover of ' + book.title;
  cover.width = 300;
  cover.height = 450;

  const info = document.createElement('div');
  info.className = 'book__info';

  const title = document.createElement('h3');
  title.className = 'book__title';
  title.textContent = book.title;

  const author = document.createElement('p');
  author.className = 'book__author';
  author.textContent = book.author;

  const meta = document.createElement('p');
  meta.className = 'book__meta';

  const badge = document.createElement('span');
  badge.className = 'badge badge--' + book.status;   // e.g. "badge badge--reading"
  badge.textContent = labelFor(book.status);
  meta.append(badge);

  // Only finished books have a rating, so only draw stars when there is one.
  if (book.rating) {
    const rating = document.createElement('span');
    rating.className = 'rating';
    rating.textContent = '★'.repeat(book.rating) + '☆'.repeat(5 - book.rating);
    rating.setAttribute('aria-label', 'Rated ' + book.rating + ' out of 5');
    meta.append(rating);
  }

  const remove = document.createElement('button');
  remove.className = 'book__remove';
  remove.type = 'button';          // without this, a button inside a form submits it
  remove.textContent = 'Remove';
  remove.dataset.id = book.id;     // becomes data-id="5" in the HTML
  remove.setAttribute('aria-label', 'Remove ' + book.title);
  meta.append(remove);

  info.append(title, author, meta);

  if (book.notes) {
    const notes = document.createElement('p');
    notes.className = 'book__notes';
    notes.textContent = book.notes;
    info.append(notes);
  }

  article.append(cover, info);
  li.append(article);
  return li;
}

/* --- 4. Drawing the whole page ------------------------------------------
   Wipes all three shelves and rebuilds them from `books`. Redrawing
   everything is wasteful in theory and completely fine in practice at this
   size - and it means there is only ONE place that turns data into pixels. */
function render() {
  STATUSES.forEach(status => {
    const list = document.querySelector('.book-list[data-status="' + status.key + '"]');
    const countEl = list.closest('.shelf').querySelector('.count');

    // filter() returns a NEW array of just the books that match.
    const shelfBooks = books.filter(book => book.status === status.key);

    countEl.textContent = shelfBooks.length;
    list.replaceChildren();          // empty the list

    if (shelfBooks.length === 0) {
      const empty = document.createElement('li');
      empty.className = 'empty';
      empty.textContent = 'Nothing here yet.';
      list.append(empty);
      return;                        // skips to the next status
    }

    shelfBooks.forEach(book => list.append(createBookCard(book)));
  });
}

/* --- 5. Adding a book ---------------------------------------------------- */
const form = document.querySelector('#add-book-form');

form.addEventListener('submit', event => {
  // Without this line the browser reloads the page on submit - a leftover from
  // how forms worked before JavaScript. It would wipe everything instantly.
  event.preventDefault();

  const data = new FormData(form);
  const title = data.get('title').trim();     // trim() drops stray spaces
  const author = data.get('author').trim();

  if (!title || !author) return;              // belt and braces; HTML already checks

  books.push({
    id: nextId,
    title: title,
    author: author,
    status: data.get('status'),
    rating: null,
    notes: '',
    cover: '',                                // falls back to placeholder.svg
  });
  nextId = nextId + 1;

  form.reset();                               // clear the boxes
  render();                                   // redraw with the new book
  document.querySelector('#title').focus();   // ready for the next one
});

/* --- 6. Removing a book --------------------------------------------------
   One listener on <main> handles every Remove button, including buttons that
   do not exist yet. This is called event delegation: a click on a button
   bubbles up to <main>, and we ask which button it came from.

   The naive alternative - attaching a listener to each button - breaks the
   moment render() replaces those buttons with new ones. */
document.querySelector('main').addEventListener('click', event => {
  const button = event.target.closest('.book__remove');
  if (!button) return;                        // clicked something else; ignore

  const id = Number(button.dataset.id);       // data attributes are text, so convert
  books = books.filter(book => book.id !== id);
  render();
});

/* --- 7. Go ---------------------------------------------------------------
   The page ships with empty shelves; this first call fills them. */
render();
