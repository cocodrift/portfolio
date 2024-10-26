const express = require('express');
const router = express.Router();
const Post = require('../models/post'); // Adjust the path if necessary

// Home route
router.get('/', (req, res, next) => {
  try {
    res.render('index');
  } catch (error) {
    next(error);
  }
});


// Profile route
router.get('/profile', (req, res, next) => {
  try {
    res.render('profile');
  } catch (error) {
    next(error);
  }
});

// Travel route
router.get('/travel', (req, res, next) => {
  try {
    res.render('travel');
  } catch (error) {
    next(error);
  }
});

// Fitness route
router.get('/fitness', (req, res, next) => {
  try {
    res.render('fitness');
  } catch (error) {
    next(error);
  }
});



// Error handling middleware
router.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

module.exports = router;
