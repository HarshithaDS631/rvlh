import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { BookOpen, Shield, GraduationCap, Users, ArrowRight, Eye, EyeOff, Sparkles } from 'lucide-react';
import './Auth.css';

export default function Login() {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [selectedRole, setSelectedRole] = useState('student');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const roles = [
    { id: 'student', label: 'Student', icon: Users, color: 'var(--accent-500)' },
    { id: 'teacher', label: 'Teacher', icon: GraduationCap, color: 'var(--primary-500)' },
    { id: 'admin', label: 'Admin', icon: Shield, color: 'var(--error)' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Basic local validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address.');
      return;
    }
    
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    try {
      const user = await login(formData.email, formData.password, selectedRole);
      
      switch (user.role) {
        case 'admin': navigate('/admin'); break;
        case 'teacher': navigate('/teacher'); break;
        case 'student': navigate('/student'); break;
        default: navigate('/');
      }
    } catch {
      setError(`Invalid ${selectedRole} credentials. Please try again.`);
    }
  };

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="auth-page">
      <div className="auth-bg" />
      <div className="auth-container animate-fadeInUp">
        <div className="auth-card">
          <div className="auth-header">
            <h1 className="auth-title">Welcome Back</h1>
            <p className="auth-subtitle">Sign in to your learning account</p>
          </div>

          <div className="auth-role-tabs">
            {roles.map((r) => (
              <button
                key={r.id}
                type="button"
                className={`auth-role-tab ${selectedRole === r.id ? 'active' : ''}`}
                onClick={() => setSelectedRole(r.id)}
              >
                <span>{r.label}</span>
              </button>
            ))}
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            {error && <div className="auth-error">{error}</div>}

            <div className="form-group">
              <label htmlFor="login-email" className="form-label">Email Address</label>
              <input
                type="email"
                id="login-email"
                className="form-input"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => updateField('email', e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="login-password" className="form-label">Password</label>
              <div className="auth-password-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="login-password"
                  className="form-input"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => updateField('password', e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg auth-submit terminal-hub-entry"
              disabled={isLoading}
              id="login-submit"
            >
              {isLoading ? (
                <span className="auth-spinner" />
              ) : (
                <>Sign In <ArrowRight size={18} /></>
              )}
            </button>

            <div className="auth-footer">
              <p className="auth-switch">
                New here? <Link to="/register">Create an Account</Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
