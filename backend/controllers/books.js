// backend/controllers/books.js
const axios = require('axios');
const Book = require('../models/Books');

// Fetch books from Gutenberg API and store them in the database
const fetchBooks = async (req, res) => {
  try {
    // Fetch books from the Gutenberg API
    const response = await axios.get('https://gutendex.com/books');

    if (!response.data || !response.data.results) {
      return res.status(500).json({ message: 'No books found from Gutenberg API' });
    }

    const booksData = response.data.results;
    const booksToSave = [];

    for (const book of booksData) {
      // Check if book already exists in the database (using title and author)
      const existingBook = await Book.findOne({
        title: book.title,
        author: book.authors && book.authors.length > 0 ? book.authors[0].name : 'Unknown Author',
      });

      if (!existingBook) {
        const bookData = {
          title: book.title || 'Unknown Title',
          author: book.authors && book.authors.length > 0 ? book.authors[0].name : 'Unknown Author',
          genre: book.subjects && book.subjects.length > 0 ? book.subjects[0] : 'Unknown', 
          totalPages: Math.floor(Math.random() * (300 - 200 + 1)) + 200, 
          coverImage: book.formats && book.formats['image/jpeg']
            ? book.formats['image/jpeg']
            : null,
          summary: book.summaries && book.summaries.length > 0 ? book.summaries[0] : 'No summary available', // Extracting summary
        };
        booksToSave.push(bookData);
      }
    }

    // Save new books to the database
    if (booksToSave.length > 0) {
      await Book.insertMany(booksToSave);
    }

    // Fetch all books from the database
    const allBooks = await Book.find();
    res.status(200).json(allBooks);
  } catch (error) {
    console.error('Error in fetchBooks:', error.message);
    res.status(500).json({ message: 'Error fetching books', error: error.message });
  }
};

// Get all books
const getAllBooks = async (req, res) => {
  try {
    const books = await Book.find();
    res.status(200).json(books);
  } catch (error) {
    console.error('Error in getAllBooks:', error.message);
    res.status(500).json({ message: 'Error fetching books', error: error.message });
  }
};

module.exports = {
  fetchBooks,
  getAllBooks,
};
