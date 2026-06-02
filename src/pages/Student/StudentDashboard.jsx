import { useState, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import {
  Video, FileText, Brain, Bell, BarChart3, User, Play, Lock,
  Crown, Download, BookMarked, ClipboardList, FlaskConical,
  CheckCircle, Star, Zap, Flame, Filter, Search, AlertCircle,
  Info, Eye, EyeOff, Save, Award, Target, BookOpen, Shield,
  Sparkles, ArrowRight, TrendingUp, LogOut, ChevronRight, Radio, Calendar, LayoutDashboard, MessageSquare, Send
} from 'lucide-react';
import CoursePaymentModal from '../../components/Payment/CoursePaymentModal';
import './Dashboard.css';

const TAB_MAP = {
  '/student':               { id: 'dashboard',     label: 'Dashboard',      desc: 'Overview & quick stats' },
  '/student/courses':       { id: 'courses',       label: 'Courses',        desc: 'Your enrolled courses' },
  '/student/videos':        { id: 'videos',        label: 'Video Lectures', desc: 'Watch & learn' },
  '/student/live':           { id: 'live',          label: 'Live Class',     desc: 'Scheduled sessions' },
  '/student/quizzes':       { id: 'quizzes',       label: 'Mock Quiz',      desc: 'Practice & AI quizzes' },
  '/student/doubts':         { id: 'doubts',        label: 'Doubts',         desc: 'Ask & resolve doubts' },
  '/student/materials':     { id: 'materials',     label: 'Material',       desc: 'Notes & formula sheets' },
  '/student/announcements': { id: 'announcements', label: 'Announcements',  desc: 'Notices & updates' },
  '/student/grading':       { id: 'grading',       label: 'Grading',        desc: 'Your performance' },
  '/student/settings':      { id: 'profile',       label: 'Profile',        desc: 'Account settings' },
};

const MAT_CATS = [
  { id: 'all',     label: 'All',              icon: FileText,     free: false },
  { id: 'course',  label: 'Course Material',  icon: BookMarked,   free: false },
  { id: 'pyqp',    label: 'Prev Year Papers', icon: ClipboardList,free: false },
  { id: 'formula', label: 'Formula Sheets',   icon: FlaskConical, free: true  },
];

export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const { data, updateEntity, addEntity } = useStore();
  const navigate = useNavigate();
  const location = useLocation();

  const currentTab = TAB_MAP[location.pathname] || TAB_MAP['/student'];
  const activeTab = currentTab.id;
  const [matCat,       setMatCat]       = useState('all');
  const [subjectFilter,setSubjectFilter]= useState('all');
  const [search,       setSearch]       = useState('');
  const [showPwd,      setShowPwd]      = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [profile,      setProfile]      = useState({
    name: user?.name || '', email: user?.email || '',
    newPassword: '', confirmPassword: '',
  });
  const [doubtForm, setDoubtForm] = useState({ question: '', category: 'General', teacherId: '', refType: '', refId: '' });
  const [doubtSent, setDoubtSent] = useState(false);
  const [unlockingCourse, setUnlockingCourse] = useState(null);
  const [resumeVideoIndex, setResumeVideoIndex] = useState(0);
  const [doubtError, setDoubtError] = useState('');
  const [gradeViewMode, setGradeViewMode] = useState('grid');
  const [expandedAnnounceIds, setExpandedAnnounceIds] = useState({});
  const [readAnnounceIds, setReadAnnounceIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('rvlh_read_announcements') || '[]');
    } catch {
      return [];
    }
  });

  const isRVLH    = user?.type === 'rvlh';
  const isPremium = isRVLH || user?.subscription === 'premium';
  
  const handleCourseUnlock = (course) => {
    const currentPurchased = user?.purchasedCourses || [];
    const updatedCourses = [...new Set([...currentPurchased, course.id])];
    updateEntity('users', user.id, { purchasedCourses: updatedCourses });
    setUnlockingCourse(null);
  };

  const isAnyLiveOngoing = useMemo(() => (data?.liveClasses || []).some(lc => lc.status === 'ongoing'), [data]);

  /* ─── derived lists ─── */
  const subjects = useMemo(() => {
    const s = new Set();
    (data?.videos    || []).filter(v => v.status === 'approved').forEach(v => v.subject && s.add(v.subject));
    (data?.materials || []).filter(m => m.status === 'approved').forEach(m => m.subject && s.add(m.subject));
    return [...s];
  }, [data]);

  const videos = useMemo(() => (data?.videos || []).filter(v =>
    v.status === 'approved' &&
    (subjectFilter === 'all' || v.subject === subjectFilter) &&
    (!search || v.title.toLowerCase().includes(search.toLowerCase()))
  ), [data, subjectFilter, search]);

  const materials = useMemo(() => (data?.materials || []).filter(m =>
    m.status === 'approved' &&
    (subjectFilter === 'all' || m.subject === subjectFilter) &&
    (matCat === 'all' || m.category === matCat) &&
    (!search || m.title.toLowerCase().includes(search.toLowerCase()))
  ), [data, subjectFilter, matCat, search]);

  const quizzes = useMemo(() => (data?.quizzes || []).filter(q =>
    (subjectFilter === 'all' || q.subject === subjectFilter) &&
    (!search || q.title.toLowerCase().includes(search.toLowerCase()))
  ), [data, subjectFilter, search]);

  const announcements = useMemo(() =>
    (data?.announcements || []).slice().sort((a,b) => new Date(b.date)-new Date(a.date)), [data]);

  const myResults = useMemo(() =>
    (data?.quizResults || []).filter(r => r.studentId === user?.id), [data, user]);

  /* ─── access helpers ─── */
  const canVideo    = (v, idx) => isPremium || user?.course === v.courseId || user?.purchasedCourses?.includes(v.courseId) || idx === 0;
  const canMaterial = (m)      => isPremium || user?.course === m.courseId || user?.purchasedCourses?.includes(m.courseId) || m.category === 'formula';
  const canQuiz     = ()       => isPremium || (user?.freeQuizzesLeft || 0) > 0;

  /* ─── grading ─── */
  const subjectGrades = useMemo(() => {
    const acc = {};
    myResults.forEach(r => {
      const k = r.subject || 'General';
      if (!acc[k]) acc[k] = { marks: 0, total: 0, count: 0 };
      acc[k].marks += Number(r.score) || 0;
      acc[k].total += 100;
      acc[k].count += 1;
    });
    return Object.entries(acc).map(([subject, v]) => {
      const avg = Math.round(v.marks / v.count);
      const grade = avg>=90?'A+': avg>=80?'A': avg>=70?'B': avg>=60?'C':'D';
      return { subject, ...v, avg, grade };
    });
  }, [myResults]);

  const overallAvg = subjectGrades.length
    ? Math.round(subjectGrades.reduce((s,g) => s+g.avg, 0) / subjectGrades.length) : 0;

  const handleSave = () => {
    if (profile.newPassword && profile.newPassword !== profile.confirmPassword) {
      alert('Passwords do not match!'); return;
    }
    updateEntity('users', user.id, {
      name: profile.name, email: profile.email,
      ...(profile.newPassword ? { password: profile.newPassword } : {}),
    });
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3000);
  };

  /* ─── helpers ─── */
  const CourseName = (id) => (data?.courses||[]).find(c=>c.id===id)?.shortName || 'General';
  const TeacherName= (id) => (data?.users   ||[]).find(u=>u.id===id)?.name     || 'Faculty';
  const GradeColor = (g)  => ({
    'A+':'#10b981','A':'var(--primary-400)','B':'#3b82f6','C':'#f59e0b','D':'var(--error)'
  })[g] || 'var(--text-tertiary)';

  return (
    <div className="stu-dashboard">

      {/* ══════════════════════════════════════
          MAIN CONTENT (sidebar is global)
          ══════════════════════════════════════ */}
      <main className="stu-main-content">

        {/* Page header */}
        <div className="stu-content-header">
          <div>
            <h1 className="stu-content-title">
              {currentTab.label}
            </h1>
            <p className="stu-content-subtitle">
              {currentTab.desc}
              {!isRVLH && activeTab === 'videos'    && ' · 1 video free for outside students'}
              {!isRVLH && activeTab === 'materials' && ' · Only Formula Sheets are free'}
            </p>
          </div>

          {/* Filters — shown on content tabs */}
          {['videos','materials','quizzes'].includes(activeTab) && (
            <div className="stu-content-filters">
              <div className="filter-dropdown">
                <Filter size={13} />
                <select className="form-select" value={subjectFilter}
                  onChange={e => setSubjectFilter(e.target.value)}>
                  <option value="all">All Subjects</option>
                  {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="hub-search">
                <Search size={14} />
                <input className="form-input" placeholder="Search…" value={search}
                  onChange={e => setSearch(e.target.value)} />
              </div>
            </div>
          )}
        </div>

        <div className="stu-content-body">

          {/* ── DASHBOARD (Overview) ── */}
          {activeTab === 'dashboard' && (
            <>
              <div className="stu-welcome-card">
                <div className="stu-welcome-left">
                  <h2>Welcome back, {user?.name?.split(' ')[0]}! 👋</h2>
                  <p>Here's a quick overview of your learning progress.</p>
                </div>
                {isRVLH && <span className="stu-type-badge rvlh"><Crown size={11}/> RVLH Student</span>}
              </div>

              <div className="stu-dash-grid">
                <div className="stu-dash-main">
                  {/* Resume Learning */}
                  <div className="stu-resume-card hud-serious-border">
                    <div className="stu-resume-header">
                      <TrendingUp size={18} color="var(--primary-400)" />
                      <span>Resume Learning</span>
                    </div>
                    {videos.length > 0 ? (
                      <div>
                        {(() => {
                          const activeVideo = videos[resumeVideoIndex % videos.length] || videos[0];
                          const mockProgress = activeVideo.id === 'vid-1' ? 75 : activeVideo.id === 'vid-2' ? 30 : 45;
                          return (
                            <div className="stu-resume-body animate-fadeIn">
                              <div className="stu-resume-thumb">
                                <img src={activeVideo.thumbnail || `https://picsum.photos/seed/${activeVideo.id}/200/120`} alt="" />
                                <button className="stu-resume-play" onClick={() => navigate(`/student/video/${activeVideo.id}`)}>
                                  <Play size={16} fill="white" />
                                </button>
                              </div>
                              <div className="stu-resume-info">
                                <h4>{activeVideo.title}</h4>
                                <p>{activeVideo.subject} · {CourseName(activeVideo.courseId)}</p>
                                <div className="stu-resume-progress-box">
                                  <div className="stu-resume-progress-bar"><div className="stu-resume-progress-fill" style={{ width: `${mockProgress}%` }} /></div>
                                  <span>{mockProgress}% completed</span>
                                </div>
                                {videos.length > 1 && (
                                  <div className="stu-resume-dots" style={{ display: 'flex', gap: '6px', marginTop: '12px' }}>
                                    {videos.slice(0, 3).map((v, idx) => (
                                      <button
                                        key={v.id}
                                        className={`stu-dot-btn ${resumeVideoIndex === idx ? 'active' : ''}`}
                                        style={{
                                          width: resumeVideoIndex === idx ? '18px' : '6px',
                                          height: '6px',
                                          borderRadius: '3px',
                                          background: resumeVideoIndex === idx ? 'var(--primary-400)' : 'var(--text-tertiary)',
                                          border: 'none',
                                          cursor: 'pointer',
                                          padding: 0,
                                          transition: 'all 0.25s ease'
                                        }}
                                        onClick={() => setResumeVideoIndex(idx)}
                                      />
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    ) : (
                      <p className="stu-empty-note">Start your first lesson to see progress here!</p>
                    )}
                  </div>

                  <h3 className="stu-section-label" style={{ marginTop: '24px' }}>📚 Quick Actions</h3>
                  <div className="stu-quick-actions">
                    <button className="stu-quick-btn" onClick={() => navigate('/student/videos')}>
                      <Video size={20} /> Watch Videos
                    </button>
                    <button className="stu-quick-btn" onClick={() => navigate('/student/quizzes')}>
                      <Brain size={20} /> Take a Quiz
                    </button>
                    <button className="stu-quick-btn" onClick={() => navigate('/student/materials')}>
                      <FileText size={20} /> Study Material
                    </button>
                    <button className="stu-quick-btn" onClick={() => navigate('/student/grading')}>
                      <BarChart3 size={20} /> View Grades
                    </button>
                  </div>
                </div>

                <div className="stu-dash-side">
                  {/* Stats */}
                  <div className="stu-side-stats-grid">
                    {[
                      { label: 'Streak', val: user?.streak || 0, icon: Flame, color: '#f59e0b', suffix: '🔥' },
                      { label: 'Avg Score', val: overallAvg ? `${overallAvg}%` : '—', icon: Award, color: 'var(--primary-400)' },
                    ].map(s => (
                      <div key={s.label} className="stu-side-stat-card">
                        <s.icon size={18} color={s.color} />
                        <div>
                          <span className="stu-side-stat-val">{s.val} {s.suffix || ''}</span>
                          <span className="stu-side-stat-lbl">{s.label}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Upcoming Live */}
                  <div className="stu-side-widget hud-serious-border">
                    <div className="stu-widget-header">
                      <Radio size={16} color="var(--error)" className={isAnyLiveOngoing ? 'live-dot-pulse' : ''} />
                      <span>Live Classes</span>
                    </div>
                    <div className="stu-widget-body">
                      {(data?.liveClasses || []).filter(lc => lc.status !== 'completed').slice(0, 2).map(lc => (
                        <div key={lc.id} className="stu-mini-live">
                          <div className="stu-ml-time">
                            <strong>{lc.time}</strong>
                            <span>{lc.status === 'ongoing' ? 'NOW' : 'TODAY'}</span>
                          </div>
                          <div className="stu-ml-info">
                            <span className="stu-ml-title">{lc.title}</span>
                            <span className="stu-ml-meta">{TeacherName(lc.teacherId)}</span>
                          </div>
                          <ChevronRight size={14} color="var(--text-tertiary)" />
                        </div>
                      ))}
                      {(data?.liveClasses || []).filter(lc => lc.status !== 'completed').length === 0 && (
                        <p className="stu-empty-note">No live classes today</p>
                      )}
                    </div>
                    <button className="stu-widget-more" onClick={() => navigate('/student/live')}>
                      View schedule <ArrowRight size={12} />
                    </button>
                  </div>

                  {/* Daily Tip */}
                  <div className="stu-tip-card">
                    <Sparkles size={16} color="var(--primary-400)" />
                    <p>"Consistency is the key to mastering any subject. Keep going!"</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ── COURSES ── */}
          {activeTab === 'courses' && (
            <>
              <div className="stu-courses-grid">
                {(data?.courses || []).map(course => {
                  const isEnrolled = user?.course === course.id || user?.purchasedCourses?.includes(course.id);
                  return (
                    <div key={course.id} className={`stu-course-card ${isEnrolled ? 'enrolled' : 'locked-course'}`}>
                      <div className="stu-course-gradient" style={{ background: course.gradient }} />
                      <div className="stu-course-body">
                        <div className="stu-course-header-row">
                          <h3>{course.name}</h3>
                          {isEnrolled
                            ? <span className="stu-enrolled-badge"><CheckCircle size={12}/> Enrolled</span>
                            : <span className="stu-locked-badge"><Lock size={12}/> Locked</span>
                          }
                        </div>
                        <p className="stu-course-desc">{course.description}</p>
                        <div className="stu-course-stats-row">
                          <span><Video size={13}/> {(data?.videos||[]).filter(v => v.courseId === course.id && v.status === 'approved').length} Videos</span>
                          <span><FileText size={13}/> {(data?.materials||[]).filter(m => m.courseId === course.id && m.status === 'approved').length} Materials</span>
                        </div>
                        {isEnrolled ? (
                          <button className="btn btn-primary btn-sm" style={{ width: '100%', marginTop: '12px' }}
                            onClick={() => navigate('/student/videos')}>
                            <Play size={14}/> Continue Learning
                          </button>
                        ) : (
                          <button className="btn-buy-course btn-sm" style={{ width: '100%', marginTop: '12px', display: 'flex', justifyContent: 'center' }} onClick={() => setUnlockingCourse(course)}>
                            <Crown size={14}/> Unlock Course
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* ── VIDEOS ── */}
          {activeTab === 'videos' && (
            <>
              {!isRVLH && (
                <div className="stu-access-banner info-banner">
                  <CheckCircle size={14} color="var(--success)" />
                  <span>First video is free. <Link to="/student/subscription" state={{ showPayment: true }}>Upgrade</Link> for full access.</span>
                </div>
              )}
              <div className="stu-videos-grid">
                {videos.map((video, idx) => {
                  const unlocked = canVideo(video, idx);
                  return (
                    <div key={video.id} className={`stu-video-card ${!unlocked ? 'locked' : ''}`}>
                      <div className="stu-video-thumb">
                        <img src={video.thumbnail || `https://picsum.photos/seed/${video.id}/400/220`} alt={video.title} />
                        <div className="stu-video-play-overlay">
                          {unlocked
                            ? <button className="stu-play-btn" onClick={() => navigate(`/student/video/${video.id}`)}><Play size={22} fill="white" /></button>
                            : <Link to="/student/subscription" state={{ showPayment: true }} className="stu-play-btn locked"><Lock size={18} color="#fbbf24" /></Link>}
                        </div>
                        {!isRVLH && idx === 0 && <span className="badge-free">FREE</span>}
                        {!unlocked            && <span className="badge-paid"><Crown size={9}/> PAID</span>}
                        {video.duration       && <span className="badge-duration">{video.duration}</span>}
                      </div>
                      <div className="stu-video-info">
                        <div className="stu-pill-row">
                          {video.subject && <span className="pill-subject">{video.subject}</span>}
                          <span className="pill-course">{CourseName(video.courseId)}</span>
                        </div>
                        <h4 className="stu-video-title">{video.title}</h4>
                        <p className="stu-video-teacher">by {TeacherName(video.teacherId)}</p>
                        {unlocked && (
                          <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                            <button className="btn btn-primary btn-sm" style={{ flex: 1 }}
                              onClick={() => navigate(`/student/video/${video.id}`)}>
                              <Play size={13} /> Watch
                            </button>
                          </div>
                        )}
                        {!unlocked && (
                          <button 
                            className="btn-buy-course btn-sm" 
                            style={{ marginTop: '10px', display: 'flex', justifyContent: 'center', width: '100%' }}
                            onClick={() => setUnlockingCourse(data?.courses?.find(c => c.id === video.courseId))}
                          >
                            <Crown size={13} /> Unlock Course
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
                {videos.length === 0 && (
                  <div className="stu-empty-state">
                    <Video size={48} />
                    <p>No videos available yet. Check back soon!</p>
                  </div>
                )}
              </div>
            </>
          )}

          {/* ── LIVE CLASS ── */}
          {activeTab === 'live' && (() => {
            const liveClasses = (data?.liveClasses || []).filter(lc => {
              // Show classes for the student's enrolled course, or all if no course filter
              return !user?.course || lc.courseId === user.course || !lc.courseId;
            });
            const ongoing = liveClasses.filter(lc => lc.status === 'ongoing');
            const upcoming = liveClasses.filter(lc => lc.status === 'upcoming');
            const completed = liveClasses.filter(lc => lc.status === 'completed');
            const teacherName = (id) => (data?.users || []).find(u => u.id === id)?.name || 'Teacher';
            const courseName = (id) => (data?.courses || []).find(c => c.id === id)?.shortName || '';

            return (
              <>
                {/* Ongoing – pulsing live */}
                {ongoing.length > 0 && (
                  <>
                    <h3 className="stu-section-label" style={{ color: 'var(--error)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="live-dot-pulse" /> Live Now
                    </h3>
                    <div className="stu-live-grid">
                      {ongoing.map(lc => (
                        <div key={lc.id} className="stu-live-card ongoing">
                          <div className="stu-live-badge live"><Radio size={12}/> LIVE</div>
                          <h4>{lc.title}</h4>
                          <p className="stu-live-meta">{teacherName(lc.teacherId)} · {courseName(lc.courseId)}</p>
                          <p className="stu-live-time"><Calendar size={13}/> Today at {lc.time}</p>
                          <Link to={`/student/live-room/${lc.id}`} className="btn btn-primary btn-sm" style={{ width: '100%', marginTop: '10px' }}>
                            <Radio size={14}/> Join Now
                          </Link>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {/* Upcoming */}
                {upcoming.length > 0 && (
                  <>
                    <h3 className="stu-section-label" style={{ marginTop: ongoing.length > 0 ? '28px' : '0' }}>📅 Upcoming Classes</h3>
                    <div className="stu-live-grid">
                      {upcoming.map(lc => (
                        <div key={lc.id} className="stu-live-card upcoming">
                          <div className="stu-live-badge upcoming-badge">Upcoming</div>
                          <h4>{lc.title}</h4>
                          <p className="stu-live-meta">{teacherName(lc.teacherId)} · {courseName(lc.courseId)}</p>
                          <p className="stu-live-time"><Calendar size={13}/> {lc.date ? new Date(lc.date).toLocaleDateString() : 'TBA'} at {lc.time}</p>
                          <button className="btn btn-secondary btn-sm" disabled style={{ width: '100%', marginTop: '10px', opacity: 0.6 }}>
                            Starts Soon
                          </button>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {/* Completed */}
                {completed.length > 0 && (
                  <>
                    <h3 className="stu-section-label" style={{ marginTop: '28px' }}>✅ Past Classes</h3>
                    <div className="stu-live-grid">
                      {completed.map(lc => (
                        <div key={lc.id} className="stu-live-card past">
                          <div className="stu-live-badge past-badge">Completed</div>
                          <h4>{lc.title}</h4>
                          <p className="stu-live-meta">{teacherName(lc.teacherId)} · {courseName(lc.courseId)}</p>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {liveClasses.length === 0 && (
                  <div className="stu-empty-state">
                    <Radio size={48} />
                    <p>No live classes scheduled yet. Your teachers will schedule sessions soon!</p>
                  </div>
                )}
              </>
            );
          })()}


          {/* ── DOUBTS ── */}
          {activeTab === 'doubts' && (() => {
            const myDoubts = (data?.doubts || []).filter(d => d.studentId === user?.id);
            const teachers = (data?.users || []).filter(u => u.role === 'teacher');
            const approvedVids = (data?.videos || []).filter(v => v.status === 'approved');
            const approvedMats = (data?.materials || []).filter(m => m.status === 'approved');
            const pendingCount = myDoubts.filter(d => d.status === 'pending').length;
            const resolvedCount = myDoubts.filter(d => d.status === 'resolved').length;

            const timeAgo = (dateStr) => {
              if (!dateStr) return '';
              const diff = Date.now() - new Date(dateStr).getTime();
              const mins = Math.floor(diff / 60000);
              if (mins < 1) return 'Just now';
              if (mins < 60) return `${mins}m ago`;
              const hrs = Math.floor(mins / 60);
              if (hrs < 24) return `${hrs}h ago`;
              return `${Math.floor(hrs / 24)}d ago`;
            };

            const handleSubmitDoubt = () => {
              const qText = doubtForm.question.trim();
              if (!qText) return;
              if (qText.length < 15) {
                setDoubtError('Your question must be at least 15 characters long to describe the doubt clearly.');
                return;
              }
              setDoubtError('');
              const targetTeacher = doubtForm.teacherId || teachers[0]?.id || '';
              addEntity('doubts', {
                studentId: user?.id, studentName: user?.name,
                question: doubtForm.question, category: doubtForm.category,
                teacherId: targetTeacher,
                refType: doubtForm.refType || null, refId: doubtForm.refId || null,
                reply: '', status: 'pending', image: null,
              });
              setDoubtForm({ question: '', category: 'General', teacherId: '', refType: '', refId: '' });
              setDoubtSent(true);
              setTimeout(() => setDoubtSent(false), 3000);
            };

            return (
              <>
                {/* Quick Stats */}
                <div className="doubt-stats-row">
                  <div className="doubt-stat-chip"><MessageSquare size={18} color="var(--primary-400)" /><div><span className="doubt-stat-num">{myDoubts.length}</span><span className="doubt-stat-lbl">Total</span></div></div>
                  <div className="doubt-stat-chip"><AlertCircle size={18} color="#f59e0b" /><div><span className="doubt-stat-num">{pendingCount}</span><span className="doubt-stat-lbl">Awaiting</span></div></div>
                  <div className="doubt-stat-chip"><CheckCircle size={18} color="var(--success)" /><div><span className="doubt-stat-num">{resolvedCount}</span><span className="doubt-stat-lbl">Answered</span></div></div>
                </div>

                {/* Ask New Doubt */}
                <div className="doubt-form-wrapper">
                  <div className="doubt-form-header">
                    <div className="doubt-form-icon"><MessageSquare size={20} /></div>
                    <div><h3>Ask a New Doubt</h3><p>Your teacher will receive this and reply as soon as possible</p></div>
                  </div>

                  {doubtSent && (
                    <div className="doubt-success-toast"><CheckCircle size={16} /><span><strong>Doubt submitted!</strong> Your teacher will reply soon. Check back here for the response.</span></div>
                  )}

                  {doubtError && (
                    <div className="doubt-error-banner" style={{ background: 'rgba(239,68,68,0.08)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)', padding: '10px 14px', borderRadius: '10px', marginBottom: '14px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <AlertCircle size={14} /> <span>{doubtError}</span>
                    </div>
                  )}

                  <div className="doubt-form-body">
                    <label className="doubt-field-label">Your Question</label>
                    <textarea className="doubt-input-area"
                      placeholder={'E.g., "In the Laws of Motion video at 15:30, I didn\'t understand the derivation of F=ma for variable mass systems. Can you explain step by step?"'}
                      value={doubtForm.question} onChange={e => { setDoubtForm(p => ({ ...p, question: e.target.value })); if(e.target.value.length >= 15) setDoubtError(''); }} rows={4} maxLength={500} />
                    
                    <span className="char-counter" style={{ fontSize: '10px', color: 'var(--text-tertiary)', alignSelf: 'flex-end', marginTop: '-8px', marginBottom: '12px' }}>
                      {doubtForm.question.length} / 500 characters
                    </span>

                    <div className="doubt-options-grid">
                      <div className="doubt-field">
                        <label className="doubt-field-label">Subject</label>
                        <select className="doubt-select" value={doubtForm.category} onChange={e => setDoubtForm(p => ({ ...p, category: e.target.value }))}>
                          {['General', 'Physics', 'Chemistry', 'Mathematics', 'Biology'].map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div className="doubt-field">
                        <label className="doubt-field-label">Send To</label>
                        <select className="doubt-select" value={doubtForm.teacherId} onChange={e => setDoubtForm(p => ({ ...p, teacherId: e.target.value }))}>
                          <option value="">Auto-assign best teacher</option>
                          {teachers.map(t => <option key={t.id} value={t.id}>{t.name} — {t.subject}</option>)}
                        </select>
                      </div>
                      <div className="doubt-field">
                        <label className="doubt-field-label">Related To</label>
                        <select className="doubt-select" value={doubtForm.refType} onChange={e => setDoubtForm(p => ({ ...p, refType: e.target.value, refId: '' }))}>
                          <option value="">Direct question (no reference)</option>
                          <option value="video">A specific video</option>
                          <option value="material">A specific material</option>
                        </select>
                      </div>
                      {doubtForm.refType === 'video' && (
                        <div className="doubt-field">
                          <label className="doubt-field-label">Which Video?</label>
                          <select className="doubt-select" value={doubtForm.refId} onChange={e => setDoubtForm(p => ({ ...p, refId: e.target.value }))}>
                            <option value="">— Pick a video —</option>
                            {approvedVids.map(v => <option key={v.id} value={v.id}>{v.title}</option>)}
                          </select>
                        </div>
                      )}
                      {doubtForm.refType === 'material' && (
                        <div className="doubt-field">
                          <label className="doubt-field-label">Which Material?</label>
                          <select className="doubt-select" value={doubtForm.refId} onChange={e => setDoubtForm(p => ({ ...p, refId: e.target.value }))}>
                            <option value="">— Pick a material —</option>
                            {approvedMats.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
                          </select>
                        </div>
                      )}
                    </div>

                    {doubtForm.question.trim().length > 0 && (
                      <div className="doubt-preview-box" style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed var(--border-light)', borderRadius: '12px', padding: '16px', marginTop: '16px', marginBottom: '16px' }}>
                        <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--primary-400)', textTransform: 'uppercase', tracking: '1px', display: 'block', marginBottom: '8px' }}>Live Preview</span>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                          <div style={{ width: '32px', height: '32px', borderRadius: '50%', overflow: 'hidden', border: '1px solid var(--border-light)', background: 'var(--surface-elevated)' }}>
                            <img src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '6px' }}>
                              <strong style={{ fontSize: '13px', color: 'var(--text-primary)' }}>{user?.name || 'You'}</strong>
                              <span style={{ fontSize: '10px', background: 'rgba(34,211,238,0.12)', color: 'var(--primary-400)', padding: '1px 6px', borderRadius: '4px', fontWeight: 600 }}>{doubtForm.category}</span>
                            </div>
                            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, whiteSpace: 'pre-wrap' }}>{doubtForm.question}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <button className="doubt-submit-btn" onClick={handleSubmitDoubt} disabled={!doubtForm.question.trim()}>
                      <Send size={16} /> Send My Doubt
                    </button>
                  </div>
                </div>

                {/* Doubts History */}
                <div className="doubt-history-header"><h3>My Doubt History</h3><span className="doubt-history-count">{myDoubts.length} {myDoubts.length === 1 ? 'doubt' : 'doubts'}</span></div>

                {myDoubts.length === 0 ? (
                  <div className="doubt-empty">
                    <div className="doubt-empty-icon"><MessageSquare size={40} /></div>
                    <h4>No doubts yet</h4>
                    <p>Ask your first question above — your teachers are ready to help!</p>
                  </div>
                ) : (
                  <div className="doubt-cards-list">
                    {[...myDoubts].reverse().map(d => {
                      const teacher = teachers.find(t => t.id === d.teacherId);
                      const refVideo = d.refType === 'video' ? approvedVids.find(v => v.id === d.refId) : null;
                      const refMat = d.refType === 'material' ? approvedMats.find(m => m.id === d.refId) : null;
                      const isResolved = d.status === 'resolved';
                      return (
                        <div key={d.id} className={`doubt-thread ${isResolved ? 'resolved' : 'pending'}`}>
                          <div className="doubt-msg doubt-msg-student">
                            <div className="doubt-msg-avatar"><img src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`} alt="" /></div>
                            <div className="doubt-msg-bubble">
                              <div className="doubt-msg-top">
                                <strong>You</strong>
                                <span className="doubt-msg-time">{timeAgo(d.createdAt)}</span>
                                <span className={`doubt-pill-status ${d.status}`}>
                                  {isResolved ? <><CheckCircle size={10}/> Answered</> : <><AlertCircle size={10}/> Awaiting</>}
                                </span>
                              </div>
                              <div className="doubt-msg-tags">
                                <span className="doubt-tag-subject">{d.category}</span>
                                {refVideo && <span className="doubt-tag-ref"><Video size={10}/> {refVideo.title}</span>}
                                {refMat && <span className="doubt-tag-ref"><FileText size={10}/> {refMat.title}</span>}
                                <span className="doubt-tag-teacher">To: {teacher?.name || 'Teacher'}</span>
                              </div>
                              <p className="doubt-msg-text">{d.question}</p>
                            </div>
                          </div>
                          {isResolved && d.reply && (
                            <div className="doubt-msg doubt-msg-teacher">
                              <div className="doubt-msg-avatar teacher-av"><img src={teacher?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${d.teacherId}`} alt="" /></div>
                              <div className="doubt-msg-bubble teacher-bubble">
                                <div className="doubt-msg-top"><strong>{teacher?.name || 'Teacher'}</strong><span className="doubt-msg-role">{teacher?.subject} Faculty</span></div>
                                <p className="doubt-msg-text">{d.reply}</p>
                              </div>
                            </div>
                          )}
                          {!isResolved && (
                            <div className="doubt-waiting">
                              <div className="doubt-waiting-dots"><span/><span/><span/></div>
                              <span>Waiting for {teacher?.name || 'teacher'} to respond...</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            );
          })()}

          {/* ── MATERIALS ── */}
          {activeTab === 'materials' && (
            <>
              {!isRVLH && (
                <div className="stu-access-banner info-banner">
                  <FlaskConical size={14} color="var(--success)" />
                  <span>Formula Sheets are free forever. <Link to="/student/subscription" state={{ showPayment: true }}>Upgrade</Link> for Course Material & PYQP.</span>
                </div>
              )}
              {/* Category pills */}
              <div className="stu-mat-cats">
                {MAT_CATS.map(c => (
                  <button key={c.id}
                    className={`stu-cat-pill ${matCat === c.id ? 'active' : ''}`}
                    onClick={() => setMatCat(c.id)}>
                    <c.icon size={14} /> {c.label}
                    {c.free && <span className="tag-free">FREE</span>}
                  </button>
                ))}
              </div>

              <div className="stu-materials-list">
                {materials.map(mat => {
                  const unlocked = canMaterial(mat);
                  const meta = {
                    course:  { label:'Course Material', color:'#3b82f6', Icon: BookMarked    },
                    pyqp:    { label:'Prev Year Paper',  color:'#f59e0b', Icon: ClipboardList },
                    formula: { label:'Formula Sheet',   color:'#8b5cf6', Icon: FlaskConical  },
                  }[mat.category] || { label:'Material', color:'#64748b', Icon: FileText };
                  return (
                    <div key={mat.id} className={`stu-material-row ${!unlocked ? 'locked' : ''}`}>
                      <div className="stu-mat-icon" style={{ background:`${meta.color}18`, color:meta.color, border:`1px solid ${meta.color}25` }}>
                        <meta.Icon size={24} />
                      </div>
                      <div className="stu-mat-body">
                        <div className="stu-pill-row" style={{ marginBottom: '4px' }}>
                          <span className="pill-type" style={{ background:`${meta.color}20`, color:meta.color }}>{meta.label}</span>
                          {mat.category === 'formula' && <span className="tag-free">FREE</span>}
                          {mat.subject && <span className="pill-subject">{mat.subject}</span>}
                        </div>
                        <h4 className="stu-mat-title">{mat.title}</h4>
                        <p className="stu-mat-meta">{CourseName(mat.courseId)} · by {TeacherName(mat.teacherId)}</p>
                      </div>
                      <div className="stu-mat-action">
                        {unlocked
                          ? <button className="btn btn-secondary btn-sm"><Download size={14}/> Download</button>
                          : <Link to="/student/subscription" state={{ showPayment: true }} className="btn-buy-course btn-sm"><Crown size={13}/> Upgrade</Link>}
                      </div>
                    </div>
                  );
                })}
                {materials.length === 0 && (
                  <div className="stu-empty-state">
                    <FileText size={48} />
                    <p>No materials found for this filter.</p>
                  </div>
                )}
              </div>
            </>
          )}

          {/* ── QUIZZES ── */}
          {activeTab === 'quizzes' && (
            <>
              {/* AI quiz callout */}
              <div className="stu-ai-callout">
                <Sparkles size={20} color="var(--primary-400)" />
                <div>
                  <strong>Generate AI Quiz from a Video</strong>
                  <p>Watch any video, then click <em>AI Quiz</em> on the video page to get a personalised quiz instantly.</p>
                </div>
                <button className="btn btn-secondary btn-sm" onClick={() => navigate('/student')}>
                  <Video size={14}/> Browse Videos <ArrowRight size={13}/>
                </button>
              </div>

              <h3 className="stu-section-label">📋 Teacher Quizzes</h3>

              {!isRVLH && (
                <div className="stu-access-banner warn-banner" style={{ marginBottom: '16px' }}>
                  <Lock size={14} color="var(--error)" />
                  <span>Teacher quizzes require Premium. <Link to="/student/subscription" state={{ showPayment: true }}>Upgrade now.</Link></span>
                </div>
              )}

              <div className="stu-quiz-grid">
                {quizzes.map(quiz => {
                  const accessible = isRVLH;
                  return (
                    <div key={quiz.id} className={`stu-quiz-card ${!accessible ? 'locked' : ''}`}>
                      <div className="stu-quiz-icon"><Brain size={26} color="var(--primary-400)" /></div>
                      <div className="stu-quiz-body">
                        {quiz.subject && <span className="pill-subject" style={{ marginBottom: '6px', display: 'inline-block' }}>{quiz.subject}</span>}
                        <h4 className="stu-quiz-title">{quiz.title}</h4>
                        <p className="stu-quiz-meta">
                          <Zap size={12}/> {quiz.questions?.length || 0} questions · by {TeacherName(quiz.teacherId)}
                        </p>
                      </div>
                      <div className="stu-quiz-action">
                        {accessible
                          ? <Link to={`/student/quiz/${quiz.id}?mode=teacher`} className="btn btn-primary btn-sm"><Play size={13}/> Start</Link>
                          : <Link to="/student/subscription" state={{ showPayment: true }} className="btn-buy-course btn-sm"><Crown size={13}/> Unlock</Link>}
                      </div>
                    </div>
                  );
                })}
                {quizzes.length === 0 && (
                  <div className="stu-empty-state" style={{ gridColumn: '1 / -1' }}>
                    <Brain size={48} />
                    <p>No teacher quizzes yet. Generate an AI quiz from any video!</p>
                  </div>
                )}
              </div>
            </>
          )}

          {/* ── ANNOUNCEMENTS ── */}
          {activeTab === 'announcements' && (
            <div className="stu-ann-list">
              {announcements.map(ann => {
                const isRead = readAnnounceIds.includes(ann.id);
                const isExpanded = !!expandedAnnounceIds[ann.id];
                
                const handleAnnounceClick = () => {
                  setExpandedAnnounceIds(prev => ({ ...prev, [ann.id]: !prev[ann.id] }));
                  if (!isRead) {
                    const nextRead = [...readAnnounceIds, ann.id];
                    setReadAnnounceIds(nextRead);
                    localStorage.setItem('rvlh_read_announcements', JSON.stringify(nextRead));
                  }
                };

                return (
                  <div
                    key={ann.id}
                    className={`stu-ann-card ${ann.type === 'warning' ? 'urgent' : ''} ${isRead ? 'read' : 'unread'}`}
                    style={{ cursor: 'pointer', transition: 'all 0.2s ease', opacity: isRead ? 0.7 : 1 }}
                    onClick={handleAnnounceClick}
                  >
                    <div className="stu-ann-line" />
                    <div className="stu-ann-icon">
                      {ann.type === 'warning' ? <AlertCircle size={20}/> : <Info size={20}/>}
                    </div>
                    <div className="stu-ann-body">
                      <div className="stu-ann-meta" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <span className={`ann-pill ${ann.type === 'warning' ? 'urgent' : 'info'}`}>
                            {ann.type === 'warning' ? '⚠ Important' : 'ℹ Notice'}
                          </span>
                          {!isRead && <span className="tag-new-pulse" style={{ background: 'var(--primary-400)', color: '#fff', fontSize: '9px', fontWeight: 800, padding: '1px 5px', borderRadius: '4px' }}>NEW</span>}
                        </div>
                        <span className="stu-ann-date">
                          {new Date(ann.date).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })}
                        </span>
                      </div>
                      <h3 className="stu-ann-title" style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>{ann.title}</span>
                        <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: 'normal' }}>{isExpanded ? 'Click to collapse' : 'Click to read'}</span>
                      </h3>
                      
                      {isExpanded ? (
                        <p className="stu-ann-content animate-fadeIn" style={{ whiteSpace: 'pre-wrap', marginTop: '8px' }}>{ann.content}</p>
                      ) : (
                        <p className="stu-ann-content" style={{ overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', marginTop: '8px' }}>{ann.content}</p>
                      )}

                      {ann.targetAudience && (
                        <span className="stu-ann-audience" style={{ display: 'block', marginTop: '8px' }}>📢 {ann.targetAudience === 'both' ? 'All Students & Faculty' : ann.targetAudience}</span>
                      )}
                    </div>
                  </div>
                );
              })}
              {announcements.length === 0 && (
                <div className="stu-empty-state">
                  <Bell size={48} />
                  <p>No announcements yet. You're all caught up!</p>
                </div>
              )}
            </div>
          )}

          {/* ── GRADING ── */}
          {activeTab === 'grading' && (
            <>
              {/* Overall card */}
              <div className="stu-grade-overview">
                <div className="stu-grade-big">
                  <Award size={40} color="var(--primary-400)" />
                  <div>
                    <span className="stu-grade-avg">{overallAvg > 0 ? `${overallAvg}%` : '—'}</span>
                    <span className="stu-grade-avg-label">Overall Average</span>
                  </div>
                </div>
                <div className="stu-grade-stats">
                  {[
                    { label:'Quizzes Taken',    val: myResults.length,     color:'#3b82f6' },
                    { label:'Subjects',          val: subjectGrades.length, color:'#10b981' },
                    { label:'Best Score',
                      val: subjectGrades.length ? Math.max(...subjectGrades.map(g=>g.avg))+'%' : '—',
                      color:'#f59e0b' },
                  ].map(s => (
                    <div key={s.label} className="stu-grade-stat">
                      <span className="stu-grade-stat-val" style={{ color: s.color }}>{s.val}</span>
                      <span className="stu-grade-stat-label">{s.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Subject cards */}
              {subjectGrades.length > 0 ? (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '28px', marginBottom: '16px' }}>
                    <h3 className="stu-section-label" style={{ margin: 0 }}>📊 Performance Reports</h3>
                    <div className="view-mode-toggles" style={{ display: 'flex', gap: '8px' }}>
                      <button
                        className={`btn btn-sm ${gradeViewMode === 'grid' ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                        onClick={() => setGradeViewMode('grid')}
                      >
                        <Award size={13} /> Subject Analytics
                      </button>
                      <button
                        className={`btn btn-sm ${gradeViewMode === 'table' ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                        onClick={() => setGradeViewMode('table')}
                      >
                        <ClipboardList size={13} /> Detailed History
                      </button>
                    </div>
                  </div>

                  {gradeViewMode === 'grid' ? (
                    <div className="stu-subject-grid animate-slideUp">
                      {subjectGrades.map(sg => (
                        <div key={sg.subject} className="stu-subject-card">
                          <div className="stu-sub-top">
                            <span className="pill-subject">{sg.subject}</span>
                            <span className="stu-sub-grade" style={{ color: GradeColor(sg.grade) }}>{sg.grade}</span>
                          </div>
                          <div className="stu-sub-marks">
                            <span className="stu-sub-scored" style={{ color: GradeColor(sg.grade) }}>{sg.marks}</span>
                            <span className="stu-sub-sep">/</span>
                            <span className="stu-sub-total">{sg.total}</span>
                            <span className="stu-sub-label">marks</span>
                          </div>
                          <div className="stu-sub-avg">{sg.avg}% · {sg.count} quiz{sg.count !== 1 ? 'zes' : ''}</div>
                          <div className="stu-sub-bar">
                            <div className="stu-sub-fill" style={{ width:`${sg.avg}%`, background: GradeColor(sg.grade) }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="stu-table-wrap animate-slideUp">
                      <table className="elite-table">
                        <thead>
                          <tr><th>Quiz / Video</th><th>Subject</th><th>Score</th><th>Marks</th><th>Grade</th><th>Date</th></tr>
                        </thead>
                        <tbody>
                          {[...myResults].reverse().map((r,i) => {
                            const q = (data?.quizzes||[]).find(x=>x.id===r.quizId);
                            const v = (data?.videos ||[]).find(x=>x.id===r.videoId);
                            const g = r.score>=90?'A+':r.score>=80?'A':r.score>=70?'B':r.score>=60?'C':'D';
                            return (
                              <tr key={i}>
                                <td><strong>{q?.title||v?.title||'AI Quiz'}</strong></td>
                                <td>{r.subject ? <span className="pill-subject">{r.subject}</span> : '—'}</td>
                                <td style={{ color:'var(--primary-400)', fontWeight:700 }}>{r.score}%</td>
                                <td style={{ fontFamily:'monospace', fontSize:'12px' }}>{r.score}/100</td>
                                <td><span className="stu-sub-grade" style={{ color: GradeColor(g) }}>{g}</span></td>
                                <td style={{ fontSize:'12px', color:'var(--text-tertiary)' }}>
                                  {r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-IN') : '—'}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              ) : (
                <div className="stu-empty-state" style={{ marginTop: '40px' }}>
                  <Target size={52} />
                  <p>No grades yet. Take a quiz to see your performance here!</p>
                  <button className="btn btn-primary btn-sm" onClick={() => navigate('/student/quizzes')}>
                    <Brain size={14}/> Go to Quizzes
                  </button>
                </div>
              )}
            </>
          )}

          {/* ── PROFILE ── */}
          {activeTab === 'profile' && (
            <div className="stu-profile-grid">
              {/* Left info card */}
              <div className="stu-profile-card">
                <img
                  src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`}
                  alt={user?.name} className="stu-profile-avatar" />
                <h3>{user?.name}</h3>
                <p className="stu-profile-email">{user?.email}</p>
                <div style={{ display:'flex', gap:'8px', flexWrap:'wrap', justifyContent:'center', marginTop:'10px' }}>
                  <span className={`stu-type-badge ${isRVLH ? 'rvlh':'outside'}`}>
                    {isRVLH ? <><Crown size={11}/> RVLH</> : <><User size={11}/> Outside</>}
                  </span>
                  <span className="stu-type-badge" style={{ background:'rgba(34,211,238,0.1)', color:'var(--primary-400)' }}>
                    <BookOpen size={11}/> {(data?.courses||[]).find(c=>c.id===user?.course)?.shortName || 'No Course'}
                  </span>
                </div>
                {isRVLH && (
                  <div className="stu-id-badge">
                    <Shield size={13}/> <span>ID: {user?.studentId}</span>
                  </div>
                )}
                <div className="stu-profile-stats">
                  <div className="stu-pstat"><span>{myResults.length}</span><small>Quizzes</small></div>
                  <div className="stu-pstat"><span>{overallAvg||'—'}{overallAvg?'%':''}</span><small>Avg</small></div>
                  <div className="stu-pstat"><span>{user?.streak||0}</span><small>Streak 🔥</small></div>
                </div>
              </div>

              {/* Edit form */}
              <div className="section-card hud-serious-border" style={{ padding:'28px' }}>
                <h3 style={{ fontSize:'18px', fontWeight:800, marginBottom:'24px' }}>Edit Profile</h3>
                {profileSaved && (
                  <div className="stu-save-msg">
                    <CheckCircle size={15}/> Profile updated successfully!
                  </div>
                )}
                <div style={{ marginBottom:'18px' }}>
                  <label className="form-label">Full Name</label>
                  <input className="form-input" value={profile.name}
                    onChange={e => setProfile({...profile, name: e.target.value})} />
                </div>
                <div style={{ marginBottom:'24px' }}>
                  <label className="form-label">Email Address</label>
                  <input className="form-input" type="email" value={profile.email}
                    onChange={e => setProfile({...profile, email: e.target.value})} />
                </div>
                <div style={{ borderTop:'1px solid var(--border-light)', paddingTop:'20px', marginBottom:'20px' }}>
                  <h4 style={{ fontSize:'14px', color:'var(--text-secondary)', marginBottom:'14px' }}>Change Password</h4>
                  <div className="auth-password-wrapper" style={{ marginBottom:'12px' }}>
                    <input className="form-input" type={showPwd ? 'text':'password'}
                      placeholder="New password (leave blank to keep current)"
                      value={profile.newPassword}
                      onChange={e => setProfile({...profile, newPassword: e.target.value})} />
                    <button type="button" className="auth-password-toggle" onClick={() => setShowPwd(!showPwd)}>
                      {showPwd ? <EyeOff size={16}/> : <Eye size={16}/>}
                    </button>
                  </div>
                  <input className="form-input" type="password" placeholder="Confirm new password"
                    value={profile.confirmPassword}
                    onChange={e => setProfile({...profile, confirmPassword: e.target.value})} />
                </div>
                <button className="btn btn-primary" style={{ width:'100%' }} onClick={handleSave}>
                  <Save size={15}/> Save Changes
                </button>
              </div>
            </div>
          )}

        </div>
      </main>

      <CoursePaymentModal 
        course={unlockingCourse} 
        onClose={() => setUnlockingCourse(null)} 
        onSuccess={handleCourseUnlock} 
      />
    </div>
  );  
}
