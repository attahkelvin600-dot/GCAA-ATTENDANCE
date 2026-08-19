import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Home.css';

function Home() {
  const token = localStorage.getItem('token');

  return (
    <div className="home-page">
      <header className="home-nav">
        <div className="home-brand">GCAA Attendance</div>
        <div className="home-nav-actions">
          {token ? (
            <Link to="/dashboard" className="home-btn home-btn-primary">Go to Dashboard</Link>
          ) : (
            <>
              <Link to="/login" className="home-btn home-btn-ghost">Login</Link>
              <Link to="/register" className="home-btn home-btn-primary">Get Started</Link>
            </>
          )}
        </div>
      </header>

      <main className="home-hero">
        <p className="home-kicker">Ghana Civil Aviation Authority</p>
        <h1>Attendance Tracking Built for Daily Reliability</h1>
        <p className="home-subtext">
          Manage check-ins, check-outs, and location-aware attendance records with a clean,
          secure workflow for personnel and administrators.
        </p>
        <div className="home-cta">
          <Link to={token ? '/dashboard' : '/register'} className="home-btn home-btn-primary">
            {token ? 'Open Dashboard' : 'Create Account'}
          </Link>
          <Link to="/login" className="home-btn home-btn-ghost">Sign In</Link>
        </div>
      </main>

      <section className="home-features">
        <article className="feature-card">
          <h3>Fast Check-In</h3>
          <p>One-tap attendance with automatic location detection and optional notes.</p>
        </article>
        <article className="feature-card">
          <h3>Accurate Records</h3>
          <p>Track location name, coordinates, and history in one place.</p>
        </article>
        <article className="feature-card">
          <h3>Daily Visibility</h3>
          <p>Quickly review attendance status and daily reports for decision making.</p>
        </article>
      </section>
    </div>
  );
}

export default Home;
