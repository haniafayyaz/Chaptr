import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation
import '../styles/books.css';

const Books = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // Hook for navigation

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/books');
        if (!response.ok) {
          throw new Error('Failed to fetch books');
        }
        const data = await response.json();
        setBooks(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  const handleDetailsClick = (bookId) => {
    navigate(`/book/${bookId}`); // Navigate to the book details page
  };

  if (loading) {
    return <div className="loading">Loading books...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="books-page">
      <div className="books-container">
        <h1>Discover Books</h1>
        {books.length === 0 ? (
          <p>No books available.</p>
        ) : (
          <div className="books-grid">
            {books.map((book) => (
              <div key={book._id} className="book-card">
                <div className="book-cover-container">
                  {book.coverImage ? (
                    <img
                      src={book.coverImage}
                      alt={`${book.title} cover`}
                      className="book-cover"
                    />
                  ) : (
                    <div className="book-cover-placeholder">No Cover Available</div>
                  )}
                </div>
                <div className="book-details">
                  <h2 className="book-title">{book.title}</h2>
                  <p className="book-author">{book.author}</p>
                  <div className="book-rating">
                    {'★★★★★'} {book.rating || '5.0'}
                  </div>
                  <p className="book-genres">{book.genre}</p> {/* Changed from genres to genre to match schema */}
                 
                  <div className="divider"></div>
                  <button
                    className="book-details-button"
                    onClick={() => handleDetailsClick(book._id)}
                  >
                    Details
                </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Books;