import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { z } from 'zod';
import '../styles/auth.css';

// ── Zod schema ──────────────────────────────────────────────────────────────
const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
});

type LoginFields = z.infer<typeof loginSchema>;

// ── Company accounts (swap for a real DB auth call when ready) ──────────────
// To add a new company: add an entry here and a matching key in driversData.ts
const ACCOUNTS: Record<string, { password: string; name: string; companyId: string; companyName: string }> = {
  'dispatch@pakslogistic.com':  { password: 'paks123',  name: 'Paks Admin',  companyId: 'company-paks',  companyName: 'Paks Logistic LLC'       },
  'dispatch@swifttransport.com': { password: 'swift123', name: 'Swift Admin', companyId: 'company-swift', companyName: 'Swift Transport Inc'     },
  'dispatch@eaglefreight.com': { password: 'eagle123', name: 'Eagle Admin', companyId: 'company-eagle', companyName: 'Eagle Freight Solutions' },
};

// ── Component ────────────────────────────────────────────────────────────────
function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  // After login, redirect back to wherever the user tried to go
  const from = (location.state as { from?: Location })?.from?.pathname ?? '/dashboard';

  const [fields, setFields] = useState<LoginFields>({ email: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState<Partial<LoginFields>>({});
  const [serverError, setServerError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFields((prev) => ({ ...prev, [name]: value }));
    // Clear field-level error as the user types
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    setServerError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');

    // ── Zod parse ──────────────────────────────────────────────────────────
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

    // ── Credential check ───────────────────────────────────────────────────
    const { email, password } = result.data;
    const account = ACCOUNTS[email.toLowerCase()];

    if (account && account.password === password) {
      localStorage.setItem(
        'currentUser',
        JSON.stringify({
          email,
          name:        account.name,
          role:        'admin',
          companyId:   account.companyId,
          companyName: account.companyName,
        })
      );
      navigate(from, { replace: true });
    } else {
      setServerError('Invalid email or password. Please check your credentials.');
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

        {serverError && <div className="error-message">{serverError}</div>}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          {/* Email */}
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={fields.email}
              onChange={handleChange}
              placeholder="Enter your email address"
            />
            {fieldErrors.email && (
              <span className="field-error">{fieldErrors.email}</span>
            )}
          </div>

          {/* Password */}
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={fields.password}
              onChange={handleChange}
              placeholder="Enter your password"
            />
            {fieldErrors.password && (
              <span className="field-error">{fieldErrors.password}</span>
            )}
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
