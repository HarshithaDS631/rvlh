import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import { BookOpen, ArrowRight, Eye, EyeOff, Shield, GraduationCap, Users, Sparkles } from 'lucide-react';
import './Auth.css';

export default function Register() {
  const { register, isLoading } = useAuth();
  const { data } = useStore();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    course: '',
    studentId: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      await register('student', formData);
      navigate('/student');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    }
  };

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="auth-page">
      <div className="auth-bg" />
      <div className="auth-container animate-fadeInUp">
        <div className="auth-card auth-card-register">
          <div className="auth-header">
            <h1 className="auth-title">Create Account</h1>
            <p className="auth-subtitle">Join us and start learning today</p>
          </div>

          <form className="auth-form animate-fadeIn" onSubmit={handleSubmit}>
            <div className="auth-selected-role" style={{ '--role-color': '#10b981', marginBottom: '24px' }}>
              <Sparkles size={14} />
              Registering new <strong>Student</strong> account
            </div>

            {error && <div className="auth-error">{error}</div>}

            <div className="auth-form-row">
              <div className="form-group">
                <label htmlFor="reg-name" className="form-label">Full Name</label>
                <input
                  type="text"
                  id="reg-name"
                  className="form-input"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="reg-phone" className="form-label">Phone Number</label>
                <input
                  type="tel"
                  id="reg-phone"
                  className="form-input"
                  placeholder="+91 XXXXX XXXXX"
                  value={formData.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="reg-email" className="form-label">Email Address</label>
              <input
                type="email"
                id="reg-email"
                className="form-input"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => updateField('email', e.target.value)}
                required
              />
            </div>

            <div className="auth-form-row">
              <div className="form-group">
                <label htmlFor="reg-password" className="form-label">Password</label>
                <div className="auth-password-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="reg-password"
                    className="form-input"
                    placeholder="Create password"
                    value={formData.password}
                    onChange={(e) => updateField('password', e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="auth-password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="reg-confirm" className="form-label">Confirm Password</label>
                <input
                  type="password"
                  id="reg-confirm"
                  className="form-input"
                  placeholder="Confirm password"
                  value={formData.confirmPassword}
                  onChange={(e) => updateField('confirmPassword', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="auth-form-row">
              <div className="form-group">
                <label htmlFor="reg-course" className="form-label">Select Course</label>
                <select
                  id="reg-course"
                  className="form-select"
                  value={formData.course}
                  onChange={(e) => updateField('course', e.target.value)}
                  required
                >
                  <option value="">Choose a course framework</option>
                  {data?.courses?.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="reg-studentId" className="form-label">
                  RVLH Student ID <span className="auth-optional">(optional)</span>
                </label>
                <input
                  type="text"
                  id="reg-studentId"
                  className="form-input"
                  placeholder="e.g., RVLH2025001"
                  value={formData.studentId}
                  onChange={(e) => updateField('studentId', e.target.value)}
                />
                <p className="auth-hint">RVLH students get free unlimited access to all content!</p>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg auth-submit terminal-hub-entry"
              disabled={isLoading}
              id="register-submit"
              style={{marginTop: '8px'}}
            >
              {isLoading ? (
                <span className="auth-spinner" />
              ) : (
                <>Create Student Account <ArrowRight size={18} /></>
              )}
            </button>

            <p className="auth-switch">
              Already have an account? <Link to="/login">Sign In</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
