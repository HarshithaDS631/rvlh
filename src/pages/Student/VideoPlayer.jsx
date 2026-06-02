import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import {
  Play, Pause, Volume2, Maximize, ChevronRight, Brain,
  Download, ThumbsUp, Share2, BookOpen, Clock, Eye, Star,
  FileText, CheckCircle, Lock, Crown, SkipBack, SkipForward, Sparkles
} from 'lucide-react';
import './VideoPlayer.css';

export default function VideoPlayer() {
  const { id } = useParams();
  const { user } = useAuth();
  const { data } = useStore();
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(35);
  const [activeTab, setActiveTab] = useState('overview');

  const approvedVideos = (data?.videos || []).filter(v => v.status === 'approved');
  const video = approvedVideos.find((v) => v.id === id) || approvedVideos[0];
  const isRVLH = user?.type === 'rvlh';

  if (!video) {
    return (
      <div className="video-player-page" style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <div style={{textAlign: 'center', padding: '100px 20px'}}>
           <Video size={48} color="#94a3b8" style={{marginBottom: 16}} />
           <h2 style={{color: '#f8fafc'}}>No Videos Available</h2>
           <p style={{color: '#94a3b8'}}>Please ask your teacher or administrator to upload some content first.</p>
        </div>
      </div>
    );
  }

  const relatedVideos = approvedVideos.filter((v) => v.id !== video.id).slice(0, 4);
  const relatedMaterials = (data?.materials || []).filter((m) => m.courseId === video.courseId && m.status === 'approved').slice(0, 3);
  const subject = data.courses.find((s) => s.id === video.courseId);
  const teacher = (data?.users || []).find(u => u.id === video.teacherId);
  const teacherNameStr = teacher?.name || video.teacherName || video.teacher || 'Teacher';
  const teacherAvatar = teacher?.avatar || video.teacherAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${video.teacherId}`;

  return (
    <div className="video-player-page">
      <div className="video-player-main">
        {/* Video Player */}
        <div className="video-player-container animate-fadeIn">
          <div className="video-player">
            <img src={video.thumbnail} alt={video.title} className="video-player-poster" />
            <div className="video-player-overlay" onClick={() => setIsPlaying(!isPlaying)}>
              {!isPlaying && (
                <div className="video-player-big-play">
                  <Play size={32} fill="white" />
                </div>
              )}
            </div>
            <div className="video-player-controls">
              <div className="video-progress-bar" onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setProgress(((e.clientX - rect.left) / rect.width) * 100);
              }}>
                <div className="video-progress-fill" style={{ width: `${progress}%` }}>
                  <div className="video-progress-thumb" />
                </div>
              </div>
              <div className="video-controls-row">
                <div className="video-controls-left">
                  <button className="video-ctrl-btn" id="video-play-toggle" onClick={() => setIsPlaying(!isPlaying)}>
                    {isPlaying ? <Pause size={18} fill="white" /> : <Play size={18} fill="white" />}
                  </button>
                  <button className="video-ctrl-btn"><SkipBack size={16} /></button>
                  <button className="video-ctrl-btn"><SkipForward size={16} /></button>
                  <button className="video-ctrl-btn"><Volume2 size={18} /></button>
                  <span className="video-time">15:45 / {video.duration}</span>
                </div>
                <div className="video-controls-right">
                  <button className="video-ctrl-btn"><Maximize size={18} /></button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Video Info */}
        <div className="video-info animate-fadeInUp stagger-1">
          <div className="video-info-header">
            <div className="video-breadcrumb">
              <Link to="/student/courses">{subject?.name}</Link>
              <ChevronRight size={14} />
              <span>{video.topic}</span>
            </div>
            <h1 className="video-title">{video.title}</h1>
            <div className="video-meta-row">
              <div className="video-teacher-info">
                <img src={teacherAvatar} alt={teacherNameStr} className="video-teacher-avatar" />
                <div>
                  <span className="video-teacher-name">{teacherNameStr}</span>
                  <span className="video-teacher-subject">{subject?.name || video.subject} Expert</span>
                </div>
              </div>
              <div className="video-actions">
                <button className="btn btn-secondary btn-sm" id="video-like">
                  <ThumbsUp size={16} /> {video.likes || 0}
                </button>
                <button className="btn btn-secondary btn-sm" id="video-share">
                  <Share2 size={16} /> Share
                </button>
                <Link to={`/student/quiz/${video.id}`} className="btn btn-accent btn-sm" id="video-quiz">
                  <Brain size={16} /> Generate Quiz
                </Link>
              </div>
            </div>
          </div>

          {/* AI Quiz prompt — appears after watching enough */}
          {progress > 50 && (
            <div className="video-ai-quiz-banner animate-fadeInUp">
              <div className="video-ai-quiz-icon">
                <Brain size={24} />
              </div>
              <div className="video-ai-quiz-text">
                <strong>Ready to test yourself?</strong>
                <p>You've watched enough of this video. Generate an AI-powered quiz to reinforce your learning!</p>
              </div>
              <Link to={`/student/quiz/${video.id}`} className="btn btn-accent" id="video-ai-quiz-cta">
                <Sparkles size={16} /> Generate AI Quiz
              </Link>
            </div>
          )}

          {/* Tabs */}
          <div className="video-tabs">
            {['overview', 'materials', 'notes'].map((tab) => (
              <button
                key={tab}
                className={`video-tab ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
                id={`tab-${tab}`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          <div className="video-tab-content">
            {activeTab === 'overview' && (
              <div className="video-overview animate-fadeIn">
                <p className="video-description">{video.description || `Comprehensive lecture on ${video.title} covering all important concepts and problem-solving techniques.`}</p>
                <div className="video-stats-row">
                  <div className="video-stat-item">
                    <Eye size={16} />
                    <span>{(video.views || 0).toLocaleString()} views</span>
                  </div>
                  <div className="video-stat-item">
                    <Clock size={16} />
                    <span>{video.duration}</span>
                  </div>
                  <div className="video-stat-item">
                    <Star size={16} />
                    <span>Uploaded {video.uploadDate || new Date(video.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="video-topics-covered">
                  <h3>Topics Covered</h3>
                  <div className="video-topic-tags">
                    {['Fundamentals', 'Problem Solving', 'Formulas', 'Practice Questions', 'Tips & Tricks'].map((t) => (
                      <span key={t} className="badge badge-primary">{t}</span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'materials' && (
              <div className="video-materials animate-fadeIn">
                {relatedMaterials.length > 0 ? relatedMaterials.map((mat) => (
                  <div key={mat.id} className="video-material-item">
                    <div className="video-material-icon">
                      <FileText size={20} />
                    </div>
                    <div className="video-material-info">
                      <span className="video-material-name">{mat.title}</span>
                      <span className="video-material-meta">{mat.pages} pages • {mat.size}</span>
                    </div>
                    <button className="btn btn-secondary btn-sm" id={`download-${mat.id}`}>
                      <Download size={14} /> Download
                    </button>
                  </div>
                )) : (
                  <p style={{ color: 'var(--text-tertiary)', fontSize: '14px' }}>No materials available for this lesson yet.</p>
                )}
              </div>
            )}

            {activeTab === 'notes' && (
              <div className="video-notes animate-fadeIn">
                <textarea
                  className="video-notes-input"
                  placeholder="Take notes while watching this video..."
                  rows={6}
                  id="video-notes-textarea"
                />
                <button className="btn btn-primary btn-sm" style={{ marginTop: '12px' }} id="save-notes">
                  Save Notes
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sidebar - Up Next */}
      <div className="video-sidebar animate-fadeInUp stagger-2">
        <div className="vside-header">
          <h3>Up Next</h3>
          <span className="vside-count">{relatedVideos.length} videos</span>
        </div>

        <div className="vside-list">
          {relatedVideos.map((rv, idx) => {
            const rvTeacher = (data?.users || []).find(u => u.id === rv.teacherId);
            const rvCourse = data.courses.find(c => c.id === rv.courseId);
            return (
              <Link
                to={`/student/video/${rv.id}`}
                key={rv.id}
                className="vside-item"
                id={`related-${rv.id}`}
              >
                <span className="vside-num">{idx + 1}</span>
                <div className="vside-thumb">
                  <div className="vside-thumb-placeholder">
                    <Play size={16} fill="white" color="white" />
                  </div>
                  <span className="vside-duration">{rv.duration || '—'}</span>
                  {!isRVLH && idx >= (user?.freeVideosLeft || 0) && (
                    <div className="vside-lock"><Lock size={10} /></div>
                  )}
                </div>
                <div className="vside-info">
                  <span className="vside-name">{rv.title}</span>
                  <span className="vside-teacher">{rvTeacher?.name || 'Teacher'}</span>
                  <div className="vside-meta">
                    {rvCourse && <span className="vside-course">{rvCourse.name?.split(' ')[0] || 'Course'}</span>}
                    {rv.subject && <span className="vside-subject">{rv.subject}</span>}
                  </div>
                </div>
              </Link>
            );
          })}

          {relatedVideos.length === 0 && (
            <div className="vside-empty">
              <Video size={24} />
              <p>No more videos in this series</p>
            </div>
          )}
        </div>

        {!isRVLH && (
          <div className="vside-upgrade">
            <Crown size={18} />
            <div>
              <strong>Unlock All Videos</strong>
              <p>Get unlimited access with Pro plan</p>
            </div>
            <Link to="/student/subscription" state={{ showPayment: true }} className="btn btn-primary btn-sm">Upgrade</Link>
          </div>
        )}
      </div>
    </div>
  );
}
