const express = require('express');
const router = express.Router();
const Project = require('../models/Project');

// Home route
router.get('/', async (req, res) => {
  try {
    const projects = await Project.find({});
    res.render('index', { projects });
  } catch (error) {
    res.status(500).send('Server Error');
  }
});

// Portfolio page
router.get('/portfolio', async (req, res) => {
  try {
    const projects = await Project.find({});
    res.render('profile', { projects });
  } catch (error) {
    res.status(500).send('Server Error');
  }
});

module.exports = router;
