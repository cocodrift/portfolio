require('dotenv').config();

const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');

const app = express();

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Request body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())

// Routes
const appRouter = require('./routes/index');
app.use('/', appRouter);

// Export for Vercel
module.exports = app;

// Run locally only
if (require.main === module) {
  const port = process.env.PORT || 3000;

  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}
