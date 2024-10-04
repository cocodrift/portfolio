const express = require('express');
const router = express.Router();
const Article = require('../models/post'); // Import Article model

// Route to load and display articles
router.get('/', async (req, res) => {
  try {
    const articles = await Article.find().sort({ publishedAt: -1 }); // Load all articles
    res.render('index', { articles }); // Pass articles to the view
  } catch (error) {
    res.status(500).send('Error loading articles');
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

// Shop route
router.get('/shop', (req, res, next) => {
  try {
    const posts = []; // Fetch posts from somewhere (e.g., database)
    res.render('shop', { posts });
  } catch (error) {
    next(error);
  }
});

// Technology route
router.get('/technology', (req, res, next) => {
  try {
    res.render('technology');
  } catch (error) {
    next(error);
  }
});

// Cuisine route
router.get('/cuisine', (req, res, next) => {
  try {
    res.render('cuisine');
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
