import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { quoteService } from '../services/api';
import './Header.css';

function Header({ user, onLogout, currentView, setCurrentView }) {
  const [quote, setQuote] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    quoteService.getDailyQuote()
      .then(response => {
        setQuote(response.data.quote);
      })
      .catch(error => {
        console.error('Failed to fetch quote:', error);
      });
  }, []);

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  const handleViewChange = (view) => {
    setCurrentView(view);
    if (view === 'calendar') {
      navigate('/calendar');
    } else if (view === 'settings') {
      navigate('/settings');
    }
  };

  return (
    <header className="header">
      {quote && (
        <div className="quote-banner">
          <blockquote className="quote-text">
            "{quote.text}"
          </blockquote>
          <p className="quote-author">— {quote.author}</p>
        </div>
      )}

      <div className="title-section">
        <div className="container">
          <h1 className="app-title">Stoic Calendar</h1>
        </div>
      </div>

      <nav className="navbar">
        <div className="container navbar-content">
          <div className="nav-buttons">
            <button
              onClick={() => handleViewChange('calendar')}
              className={`nav-btn ${currentView === 'calendar' ? 'active' : ''}`}
            >
              Calendar
            </button>
            <button
              onClick={() => handleViewChange('settings')}
              className={`nav-btn ${currentView === 'settings' ? 'active' : ''}`}
            >
              Settings
            </button>
            <span className="user-email-mobile">{user.email}</span>
            <button onClick={handleLogout} className="nav-btn logout-btn">
              Logout
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
}

export default Header;
