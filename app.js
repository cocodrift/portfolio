require('dotenv').config();

const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');

const app = express();

const port = process.env.PORT || 3000;


// ----------------------------------------
// View engine
// ----------------------------------------

app.set('view engine', 'ejs');

app.set(
  'views',
  path.join(__dirname, 'views')
);


// ----------------------------------------
// Middleware
// ----------------------------------------

app.use(
  express.static(
    path.join(__dirname, 'public')
  )
);

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true
  })
);

app.use(cookieParser());


// ----------------------------------------
// Routes
// ----------------------------------------

const appRouter = require('./routes/index');

app.use('/', appRouter);


// ----------------------------------------
// Start server
// ----------------------------------------

if (require.main === module) {
  app.listen(port, () => {
    console.log(
      `M's Hub is running on port ${port}`
    );
  });
}


module.exports = app;
