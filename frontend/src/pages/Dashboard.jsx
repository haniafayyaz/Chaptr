import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import "../styles/dashboard.css"; 

const Dashboard = () => {
  // State for books data
  const [books, setBooks] = useState({
    'theMidnightLibrary': {
      id: 'theMidnightLibrary',
      title: 'The Midnight Library',
      author: 'Matt Haig',
      progress: 45,
      totalPages: 300,
      pagesRead: 135,
      coverColor: '#FF9AA2',
      status: 'reading'
    },
    'projectHailMary': {
      id: 'projectHailMary',
      title: 'Project Hail Mary',
      author: 'Andy Weir',
      progress: 35,
      totalPages: 400,
      pagesRead: 140,
      coverColor: '#FFB7B2',
      status: 'reading'
    },
    'dune': {
      id: 'dune',
      title: 'Dune',
      author: 'Frank Herbert',
      progress: 0,
      totalPages: 412,
      pagesRead: 0,
      coverColor: '#B5EAD7',
      status: 'wantToRead'
    },
    'atomicHabits': {
      id: 'atomicHabits',
      title: 'Atomic Habits',
      author: 'James Clear',
      progress: 0,
      totalPages: 320,
      pagesRead: 0,
      coverColor: '#C7CEEA',
      status: 'wantToRead'
    }
  });

  const [stats, setStats] = useState({
    booksRead: 12,
    pagesRead: 3542,
    readingStreak: 7,
    goalProgress: 65
  });

  const [showModal, setShowModal] = useState(false);
  const [currentBook, setCurrentBook] = useState(null);
  const [pagesInput, setPagesInput] = useState('');

  const handleUpdateClick = (bookId) => {
    setCurrentBook(bookId);
    setPagesInput('');
    setShowModal(true);
  };

  const handleProgressUpdate = () => {
    if (!pagesInput || isNaN(pagesInput)) return;
    
    const pagesNum = parseInt(pagesInput);
    setBooks(prevBooks => {
      const updatedBooks = {...prevBooks};
      const book = updatedBooks[currentBook];
      
      // Calculate new progress
      const newPagesRead = Math.min(book.pagesRead + pagesNum, book.totalPages);
      const newProgress = Math.round((newPagesRead / book.totalPages) * 100);
      
      updatedBooks[currentBook] = {
        ...book,
        pagesRead: newPagesRead,
        progress: newProgress
      };
      
      // Update stats if book is completed
      if (newProgress === 100 && book.progress < 100) {
        setStats(prev => ({
          ...prev,
          booksRead: prev.booksRead + 1,
          pagesRead: prev.pagesRead + (book.totalPages - book.pagesRead)
        }));
      } else if (newProgress < 100) {
        setStats(prev => ({
          ...prev,
          pagesRead: prev.pagesRead + pagesNum
        }));
      }
      
      return updatedBooks;
    });
    
    setShowModal(false);
  };

  const startReading = (bookId) => {
    setBooks(prevBooks => ({
      ...prevBooks,
      [bookId]: {
        ...prevBooks[bookId],
        progress: 1,
        pagesRead: 1,
        status: 'reading'
      }
    }));
  };

  // Filter books by status
  const currentlyReadingBooks = Object.values(books).filter(book => book.status === 'reading');
  const wantToReadBooks = Object.values(books).filter(book => book.status === 'wantToRead');

  return (
    <div className="dashboard-container">
      {/* Modal for updating progress */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Update Progress for {currentBook && books[currentBook].title}</h3>
            <p>Current progress: {currentBook && books[currentBook].progress}%</p>
            <div className="input-group">
              <label>Pages read since last update:</label>
              <input
                type="number"
                value={pagesInput}
                onChange={(e) => setPagesInput(e.target.value)}
                placeholder="Enter number of pages"
                min="1"
              />
            </div>
            <div className="modal-buttons">
              <button onClick={() => setShowModal(false)} className="cancel-btn">Cancel</button>
              <button onClick={handleProgressUpdate} className="confirm-btn">Update</button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar Navigation */}
      <div className="sidebar">
        <h1 className="logo">BookTrack</h1>
        <nav className="nav-menu">
          <Link to="/books" className="nav-item active">My Books</Link>
          <Link to="/clubs" className="nav-item">Book Clubs</Link>
          <Link to="/challenges" className="nav-item">Challenges</Link>
          <Link to="/discover" className="nav-item">Discover</Link>
        </nav>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <header className="header">
          <h2>Welcome back, John Doe!</h2>
          <div className="user-avatar">JD</div>
        </header>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📚</div>
            <div className="stat-info">
              <h3>{stats.booksRead}</h3>
              <p>Books Read</p>
              <span className="stat-trend">+2 from last month</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">📖</div>
            <div className="stat-info">
              <h3>{stats.pagesRead.toLocaleString()}</h3>
              <p>Pages Read</p>
              <span className="stat-trend">+342 from last month</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🔥</div>
            <div className="stat-info">
              <h3>{stats.readingStreak}</h3>
              <p>Reading Streak</p>
              <span className="stat-trend">Keep it up!</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🎯</div>
            <div className="stat-info">
              <h3>{stats.goalProgress}%</h3>
              <p>Goal Progress</p>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${stats.goalProgress}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Books Sections */}
        <div className="books-container">
          {/* Currently Reading */}
          <div className="books-section">
            <h3>Currently Reading</h3>
            
            {currentlyReadingBooks.map(book => (
              <div key={book.id} className="book-card">
                <div className="book-cover" style={{ background: book.coverColor }}>
                  {book.title.split(' ').map(word => word[0]).join('')}
                </div>
                <div className="book-details">
                  <h4>{book.title}</h4>
                  <p>{book.author}</p>
                  <div className="book-progress">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${book.progress}%` }}
                      ></div>
                    </div>
                    <span>{book.progress}%</span>
                  </div>
                  <p className="pages-info">
                    {book.pagesRead} of {book.totalPages} pages read
                  </p>
                  <button 
                    onClick={() => handleUpdateClick(book.id)} 
                    className="update-btn"
                  >
                    Update Progress
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Want to Read */}
          <div className="books-section">
            <h3>Want to Read</h3>
            
            {wantToReadBooks.map(book => (
              <div key={book.id} className="book-card">
                <div className="book-cover" style={{ background: book.coverColor }}>
                  {book.title.split(' ').map(word => word[0]).join('')}
                </div>
                <div className="book-details">
                  <h4>{book.title}</h4>
                  <p>{book.author}</p>
                  <button 
                    onClick={() => startReading(book.id)} 
                    className="start-reading-btn"
                  >
                    Start Reading
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="activity-section">
          <div className="section-header">
            <h3>Recent Activity</h3>
            <p className="subtitle">Your reading journey</p>
          </div>
          
          <div className="activity-list">
            <div className="activity-item">
              <div className="activity-icon">📖</div>
              <div className="activity-content">
                <h4>The Midnight Library</h4>
                <p>Read 25 pages</p>
                <span className="activity-time">2 hours ago</span>
              </div>
            </div>

            <div className="activity-item">
              <div className="activity-icon">⭐</div>
              <div className="activity-content">
                <h4>Dune</h4>
                <p>Gave 5 stars</p>
                <span className="activity-time">Yesterday</span>
              </div>
            </div>

            <div className="activity-item">
              <div className="activity-icon">👥</div>
              <div className="activity-content">
                <h4>Joined Sci-FI Lovers book club</h4>
                <span className="activity-time">3 days ago</span>
              </div>
            </div>
          </div>

          <button className="view-all-btn">View All Activity →</button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;