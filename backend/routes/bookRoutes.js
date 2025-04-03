// backend/routes/books.js
const express = require('express');
const router = express.Router();
const { fetchBooks, getAllBooks } = require('../controllers/books');

// Fetch books from Open Library and store in database
router.get('/fetch', fetchBooks);

// Get all books
router.get('/', getAllBooks);

module.exports = router;