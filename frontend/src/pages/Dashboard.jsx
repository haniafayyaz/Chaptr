import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import "../styles/dashboard.css";
import axios from 'axios';

const Dashboard = () => {
  const [books, setBooks] = useState({
    reading: [],
    wantToRead: []
  });
  const [stats, setStats] = useState({
    booksRead: 0,
    pagesRead: 0,
    readingStreak: 0,
    goalProgress: 0
  });
  const [showModal, setShowModal] = useState(false);
  const [currentBook, setCurrentBook] = useState(null);
  const [pagesInput, setPagesInput] = useState('');
  const [loading, setLoading] = useState(true);
  
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const userData = localStorage.getItem('user');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        
        try {
          const apiUrl = process.env.NODE_ENV === 'development'
            ? `http://localhost:5000/api/reading-list/get-reading-list/${parsedUser.username}`
            : `/api/reading-list/get-reading-list/${parsedUser.username}`;
          const readingListRes = await axios.get(apiUrl);
          
          console.log('Reading List Response:', readingListRes.data);

          const readingListData = Array.isArray(readingListRes.data)
            ? readingListRes.data
            : Array.isArray(readingListRes.data.books)
              ? readingListRes.data.books
              : [];

          console.log('Processed Reading List Data:', readingListData);

          const readingBooks = readingListData
            .filter(book => book.status === 'reading')
            .map(book => ({
              id: book.bookId,
              title: book.bookTitle,
              author: book.bookAuthor,
              coverImage: book.coverImage,
              progress: book.progress || 0,
              totalPages: book.totalPages || 0,
              pagesRead: book.pagesRead || 0
            }));

          const wantToReadBooks = readingListData
            .filter(book => book.status === 'wantToRead')
            .map(book => ({
              id: book.bookId,
              title: book.bookTitle,
              author: book.bookAuthor,
              coverImage: book.coverImage,
              progress: 0,
              totalPages: book.totalPages || 0,
              pagesRead: 0
            }));

          console.log('Reading Books:', readingBooks);
          console.log('Want to Read Books:', wantToReadBooks);

          setBooks({
            reading: readingBooks,
            wantToRead: wantToReadBooks
          });
          setLoading(false);
        } catch (error) {
          console.error("Error fetching data:", error);
          setLoading(false);
        }
      } else {
        navigate('/login');
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleUpdateClick = (book) => {
    setCurrentBook(book);
    setPagesInput('');
    setShowModal(true);
  };

  const handleProgressUpdate = async () => {
    if (!pagesInput || isNaN(pagesInput)) return;
    
    const pagesNum = parseInt(pagesInput);
    try {
      const updateUrl = process.env.NODE_ENV === 'development'
        ? 'http://localhost:5000/api/reading-list/update-progress'
        : '/api/reading-list/update-progress';
      const response = await axios.put(updateUrl, {
        username: user.username,
        bookId: currentBook.id,
        pagesRead: pagesNum
      });

      console.log('Progress Update Response:', response.data);

      setBooks(prev => ({
        ...prev,
        reading: prev.reading.map(book => 
          book.id === currentBook.id ? response.data.updatedBook : book
        )
      }));
      setShowModal(false);
    } catch (error) {
      console.error("Error updating progress:", error);
    }
  };

  const startReading = async (bookId) => {
    try {
      const bookToStart = books.wantToRead.find(b => b.id === bookId);
      if (!bookToStart) {
        console.error("Book not found in wantToRead:", bookId);
        return;
      }
      console.log('Starting book:', bookToStart);

      const updateUrl = process.env.NODE_ENV === 'development'
        ? 'http://localhost:5000/api/reading-list/update-progress'
        : '/api/reading-list/update-progress';
      const response = await axios.put(updateUrl, {
        username: user.username,
        bookId: bookToStart.id,
        pagesRead: 0
      });

      console.log('Start Reading Response:', response.data);

      const updatedBook = {
        id: response.data.updatedBook.bookId,
        title: response.data.updatedBook.bookTitle,
        author: response.data.updatedBook.bookAuthor,
        coverImage: response.data.updatedBook.coverImage,
        progress: response.data.updatedBook.progress || 0,
        totalPages: response.data.updatedBook.totalPages || 0,
        pagesRead: response.data.updatedBook.pagesRead || 0
      };

      setBooks(prev => {
        const newReading = [...prev.reading, updatedBook];
        const newWantToRead = prev.wantToRead.filter(b => b.id !== bookId);
        console.log('Updated Reading:', newReading);
        console.log('Updated Want to Read:', newWantToRead);
        return {
          reading: newReading,
          wantToRead: newWantToRead
        };
      });
    } catch (error) {
      console.error("Error starting to read book:", error.response ? error.response.data : error);
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  if (loading) {
    return <div>Loading your books...</div>;
  }

  return (
    <div className="dashboard-container">
      {showModal && currentBook && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Update Progress for {currentBook.title}</h3>
            <p>Current progress: {currentBook.progress}%</p>
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

      <div className="sidebar">
        <h1 className="logo">BookTrack</h1>
        <nav className="nav-menu">
          <Link to="/books" className="nav-item active">My Books</Link>
          <Link to="/clubs" className="nav-item">Book Clubs</Link>
          <Link to="/challenges" className="nav-item">Challenges</Link>
          <Link to="/books" className="nav-item">Discover</Link>
        </nav>
      </div>

      <div className="main-content">
        <header className="header">
          <h2>Welcome back, {user.name}!</h2>
          <div className="user-avatar">{user.name.split(' ').map(n => n[0]).join('')}</div>
        </header>

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
              <h3>{(stats.pagesRead || 0).toLocaleString()}</h3>
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

        <div className="books-container">
          <div className="books-section">
            <h3>Currently Reading</h3>
            {books.reading.length > 0 ? (
              books.reading.map(book => (
                <div key={book.id} className="book-card">
                  <div className="book-cover" style={{ backgroundImage: `url(${book.coverImage})` }}>
                    {!book.coverImage && book.title.split(' ').map(word => word[0]).join('')}
                  </div>
                  <div className="book-details">
                    <h4>{book.title}</h4>
                    <p>{book.author}</p>
                    {book.progress > 0 && (
                      <>
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
                      </>
                    )}
                    <button 
                      onClick={() => handleUpdateClick(book)} 
                      className="update-btn"
                    >
                      Update Progress
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p>You're not currently reading any books</p>
            )}
          </div>

          <div className="books-section">
            <h3>Want to Read</h3>
            {books.wantToRead.length > 0 ? (
              books.wantToRead.map(book => (
                <div key={book.id} className="book-card">
                  <div className="book-cover" style={{ backgroundImage: `url(${book.coverImage})` }}>
                    {!book.coverImage && book.title.split(' ').map(word => word[0]).join('')}
                  </div>
                  <div className="book-details">
                    <h4>{book.title || 'Untitled'}</h4>
                    <p>{book.author || 'Unknown Author'}</p>
                    <button 
                      onClick={() => startReading(book.id)} 
                      className="start-reading-btn"
                    >
                      Start Reading
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p>Your want to read list is empty</p>
            )}
          </div>
        </div>

        <div className="activity-section">
          <div className="section-header">
            <h3>Recent Activity</h3>
            <p className="subtitle">Your reading journey</p>
          </div>
          
          <div className="activity-list">
            <div className="activity-item">
              <div className="activity-icon">📖</div>
              <div className="activity-content">
                <h4>Updated progress</h4>
                <p>Read 25 pages of {books.reading[0]?.title || 'your book'}</p>
                <span className="activity-time">2 hours ago</span>
              </div>
            </div>

            <div className="activity-item">
              <div className="activity-icon">⭐</div>
              <div className="activity-content">
                <h4>Added to list</h4>
                <p>{books.wantToRead[0]?.title || 'New book'} added to want to read</p>
                <span className="activity-time">Yesterday</span>
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