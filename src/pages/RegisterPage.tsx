import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/auth.css';

function RegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    role: 'hr_manager'
  });
  const [error, setError] = useState('');

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    // Check if email already exists
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    if (users.find((u: any) => u.email === formData.email)) {
      setError('Email already registered');
      return;
    }

    // Save user to localStorage (simulated database)
    const newUser = {
      id: Date.now(),
      fullName: formData.fullName,
      email: formData.email,
      password: formData.password,
      companyName: formData.companyName,
      role: formData.role,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('currentUser', JSON.stringify(newUser));

    // Redirect to dashboard
    navigate('/dashboard');
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="auth-header">
          <div className="logo-icon">🏢</div>
          <h1>Create Account</h1>
          <p>Join our HR Management System</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="fullName">Full Name</label>
            <input
              type="text"
              id="fullName"
              value={formData.fullName}
              onChange={(e) => handleChange('fullName', e.target.value)}
              placeholder="John Smith"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="manager@example.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="companyName">Company Name</label>
            <input
              type="text"
              id="companyName"
              value={formData.companyName}
              onChange={(e) => handleChange('companyName', e.target.value)}
              placeholder="Your Company LLC"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="role">Account Type</label>
            <select
              id="role"
              value={formData.role}
              onChange={(e) => handleChange('role', e.target.value)}
              required
            >
              <option value="hr_manager">HR Manager</option>
              <option value="admin">Administrator</option>
              <option value="recruiter">Recruiter</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              placeholder="At least 6 characters"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              value={formData.confirmPassword}
              onChange={(e) => handleChange('confirmPassword', e.target.value)}
              placeholder="Re-enter password"
              required
            />
          </div>

          <button type="submit" className="auth-button">
            Create Account
          </button>
        </form>

        <div className="auth-divider">
          <span>or</span>
        </div>

        <div className="auth-links">
          <p>Already have an account?</p>
          <button onClick={() => navigate('/login')} className="link-button">
            Sign In
          </button>
        </div>

        <button onClick={() => navigate('/')} className="back-button">
          ← Back to Home
        </button>
      </div>
    </div>
  );
}

export default RegisterPage;
