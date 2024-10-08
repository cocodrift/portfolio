const express = require('express');
const router = express.Router();
const Project = require('../models/Project');

// Admin dashboard to add new projects
router.get('/admin', (req, res) => {
  res.render('admin');
});

// Route to handle form submission
router.post('/admin/add', async (req, res) => {
  const { title, description, link, imageUrl, techStack } = req.body;
  const newProject = new Project({
    title,
    description,
    link,
    imageUrl,
    techStack: techStack.split(',') // Convert to array
  });

  try {
    await newProject.save();
    res.redirect('/');
  } catch (error) {
    res.status(500).send('Error saving project');
  }
});

module.exports = router;
