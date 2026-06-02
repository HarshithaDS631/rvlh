import { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import {
  BookOpen, Video, FileText, Search, Play, Download, Lock, Brain,
  ChevronDown, Filter, Crown, ShoppingCart, Sparkles, ClipboardList,
  Star, BookMarked, FlaskConical, ArrowRight, CheckCircle, Zap
} from 'lucide-react';
import CoursePaymentModal from '../../components/Payment/CoursePaymentModal';
import './Courses.css';

export default function Courses() {
  const { user } = useAuth();
  const { data } = useStore();
  const [searchParams] = useSearchParams();
  const initialCourse = searchParams.get('course') || 'all';

  const [activeCourseId, setActiveCourseId] = useState(initialCourse);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeView, setActiveView] = useState('videos');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [materialCategory, setMaterialCategory] = useState('all');

  const isRVLH = user?.type === 'rvlh';
  const isPremium = isRVLH || user?.subscription === 'premium';
  
  const [unlockingCourse, setUnlockingCourse] = useState(null);

  const handleCourseUnlock = (course) => {
    const currentPurchased = user?.purchasedCourses || [];
    const updatedCourses = [...new Set([...currentPurchased, course.id])];
    useStore().updateEntity('users', user.id, { purchasedCourses: updatedCourses });
    setUnlockingCourse(null);
  };

  // Build subject list from approved content
  const subjectsList = useMemo(() => {
    const allSubjects = new Set();
    (data?.videos || []).filter(v => v.status === 'approved').forEach(v => v.subject && allSubjects.add(v.subject));
    (data?.materials || []).filter(m => m.status === 'approved').forEach(m => m.subject && allSubjects.add(m.subject));
    return [...allSubjects];
  }, [data]);

  // Filter logic
  const filteredVideos = useMemo(() => (data?.videos || []).filter(v =>
    v.status === 'approved' &&
    (activeCourseId === 'all' || v.courseId === activeCourseId) &&
    (subjectFilter === 'all' || v.subject === subjectFilter) &&
    (searchQuery === '' || v.title.toLowerCase().includes(searchQuery.toLowerCase()))
  ), [data, activeCourseId, subjectFilter, searchQuery]);

  const filteredMaterials = useMemo(() => (data?.materials || []).filter(m =>
    m.status === 'approved' &&
    (activeCourseId === 'all' || m.courseId === activeCourseId) &&
    (subjectFilter === 'all' || m.subject === subjectFilter) &&
    (materialCategory === 'all' || m.category === materialCategory) &&
    (searchQuery === '' || m.title.toLowerCase().includes(searchQuery.toLowerCase()))
  ), [data, activeCourseId, subjectFilter, materialCategory, searchQuery]);

  const filteredQuizzes = useMemo(() => (data?.quizzes || []).filter(q =>
    (activeCourseId === 'all' || q.courseId === activeCourseId) &&
    (subjectFilter === 'all' || q.subject === subjectFilter) &&
    (searchQuery === '' || q.title.toLowerCase().includes(searchQuery.toLowerCase()))
  ), [data, activeCourseId, subjectFilter, searchQuery]);

  // Access control
  const canAccessVideo = (video, idx) => {
    if (isPremium) return true;
    if (user?.course === video.courseId || user?.purchasedCourses?.includes(video.courseId)) return true;
    // Outside students: first 1 video free globally
    return idx === 0;
  };

  const canAccessMaterial = (mat) => {
    if (isPremium) return true;
    if (user?.course === mat.courseId || user?.purchasedCourses?.includes(mat.courseId)) return true;
    // Outside: only formula material is free
    return mat.category === 'formula';
  };

  const canAccessQuiz = () => {
    if (isPremium) return true;
    return (user?.freeQuizzesLeft || 0) > 0;
  };

  // Material category metadata
  const matCategories = [
    { id: 'all', label: 'All Materials', icon: FileText },
    { id: 'course', label: 'Course Material', icon: BookMarked },
    { id: 'pyqp', label: 'Prev Year Papers', icon: ClipboardList },
    { id: 'formula', label: 'Formula Sheets', icon: FlaskConical, free: true },
  ];

  return (
    <div className="courses-page">
      {/* Header */}
      <div className="courses-header animate-fadeIn">
        <div className="courses-header-info">
          <h1>{isRVLH ? '📚 RVLH Academic Hub' : '📖 Learning Portal'}</h1>
          <p>
            {isRVLH
              ? 'Full access to your enrolled course content, AI quizzes & graded materials.'
              : 'Explore our free content. Upgrade to Premium for full access.'}
          </p>
        </div>
        {!isRVLH && (
          <Link to="/student/subscription" state={{ showPayment: true }} className="btn-upgrade-banner">
            <Crown size={16} /> Upgrade to Premium <ArrowRight size={14} />
          </Link>
        )}
      </div>

      {/* Access Notice for Outside Students */}
      {!isRVLH && (
        <div className="outside-access-notice animate-fadeInDown">
          <div className="notice-row">
            <CheckCircle size={14} color="var(--success)" />
            <span><strong>Free Access:</strong> 1 Video · Formula Sheets · 1 AI Quiz</span>
          </div>
          <div className="notice-row">
            <Lock size={14} color="var(--error)" />
            <span><strong>Paid:</strong> All Videos · Course Material · PYQP · Teacher Quizzes</span>
          </div>
        </div>
      )}

      {/* Filters Bar */}
      <div className="courses-filters animate-fadeInUp stagger-1">
        {/* Search */}
        <div className="courses-search">
          <Search size={16} className="courses-search-icon" />
          <input
            type="text"
            placeholder="Search videos, materials, quizzes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input"
            style={{ paddingLeft: '40px' }}
          />
        </div>

        {/* Subject Filter */}
        <div className="filter-dropdown" style={{ minWidth: '160px' }}>
          <Filter size={14} />
          <select
            className="form-select"
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
          >
            <option value="all">All Subjects</option>
            {subjectsList.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <ChevronDown size={14} />
        </div>

        {/* Course Filter */}
        <div className="filter-dropdown" style={{ minWidth: '180px' }}>
          <BookOpen size={14} />
          <select
            className="form-select"
            value={activeCourseId}
            onChange={(e) => setActiveCourseId(e.target.value)}
          >
            <option value="all">All Courses</option>
            {(data?.courses || []).map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <ChevronDown size={14} />
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="courses-view-tabs animate-fadeInUp stagger-2">
        {[
          { id: 'videos', label: 'Videos', icon: Video },
          { id: 'materials', label: 'Materials', icon: FileText },
          { id: 'quizzes', label: 'Quizzes', icon: Brain },
        ].map(tab => (
          <button
            key={tab.id}
            className={`courses-view-tab ${activeView === tab.id ? 'active' : ''}`}
            onClick={() => setActiveView(tab.id)}
          >
            <tab.icon size={16} /> {tab.label}
          </button>
        ))}
      </div>

      {/* ─── VIDEOS TAB ─── */}
      {activeView === 'videos' && (
        <div className="courses-content animate-fadeInUp stagger-3">
          <div className="dash-videos-grid">
            {filteredVideos.map((video, idx) => {
              const unlocked = canAccessVideo(video, idx);
              return (
                <div key={video.id} className={`video-hub-card ${!unlocked ? 'video-locked-card' : ''}`}>
                  <div className="video-hub-thumb">
                    <img src={video.thumbnail || `https://picsum.photos/seed/${video.id}/400/225`} alt={video.title} />
                    <div className="video-hub-overlay">
                      {unlocked ? (
                        <Link to={`/student/video/${video.id}`} className="play-btn-circle">
                          <Play size={22} fill="white" />
                        </Link>
                      ) : (
                        <Link to="/student/subscription" state={{ showPayment: true }} className="play-btn-circle locked">
                          <Lock size={20} color="#fbbf24" />
                        </Link>
                      )}
                    </div>
                    {!isRVLH && idx === 0 && (
                      <span className="free-badge-pill">FREE</span>
                    )}
                    {!unlocked && (
                      <span className="paid-badge-pill"><Crown size={10} /> PAID</span>
                    )}
                    <span className="dash-video-duration">{video.duration || '–'}</span>
                  </div>
                  <div className="video-hub-info">
                    <div className="video-hub-tags">
                      {video.subject && <span className="subject-pill">{video.subject}</span>}
                      <span className="course-pill">{(data?.courses || []).find(c => c.id === video.courseId)?.shortName || 'General'}</span>
                    </div>
                    <h4 className="video-hub-title">{video.title}</h4>
                    <p className="video-hub-teacher">
                      by {(data?.users || []).find(u => u.id === video.teacherId)?.name || 'Faculty'}
                    </p>
                    {unlocked && (
                      <Link
                        to={`/student/quiz/${video.id}`}
                        className="ai-quiz-btn"
                      >
                        <Sparkles size={13} /> Generate AI Quiz
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
            {filteredVideos.length === 0 && (
              <div className="empty-course-state">
                <Video size={48} />
                <p>No videos match your filters. Try adjusting the subject or course.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── MATERIALS TAB ─── */}
      {activeView === 'materials' && (
        <div className="courses-content animate-fadeInUp stagger-3">
          {/* Category sub-tabs */}
          <div className="material-category-tabs">
            {matCategories.map(cat => (
              <button
                key={cat.id}
                className={`mat-cat-tab ${materialCategory === cat.id ? 'active' : ''}`}
                onClick={() => setMaterialCategory(cat.id)}
              >
                <cat.icon size={14} /> {cat.label}
                {cat.free && <span className="free-tag-inline">FREE</span>}
              </button>
            ))}
          </div>

          <div className="courses-materials-list">
            {filteredMaterials.map(mat => {
              const unlocked = canAccessMaterial(mat);
              const catMeta = {
                course: { label: 'Course Material', color: '#3b82f6', icon: BookMarked },
                pyqp: { label: 'Prev Year Paper', color: '#f59e0b', icon: ClipboardList },
                formula: { label: 'Formula Sheet', color: '#8b5cf6', icon: FlaskConical },
              }[mat.category] || { label: 'Material', color: '#64748b', icon: FileText };

              return (
                <div key={mat.id} className={`material-hub-card ${!unlocked ? 'material-locked' : ''}`}>
                  <div
                    className="material-hub-icon"
                    style={{ background: `${catMeta.color}18`, color: catMeta.color, borderColor: `${catMeta.color}30` }}
                  >
                    <catMeta.icon size={26} />
                  </div>
                  <div className="material-hub-body">
                    <div className="material-hub-tags">
                      <span className="mat-type-badge" style={{ background: `${catMeta.color}20`, color: catMeta.color }}>
                        {catMeta.label}
                      </span>
                      {mat.category === 'formula' && <span className="free-tag-inline">FREE</span>}
                      {mat.subject && <span className="subject-pill">{mat.subject}</span>}
                    </div>
                    <h3 className="material-hub-title">{mat.title}</h3>
                    <p className="material-hub-meta">
                      {(data?.courses || []).find(c => c.id === mat.courseId)?.shortName || 'General'} ·{' '}
                      {(data?.users || []).find(u => u.id === mat.teacherId)?.name || 'Faculty'}
                    </p>
                  </div>
                  <div className="material-hub-action">
                    {unlocked ? (
                      <button className="btn btn-secondary btn-sm">
                        <Download size={14} /> Download
                      </button>
                    ) : (
                      <button className="btn-buy-course btn-sm" onClick={() => setUnlockingCourse(data?.courses?.find(c => c.id === mat.courseId))}>
                        <Crown size={14} /> Upgrade
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
            {filteredMaterials.length === 0 && (
              <div className="empty-course-state">
                <FileText size={48} />
                <p>No materials found. Modify your filters or check back later.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── QUIZZES TAB ─── */}
      {activeView === 'quizzes' && (
        <div className="courses-content animate-fadeInUp stagger-3">
          {!isRVLH && (
            <div className="outside-access-notice" style={{ marginBottom: '24px' }}>
              <Lock size={14} color="var(--error)" />
              <span>Teacher Quizzes require a Premium subscription. You can still generate 1 free AI Quiz from Videos.</span>
              <Link to="/student/subscription" state={{ showPayment: true }} className="btn btn-primary btn-sm" style={{ marginLeft: 'auto' }}>
                <Crown size={14} /> Upgrade
              </Link>
            </div>
          )}

          <div className="quiz-hub-grid">
            {filteredQuizzes.map(quiz => {
              const accessible = canAccessQuiz();
              return (
                <div key={quiz.id} className={`quiz-hub-card hud-card ${!accessible ? 'quiz-locked-card' : ''}`}>
                  <div className="quiz-hub-icon">
                    <Brain size={28} color="var(--primary-400)" />
                  </div>
                  <div className="quiz-hub-info">
                    <div className="quiz-hub-tags">
                      {quiz.subject && <span className="subject-pill">{quiz.subject}</span>}
                      {quiz.level && <span className={`subject-pill ${quiz.level === 'High' ? 'level-high' : quiz.level === 'Low' ? 'level-low' : 'level-medium'}`}>{quiz.level}</span>}
                      <span className="quiz-q-count"><Zap size={11} /> {quiz.questions?.length || 0} Qs</span>
                    </div>
                    <h4>{quiz.title}</h4>
                    <p>by {(data?.users || []).find(u => u.id === quiz.teacherId)?.name || 'Faculty'}</p>
                  </div>
                  <div className="quiz-hub-action">
                    {accessible && isRVLH ? (
                      <Link to={`/student/quiz/${quiz.id}?mode=teacher`} className="btn btn-primary btn-sm">
                        <Play size={14} /> Take Quiz
                      </Link>
                    ) : (
                      <button className="btn-buy-course btn-sm" onClick={() => setUnlockingCourse(data?.courses?.find(c => c.id === quiz.courseId))}>
                        <Crown size={14} /> Unlock
                      </button>
                    )}
                    {accessible && quiz.subject && (
                      <span className="quiz-free-tag">
                        <Star size={10} fill="currentColor" /> Graded
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
            {filteredQuizzes.length === 0 && (
              <div className="empty-course-state" style={{ gridColumn: '1/-1' }}>
                <Brain size={48} />
                <p>No teacher quizzes yet. Generate an AI Quiz from any video!</p>
                <button className="btn btn-primary" onClick={() => setActiveView('videos')}>
                  <Video size={16} /> Go to Videos
                </button>
              </div>
            )}
          </div>

          {/* AI Quiz CTA */}
          <div className="ai-quiz-cta-card hud-card">
            <Sparkles size={32} color="var(--primary-400)" />
            <div>
              <h3>Generate AI Quiz</h3>
              <p>Pick any video, click "Generate AI Quiz" and get a custom personalised quiz in seconds — powered by AI.</p>
            </div>
            <button className="btn btn-secondary" onClick={() => setActiveView('videos')}>
              <Video size={16} /> Browse Videos <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}
      <CoursePaymentModal 
        course={unlockingCourse} 
        onClose={() => setUnlockingCourse(null)} 
        onSuccess={handleCourseUnlock} 
      />
    </div>
  );
}
