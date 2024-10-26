const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const isAuthenticated = require('../middleware/isAuthenticated');

// Display add Post form
router.get('/addPost', isAuthenticated, adminController.getAddPost);

// Handle adding a new Post
router.post('/addPost', isAuthenticated, adminController.postAddPost);

// Display orders
router.get('/orders', isAuthenticated, adminController.getOrders);

// Display today's order summary
router.get('/order-summary', isAuthenticated, adminController.getOrderSummary);

// Display edit Post form
router.get('/editPost/:id', isAuthenticated, adminController.getEditPost);

// Handle editing a Post
router.post('/editPost/:id', isAuthenticated, adminController.postEditPost);

// Handle  deleting a Post
router.post('/deletePost/:id', isAuthenticated, adminController.deletePost);

// Assuming you have a router defined in your admin routes file
router.post('/orders/clear/:id', isAuthenticated, adminController.clearOrder);


module.exports = router;
