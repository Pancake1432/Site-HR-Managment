import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/auth.css';

// Hardcoded admin credentials
const ADMIN_EMAIL = 'admin@admin.com';
const ADMIN_PASSWORD = 'admin123';

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Check against hardcoded credentials
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      // Store user session
      localStorage.setItem('currentUser', JSON.stringify({ 
        email: ADMIN_EMAIL,
        name: 'Administrator',
        role: 'admin' 
      }));
      navigate('/dashboard');
    } else {
      setError('Invalid email or password. Please check your credentials.');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="auth-header">
          <div className="logo-icon">🏢</div>
          <h1>Welcome Back</h1>
          <p>Sign in to your HR Manager account</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@admin.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          <button type="submit" className="auth-button">
            Sign In
          </button>
        </form>

        <button onClick={() => navigate('/')} className="back-button">
          ← Back to Home
        </button>
      </div>
    </div>
  );
}

export default LoginPage;
