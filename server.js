/* ==========================================================================
   My Library - the server

   Run it with:  npm start
   Then open:    http://localhost:3000
   Stop it with: Ctrl+C in the terminal

   Stage 3a: this server does exactly one job - hand over the files in
   public/ when a browser asks for them. It knows nothing about books yet.
   ========================================================================== */

'use strict';

/* --- 1. Borrow other people's code --------------------------------------
   require() is Node's way of pulling in code from elsewhere. It is the
   server-side equivalent of <script src="..."> in your HTML.

   'express' comes from node_modules/ (npm downloaded it).
   'path' is built into Node - nothing to install. */
const express = require('express');
const path = require('path');

/* --- 2. Create the application ------------------------------------------
   `app` is the server we are about to describe. Right now it does nothing
   at all; the lines below teach it how to behave. */
const app = express();

const PORT = 3000;

/* --- 3. Serve the public folder -----------------------------------------
   This single line is the whole of stage 3a.

   express.static() means: when a request comes in, look for a matching file
   inside this folder and send it back. A request for /styles.css finds
   public/styles.css. A request for / finds public/index.html automatically.

   __dirname is a Node built-in meaning "the folder this file lives in", so
   the path works no matter where the server is started from.

   Anything NOT inside public/ - including this file - is unreachable from a
   browser. That is deliberate. */
app.use(express.static(path.join(__dirname, 'public')));

/* --- 4. Start listening --------------------------------------------------
   listen() is the moment the program stops being a script and becomes a
   server: it stays open, waiting for requests, until you stop it.

   The function is a callback - the same idea as addEventListener. Node runs
   it once the server is actually up. */
app.listen(PORT, () => {
  console.log('Library running at http://localhost:' + PORT);
  console.log('Press Ctrl+C to stop.');
});
