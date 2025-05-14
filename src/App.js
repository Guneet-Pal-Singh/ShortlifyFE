import React, { useState, useEffect } from 'react';
import './App.css';
import Shortener from './Shortener';
import Dashboard from './components/Dashboard';
import Auth from './components/Auth';

function App() {
  const [showDashboard, setShowDashboard] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check for existing token in localStorage
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) {
      setIsAuthenticated(true);
      setUser(JSON.parse(savedUser));
    }

    const handleMouseMove = (e) => {
      // Calculate mouse position as percentage
      const mouseX = (e.clientX / window.innerWidth) * 100;
      const mouseY = (e.clientY / window.innerHeight) * 100;

      // Update CSS variables for mouse position
      document.documentElement.style.setProperty('--mouse-x', `${mouseX}%`);
      document.documentElement.style.setProperty('--mouse-y', `${mouseY}%`);

      // Calculate tilt effect
      const tiltX = (mouseY - 50) * 0.1;
      const tiltY = (mouseX - 50) * -0.1;

      // Update CSS variables for tilt
      document.documentElement.style.setProperty('--tilt-x', `${tiltX}deg`);
      document.documentElement.style.setProperty('--tilt-y', `${tiltY}deg`);

      // Update mouse follow element
      const mouseFollow = document.querySelector('.mouse-follow');
      if (mouseFollow) {
        mouseFollow.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
      }

      // Update particles position
      const particles = document.querySelectorAll('.particle');
      particles.forEach((particle, index) => {
        const speed = 0.05 + (index * 0.01);
        const x = (mouseX - 50) * speed;
        const y = (mouseY - 50) * speed;
        particle.style.transform = `translate(${x}px, ${y}px)`;
      });
    };

    // Add mouse follow element
    const mouseFollow = document.createElement('div');
    mouseFollow.className = 'mouse-follow';
    document.body.appendChild(mouseFollow);

    // Add interactive particles
    const particles = document.createElement('div');
    particles.className = 'particles';
    for (let i = 0; i < 8; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particles.appendChild(particle);
    }
    document.body.appendChild(particles);

    // Add event listener
    window.addEventListener('mousemove', handleMouseMove);

    // Cleanup
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.body.removeChild(mouseFollow);
      document.body.removeChild(particles);
    };
  }, []);

  const handleAuth = (token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setIsAuthenticated(true);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <div className="App">
      {isAuthenticated && (
        <div className="user-info-floating">
          <span>Welcome, {user?.name}</span>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      )}
      <header className="App-header">
        <h1>Shortlify</h1>
        <p>Shorten your URLs with style</p>
      </header>

      <main>
        <div className="container">
          {!isAuthenticated ? (
            <Auth onAuth={handleAuth} />
          ) : (
            <>
              <div className="toggle-container">
                <button 
                  className={`toggle-btn ${!showDashboard ? 'active' : ''}`}
                  onClick={() => setShowDashboard(false)}
                >
                  Create URL
                </button>
                <button 
                  className={`toggle-btn ${showDashboard ? 'active' : ''}`}
                  onClick={() => setShowDashboard(true)}
                >
                  View Analytics
                </button>
              </div>

              {showDashboard ? (
                <Dashboard />
              ) : (
                <Shortener />
              )}
            </>
          )}
        </div>
      </main>

      <footer>
        <p>© 2025 Shortlify. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
