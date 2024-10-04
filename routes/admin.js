const express = require('express');
const router = express.Router();
const Article = require('../models/Article'); // Import Article model

// Route to render admin page
router.get('/admin', (req, res) => {
  res.render('admin'); // Render the admin.ejs form
});

// Route to handle article submission
router.post('/admin', async (req, res) => {
  const { title, content, author, publishedAt } = req.body;

  try {
    const newArticle = new Article({
      title,
      content,
      author,
      publishedAt: publishedAt || Date.now(),
    });
    await newArticle.save(); // Save new article to the database
    res.redirect('/admin'); // Redirect back to admin page after saving
  } catch (error) {
    console.error('Error saving article:', error);
    res.status(500).send('Error saving article');
  }
});

module.exports = router;
