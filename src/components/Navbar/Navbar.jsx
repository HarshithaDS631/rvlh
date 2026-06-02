import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Menu, X, Bell, Search, User, LogOut, ChevronDown,
  BookOpen, LayoutDashboard, GraduationCap, Settings
} from 'lucide-react';
import './Navbar.css';

export default function Navbar({ onMenuClick, showMenuButton }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const isPublicPage = ['/', '/login', '/register'].includes(location.pathname);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMenuOpen(false);
    setProfileOpen(false);
  }, [location]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getDashboardLink = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'admin': return '/admin';
      case 'teacher': return '/teacher';
      case 'student': return '/student';
      default: return '/';
    }
  };

  return (
    <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''} ${isPublicPage ? 'navbar-transparent' : ''}`}>
      <div className="navbar-container">
        <Link to={user ? getDashboardLink() : '/'} className="navbar-brand">
          <div className="navbar-logo">
            <BookOpen size={24} />
          </div>
          <div className="navbar-brand-text">
            <span className="navbar-brand-name">RVLH</span>
            <span className="navbar-brand-tagline">Learning Hub</span>
          </div>
        </Link>

        {!isPublicPage && user && (
          <div className="navbar-search">
            <Search size={18} className="navbar-search-icon" />
            <input
              type="text"
              placeholder="SEARCH SYSTEM.DATABASE..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="navbar-search-input"
              id="global-search"
            />
          </div>
        )}

        {isPublicPage ? (
          <div className="navbar-public-links">
            <Link to="/" className={`navbar-link ${location.pathname === '/' ? 'active' : ''}`}>Home</Link>
            <a href="#courses" className="navbar-link">Courses</a>
            <a href="#features" className="navbar-link">Features</a>
            <a href="#about" className="navbar-link">About</a>
            {!user || ['/', '/login', '/register'].includes(location.pathname) ? (
              <div className="navbar-auth-buttons">
                <Link to="/login" className="btn btn-primary btn-sm terminal-hub-entry" id="login-signup-btn">
                   Login / Signup
                </Link>
              </div>
            ) : (
              <Link to={getDashboardLink()} className="btn btn-primary" id="dashboard-btn">
                <LayoutDashboard size={16} /> Dashboard
              </Link>
            )}
          </div>
        ) : (
          <div className="navbar-actions">
            <button className="btn btn-icon navbar-action-btn" data-tooltip="Notifications" id="notifications-btn">
              <Bell size={20} />
              <span className="navbar-notification-badge">3</span>
            </button>

            <div className="navbar-profile-wrapper">
              <button
                className="navbar-profile-trigger"
                onClick={() => setProfileOpen(!profileOpen)}
                id="profile-menu-btn"
              >
                <img src={user?.avatar} alt={user?.name} className="navbar-avatar" />
                <span className="navbar-user-name">node.{user?.name?.split(' ')[0]}</span>
                <ChevronDown size={16} className={`navbar-chevron ${profileOpen ? 'rotated' : ''}`} />
              </button>

              {profileOpen && (
                <div className="navbar-dropdown animate-fadeInDown">
                  <div className="navbar-dropdown-header">
                    <img src={user?.avatar} alt={user?.name} className="navbar-dropdown-avatar" />
                    <div>
                      <p className="navbar-dropdown-name">{user?.name}</p>
                      <p className="navbar-dropdown-email">{user?.email}</p>
                      <span className="badge badge-primary">{user?.role}</span>
                    </div>
                  </div>
                  <div className="navbar-dropdown-divider" />
                  <Link to={getDashboardLink()} className="navbar-dropdown-item" id="dropdown-dashboard">
                    <LayoutDashboard size={16} /> Registry.Dashboard
                  </Link>
                  <Link to={`${getDashboardLink()}/settings`} className="navbar-dropdown-item" id="dropdown-settings">
                    <Settings size={16} /> Registry.Settings
                  </Link>
                  <div className="navbar-dropdown-divider" />
                  <button onClick={handleLogout} className="navbar-dropdown-item navbar-dropdown-logout" id="dropdown-logout">
                    <LogOut size={16} /> System.SignOut
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        <button
          className="navbar-mobile-toggle"
          onClick={showMenuButton ? onMenuClick : () => setMenuOpen(!menuOpen)}
          id="mobile-menu-toggle"
          aria-label="Toggle menu"
        >
          {showMenuButton ? <Menu size={24} /> : (menuOpen ? <X size={24} /> : <Menu size={24} />)}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="navbar-mobile-menu animate-fadeInDown">
          {isPublicPage ? (
            <>
              <Link to="/" className="navbar-mobile-link">Home</Link>
              <a href="#courses" className="navbar-mobile-link" onClick={() => setMenuOpen(false)}>Courses</a>
              <a href="#features" className="navbar-mobile-link" onClick={() => setMenuOpen(false)}>Features</a>
              <a href="#about" className="navbar-mobile-link" onClick={() => setMenuOpen(false)}>About</a>
              {!user || ['/', '/login', '/register'].includes(location.pathname) ? (
                <Link to="/login" className="navbar-mobile-link terminal-hub-entry" style={{ color: 'var(--primary-400)' }}>Login / Signup</Link>
              ) : (
                <Link to={getDashboardLink()} className="btn btn-primary" style={{ marginTop: '8px' }}>Dashboard</Link>
              )}
            </>
          ) : (
            <>
              <div className="navbar-mobile-search">
                <Search size={18} />
                <input type="text" placeholder="Search..." className="navbar-search-input" />
              </div>
              <Link to={getDashboardLink()} className="navbar-mobile-link">
                <LayoutDashboard size={18} /> Dashboard
              </Link>
              <button onClick={handleLogout} className="navbar-mobile-link" style={{ color: 'var(--error)' }}>
                <LogOut size={18} /> Sign Out
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
