import { useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import {
  Users, GraduationCap, BookOpen, Video, Activity,
  Trash2, Plus, CheckCircle, X, Shield, Bell, CreditCard,
  Lock, Power, Filter, Award, TrendingUp, Download,
  Eye, FileText, Calendar, Clock, Mail, Phone, User,
  Search, ChevronDown, IndianRupee, BarChart3, AlertCircle, MessageSquare, ArrowRight, ClipboardList
} from 'lucide-react';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const { user } = useAuth();
  const { data, addEntity, updateEntity, deleteEntity } = useStore();
  const location = useLocation();

  const getTabFromPath = (path) => {
    if (path.includes('faculty')) return 'faculty';
    if (path.includes('students')) return 'students';
    if (path.includes('approvals')) return 'approvals';
    if (path.includes('results')) return 'results';
    if (path.includes('library')) return 'library';
    if (path.includes('payments')) return 'payments';
    if (path.includes('announcements')) return 'announcements';
    if (path.includes('notifications')) return 'notifications';
    if (path.includes('security')) return 'security';
    return 'overview';
  };

  const activeTab = getTabFromPath(location.pathname);

  // — State —
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [newTeacher, setNewTeacher] = useState({ name: '', email: '', password: '', subject: '', phone: '' });
  const [facultySubjectFilter, setFacultySubjectFilter] = useState('all');
  const [studentCourseFilter, setStudentCourseFilter] = useState('all');
  const [resultSubjectFilter, setResultSubjectFilter] = useState('all');
  const [libSubjectFilter, setLibSubjectFilter] = useState('all');
  const [libTypeFilter, setLibTypeFilter] = useState('all');
  const [paymentCourseFilter, setPaymentCourseFilter] = useState('all');
  const [showAnnounceModal, setShowAnnounceModal] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', content: '', type: 'info', audience: 'both' });
  const [approvalTypeFilter, setApprovalTypeFilter] = useState('all');
  const [approvalSubjectFilter, setApprovalSubjectFilter] = useState('all');
  const [previewItem, setPreviewItem] = useState(null);
  const [profileData, setProfileData] = useState({
    name: user?.name || 'Super Admin',
    email: user?.email || 'admin@rvlh.edu',
    phone: user?.phone || '+91 98765 43210',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // — Derived Data —
  const teachers = useMemo(() => (data?.users || []).filter(u => u.role === 'teacher'), [data?.users]);
  const students = useMemo(() => (data?.users || []).filter(u => u.role === 'student'), [data?.users]);
  const pendingVideos = useMemo(() => (data?.videos || []).filter(v => v.status === 'pending' || !v.status), [data?.videos]);
  const pendingMaterials = useMemo(() => (data?.materials || []).filter(m => m.status === 'pending' || !m.status), [data?.materials]);
  const totalPending = pendingVideos.length + pendingMaterials.length;
  const approvedVideos = useMemo(() => (data?.videos || []).filter(v => v.status === 'approved'), [data?.videos]);
  const approvedMaterials = useMemo(() => (data?.materials || []).filter(m => m.status === 'approved'), [data?.materials]);
  const totalRevenue = useMemo(() => (data?.payments || []).filter(p => p.status === 'completed').reduce((acc, curr) => acc + curr.amount, 0), [data?.payments]);

  const adminNotifications = useMemo(() =>
    (data?.notifications || []).filter(n => n.role === 'admin' || n.userId === user?.id).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [data?.notifications, user?.id]
  );
  const unreadCount = adminNotifications.filter(n => !n.read).length;

  // — Filtered Data —
  const filteredTeachers = facultySubjectFilter === 'all' ? teachers : teachers.filter(t => t.subject === facultySubjectFilter);
  const filteredStudents = studentCourseFilter === 'all' ? students : students.filter(s => s.course === studentCourseFilter);
  const filteredResults = resultSubjectFilter === 'all' ? (data?.quizResults || []) : (data?.quizResults || []).filter(r => r.subject === resultSubjectFilter);

  const allLibraryItems = useMemo(() => {
    const vids = approvedVideos.map(v => ({ ...v, itemType: 'video' }));
    const mats = approvedMaterials.map(m => ({ ...m, itemType: 'material' }));
    const tests = (data?.quizzes || []).map(q => ({ ...q, itemType: 'test', title: q.title || 'Untitled Test' }));
    return [...vids, ...mats, ...tests].sort((a, b) => new Date(b.createdAt || Date.now()) - new Date(a.createdAt || Date.now()));
  }, [approvedVideos, approvedMaterials, data?.quizzes]);

  const filteredLibrary = useMemo(() => {
    return allLibraryItems.filter(item => {
      const typeMatch = libTypeFilter === 'all' || item.itemType === libTypeFilter;
      const subMatch = libSubjectFilter === 'all' || item.subject === libSubjectFilter;
      return typeMatch && subMatch;
    });
  }, [allLibraryItems, libTypeFilter, libSubjectFilter]);

  const filteredPayments = paymentCourseFilter === 'all' ? (data?.payments || []) : (data?.payments || []).filter(p => p.course === paymentCourseFilter);
  const filteredFees = paymentCourseFilter === 'all' ? (data?.feeRecords || []) : (data?.feeRecords || []).filter(f => f.course === paymentCourseFilter);

  // — Computed Stats —
  const avgPercentage = filteredResults.length > 0
    ? Math.round(filteredResults.reduce((sum, r) => sum + (r.score / r.total) * 100, 0) / filteredResults.length)
    : 0;

  const courseDistribution = useMemo(() => {
    const dist = {};
    students.forEach(s => {
      const course = (data?.courses || []).find(c => c.id === s.course);
      const name = course?.shortName || s.course || 'Unknown';
      dist[name] = (dist[name] || 0) + 1;
    });
    return Object.entries(dist).map(([name, count]) => ({ name, count }));
  }, [students, data?.courses]);

  const subjectsList = useMemo(() => {
    const subs = new Set();
    [...(data?.videos || []), ...(data?.materials || [])].forEach(item => { if (item.subject) subs.add(item.subject); });
    (data?.quizResults || []).forEach(r => { if (r.subject) subs.add(r.subject); });
    teachers.forEach(t => { if (t.subject) subs.add(t.subject); });
    return Array.from(subs).sort();
  }, [data?.videos, data?.materials, data?.quizResults, teachers]);

  // — Handlers —
  const handleCreateTeacher = (e) => {
    e.preventDefault();
    if (!newTeacher.name || !newTeacher.email || !newTeacher.password) return;
    addEntity('users', {
      ...newTeacher,
      role: 'teacher',
      type: 'teacher',
      status: 'active',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${newTeacher.email}`,
    });
    setNewTeacher({ name: '', email: '', password: '', subject: '', phone: '' });
    setShowTeacherModal(false);
  };

  const handleCreateAnnouncement = (e) => {
    e.preventDefault();
    addEntity('announcements', {
      ...newAnnouncement,
      date: new Date().toISOString()
    });
    setNewAnnouncement({ title: '', content: '', type: 'info', audience: 'both' });
    setShowAnnounceModal(false);
  };

  const toggleUserStatus = (id, currentStatus) => {
    updateEntity('users', id, { status: currentStatus === 'active' ? 'deactivated' : 'active' });
  };

  const handleApprove = (item) => {
    const itemType = item.type === 'video' ? 'videos' : 'materials';
    updateEntity(itemType, item.id, { status: 'approved' });
    addEntity('notifications', {
      userId: item.teacherId,
      title: 'Content Approved ✅',
      message: `Your ${item.type}: "${item.title}" is now live.`,
      category: 'today',
      link: item.type === 'video' ? '/teacher/videos' : '/teacher/materials'
    });
    addEntity('notifications', {
      courseId: item.courseId,
      title: `New ${item.type.charAt(0).toUpperCase() + item.type.slice(1)} Alert!`,
      message: `"${item.title}" is now available in your course library.`,
      category: 'today',
      link: item.type === 'video' ? `/student/video/${item.id}` : '/student/materials'
    });
  };

  const handleDecline = (item) => {
    const itemType = item.type === 'video' ? 'videos' : 'materials';
    updateEntity(itemType, item.id, { status: 'declined' });
    addEntity('notifications', {
      userId: item.teacherId,
      title: 'Content Declined ❌',
      message: `Your ${item.type}: "${item.title}" was not approved. Please revise and re-submit.`,
      category: 'today',
    });
  };

  const markNotifRead = (id) => {
    updateEntity('notifications', id, { read: true });
  };

  const markAllNotifsRead = () => {
    adminNotifications.filter(n => !n.read).forEach(n => {
      updateEntity('notifications', n.id, { read: true });
    });
  };

  const handleRefund = (id) => {
    updateEntity('payments', id, { status: 'refunded' });
  };

  const handleProfileSave = (e) => {
    e.preventDefault();
    if (profileData.newPassword && profileData.newPassword !== profileData.confirmPassword) {
      alert('New passwords do not match!');
      return;
    }
    updateEntity('users', user.id, {
      name: profileData.name,
      email: profileData.email,
      phone: profileData.phone,
      ...(profileData.newPassword ? { password: profileData.newPassword } : {})
    });
    setProfileData(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
    alert('Profile updated successfully!');
  };

  const tabTitles = {
    overview: 'User Management',
    faculty: 'Faculty Management',
    students: 'Student Registry',
    approvals: 'Approvals',
    results: 'Academic Results',
    library: 'Global Library Hub',
    payments: 'Financial Hub',
    announcements: 'Announcements Hub',
    notifications: 'Event Center',
    security: 'Admin Security'
  };

  const tabDescriptions = {
    overview: 'System overview with students, faculty, revenue & operational summary',
    faculty: 'Create and manage teacher accounts & domain assignments',
    students: 'View and manage all registered students across courses',
    approvals: 'Review, preview & approve/decline uploaded content',
    results: 'All student scores, averages & mastery tracking',
    library: 'Explore and manage all approved academic assets',
    payments: 'Revenue tracking, EMI management & fee reminders',
    announcements: 'Broadcast messages to faculty, students or both',
    notifications: 'Track faculty activities, tests, and academic events',
    security: 'Admin profile, credentials & security settings'
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const formatTimeAgo = (dateStr) => {
    if (!dateStr) return '';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  return (
    <div className="admin-view animate-fadeIn">
      {/* Glass Header */}
      <div className="glass-header">
        <div className="header-info">
          <h1>{tabTitles[activeTab]}</h1>
          <p>{tabDescriptions[activeTab]}</p>
        </div>
      </div>

      <div className="admin-page-content">

        {/* ═══════════════════ TAB 1: USER MANAGEMENT (OVERVIEW) ═══════════════════ */}
        {activeTab === 'overview' && (
          <div className="admin-overview animate-fadeIn">
            {/* Stat Cards */}
            <div className="admin-stat-grid">
              <div className="dash-stat-card hud-card hud-serious-border">
                <div className="dash-stat-icon"><Users size={22} color="var(--primary-400)" /></div>
                <div className="dash-stat-info">
                  <span className="terminal-readout">Students</span>
                  <span className="dash-stat-value neon-text">{students.length}</span>
                  <span className="dash-stat-label">Total Registered Students</span>
                </div>
              </div>
              <div className="dash-stat-card hud-card">
                <div className="dash-stat-icon"><GraduationCap size={22} color="var(--primary-400)" /></div>
                <div className="dash-stat-info">
                  <span className="terminal-readout">Faculty</span>
                  <span className="dash-stat-value neon-text">{teachers.length}</span>
                  <span className="dash-stat-label">Verified Teachers</span>
                </div>
              </div>
              <div className="dash-stat-card hud-card">
                <div className="dash-stat-icon"><Activity size={22} color="var(--primary-400)" /></div>
                <div className="dash-stat-info">
                  <span className="terminal-readout">Pending</span>
                  <span className="dash-stat-value neon-text">{totalPending}</span>
                  <span className="dash-stat-label">Awaiting Approval</span>
                </div>
              </div>
              <div className="dash-stat-card hud-card">
                <div className="dash-stat-icon"><IndianRupee size={22} color="var(--primary-400)" /></div>
                <div className="dash-stat-info">
                  <span className="terminal-readout">Revenue</span>
                  <span className="dash-stat-value neon-text">₹{totalRevenue.toLocaleString()}</span>
                  <span className="dash-stat-label">Total Earnings</span>
                </div>
              </div>
            </div>

            {/* Summary Grid */}
            <div className="admin-summary-grid">
              {/* Course Distribution */}
              <section className="section-card hud-serious-border">
                <div className="card-header"><h3>Course Distribution</h3></div>
                <div className="course-dist-list">
                  {courseDistribution.map(({ name, count }) => {
                    const maxCount = Math.max(...courseDistribution.map(c => c.count));
                    const percentage = (count / maxCount) * 100;
                    return (
                      <div key={name} className="course-dist-item">
                        <div className="dist-label-row">
                          <span className="course-dist-name terminal-readout">{name}</span>
                          <span className="course-dist-count neon-text">{count}</span>
                        </div>
                        <div className="course-dist-bar-wrap hud-card">
                          <div className="course-dist-bar neon-bg" style={{ width: `${percentage}%` }}>
                            <div className="digital-scanline" />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {courseDistribution.length === 0 && <p className="empty-text">No active enrollments recorded.</p>}
                </div>
              </section>

              {/* Quick Stats */}
              <section className="section-card">
                <div className="card-header"><h3>Platform Summary</h3></div>
                <div className="quick-stats-list">
                  <div className="quick-stat-row">
                    <span className="qs-icon" style={{ background: 'rgba(59,130,246,0.1)', color: '#3b82f6' }}><Video size={16} /></span>
                    <span className="qs-label">Approved Videos</span>
                    <span className="qs-value">{approvedVideos.length}</span>
                  </div>
                  <div className="quick-stat-row">
                    <span className="qs-icon" style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981' }}><FileText size={16} /></span>
                    <span className="qs-label">Approved Materials</span>
                    <span className="qs-value">{approvedMaterials.length}</span>
                  </div>
                  <div className="quick-stat-row">
                    <span className="qs-icon" style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b' }}><BarChart3 size={16} /></span>
                    <span className="qs-label">Avg. Score</span>
                    <span className="qs-value">{avgPercentage}%</span>
                  </div>
                  <div className="quick-stat-row">
                    <span className="qs-icon" style={{ background: 'rgba(139,92,246,0.1)', color: '#8b5cf6' }}><Bell size={16} /></span>
                    <span className="qs-label">Unread Alerts</span>
                    <span className="qs-value">{unreadCount}</span>
                  </div>
                  <div className="quick-stat-row">
                    <span className="qs-icon" style={{ background: 'rgba(236,72,153,0.1)', color: '#ec4899' }}><BookOpen size={16} /></span>
                    <span className="qs-label">Active Courses</span>
                    <span className="qs-value">{(data?.courses || []).filter(c => c.status === 'published').length}</span>
                  </div>
                </div>
              </section>

              {/* Recent Activity */}
              <section className="section-card section-card-wide">
                <div className="card-header"><h3>Recent Notifications</h3></div>
                <div className="admin-notif-feed-compact">
                  {adminNotifications.slice(0, 5).map(n => (
                    <div key={n.id} className={`notif-compact-item hud-card ${n.read ? 'read' : 'unread'}`}>
                      <div className="notif-dot-wrap">
                        <div className={`notif-dot ${n.read ? '' : 'pulse neon-bg'}`}></div>
                      </div>
                      <div className="notif-compact-content">
                        <h5 className="terminal-readout">{n.title}</h5>
                        <p>{n.message}</p>
                      </div>
                      <span className="notif-time terminal-readout-dim">{formatTimeAgo(n.createdAt)}</span>
                      <div className="digital-scanline" />
                    </div>
                  ))}
                  {adminNotifications.length === 0 && (
                    <div className="empty-state-inline">
                      <TrendingUp size={32} />
                      <p>Monitoring system quiet. No new alerts.</p>
                    </div>
                  )}
                </div>
              </section>
            </div>
          </div>
        )}

        {/* ═══════════════════ TAB 2: FACULTY MANAGEMENT ═══════════════════ */}
        {activeTab === 'faculty' && (
          <section className="section-card animate-slideUp">
            <div className="card-header">
              <h3>Faculty Management</h3>
              <div className="header-actions">
                <div className="filter-dropdown">
                  <Filter size={14} />
                  <select className="form-select" style={{ maxWidth: '200px' }} value={facultySubjectFilter} onChange={e => setFacultySubjectFilter(e.target.value)}>
                    <option value="all">All Subjects</option>
                    {subjectsList.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <button className="elite-btn-primary" onClick={() => setShowTeacherModal(true)}>
                  <Plus size={18} /> Add New Teacher
                </button>
              </div>
            </div>
            <div className="table-wrapper">
              <table className="elite-table">
                <thead>
                  <tr>
                    <th>Teacher</th>
                    <th>Subject</th>
                    <th>Email</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTeachers.map(t => (
                    <tr key={t.id}>
                      <td>
                        <div className="user-profile-cell">
                          <img src={t.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${t.email}`} alt={t.name} />
                          <div className="info">
                            <span className="name">{t.name}</span>
                            <span className="meta">Joined {formatDate(t.createdAt)}</span>
                          </div>
                        </div>
                      </td>
                      <td><span className="type-badge">{t.subject || 'General'}</span></td>
                      <td className="td-email">{t.email}</td>
                      <td><span className={`elite-status ${t.status || 'active'}`}>{t.status || 'active'}</span></td>
                      <td>
                        <div className="action-row">
                          <button className={`tool-btn ${t.status === 'deactivated' ? 'revive' : 'kill'}`}
                            title={t.status === 'deactivated' ? 'Activate' : 'Deactivate'}
                            onClick={() => toggleUserStatus(t.id, t.status || 'active')}>
                            <Power size={16} />
                          </button>
                          <button className="tool-btn danger" onClick={() => deleteEntity('users', t.id)}><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredTeachers.length === 0 && (
                    <tr><td colSpan="5" className="empty-td">No teachers found for this filter.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* ═══════════════════ TAB 3: STUDENT REGISTRY ═══════════════════ */}
        {activeTab === 'students' && (
          <section className="section-card animate-slideUp">
            <div className="card-header">
              <h3>Student Registry</h3>
              <div className="header-actions">
                <div className="filter-dropdown">
                  <Filter size={14} />
                  <select className="form-select" style={{ maxWidth: '200px' }} value={studentCourseFilter} onChange={e => setStudentCourseFilter(e.target.value)}>
                    <option value="all">All Courses</option>
                    {(data?.courses || []).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div className="table-wrapper">
              <table className="elite-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Course</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map(s => {
                    const course = (data?.courses || []).find(c => c.id === s.course);
                    return (
                      <tr key={s.id}>
                        <td>
                          <div className="user-profile-cell">
                            <img src={s.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${s.email}`} alt={s.name} />
                            <div className="info">
                              <span className="name">{s.name}</span>
                              <span className="meta">{s.email}</span>
                            </div>
                          </div>
                        </td>
                        <td><span className="type-badge" style={{ background: course?.color ? `${course.color}22` : undefined, color: course?.color }}>{course?.shortName || s.course || '—'}</span></td>
                        <td><span className={`student-type-tag ${s.type}`}>{s.type === 'rvlh' ? 'RVLH' : 'Outside'}</span></td>
                        <td><span className={`elite-status ${s.status || 'active'}`}>{s.status || 'active'}</span></td>
                        <td>
                          <div className="action-row">
                            <button className={`tool-btn ${s.status === 'deactivated' ? 'revive' : 'kill'}`}
                              title={s.status === 'deactivated' ? 'Activate' : 'Deactivate'}
                              onClick={() => toggleUserStatus(s.id, s.status || 'active')}>
                              <Power size={16} />
                            </button>
                            <button className="tool-btn danger" onClick={() => deleteEntity('users', s.id)}><Trash2 size={16} /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredStudents.length === 0 && (
                    <tr><td colSpan="5" className="empty-td">No students found for this filter.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* ═══════════════════ TAB 4: APPROVALS ═══════════════════ */}
        {activeTab === 'approvals' && (
          <section className="section-card animate-slideUp">
            <div className="card-header">
              <h3>Content Quality Review</h3>
              <div className="header-actions">
                <div className="filter-dropdown">
                  <Video size={14} />
                  <select className="form-select" value={approvalTypeFilter} onChange={e => setApprovalTypeFilter(e.target.value)}>
                    <option value="all">All Content Types</option>
                    <option value="video">Videos Only</option>
                    <option value="material">Materials Only</option>
                  </select>
                </div>
                <div className="filter-dropdown">
                  <Filter size={14} />
                  <select className="form-select" value={approvalSubjectFilter} onChange={e => setApprovalSubjectFilter(e.target.value)}>
                    <option value="all">All Subjects</option>
                    {subjectsList.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <span className="pending-counter hud-card">{totalPending} Pending</span>
              </div>
            </div>
            <div className="library-grid">
              {[...pendingVideos.map(v => ({ ...v, type: 'video' })), ...pendingMaterials.map(m => ({ ...m, type: 'material' }))]
                .filter(item => {
                  const typeMatch = approvalTypeFilter === 'all' || item.type === approvalTypeFilter;
                  const subMatch = approvalSubjectFilter === 'all' || item.subject === approvalSubjectFilter;
                  return typeMatch && subMatch;
                })
                .map(item => (
                <div key={item.id} className="library-card hud-card animate-fadeInUp">
                  <div className="lib-card-icon">
                    {item.type === 'video' ? <Video size={28} className="neon-text" /> : <FileText size={28} className="neon-text" />}
                  </div>
                  <div className="lib-card-body" style={{ paddingBottom: '0' }}>
                    <span className="terminal-readout">PENDING_LINK: {item.id.split('-')[0].toUpperCase()}</span>
                    <h4 style={{ fontSize: '18px', margin: '8px 0' }}>{item.title}</h4>
                    <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', marginBottom: '12px' }}>
                      By {item.teacherName || (data?.users || []).find(u => u.id === item.teacherId)?.name || 'Faculty'}
                    </p>
                    
                    <div className="lib-card-meta" style={{ marginBottom: '16px' }}>
                      <span className={`lib-type-badge ${item.type}`} style={{ fontSize: '10px' }}>{item.type.toUpperCase()}</span>
                      <span className="lib-divider">/</span>
                      <span className="lib-subject" style={{ fontSize: '10px' }}>{item.subject?.toUpperCase() || 'GENERAL'}</span>
                    </div>

                    <div className="lib-card-footer" style={{ borderTop: '1px solid var(--border-light)', paddingTop: '12px', display: 'flex', gap: '8px' }}>
                      <button className="preview-trigger-btn" style={{ flex: 1 }} onClick={() => setPreviewItem(item)}>
                        <Eye size={14} /> Preview
                      </button>
                      <button className="elite-btn-primary" style={{ padding: '6px 12px', borderRadius: '8px' }} onClick={() => handleApprove(item)}>
                        <CheckCircle size={16} />
                      </button>
                      <button className="elite-btn-secondary" style={{ padding: '6px 12px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', borderColor: 'rgba(239, 68, 68, 0.2)' }} onClick={() => handleDecline(item)}>
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {totalPending === 0 && (
                <div className="empty-state-wide">
                  <CheckCircle size={64} style={{ color: 'var(--success)' }} />
                  <p>All items reviewed. Quality standards maintained.</p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ═══════════════════ TAB 5: ACADEMIC RESULTS ═══════════════════ */}
        {activeTab === 'results' && (
          <section className="section-card animate-slideUp">
            <div className="card-header">
              <h3>Student Performance Overview</h3>
              <div className="header-actions">
                <div className="filter-dropdown">
                  <Filter size={14} />
                  <select className="form-select" style={{ maxWidth: '200px' }} value={resultSubjectFilter} onChange={e => setResultSubjectFilter(e.target.value)}>
                    <option value="all">All Subjects</option>
                    {subjectsList.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="avg-badge">
                  <Award size={16} />
                  <span>Avg: <strong>{avgPercentage}%</strong></span>
                </div>
              </div>
            </div>
            <div className="table-wrapper">
              <table className="elite-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Subject</th>
                    <th>Score</th>
                    <th>Percentage</th>
                    <th>Mastery</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredResults.map(res => {
                    const pct = Math.round((res.score / res.total) * 100);
                    const color = pct >= 80 ? '#10b981' : pct >= 60 ? '#f59e0b' : '#ef4444';
                    return (
                      <tr key={res.id}>
                        <td><strong>{res.studentName}</strong></td>
                        <td><span className="topic-tag">{res.subject}</span></td>
                        <td className="score-cell terminal-readout">{res.score} / {res.total}</td>
                        <td><span className="pct-badge neon-text" style={{ color }}>{pct}%</span></td>
                        <td>
                          <div className="segmented-progress">
                            {[...Array(10)].map((_, i) => (
                              <div key={i} className={`segment ${i < Math.floor(pct/10) ? 'active' : ''}`} style={{ '--segment-color': color }}></div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredResults.length === 0 && (
                    <tr><td colSpan="5" className="empty-td">No results found for this filter.</td></tr>
                  )}
                </tbody>
                {filteredResults.length > 0 && (
                  <tfoot>
                    <tr className="avg-footer-row">
                      <td colSpan="3"><strong>Overall Average</strong></td>
                      <td><strong className="avg-pct">{avgPercentage}%</strong></td>
                      <td>
                        <div className="mastery-container">
                          <div className="mastery-bar">
                            <div className="fill" style={{ width: `${avgPercentage}%`, background: avgPercentage >= 80 ? '#10b981' : avgPercentage >= 60 ? '#f59e0b' : '#ef4444' }} />
                          </div>
                        </div>
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </section>
        )}
        {/* ═══════════════════ TAB 6: GLOBAL LIBRARY HUB ═══════════════════ */}
        {activeTab === 'library' && (
          <section className="section-card animate-slideUp">
            <div className="card-header">
              <h3>Scholastic Resource Library</h3>
              <div className="header-actions">
                <div className="filter-dropdown">
                  <Video size={14} />
                  <select className="form-select" value={libTypeFilter} onChange={e => setLibTypeFilter(e.target.value)}>
                    <option value="all">All Content Types</option>
                    <option value="video">Videos</option>
                    <option value="material">Materials</option>
                    <option value="test">Tests</option>
                  </select>
                </div>
                <div className="filter-dropdown">
                  <Filter size={14} />
                  <select className="form-select" value={libSubjectFilter} onChange={e => setLibSubjectFilter(e.target.value)}>
                    <option value="all">All Subjects</option>
                    {subjectsList.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div className="library-grid">
              {filteredLibrary.map(item => (
                <div key={item.id} className="library-card hud-card animate-fadeInUp" onClick={() => setPreviewItem(item)}>
                  <div className="lib-card-icon">
                    {item.itemType === 'video' && <Video size={28} className="neon-text" />}
                    {item.itemType === 'material' && <FileText size={28} className="neon-text" />}
                    {item.itemType === 'test' && <ClipboardList size={28} className="neon-text" />}
                  </div>
                  <div className="lib-card-body">
                    <span className="terminal-readout">DATA_ID: {item.id.split('-')[0].toUpperCase()}</span>
                    <h4>{item.title}</h4>
                    <div className="lib-card-meta">
                      <span className="lib-teacher">{item.teacherName || (data?.users || []).find(u => u.id === item.teacherId)?.name || 'Unknown'}</span>
                      <span className="lib-divider">/</span>
                      <span className="lib-subject">{item.subject.toUpperCase()}</span>
                    </div>
                    <div className="lib-card-footer">
                      <span className={`lib-type-badge ${item.itemType}`}>{item.itemType}</span>
                      <button className="preview-trigger-btn">
                        <ArrowRight size={14} /> EXPLORE
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {filteredLibrary.length === 0 && (
                <div className="empty-state-wide">
                  <BookOpen size={64} />
                  <p>No academic assets found matching criteria.</p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ═══════════════════ TAB 7: ANNOUNCEMENTS ═══════════════════ */}
        {activeTab === 'announcements' && (
          <section className="section-card animate-slideUp">
            <div className="card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <h3 style={{ margin: 0 }}>Broadcast Hub</h3>
                <div style={{ display: 'flex', gap: '8px' }}>
                   <span className="meta-tag" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa' }}>Faculty</span>
                   <span className="meta-tag" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#34d399' }}>Students</span>
                </div>
              </div>
              <button className="elite-btn-primary" onClick={() => setShowAnnounceModal(true)}><Bell size={18} /> New Announcement</button>
            </div>
            <div className="announcements-wall">
              {(data?.announcements || []).sort((a,b) => new Date(b.date) - new Date(a.date)).map(ann => (
                <div key={ann.id} className={`elite-alert hud-card ${ann.type} animate-fadeIn`}>
                  <div className="alert-content">
                    <div className="alert-header">
                      <div className="digital-scanline" />
                      <span className="terminal-readout">{ann.type === 'warning' ? '⚠️ CRITICAL.PRIORITY' : 'ℹ️ SYSTEM.INFO'}</span>
                      <h5 style={{ fontSize: '18px', margin: '8px 0' }}>{ann.title}</h5>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                         {ann.audience && <span className={`audience-badge ${ann.audience}`}>{ann.audience === 'both' ? 'WIDE_BROADCAST' : ann.audience.toUpperCase()}</span>}
                         <span className="date terminal-readout-dim" style={{ fontSize: '10px' }}>LOG_TIME: {formatDate(ann.date)}</span>
                      </div>
                    </div>
                    <p className="announcement-text" style={{ fontSize: '15px', lineHeight: 1.6, marginTop: '12px' }}>{ann.content}</p>
                  </div>
                  <button className="tool-btn danger" onClick={() => deleteEntity('announcements', ann.id)}><Trash2 size={16} /></button>
                </div>
              ))}
              {(data?.announcements || []).length === 0 && (
                <div className="empty-state-wide">
                  <Bell size={64} />
                  <p>No active broadcasts found in the hub.</p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ═══════════════════ TAB 8: EVENT CENTER (NOTIFICATIONS) ═══════════════════ */}
        {activeTab === 'notifications' && (
          <section className="section-card animate-slideUp">
            <div className="card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <h3 style={{ margin: 0 }}>Faculty Activity & Event Center</h3>
                <span className="pending-counter">Total Tracking: {adminNotifications.length}</span>
              </div>
              <div className="header-actions">
                {unreadCount > 0 && (
                  <button className="elite-btn-secondary" onClick={markAllNotifsRead}>
                    <CheckCircle size={16} /> Mark All Read ({unreadCount})
                  </button>
                )}
              </div>
            </div>
            <div className="notif-timeline">
              {adminNotifications.map(n => {
                const teacher = teachers.find(t => t.id === n.fromTeacherId);
                const isUrgent = n.title.includes('Test') || n.title.includes('Exam') || n.title.includes('Critical');
                
                return (
                  <div key={n.id} className={`notif-timeline-item serious-log ${n.read ? 'read' : 'unread'} ${isUrgent ? 'urgent' : ''} hud-serious-border`} onClick={() => !n.read && markNotifRead(n.id)}>
                    <div className="notif-tl-content" style={{ padding: '16px' }}>
                      <div className="notif-tl-header" style={{ marginBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                           <span className="terminal-readout" style={{ fontSize: '10px', color: isUrgent ? 'var(--error)' : 'var(--primary-400)' }}>
                             [{isUrgent ? 'CRITICAL_EVENT' : 'SYSTEM_LOG'}]
                           </span>
                           <h5 style={{ fontSize: '15px', color: 'var(--text-primary)', margin: 0 }}>{n.title}</h5>
                        </div>
                        <span className="notif-time-stamp terminal-readout-dim" style={{ fontSize: '11px' }}>
                          <Clock size={12} /> {formatTimeAgo(n.createdAt)}
                        </span>
                      </div>
                      <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '4px 0 12px 0', lineHeight: '1.5' }}>{n.message}</p>
                      <div className="notif-tl-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                         <span className="terminal-readout" style={{ fontSize: '11px', opacity: 0.7 }}>
                           SOURCE: {teacher ? teacher.name.toUpperCase() : 'SYSTEM_CORE'}
                         </span>
                         {!n.read && <span className="unread-badge neon-bg" style={{ fontSize: '9px', padding: '2px 8px' }}>PENDING_ACTION</span>}
                      </div>
                      <div className="digital-scanline" />
                    </div>
                  </div>
                );
              })}
              {adminNotifications.length === 0 && (
                <div className="empty-state-wide">
                  <MessageSquare size={64} />
                  <p>Monitoring system active. No recent faculty events logged.</p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ═══════════════════ TAB 9: FINANCIAL HUB ═══════════════════ */}
        {activeTab === 'payments' && (
          <section className="animate-slideUp">
            <div className="card-header" style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <h3 style={{ fontSize: '24px', fontWeight: 800, margin: 0 }}>Financial Ecosystem</h3>
                <span className="terminal-readout">STATUS: ONLINE</span>
              </div>
              <div className="header-actions">
                <div className="filter-dropdown">
                  <Filter size={14} />
                  <select className="form-select" style={{ maxWidth: '200px' }} value={paymentCourseFilter} onChange={e => setPaymentCourseFilter(e.target.value)}>
                    <option value="all">All Course Clusters</option>
                    {(data?.courses || []).map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="library-grid" style={{ marginBottom: '40px' }}>
              {filteredFees.map(f => {
                const course = (data?.courses || []).find(c => c.id === f.course);
                const isPaidFull = f.pending === 0;
                return (
                  <div key={f.id} className={`library-card hud-card animate-fadeInUp ${isPaidFull ? 'paid-complete' : ''}`}>
                    <div className="lib-card-icon" style={{ background: isPaidFull ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.05)', borderColor: isPaidFull ? 'var(--success)' : 'var(--error)' }}>
                      <IndianRupee size={28} className="neon-text" />
                    </div>
                    <div className="lib-card-body">
                      <span className="terminal-readout">{course?.shortName || 'GENERAL'}</span>
                      <h4 style={{ fontSize: '18px', margin: '8px 0' }}>{f.studentName || (data?.users || []).find(u => u.id === f.studentId)?.name || 'Unknown Student'}</h4>
                      
                      <div className="financial-stats" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                        <div className="f-stat" style={{ display: 'flex', flexDirection: 'column' }}>
                          <span className="f-label" style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>TOTAL FEE</span>
                          <span className="f-value" style={{ fontSize: '14px', fontWeight: 700 }}>₹{f.total.toLocaleString()}</span>
                        </div>
                        <div className="f-stat" style={{ display: 'flex', flexDirection: 'column' }}>
                          <span className="f-label" style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>COLLECTED</span>
                          <span className="f-value neon-text" style={{ fontSize: '14px', fontWeight: 700 }}>₹{f.paid.toLocaleString()}</span>
                        </div>
                      </div>

                      <div className="lib-card-footer" style={{ borderTop: '1px solid var(--border-light)', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className={`elite-status ${isPaidFull ? 'active' : 'pending'}`} style={{ fontSize: '11px' }}>
                          {isPaidFull ? 'NODE.PAID' : `DUE: ₹${f.pending.toLocaleString()}`}
                        </span>
                        <button className="preview-trigger-btn" onClick={() => alert('EMI Plan & Receipt generation feature coming soon.')}>
                          <ClipboardList size={14} /> Manage
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="section-card">
              <div className="card-header">
                <h3>Transactional History</h3>
              </div>
              <div className="table-wrapper">
                <table className="elite-table">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Plan</th>
                      <th>Method</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPayments.map(p => (
                      <tr key={p.id} className="industrial-row">
                        <td><strong>{p.studentName}</strong></td>
                        <td><span className="plan-badge hud-card">{p.plan}</span></td>
                        <td><span className="badge badge-primary terminal-readout">{p.method}</span></td>
                        <td className="amount-cell terminal-readout neon-text">₹{p.amount.toLocaleString()}</td>
                        <td>
                          <span className={`elite-status ${p.status} terminal-readout`}>
                            {p.status === 'completed' ? 'NODE.PAID' : p.status === 'pending' ? 'NODE.AWAIT' : 'NODE.VOID'}
                          </span>
                        </td>
                        <td>
                          <div className="action-row">
                            {p.status === 'completed' && (
                              <button className="elite-btn-text danger" onClick={() => handleRefund(p.id)}>Void Transaction</button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredPayments.length === 0 && (
                      <tr><td colSpan="6" className="empty-td">No recent transactions logged.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* ═══════════════════ TAB 10: ADMIN SECURITY ═══════════════════ */}
        {activeTab === 'security' && (
          <section className="profile-focus animate-slideUp">
            <div className="profile-header-art">
              <div className="avatar-shield"><Shield size={48} /></div>
              <h2>Admin Security Panel</h2>
              <p>Manage your credentials and personal information</p>
            </div>
            <form className="elite-form" onSubmit={handleProfileSave}>
              <div className="security-section">
                <h4 className="section-title"><User size={16} /> Personal Information</h4>
                <div className="form-grid-2">
                  <div className="input-group">
                    <label>Display Name</label>
                    <input value={profileData.name} onChange={e => setProfileData({ ...profileData, name: e.target.value })} />
                  </div>
                  <div className="input-group">
                    <label><Mail size={12} /> Email Address</label>
                    <input type="email" value={profileData.email} onChange={e => setProfileData({ ...profileData, email: e.target.value })} />
                  </div>
                  <div className="input-group" style={{ gridColumn: 'span 2' }}>
                    <label><Phone size={12} /> Phone Number</label>
                    <input type="tel" value={profileData.phone} onChange={e => setProfileData({ ...profileData, phone: e.target.value })} placeholder="+91 XXXXX XXXXX" />
                  </div>
                </div>
              </div>

              <div className="security-section">
                <h4 className="section-title"><Lock size={16} /> Change Password</h4>
                <div className="form-grid-2">
                  <div className="input-group" style={{ gridColumn: 'span 2' }}>
                    <label>Current Password</label>
                    <input type="password" value={profileData.currentPassword} onChange={e => setProfileData({ ...profileData, currentPassword: e.target.value })} placeholder="Enter current password" />
                  </div>
                  <div className="input-group">
                    <label>New Password</label>
                    <input type="password" value={profileData.newPassword} onChange={e => setProfileData({ ...profileData, newPassword: e.target.value })} placeholder="Enter new password" />
                  </div>
                  <div className="input-group">
                    <label>Confirm New Password</label>
                    <input type="password" value={profileData.confirmPassword} onChange={e => setProfileData({ ...profileData, confirmPassword: e.target.value })} placeholder="Confirm new password" />
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="elite-btn-primary full">
                  <Shield size={18} /> Update Security Settings
                </button>
              </div>
            </form>
          </section>
        )}
      </div>

      {/* ═══════════════════ MODALS ═══════════════════ */}

      {/* Teacher Creation Modal */}
      {showTeacherModal && (
        <div className="elite-modal-overlay" onClick={() => setShowTeacherModal(false)}>
          <div className="elite-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-top">
              <h3>Deploy New Faculty</h3>
              <p>Create login credentials for teaching staff. Only admin can create teacher accounts.</p>
            </div>
            <form onSubmit={handleCreateTeacher}>
              <div className="input-group">
                <label>Full Name</label>
                <input required value={newTeacher.name} onChange={e => setNewTeacher({ ...newTeacher, name: e.target.value })} placeholder="e.g. Dr. Ramesh Babu" />
              </div>
              <div className="input-group">
                <label>Email Address</label>
                <input required type="email" value={newTeacher.email} onChange={e => setNewTeacher({ ...newTeacher, email: e.target.value })} placeholder="faculty@rvlh.edu" />
              </div>
              <div className="input-group">
                <label>Phone Number</label>
                <input type="tel" value={newTeacher.phone} onChange={e => setNewTeacher({ ...newTeacher, phone: e.target.value })} placeholder="+91 XXXXX XXXXX" />
              </div>
              <div className="input-group">
                <label>Initial Password</label>
                <input required type="text" value={newTeacher.password} onChange={e => setNewTeacher({ ...newTeacher, password: e.target.value })} placeholder="Temporary password" />
              </div>
              <div className="input-group">
                <label>Domain Expertise</label>
                <select value={newTeacher.subject} onChange={e => setNewTeacher({ ...newTeacher, subject: e.target.value })} className="form-select">
                  <option value="">Select Subject...</option>
                  <option value="Physics">Physics</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Biology">Biology</option>
                  <option value="Commerce">Commerce</option>
                  <option value="General">General</option>
                </select>
              </div>
              <button type="submit" className="elite-btn-primary full">Authorize & Deploy</button>
            </form>
          </div>
        </div>
      )}

      {/* Announcement Modal */}
      {showAnnounceModal && (
        <div className="elite-modal-overlay" onClick={() => setShowAnnounceModal(false)}>
          <div className="elite-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-top">
              <h3>New Announcement</h3>
              <p>Broadcast a message to your selected audience.</p>
            </div>
            <form onSubmit={handleCreateAnnouncement}>
              <div className="input-group">
                <label>Title</label>
                <input required value={newAnnouncement.title} onChange={e => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })} placeholder="Announcement headline" />
              </div>
              <div className="input-group">
                <label>Audience</label>
                <select value={newAnnouncement.audience} onChange={e => setNewAnnouncement({ ...newAnnouncement, audience: e.target.value })} className="form-select">
                  <option value="both">Everyone (Faculty + Students)</option>
                  <option value="faculty">Faculty Only</option>
                  <option value="student">Students Only</option>
                </select>
              </div>
              <div className="input-group">
                <label>Severity</label>
                <select value={newAnnouncement.type} onChange={e => setNewAnnouncement({ ...newAnnouncement, type: e.target.value })} className="form-select">
                  <option value="info">General Info</option>
                  <option value="warning">Important Warning</option>
                  <option value="error">Critical Alert</option>
                </select>
              </div>
              <div className="input-group">
                <label>Message</label>
                <textarea required value={newAnnouncement.content} onChange={e => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })} placeholder="Type your announcement..." rows={4} className="modal-textarea" />
              </div>
              <button type="submit" className="elite-btn-primary full">Broadcast Announcement</button>
            </form>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewItem && (
        <div className="elite-modal-overlay" onClick={() => setPreviewItem(null)}>
          <div className="elite-modal preview-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-top">
              <div className="preview-header-row">
                <h3>{previewItem.title}</h3>
                <button className="tool-btn" onClick={() => setPreviewItem(null)}><X size={20} /></button>
              </div>
              <p>By {previewItem.teacherName || (data?.users || []).find(u => u.id === previewItem.teacherId)?.name || 'Unknown'} • {previewItem.subject}</p>
            </div>
            <div className="preview-body">
              {(previewItem.type === 'video' || previewItem.itemType === 'video') ? (
                <div className="preview-video-wrap">
                  {previewItem.url && previewItem.url.includes('youtube') ? (
                    <iframe src={previewItem.url} title={previewItem.title} allowFullScreen className="preview-iframe"></iframe>
                  ) : (
                    <div className="preview-placeholder">
                      <Video size={48} />
                      <p>Video Preview</p>
                      <span className="preview-url">{previewItem.url || 'No URL provided'}</span>
                      {previewItem.duration && <span className="preview-duration">Duration: {previewItem.duration}</span>}
                    </div>
                  )}
                </div>
              ) : (
                <div className="preview-material-wrap">
                  <FileText size={48} />
                  <p className="preview-mat-title">{previewItem.title}</p>
                  <span className="preview-file-type">{previewItem.fileType || 'Document'}</span>
                  {previewItem.url && previewItem.url !== '#' && <a href={previewItem.url} target="_blank" rel="noopener noreferrer" className="preview-link">Open Document</a>}
                </div>
              )}
            </div>
            <div className="preview-info-row">
              <span className={`meta-tag ${previewItem.type || previewItem.itemType}`}>{previewItem.type || previewItem.itemType}</span>
              <span className="preview-date">Uploaded: {formatDate(previewItem.createdAt)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
