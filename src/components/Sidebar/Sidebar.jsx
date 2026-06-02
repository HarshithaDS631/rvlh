import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import {
  LayoutDashboard, BookOpen, Video, FileText, Users, BarChart3,
  Upload, Settings, GraduationCap, Brain, CreditCard, Award,
  Shield, UserCog, ClipboardList, TrendingUp, ChevronLeft, ChevronRight,
  Square, CheckSquare, Bell, User, Activity, Sparkles, Clock, MessageSquare, X,
  Crown, Flame, LogOut, Radio
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import './Sidebar.css';

const adminLinks = (pendingCount, unreadNotifs) => [
  { to: '/admin', icon: LayoutDashboard, label: 'User Management', exact: true },
  { to: '/admin/faculty', icon: GraduationCap, label: 'Faculty Management' },
  { to: '/admin/students', icon: Users, label: 'Student Registry' },
  { to: '/admin/approvals', icon: Activity, label: 'Approvals', badge: pendingCount > 0 ? pendingCount : null },
  { to: '/admin/results', icon: Award, label: 'Academic Results' },
  { to: '/admin/library', icon: BookOpen, label: 'Global Library' },
  { to: '/admin/payments', icon: CreditCard, label: 'Financial Hub' },
  { to: '/admin/announcements', icon: Bell, label: 'Announcements' },
  { to: '/admin/notifications', icon: MessageSquare, label: 'Notifications', badge: unreadNotifs > 0 ? unreadNotifs : null },
  { to: '/admin/security', icon: Shield, label: 'Admin Security' },
];

const teacherLinks = (pendingCount) => [
  { to: '/teacher', icon: LayoutDashboard, label: 'Control Panel', exact: true },
  { to: '/teacher/upload', icon: Upload, label: 'Content Upload' },
  { 
    to: '/teacher/queue', 
    icon: Clock, 
    label: 'Pending Review',
    badge: pendingCount > 0 ? pendingCount : null 
  },
  { to: '/teacher/live', icon: Video, label: 'Live Classes' },
  { to: '/teacher/tests', icon: ClipboardList, label: 'Test Builder' },
  { to: '/teacher/monitoring', icon: Activity, label: 'Student Monitor' },
  { to: '/teacher/doubts', icon: MessageSquare, label: 'Doubt Portal' },
  { to: '/teacher/notifications', icon: Bell, label: 'Notifications' },
  { to: '/teacher/settings', icon: UserCog, label: 'Profile Settings' },
];

const studentLinks = [
  { to: '/student',              icon: LayoutDashboard, label: 'Dashboard',      exact: true, desc: 'Overview & quick stats' },
  { to: '/student/courses',      icon: BookOpen,        label: 'Courses',        desc: 'Your enrolled courses' },
  { to: '/student/videos',       icon: Video,           label: 'Video Lectures', desc: 'Watch & learn' },
  { to: '/student/live',         icon: Radio,           label: 'Live Class',     desc: 'Scheduled sessions' },
  { to: '/student/materials',    icon: FileText,        label: 'Material',       desc: 'Notes & formula sheets' },
  { to: '/student/quizzes',      icon: Brain,           label: 'Mock Quiz',      desc: 'Practice & AI quizzes' },
  { to: '/student/doubts',       icon: MessageSquare,   label: 'Doubts',         desc: 'Ask & resolve doubts' },
  { to: '/student/grading',      icon: BarChart3,       label: 'Grading',        desc: 'Your performance' },
  { to: '/student/announcements', icon: Bell,           label: 'Announcements',  desc: 'Notices & updates' },
  { to: '/student/settings',     icon: Settings,        label: 'Profile',        desc: 'Account settings' },
];

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const { data } = useStore();
  const [collapsed, setCollapsed] = useState(false);

  if (!user) return null;

  const pendingVideos = (data?.videos || []).filter(v => v.status === 'pending' || !v.status);
  const pendingMaterials = (data?.materials || []).filter(m => m.status === 'pending' || !m.status);
  const totalPending = pendingVideos.length + pendingMaterials.length;
  const isAnyLiveOngoing = (data?.liveClasses || []).some(lc => lc.status === 'ongoing');

  let links = [];
  let roleColor = '';
  let roleIcon = null;
  let roleName = '';

  const teacherOwnedPending = [...pendingVideos, ...pendingMaterials].filter(item => item.teacherId === user?.id).length;
  const unreadNotifs = (data?.notifications || []).filter(n => (n.role === 'admin' || n.userId === user?.id) && !n.read).length;

  // Student-specific computed values
  const isRVLH = user?.type === 'rvlh';
  const isPremium = isRVLH || user?.subscription === 'premium';
  const myResults = useMemo(() =>
    (data?.quizResults || []).filter(r => r.studentId === user?.id), [data, user]);
  const overallAvg = useMemo(() => {
    const acc = {};
    myResults.forEach(r => {
      const k = r.subject || 'General';
      if (!acc[k]) acc[k] = { marks: 0, count: 0 };
      acc[k].marks += Number(r.score) || 0;
      acc[k].count += 1;
    });
    const grades = Object.values(acc).map(v => Math.round(v.marks / v.count));
    return grades.length ? Math.round(grades.reduce((s, g) => s + g, 0) / grades.length) : 0;
  }, [myResults]);

  switch (user.role) {
    case 'admin':
      links = adminLinks(totalPending, unreadNotifs);
      roleColor = 'var(--error)';
      roleIcon = <Shield size={16} />;
      roleName = 'Administrator';
      break;
    case 'teacher':
      links = teacherLinks(teacherOwnedPending);
      // Add pulsing live badge if teacher has an ongoing session
      links = links.map(l => l.to === '/teacher/live' && isAnyLiveOngoing ? { ...l, badge: 'LIVE', badgeColor: 'var(--error-500)' } : l);
      roleColor = 'var(--primary-500)';
      roleIcon = <GraduationCap size={16} />;
      roleName = 'Teacher Console';
      break;
    case 'student':
      links = [...studentLinks];
      if (user.type === 'outside') {
        links.push({ to: '/student/subscription', icon: CreditCard, label: 'Subscription', desc: 'Manage your plan' });
      }
      // Add pulsing live badge for students if any session is ongoing
      links = links.map(l => l.to === '/student/live' && isAnyLiveOngoing ? { ...l, badge: 'LIVE', badgeColor: 'var(--error-500)' } : l);
      roleColor = 'var(--accent-500)';
      roleIcon = <Award size={16} />;
      roleName = user.type === 'rvlh' ? 'RVLH Student' : 'Student';
      break;
  }

  const isStudent = user.role === 'student';

  return (
    <aside className={`sidebar ${collapsed ? 'sidebar-collapsed' : ''} ${isOpen ? 'sidebar-mobile-open' : ''}`}>
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}

      {/* ── Student: User Card at top ── */}
      {isStudent && !collapsed && (
        <div className="sidebar-student-card">
          <div className="sidebar-student-avatar-wrap">
            <img
              src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`}
              alt={user?.name}
              className="sidebar-student-avatar"
            />
            {isRVLH && (
              <span className="sidebar-student-crown">
                <Crown size={9} />
              </span>
            )}
          </div>
          <div className="sidebar-student-info">
            <h4 className="sidebar-student-name">{user?.name}</h4>
            <span className={`sidebar-student-type ${isRVLH ? 'rvlh' : 'outside'}`}>
              {isRVLH ? <><Crown size={10} /> RVLH</> : <><User size={10} /> Student</>}
            </span>
          </div>
        </div>
      )}

      {/* ── Student: Collapsed avatar ── */}
      {isStudent && collapsed && (
        <div className="sidebar-student-card-mini">
          <img
            src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`}
            alt={user?.name}
            className="sidebar-student-avatar-mini"
          />
        </div>
      )}

      {/* ── Non-student: Original role header ── */}
      {!isStudent && (
        <div className="sidebar-header">
          <div className="sidebar-role" style={{ '--role-color': roleColor }}>
            <span className="sidebar-role-icon">{roleIcon}</span>
            {!collapsed && <span className="sidebar-role-text">{roleName}</span>}
          </div>
          <button
            className="sidebar-close-mobile"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
          <button
            className="sidebar-toggle"
            onClick={() => setCollapsed(!collapsed)}
            id="sidebar-toggle"
            aria-label="Toggle sidebar"
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>
      )}

      {/* ── Student: Quick Stats ── */}
      {isStudent && !collapsed && (
        <div className="sidebar-student-stats">
          <div className="sidebar-student-stat">
            <Flame size={14} color="#f59e0b" />
            <span><strong>{user?.streak || 0}</strong> streak</span>
          </div>
          <div className="sidebar-student-stat">
            <Award size={14} color="var(--primary-400)" />
            <span><strong>{overallAvg || '—'}{overallAvg ? '%' : ''}</strong> avg</span>
          </div>
          <div className="sidebar-student-stat">
            <Brain size={14} color="#8b5cf6" />
            <span><strong>{myResults.length}</strong> quizzes</span>
          </div>
        </div>
      )}

      {/* ── Student: Toggle + Close row ── */}
      {isStudent && (
        <div className="sidebar-student-controls">
          <button
            className="sidebar-close-mobile"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
          <button
            className="sidebar-toggle"
            onClick={() => setCollapsed(!collapsed)}
            id="sidebar-toggle"
            aria-label="Toggle sidebar"
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>
      )}

      {/* ── Navigation Links ── */}
      <nav className="sidebar-nav">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.exact}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`
            }
            id={`sidebar-${link.label.toLowerCase().replace(/\s/g, '-')}`}
            onClick={onClose}
          >
            <link.icon size={20} className="sidebar-link-icon" />
            {!collapsed && (
              <div className="sidebar-link-content">
                <div className="sidebar-link-label-group">
                  <span className="sidebar-link-text">{link.label}</span>
                  {isStudent && link.desc && (
                    <span className="sidebar-link-desc">{link.desc}</span>
                  )}
                </div>
                {link.badge && (
                  <span 
                    className={`sidebar-badge ${link.badge === 'LIVE' ? 'badge-pulse' : ''}`}
                    style={link.badgeColor ? { background: link.badgeColor } : {}}
                  >
                    {link.badge}
                  </span>
                )}
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* ── Student: Upgrade Card ── */}
      {isStudent && !isPremium && !collapsed && (
        <div className="sidebar-upgrade-card">
          <Crown size={18} color="#f59e0b" />
          <div>
            <strong>Go Premium</strong>
            <p>Unlock all videos, materials & quizzes</p>
          </div>
          <Link to="/student/subscription" className="btn btn-primary btn-sm sidebar-upgrade-btn">
            Upgrade
          </Link>
        </div>
      )}

      {/* ── Student: Sign Out ── */}
      {isStudent && !collapsed && (
        <button className="sidebar-student-logout" onClick={logout}>
          <LogOut size={15} /> Sign Out
        </button>
      )}

      {/* ── Non-student: Bottom stats ── */}
      {!collapsed && !isStudent && user.role === 'student' && (
        <div className="sidebar-stats">
          <div className="sidebar-stat">
            <span className="sidebar-stat-value">{user.streak || 0}</span>
            <span className="sidebar-stat-label">Day Streak 🔥</span>
          </div>
          <div className="sidebar-stat">
            <span className="sidebar-stat-value">{user.videosWatched || 0}</span>
            <span className="sidebar-stat-label">Videos Watched</span>
          </div>
        </div>
      )}
    </aside>
  );
}
