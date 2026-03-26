import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { z } from 'zod';
import '../styles/auth.css';
import { Emoji } from '../components/Emoji';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'https://localhost:7001';

const loginSchema = z.object({
  email:    z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required').min(6, 'Password must be at least 6 characters'),
});
type LoginFields = z.infer<typeof loginSchema>;

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const from     = (location.state as { from?: Location })?.from?.pathname ?? '/dashboard';

  const [fields, setFields]           = useState<LoginFields>({ email: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState<Partial<LoginFields>>({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading]         = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFields(prev => ({ ...prev, [name]: value }));
    setFieldErrors(prev => ({ ...prev, [name]: undefined }));
    setServerError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');

    const result = loginSchema.safeParse(fields);
    if (!result.success) {
      const errors: Partial<LoginFields> = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof LoginFields;
        if (!errors[field]) errors[field] = issue.message;
      }
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    try {
      // Use plain axios — bypasses react-axios-provider-kit interceptors
      const res = await axios.post(`${BASE_URL}/api/auth/login`, {
        email:    result.data.email,
        password: result.data.password,
      });

      // Save token — same key that react-axios-provider-kit reads from
      localStorage.setItem('hr_access_token', res.data.token);

      // Navigate — window.location forces a full reload so providers re-read token
      window.location.href = from;

    } catch (err: unknown) {
      const axiosErr = err as { response?: { status?: number } };
      if (axiosErr.response?.status === 401) {
        setServerError('Invalid email or password. Please check your credentials.');
      } else {
        setServerError('Server error. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="auth-header">
          <div className="logo-icon"><Emoji symbol="🏢" size={28} /></div>
          <h1>Welcome Back</h1>
          <p>Sign in to your HR Manager account</p>
        </div>
        {serverError && <div className="error-message">{serverError}</div>}
        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input type="email" id="email" name="email" value={fields.email}
              onChange={handleChange} placeholder="Enter your email address" disabled={loading} />
            {fieldErrors.email && <span className="field-error">{fieldErrors.email}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input type="password" id="password" name="password" value={fields.password}
              onChange={handleChange} placeholder="Enter your password" disabled={loading} />
            {fieldErrors.password && <span className="field-error">{fieldErrors.password}</span>}
          </div>
          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
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
