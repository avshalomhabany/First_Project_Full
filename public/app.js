/* ==========================================================================
   My Library - browser code

   Stage 3b: the books now live on the server. This file asks for them,
   draws them, and sends changes back.

   The rule from stage 2 still holds:
       change `books`, then call render().
   The only difference is that the server decides what `books` contains.
   ========================================================================== */

'use strict';

/* --- 1. The three statuses ----------------------------------------------- */
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
   Empty to start with. The six books are no longer written here - they are
   on the server, and loadBooks() below goes and gets them. */
let books = [];

/* --- 3. Showing an error -------------------------------------------------
   The server can be stopped, or busy, or broken. When that happens the user
   should see something rather than a page that silently does nothing. */
const errorEl = document.querySelector('#error');

function showError(message) {
  errorEl.textContent = message;
  errorEl.hidden = false;
}

function clearError() {
  errorEl.hidden = true;
}

/* --- 4. Talking to the server --------------------------------------------
   fetch() sends an HTTP request. It does not answer immediately - the
   request has to travel and the server has to reply - so it hands back a
   promise: "an answer, later".

   `await` means "wait here until that answer arrives, then carry on".
   A function containing `await` must be marked `async`. That is the whole
   deal: async marks the function, await marks the waiting.

   Everything is wrapped in try/catch: if the server is unreachable, fetch
   throws, and we show a message instead of failing silently. */
async function loadBooks() {
  try {
    const response = await fetch('/api/books');      // ask
    if (!response.ok) {
      throw new Error('Server answered ' + response.status);
    }
    books = await response.json();                   // read the answer as data
    clearError();
    render();
  } catch (problem) {
    showError('Could not reach the server. Is it still running? (npm start)');
    console.error(problem);
  }
}

async function createBook(newBook) {
  const response = await fetch('/api/books', {
    method: 'POST',                                   // not a plain GET
    headers: { 'Content-Type': 'application/json' },  // "what I am sending is JSON"
    body: JSON.stringify(newBook),                    // object -> JSON text
  });

  if (!response.ok) {
    const problem = await response.json();
    throw new Error(problem.error || 'Could not add the book.');
  }
}

async function deleteBook(id) {
  const response = await fetch('/api/books/' + id, { method: 'DELETE' });

  if (!response.ok) {
    throw new Error('Could not delete that book.');
  }
}

/* --- 5. Building one book card -------------------------------------------
   Unchanged from stage 2. It works on a book object and does not care in the
   slightest where that object came from. */
function createBookCard(book) {
  const li = document.createElement('li');

  const article = document.createElement('article');
  article.className = 'book';

  const cover = document.createElement('img');
  cover.className = 'book__cover';
  cover.src = book.cover || 'covers/placeholder.svg';
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
  badge.className = 'badge badge--' + book.status;
  badge.textContent = labelFor(book.status);
  meta.append(badge);

  if (book.rating) {
    const rating = document.createElement('span');
    rating.className = 'rating';
    rating.textContent = '★'.repeat(book.rating) + '☆'.repeat(5 - book.rating);
    rating.setAttribute('aria-label', 'Rated ' + book.rating + ' out of 5');
    meta.append(rating);
  }

  const remove = document.createElement('button');
  remove.className = 'book__remove';
  remove.type = 'button';
  remove.textContent = 'Remove';
  remove.dataset.id = book.id;
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

/* --- 6. Drawing the whole page -------------------------------------------
   Also unchanged from stage 2. */
function render() {
  STATUSES.forEach(status => {
    const list = document.querySelector('.book-list[data-status="' + status.key + '"]');
    const countEl = list.closest('.shelf').querySelector('.count');

    const shelfBooks = books.filter(book => book.status === status.key);

    countEl.textContent = shelfBooks.length;
    list.replaceChildren();

    if (shelfBooks.length === 0) {
      const empty = document.createElement('li');
      empty.className = 'empty';
      empty.textContent = 'Nothing here yet.';
      list.append(empty);
      return;
    }

    shelfBooks.forEach(book => list.append(createBookCard(book)));
  });
}

/* --- 7. Adding a book ----------------------------------------------------
   Same form handler as stage 2, with one change: instead of pushing onto a
   local array, it sends the book to the server and then reloads the list.

   Reloading rather than guessing means the page always shows what the server
   actually has - including the id it assigned. */
const form = document.querySelector('#add-book-form');

form.addEventListener('submit', async event => {
  event.preventDefault();

  const data = new FormData(form);
  const title = data.get('title').trim();
  const author = data.get('author').trim();

  if (!title || !author) return;

  try {
    await createBook({ title: title, author: author, status: data.get('status') });
    form.reset();
    await loadBooks();                          // fetch the updated list, then render
    document.querySelector('#title').focus();
  } catch (problem) {
    showError(problem.message);
    console.error(problem);
  }
});

/* --- 8. Removing a book --------------------------------------------------
   Same delegated listener as stage 2; the filtering now happens server-side. */
document.querySelector('main').addEventListener('click', async event => {
  const button = event.target.closest('.book__remove');
  if (!button) return;

  try {
    await deleteBook(Number(button.dataset.id));
    await loadBooks();
  } catch (problem) {
    showError(problem.message);
    console.error(problem);
  }
});

/* --- 9. Go ---------------------------------------------------------------
   Stage 2 called render() here, because the data was already present.
   Now there is nothing to draw until the server answers, so we load first -
   and loadBooks() calls render() when the books arrive. */
loadBooks();
