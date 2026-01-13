import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

import Header from './components/Header';
import Login from './components/Login';
import Signup from './components/Signup';
import Calendar from './components/Calendar';
import Settings from './components/Settings';
import { authService } from './services/api';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      authService.getCurrentUser()
        .then(response => {
          setUser(response.data.user);
          setLoading(false);
        })
        .catch(error => {
          console.error('Failed to get user:', error);
          localStorage.removeItem('token');
          setToken(null);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [token]);

  const handleLogin = (newToken, userData) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <Router>
      <div className="App">
        {user && <Header user={user} onLogout={handleLogout} />}

        <Routes>
          <Route
            path="/login"
            element={!user ? <Login onLogin={handleLogin} /> : <Navigate to="/calendar" />}
          />
          <Route
            path="/signup"
            element={!user ? <Signup onLogin={handleLogin} /> : <Navigate to="/calendar" />}
          />
          <Route
            path="/calendar"
            element={user ? <Calendar user={user} /> : <Navigate to="/login" />}
          />
          <Route
            path="/settings"
            element={user ? <Settings user={user} setUser={setUser} /> : <Navigate to="/login" />}
          />
          <Route
            path="/"
            element={<Navigate to={user ? "/calendar" : "/login"} />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
