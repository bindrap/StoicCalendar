import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { quoteService } from '../services/api';
import './Header.css';

function Header({ user, onLogout }) {
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

      <nav className="navbar">
        <div className="container navbar-content">
          <Link to="/calendar" className="logo">
            Stoic Calendar
          </Link>

          <div className="nav-menu">
            <Link to="/calendar" className="nav-link">Calendar</Link>
            <Link to="/settings" className="nav-link">Settings</Link>
            <span className="user-email">{user.email}</span>
            <button onClick={handleLogout} className="btn btn-secondary">
              Logout
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
}

export default Header;
