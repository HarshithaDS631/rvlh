import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import {
  Upload, Video, FileText, Plus, ChevronRight, X, Trash2, Eye, Brain,
  Youtube, Link as LinkIcon, FileCheck, MousePointer2, Bell, AlertCircle, Info,
  Archive, Clock, CheckCircle2, LayoutGrid, List, MessageSquare, TrendingUp, Activity,
  Users, Award, ClipboardList, Send, Calendar, BookOpen, CheckSquare
} from 'lucide-react';
import './TeacherDashboard.css';
import LiveClassroom from './LiveClassroom';

export default function TeacherDashboard() {
  const { user } = useAuth();
  const { data, addEntity, deleteEntity, updateEntity } = useStore();
  const location = useLocation();
  
  const getTabFromPath = (path) => {
    if (path.includes('/upload')) return 'upload';
    if (path.includes('/queue')) return 'pending';
    if (path.includes('/live')) return 'live';
    if (path.includes('/tests')) return 'tests';
    if (path.includes('/monitoring')) return 'monitoring';
    if (path.includes('/doubts')) return 'doubts';
    if (path.includes('/notifications')) return 'notifications';
    if (path.includes('/settings')) return 'settings';
    return 'overview';
  };

  const [activeTab, setActiveTab] = useState(getTabFromPath(location.pathname));
  const [showUploadModal, setShowUploadModal] = useState(location.pathname.includes('/upload'));
  const [replyText, setReplyText] = useState({});
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);
  const [showAnnounceModal, setShowAnnounceModal] = useState(false);
  const [selectedStudentMonitor, setSelectedStudentMonitor] = useState(null);
  
  // LIVE SESSION STATE
  const [isInLiveSession, setIsInLiveSession] = useState(false);
  const [currentSession, setCurrentSession] = useState(null);
  
  const [liveClassData, setLiveClassData] = useState({
    title: '', courseId: '', time: '10:00', platform: 'Zoom', link: ''
  });

  const [testData, setTestData] = useState({
    title: '', duration: 30, type: 'MCQ', totalQuestions: 0, marksPerQuestion: 4, negativeMarking: 1,
    questions: [], level: 'Medium'
  });
  const [creationMode, setCreationMode] = useState('manual'); // 'manual', 'upload'
  const [manualQuestion, setManualQuestion] = useState({
    text: '', options: ['', '', '', ''], answer: 0
  });

  useEffect(() => {
    setActiveTab(getTabFromPath(location.pathname));
    setShowUploadModal(false);
    setShowScheduleModal(false);
    setShowTestModal(false);
    setShowAnnounceModal(false);
  }, [location]);

  const [uploadType, setUploadType] = useState('video'); // video, material
  
  const [formData, setFormData] = useState({
    title: '', description: '', courseId: '', duration: '', isFormula: false,
    youtubeUrl: '', fileName: ''
  });
  
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    password: '',
    confirmPassword: ''
  });

  const [videoSource, setVideoSource] = useState('youtube'); // youtube, local
  const [dragActive, setDragActive] = useState(false);
  const [uploadFilter, setUploadFilter] = useState('all'); // 'all', 'video', 'material'
  const [monitoringSubjectFilter, setMonitoringSubjectFilter] = useState('all');
  const [monitoringCourseFilter, setMonitoringCourseFilter] = useState('all');
  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', content: '' });


  const handleUploadSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.courseId) return;

    if (uploadType === 'video') {
      addEntity('videos', {
        title: formData.title,
        description: formData.description,
        courseId: formData.courseId,
        teacherId: user.id,
        duration: formData.duration || '10:00',
        thumbnail: videoSource === 'youtube' && formData.youtubeUrl 
          ? `https://img.youtube.com/vi/${formData.youtubeUrl.split('v=')[1]?.split('&')[0] || 'dQw4w9WgXcQ'}/maxresdefault.jpg`
          : `https://picsum.photos/seed/${formData.title}/640/360`,
        source: videoSource,
        url: formData.youtubeUrl,
        views: 0,
        status: 'pending'
      });
      // Notify Admin
      addEntity('notifications', {
        role: 'admin',
        title: 'New Video Submission 📹',
        message: `${user.name} submitted "${formData.title}" for review.`,
        category: 'today',
        link: '/admin/approvals'
      });
    } else {
      addEntity('materials', {
        title: formData.title,
        description: formData.description,
        courseId: formData.courseId,
        teacherId: user.id,
        isFormula: formData.isFormula,
        fileName: formData.fileName,
        pages: Math.floor(Math.random() * 20) + 1,
        downloads: 0,
        status: 'pending'
      });
      // Notify Admin
      addEntity('notifications', {
        role: 'admin',
        title: 'New Material Uploaded 📄',
        message: `${user.name} uploaded study material: "${formData.title}".`,
        category: 'today',
        link: '/admin/approvals'
      });
    }

    setFormData({ title: '', description: '', courseId: '', duration: '', isFormula: false, youtubeUrl: '', fileName: '' });
    setShowUploadModal(false);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFormData({ ...formData, fileName: e.dataTransfer.files[0].name });
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, fileName: e.target.files[0].name });
    }
  };

  const handleScheduleLive = (e) => {
    e.preventDefault();
    addEntity('liveClasses', {
      ...liveClassData,
      id: `lc-${Date.now()}`,
      teacherId: user.id,
      date: new Date().toISOString(),
      status: 'upcoming'
    });
    // Notify Students of that course
    addEntity('notifications', {
      courseId: liveClassData.courseId,
      title: 'New Live Class Scheduled! 📡',
      message: `${user.name} scheduled "${liveClassData.title}" at ${liveClassData.time}.`,
      category: 'upcoming',
      link: '/student/live'
    });
    setShowScheduleModal(false);
    setLiveClassData({ title: '', courseId: '', time: '10:00', platform: 'Zoom', link: '' });
  };

  const handleReplyDoubt = (doubtId) => {
    const reply = replyText[doubtId];
    if (!reply) return;
    updateEntity('doubts', doubtId, { reply, status: 'resolved' });
    // Notify Student
    const doubt = (data?.doubts || []).find(d => d.id === doubtId);
    addEntity('notifications', {
      userId: doubt.studentId,
      title: 'Doubt Resolved! ✅',
      message: `${user.name} replied to your question: "${doubt.question.substring(0, 30)}..."`,
      category: 'today',
      link: '/student/doubts'
    });
  };

  const handleAddQuestion = () => {
    if (!manualQuestion.text || manualQuestion.options.some(o => !o)) return;
    
    setTestData(prev => ({
      ...prev,
      questions: [...prev.questions, {
        questionText: manualQuestion.text,
        options: [...manualQuestion.options],
        answer: ['A', 'B', 'C', 'D'][manualQuestion.answer]
      }],
      totalQuestions: prev.questions.length + 1
    }));
    
    setManualQuestion({ text: '', options: ['', '', '', ''], answer: 0 });
  };

  const handleSimulateAI = () => {
    // Simulated AI extraction from document
    const extractedQuestions = [
      { questionText: "What is the primary law of motion?", options: ["Inertia", "Acceleration", "Action-Reaction", "All of the above"], answer: "D" },
      { questionText: "Define Force in terms of Mass and Acceleration.", options: ["F = m/a", "F = ma", "F = a/m", "F = m+a"], answer: "B" },
      { questionText: "Which scientist is known for the laws of motion?", options: ["Einstein", "Newton", "Tesla", "Galileo"], answer: "B" }
    ];
    
    setTestData(prev => ({
      ...prev,
      questions: extractedQuestions,
      totalQuestions: extractedQuestions.length
    }));
  };

  const handlePublishTest = (e) => {
    e.preventDefault();
    if (!testData.title) return;
    
    const finalQuestions = testData.questions.length > 0 
      ? testData.questions 
      : Array(testData.totalQuestions || 5).fill({ questionText: 'Practice Question', options: ['A', 'B', 'C', 'D'], answer: 'A' });

    addEntity('quizzes', {
      ...testData,
      id: `q-${Date.now()}`,
      subject: user.subject,
      totalQuestions: finalQuestions.length,
      questions: finalQuestions
    });
    
    // Notify Admin
    addEntity('notifications', {
      role: 'admin',
      title: 'New Test Published 📝',
      message: `${user.name} created a new test: "${testData.title}".`,
      category: 'today',
      link: '/admin/quizzes'
    });
    
    setShowTestModal(false);
    setTestData({ title: '', duration: 30, type: 'MCQ', totalQuestions: 0, marksPerQuestion: 4, negativeMarking: 1, questions: [] });
    setCreationMode('manual');
  };

  const handleCreateAnnouncement = (e) => {
    e.preventDefault();
    if (!newAnnouncement.title || !newAnnouncement.content) return;
    
    // Create the announcement
    addEntity('announcements', {
      title: newAnnouncement.title,
      content: newAnnouncement.content,
      type: 'info',
      audience: 'student',
      teacherId: user.id,
      date: new Date().toISOString()
    });

    // Notify students
    addEntity('notifications', {
      role: 'student',
      title: `Announcement from ${user.name} 📢`,
      message: newAnnouncement.title,
      category: 'today'
    });

    // Notify admin
    addEntity('notifications', {
      role: 'admin',
      title: 'Teacher Announcement 📢',
      message: `${user.name} broadcasted: "${newAnnouncement.title}"`,
      fromTeacherId: user.id,
      category: 'today'
    });

    setNewAnnouncement({ title: '', content: '' });
    setShowAnnounceModal(false);
  };

  const teacherVideos = (data?.videos || []).filter(v => v.teacherId === user?.id);
  const teacherMaterials = (data?.materials || []).filter(m => m.teacherId === user?.id);

  const approvedVideos = teacherVideos.filter(v => v.status === 'approved');
  const pendingVideos = teacherVideos.filter(v => v.status === 'pending');
  const approvedMaterials = teacherMaterials.filter(m => m.status === 'approved');
  const pendingMaterials = teacherMaterials.filter(m => m.status === 'pending');

  const teacherDoubts = (data?.doubts || []).filter(d => d.teacherId === user?.id);
  
  // Analytics: Apply Subject and Course wise filtering
  const subjectsList = Array.from(new Set((data?.quizResults || []).map(r => r.subject).filter(Boolean)));

  const studentResults = (data?.quizResults || []).filter(r => {
    const subjectMatch = monitoringSubjectFilter === 'all' || r.subject === monitoringSubjectFilter;
    let courseMatch = true;
    if (monitoringCourseFilter !== 'all') {
       const student = (data?.users || []).find(u => u.name === r.studentName || u.id === r.studentId);
       if (!student || student.course !== monitoringCourseFilter) courseMatch = false;
    }
    return subjectMatch && courseMatch;
  });
  
  const totalAvg = studentResults.length > 0
    ? Math.round(studentResults.reduce((sum, r) => sum + r.score, 0) / studentResults.length)
    : 0;

  const quizResults = studentResults;

  const teacherNotifications = (data?.notifications || []).filter(n => {
    if (n.userId === user?.id) return true;
    if (n.role === 'teacher') return true;
    return false;
  }).reverse();

  if (isInLiveSession) {
    return <LiveClassroom session={currentSession} onEnd={() => setIsInLiveSession(false)} />;
  }

  return (
    <>
    <div className="admin-view animate-fadeIn">
      {/* Glass Header */}
      <div className="glass-header">
        <div className="header-info">
          <h1>
            {activeTab === 'upload' && 'Content Management 📚'}
            {activeTab === 'pending' && 'Pending Review ⏳'}
            {activeTab === 'live' && 'Live Classroom 📡'}
            {activeTab === 'tests' && 'Test Builder 📝'}
            {activeTab === 'monitoring' && 'Student Performance 📈'}
            {activeTab === 'doubts' && 'Doubt Resolution 💬'}
            {activeTab === 'settings' && 'Profile Settings ⚙️'}
            {activeTab === 'overview' && `Teacher Dashboard 👨‍🏫`}
          </h1>
          <p>
            {activeTab === 'overview' && `Analytical oversight for ${user.subject}`}
            {activeTab === 'upload' && 'Manage your video lessons and study materials'}
            {activeTab === 'pending' && 'Reviewing your recent submissions'}
            {activeTab === 'live' && 'Schedule and conduct classes in real-time'}
            {activeTab === 'tests' && 'Design and assign assessments'}
            {activeTab === 'monitoring' && 'Analytical overview of student progress'}
            {activeTab === 'doubts' && 'Help students clear their academic blocks'}
            {activeTab === 'notifications' && 'Send notifications and view system broadcasts'}
            {activeTab === 'settings' && 'Update your personal details and security keys'}
          </p>
        </div>
        <div className="teacher-quick-actions">
            {activeTab === 'upload' && (
              <>
                <button className="btn btn-primary" onClick={() => { setUploadType('video'); setShowUploadModal(true); }}>
                  <Video size={18} /> New Video
                </button>
                <button className="btn btn-secondary" onClick={() => { setUploadType('material'); setShowUploadModal(true); }}>
                  <BookOpen size={18} /> Add Material
                </button>
              </>
            )}
            {activeTab === 'live' && (
              <button className="btn btn-primary" onClick={() => setShowScheduleModal(true)}>
                <Calendar size={18} /> Schedule Class
              </button>
            )}
            {activeTab === 'tests' && (
              <button className="elite-btn-primary" onClick={() => setShowTestModal(true)}>
                <Plus size={18} /> Design New Test
              </button>
            )}
            {activeTab === 'notifications' && (
              <button className="btn btn-primary" onClick={() => setShowAnnounceModal(true)}>
                <Bell size={18} /> New Broadcast
              </button>
            )}
          </div>
        </div>
      
      <div className="admin-page-content teacher-dashboard">
        {activeTab === 'overview' && (
          <div className="animate-fadeIn">
            <div className="admin-grid" style={{ marginBottom: '32px', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
              <div className="dash-stat-card" style={{ '--stat-color': '#3b82f6' }}>
                <div className="dash-stat-icon"><Video size={22} /></div>
                <div className="dash-stat-info">
                  <span className="dash-stat-value">{approvedVideos.length}</span>
                  <span className="dash-stat-label">Approved Videos</span>
                </div>
                <div className="dash-stat-tooltip">
                  <strong>Syllabus Coverage:</strong>
                  <p>Syllabus: 64% Completed</p>
                  <p>Pending Review: {pendingVideos.length} uploads</p>
                </div>
              </div>
              <div className="dash-stat-card" style={{ '--stat-color': '#10b981' }}>
                <div className="dash-stat-icon"><FileText size={22} /></div>
                <div className="dash-stat-info">
                  <span className="dash-stat-value">{approvedMaterials.length}</span>
                  <span className="dash-stat-label">Approved Materials</span>
                </div>
                <div className="dash-stat-tooltip">
                  <strong>Resource Hub Status:</strong>
                  <p>Approved sheets: {approvedMaterials.length}</p>
                  <p>Awaiting Admin: {pendingMaterials.length}</p>
                </div>
              </div>
              <div className="dash-stat-card" style={{ '--stat-color': '#f59e0b' }}>
                <div className="dash-stat-icon"><MessageSquare size={22} /></div>
                <div className="dash-stat-info">
                  <span className="dash-stat-value">{teacherDoubts.filter(d => d.status === 'pending').length}</span>
                  <span className="dash-stat-label">Pending Doubts</span>
                </div>
                <div className="dash-stat-tooltip">
                  <strong>Academic Doubts:</strong>
                  <p>Pending response: {teacherDoubts.filter(d => d.status === 'pending').length}</p>
                  <p>Resolved by you: {teacherDoubts.filter(d => d.status === 'resolved').length}</p>
                </div>
              </div>
              <div className="dash-stat-card" style={{ '--stat-color': '#8b5cf6' }}>
                <div className="dash-stat-icon"><TrendingUp size={22} /></div>
                <div className="dash-stat-info">
                  <span className="dash-stat-value">{totalAvg}%</span>
                  <span className="dash-stat-label">Class Average Score</span>
                </div>
                <div className="dash-stat-tooltip">
                  <strong>Rating Breakdown:</strong>
                  <p>Average Performance: {totalAvg}%</p>
                  <p>Total tests: {data?.quizzes?.filter(q => q.subject === user.subject).length || 0}</p>
                </div>
              </div>
            </div>

            <div className="teacher-analytics-row" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px' }}>
              <div className="section-card">
                <div className="card-header">
                   <h3>System Broadcasts</h3>
                </div>
                <div className="teacher-notifications-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                   {teacherNotifications.map(n => (
                     <div key={n.id} className="teacher-notif-item highlight-item">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                           <Bell size={14} className="text-primary" />
                           <strong style={{ fontSize: '14px' }}>{n.title}</strong>
                        </div>
                        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>{n.message}</p>
                     </div>
                   ))}
                </div>
              </div>

              <div className="section-card">
                <div className="card-header">
                  <h3>Recent Activity</h3>
                </div>
                <div className="activity-feed-container">
                  {quizResults.slice(0, 5).map(r => (
                    <div key={r.id} className="activity-card">
                      <div className="activity-icon recent"><CheckSquare size={18} /></div>
                      <div className="activity-content">
                        <h4>{r.studentName}</h4>
                        <p>Completed <strong>{data?.quizzes?.find(q => q.id === r.quizId)?.title || 'Quiz'}</strong></p>
                        <span className="activity-time" style={{ color: 'var(--success)', fontWeight: 800 }}>{r.score}% Grade</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'upload' && (
          <div className="animate-fadeIn">
             <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
               <select className="form-select" style={{ width: '250px' }} value={uploadFilter} onChange={e => setUploadFilter(e.target.value)}>
                 <option value="all">All Content</option>
                 <option value="video">Videos Only</option>
                 <option value="material">Materials Only</option>
               </select>
             </div>
             <div className="content-inventory-grid">
               {(uploadFilter === 'all' || uploadFilter === 'video') && (
                 <div className="section-card">
                   <div className="card-header">
                     <h3>Your Video Library</h3>
                   </div>
                 <div className="teacher-video-grid">
                   {approvedVideos.map(v => (
                     <div key={v.id} className="mini-content-card">
                       <img src={v.thumbnail} alt={v.title} />
                       <div className="card-info">
                         <h4>{v.title}</h4>
                         <span>{v.duration} • {v.views} views</span>
                       </div>
                     </div>
                   ))}
                   {approvedVideos.length === 0 && <p className="empty-msg">No videos published yet.</p>}
                 </div>
                 </div>
               )}
               
               {(uploadFilter === 'all' || uploadFilter === 'material') && (
                 <div className="section-card">
                   <div className="card-header">
                     <h3>Study Materials</h3>
                 </div>
                 <div className="teacher-material-list">
                   {approvedMaterials.map(m => (
                     <div key={m.id} className="material-row-item">
                       <FileText size={18} />
                       <div className="item-details">
                         <h4>{m.title}</h4>
                         <span>{m.pages} pages • {m.downloads} downloads</span>
                       </div>
                       <button className="tool-btn danger" onClick={() => deleteEntity('materials', m.id)}><Trash2 size={16} /></button>
                     </div>
                   ))}
                   {approvedMaterials.length === 0 && <p className="empty-msg">No materials published yet.</p>}
                 </div>
                 </div>
               )}
             </div>
          </div>
        )}

        {activeTab === 'pending' && (
          <div className="animate-fadeIn">
            <div className="pending-full-list">
               {[...pendingVideos.map(v => ({...v, type: 'Video'})), ...pendingMaterials.map(m => ({...m, type: 'Material'}))].map(item => (
                 <div key={item.id} className="pending-full-item">
                    <div className="type-badge-alt">{item.type}</div>
                    <div className="pending-info">
                       <h4>{item.title}</h4>
                       <p>Submitted for Review • Waiting for Admin Action</p>
                    </div>
                    <div className="pending-status-pill">
                       <Clock size={14} /> Pending Review
                    </div>
                    <button className="tool-btn danger" onClick={() => deleteEntity(item.type === 'Video' ? 'videos' : 'materials', item.id)}><Trash2 size={16} /></button>
                 </div>
               ))}
               {(pendingVideos.length + pendingMaterials.length) === 0 && (
                 <div className="all-clear">
                    <CheckCircle2 size={48} />
                    <h3>No items pending review</h3>
                    <p>Everything you've uploaded has been processed.</p>
                 </div>
               )}
            </div>
          </div>
        )}

        {activeTab === 'live' && (
          <div className="animate-slideUp">
            <div className="admin-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))' }}>
               {(data?.liveClasses || []).filter(lc => lc.teacherId === user.id).map(lc => (
                 <div key={lc.id} className="section-card" style={{ padding: '24px' }}>
                    <div className="card-header">
                       <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div className="tile-icon"><Video size={24} /></div>
                          <div>
                            <h4 style={{ margin: 0 }}>{lc.title}</h4>
                            <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>Scheduled for {lc.time}</p>
                          </div>
                       </div>
                       <span className="elite-status active">{lc.status}</span>
                    </div>
                    <div style={{ marginTop: '20px', display: 'flex', gap: '12px' }}>
                       <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={() => {
                         setCurrentSession(lc);
                         updateEntity('liveClasses', lc.id, { status: 'ongoing' });
                         setIsInLiveSession(true);
                       }}>Start Session</button>
                       <button className="btn btn-ghost btn-sm" style={{ flex: 1 }} onClick={() => deleteEntity('liveClasses', lc.id)}>Cancel</button>
                    </div>
                 </div>
               ))}
               {(data?.liveClasses || []).filter(lc => lc.teacherId === user.id).length === 0 && <p className="text-muted">No live classes scheduled.</p>}
            </div>
          </div>
        )}

        {activeTab === 'tests' && (
           <div className="animate-slideUp">
             <div className="section-card">
                <div className="card-header">
                   <h3>Academic Test Series</h3>
                </div>
                <table className="elite-table">
                   <thead>
                      <tr>
                        <th>Test Title</th>
                        <th>Status</th>
                        <th>Difficulty</th>
                        <th>Duration</th>
                        <th>Batches</th>
                        <th>Actions</th>
                      </tr>
                   </thead>
                   <tbody>
                      {(data?.quizzes || []).filter(q => q.subject === user.subject).map(q => (
                        <tr key={q.id}>
                           <td style={{ fontWeight: 700 }}>{q.title}</td>
                           <td><span className="elite-status active">Published</span></td>
                           <td><span className={`elite-status ${q.level === 'High' ? 'deactivated' : q.level === 'Low' ? 'active' : ''}`}>{q.level || 'Medium'}</span></td>
                           <td>{q.duration} Mins</td>
                           <td>All Batches</td>
                           <td>
                              <div className="action-row">
                                 <button className="tool-btn"><Eye size={16}/></button>
                                 <button className="tool-btn danger" onClick={() => deleteEntity('quizzes', q.id)}><Trash2 size={16}/></button>
                              </div>
                           </td>
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>
           </div>
        )}

        {activeTab === 'monitoring' && (
          <div className="animate-slideUp">
             <div className="admin-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '32px' }}>
                <div className="dash-stat-card" style={{ '--stat-color': '#3385ff' }}>
                  <div className="dash-stat-icon"><Activity size={22} /></div>
                  <div className="dash-stat-info">
                    <span className="dash-stat-value">82%</span>
                    <span className="dash-stat-label">Avg Participation</span>
                  </div>
                </div>
                <div className="dash-stat-card" style={{ '--stat-color': '#10b981' }}>
                  <div className="dash-stat-icon"><Award size={22} /></div>
                  <div className="dash-stat-info">
                    <span className="dash-stat-value">{totalAvg}%</span>
                    <span className="dash-stat-label">Avg Quiz Score</span>
                  </div>
                </div>
                <div className="dash-stat-card" style={{ '--stat-color': '#f59e0b' }}>
                  <div className="dash-stat-icon"><Users size={22} /></div>
                  <div className="dash-stat-info">
                    <span className="dash-stat-value">12</span>
                    <span className="dash-stat-label">At-Risk Students</span>
                  </div>
                </div>
             </div>

             <section className="section-card">
               <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3>Quiz Result Analytics</h3>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <select className="form-select" value={monitoringSubjectFilter} onChange={e => setMonitoringSubjectFilter(e.target.value)}>
                      <option value="all">All Subjects</option>
                      {subjectsList.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <select className="form-select" value={monitoringCourseFilter} onChange={e => setMonitoringCourseFilter(e.target.value)}>
                      <option value="all">All Courses</option>
                      {(data?.courses || []).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
               </div>
               <table className="elite-table">
                  <thead>
                    <tr>
                       <th>Student Name</th>
                       <th>Quiz</th>
                       <th>Score%</th>
                       <th>Percentile</th>
                       <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quizResults.map(r => (
                      <tr key={r.id} onClick={() => setSelectedStudentMonitor(r)} style={{ cursor: 'pointer' }} className="monitor-row">
                         <td style={{ fontWeight: 700 }}>{r.studentName}</td>
                         <td>{data?.quizzes?.find(q => q.id === r.quizId)?.title || r.quizId}</td>
                         <td>{r.score}%</td>
                         <td>{r.percentile}%</td>
                         <td><span className={`elite-status ${r.score > 60 ? 'active' : 'deactivated'}`}>{r.score > 60 ? 'Passed' : 'Needs Review'}</span></td>
                      </tr>
                    ))}
                  </tbody>
               </table>

               {/* Slide-out Student Monitor Detail Drawer */}
               {selectedStudentMonitor && (() => {
                 const student = (data?.users || []).find(
                   u => u.name === selectedStudentMonitor.studentName || u.id === selectedStudentMonitor.studentId
                 );
                 const courseName = data?.courses?.find(c => c.id === student?.course)?.name || student?.course || 'General';
                 const studentQuizzes = (data?.quizResults || []).filter(
                   qr => qr.studentName === selectedStudentMonitor.studentName || qr.studentId === selectedStudentMonitor.studentId
                 );
                 const studentAvg = studentQuizzes.length > 0
                   ? Math.round(studentQuizzes.reduce((sum, q) => sum + q.score, 0) / studentQuizzes.length)
                   : 0;

                 return (
                   <div className="student-monitor-drawer-overlay active" onClick={() => setSelectedStudentMonitor(null)}>
                     <div className="student-monitor-drawer" onClick={e => e.stopPropagation()}>
                       <div className="drawer-header">
                         <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                           <img 
                             src={student?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedStudentMonitor.studentName}`} 
                             alt={selectedStudentMonitor.studentName} 
                             style={{ width: '48px', height: '48px', borderRadius: '50%', border: '2px solid var(--primary-400)' }} 
                           />
                           <div>
                             <h3 style={{ margin: 0 }}>{selectedStudentMonitor.studentName}</h3>
                             <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>ID: {student?.studentId || 'N/A'}</p>
                           </div>
                         </div>
                         <button type="button" className="btn-icon" onClick={() => setSelectedStudentMonitor(null)}><X size={20}/></button>
                       </div>

                       <div className="drawer-body">
                         <div className="drawer-section">
                           <h4>Academic Profile</h4>
                           <div className="profile-details-grid">
                             <div className="detail-item">
                               <span className="detail-label">Course Batch</span>
                               <span className="detail-val">{courseName}</span>
                             </div>
                             <div className="detail-item">
                               <span className="detail-label">Email</span>
                               <span className="detail-val">{student?.email}</span>
                             </div>
                             <div className="detail-item">
                               <span className="detail-label">Phone</span>
                               <span className="detail-val">{student?.phone}</span>
                             </div>
                             <div className="detail-item">
                               <span className="detail-label">Learning Streak</span>
                               <span className="detail-val" style={{ color: '#f59e0b', fontWeight: 'bold' }}>🔥 {student?.streak || 0} Days</span>
                             </div>
                           </div>
                         </div>

                         <div className="drawer-section">
                           <h4>Performance Breakdown</h4>
                           <div className="perf-grid">
                             <div className="perf-card">
                               <span className="perf-num">{selectedStudentMonitor.score}%</span>
                               <span className="perf-lbl">Latest Quiz Score</span>
                             </div>
                             <div className="perf-card">
                               <span className="perf-num">{studentAvg}%</span>
                               <span className="perf-lbl">Average Score</span>
                             </div>
                             <div className="perf-card">
                               <span className="perf-num">{studentQuizzes.length}</span>
                               <span className="perf-lbl">Quizzes Taken</span>
                             </div>
                           </div>
                         </div>

                         <div className="drawer-section">
                           <h4>Academic History</h4>
                           <div className="history-list">
                             {studentQuizzes.map(sq => (
                               <div key={sq.id} className="history-list-item">
                                 <div>
                                   <strong>{data?.quizzes?.find(q => q.id === sq.quizId)?.title || sq.quizId}</strong>
                                   <span className="history-date">{new Date(sq.date).toLocaleDateString()}</span>
                                 </div>
                                 <span className={`score-badge ${sq.score > 60 ? 'pass' : 'fail'}`}>{sq.score}%</span>
                               </div>
                             ))}
                           </div>
                         </div>
                       </div>
                     </div>
                   </div>
                 );
               })()}
             </section>
          </div>
        )}

        {activeTab === 'doubts' && (
          <div className="animate-slideUp">
             <div className="doubts-grid">
                {teacherDoubts.map(d => (
                  <div key={d.id} className="section-card" style={{ marginBottom: '24px' }}>
                     <div className="card-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                           <Users size={20} />
                           <h4>{d.studentName}</h4>
                        </div>
                        <span className={`elite-status ${d.status === 'resolved' ? 'active' : 'deactivated'}`}>{d.status}</span>
                     </div>
                     <p style={{ padding: '16px', background: 'var(--gray-900)', border: '1px solid var(--border-light)', borderRadius: '12px', margin: '16px 0', fontSize: '15px' }}>
                        {d.question}
                     </p>
                     {d.image && (
                       <div style={{ marginBottom: '16px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-light)' }}>
                          <img src={d.image} alt="Doubt Context" style={{ width: '100%', maxHeight: '400px', objectFit: 'contain', background: '#000' }} />
                       </div>
                     )}
                     {d.status === 'pending' ? (
                       <div className="reply-interface animate-fadeIn">
                          <div className="doubt-templates" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
                            {[
                              "Great question! Here's the step-by-step breakdown:",
                              "Please review the lecture video at 12:30 for a complete derivation.",
                              "This is a common misconception. Let's solve it from first principles:",
                              "Excellent attempt. The error is in the integration sign step.",
                            ].map((tpl) => (
                              <button
                                key={tpl}
                                type="button"
                                className="badge"
                                style={{
                                  background: 'rgba(34, 211, 238, 0.08)',
                                  color: 'var(--primary-400)',
                                  border: '1px solid rgba(34, 211, 238, 0.2)',
                                  borderRadius: '20px',
                                  padding: '4px 12px',
                                  fontSize: '11px',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s',
                                }}
                                onClick={() => {
                                  setReplyText((prev) => ({
                                    ...prev,
                                    [d.id]: (prev[d.id] || '') + tpl + '\n',
                                  }));
                                }}
                              >
                                + {tpl.substring(0, 24)}...
                              </button>
                            ))}
                          </div>
                          <textarea 
                            className="form-input" 
                            placeholder="Type your expert resolution here..." 
                            rows="3" 
                            style={{ width: '100%', marginBottom: '12px' }}
                            value={replyText[d.id] || ''}
                            onChange={(e) => setReplyText({...replyText, [d.id]: e.target.value})}
                          />
                          <button className="btn btn-primary" onClick={() => handleReplyDoubt(d.id)}><Send size={16} /> Send Resolution</button>
                       </div>
                     ) : (
                       <div style={{ padding: '16px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px', color: 'var(--success)' }}>
                          <strong>Resolved:</strong> {d.reply}
                       </div>
                     )}
                  </div>
                ))}
                {teacherDoubts.length === 0 && <p className="text-muted">No doubts found.</p>}
             </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="animate-slideUp">
            <div className="section-card">
              <div className="card-header">
                <h3>Sent Notifications & Broadcasts</h3>
              </div>
              <div className="announcements-wall" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px' }}>
                {(data?.announcements || []).filter(a => a.teacherId === user.id).map(ann => (
                  <div key={ann.id} className="elite-alert" style={{ background: 'var(--surface-elevated)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border-light)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <h5 style={{ margin: 0, fontSize: '15px' }}>{ann.title}</h5>
                      <span className="type-badge">Students</span>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: '0 0 12px 0' }}>{ann.content}</p>
                    <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{new Date(ann.date).toLocaleDateString()}</span>
                  </div>
                ))}
                {(data?.announcements || []).filter(a => a.teacherId === user.id).length === 0 && (
                  <div className="empty-msg" style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center' }}>
                    <p>No announcements sent to students yet.</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="section-card" style={{ marginTop: '24px' }}>
              <div className="card-header">
                 <h3>System Broadcasts (From Admin)</h3>
              </div>
              <div className="teacher-notifications-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                 {teacherNotifications.map(n => (
                   <div key={n.id} className="teacher-notif-item highlight-item" style={{ background: 'var(--surface-elevated)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                         <Bell size={14} className="text-primary" />
                         <strong style={{ fontSize: '14px' }}>{n.title}</strong>
                      </div>
                      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>{n.message}</p>
                   </div>
                 ))}
                 {teacherNotifications.length === 0 && <p className="text-muted">No system broadcasts available.</p>}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="animate-slideUp">
             <div className="settings-container" style={{ maxWidth: '800px', margin: '0 auto' }}>
                <section className="section-card">
                  <div className="card-header">
                    <h3>Profile Information</h3>
                  </div>
                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">Full Name</label>
                      <input className="form-input" value={profileData.name} onChange={e => setProfileData({...profileData, name: e.target.value})} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Email Address</label>
                      <input className="form-input" value={profileData.email} onChange={e => setProfileData({...profileData, email: e.target.value})} />
                    </div>
                  </div>
                  <div className="form-grid" style={{ marginTop: '16px' }}>
                    <div className="form-group">
                      <label className="form-label">Phone Number</label>
                      <input type="tel" className="form-input" value={profileData.phone} onChange={e => setProfileData({...profileData, phone: e.target.value})} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Subject Domain</label>
                      <input className="form-input" value={user.subject} disabled />
                    </div>
                  </div>
                </section>

                <section className="section-card" style={{ marginTop: '24px' }}>
                  <div className="card-header">
                    <h3>Security Keys</h3>
                  </div>
                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">New Password</label>
                      <input type="password" className="form-input" placeholder="••••••••" value={profileData.password} onChange={e => setProfileData({...profileData, password: e.target.value})} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Confirm Key</label>
                      <input type="password" className="form-input" placeholder="••••••••" value={profileData.confirmPassword} onChange={e => setProfileData({...profileData, confirmPassword: e.target.value})} />
                    </div>
                  </div>
                  <button className="btn btn-primary btn-lg" style={{ marginTop: '24px', width: '100%' }} onClick={() => alert('Security credentials updated across all nodes.')}>
                    Update Profile & Security
                  </button>
                </section>
             </div>
          </div>
        )}
      </div>

      {showUploadModal && (
        <div className="modal-overlay" onClick={() => setShowUploadModal(false)}>
          <div className="modal-content animate-scaleIn" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {uploadType === 'video' ? <><Video size={24} color="var(--primary-500)"/> Upload Video Lesson</> : <><BookOpen size={24} color="var(--accent-500)"/> Upload Course Material</>}
              </h2>
              <button className="btn-icon" onClick={() => setShowUploadModal(false)}><X size={20}/></button>
            </div>
            
            <form onSubmit={handleUploadSubmit} className="modal-body">
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Lesson Title</label>
                  <input required className="form-input" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="e.g. Intro to Quantum Mechanics" />
                </div>
                <div className="form-group">
                  <label className="form-label">Blackboard Module (Course)</label>
                  <select required className="form-select" value={formData.courseId} onChange={e => setFormData({...formData, courseId: e.target.value})}>
                    <option value="">Select a Course...</option>
                    {data.courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              {uploadType === 'video' ? (
                <div style={{ marginTop: '20px' }}>
                  <label className="form-label">Video Source</label>
                  <div className="upload-tabs">
                    <div className={`upload-tab ${videoSource === 'youtube' ? 'active' : ''}`} onClick={() => setVideoSource('youtube')}>
                      <Youtube size={16} /> YouTube Link
                    </div>
                    <div className={`upload-tab ${videoSource === 'local' ? 'active' : ''}`} onClick={() => setVideoSource('local')}>
                      <Upload size={16} /> Local File
                    </div>
                  </div>

                  {videoSource === 'youtube' ? (
                    <div className="form-group animate-fadeIn">
                      <div className="youtube-input-group" style={{ display: 'flex', alignItems: 'center', background: 'var(--surface-bg)', border: '1px solid var(--border-light)', borderRadius: '8px', padding: '0 12px' }}>
                        <Youtube size={18} color="#ef4444" />
                        <input 
                          className="form-input" 
                          style={{ border: 'none', background: 'transparent', boxShadow: 'none' }}
                          value={formData.youtubeUrl} 
                          onChange={e => setFormData({...formData, youtubeUrl: e.target.value, duration: formData.duration || '12:45'})} 
                          placeholder="https://www.youtube.com/watch?v=..." 
                        />
                      </div>
                      <p className="form-hint" style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '6px' }}>Paste the full YouTube video URL here</p>
                    </div>
                  ) : (
                    <div 
                      className={`upload-dropzone animate-fadeIn ${dragActive ? 'drag-active' : ''}`}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                      style={{ padding: '40px 20px', border: '2px dashed var(--primary-300)', borderRadius: '12px', textAlign: 'center', background: dragActive ? 'var(--primary-50)' : 'var(--surface-bg)', transition: 'all 0.2s', cursor: 'pointer' }}
                    >
                      <input type="file" id="video-upload" hidden onChange={handleFileSelect} accept="video/*" />
                      <label htmlFor="video-upload" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--primary-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-600)' }}>
                           <Video size={24} />
                        </div>
                        <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>Click to browse or drag video here</h4>
                        <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-tertiary)' }}>Supports MP4, WEBM (Max 500MB)</p>
                      </label>
                      {formData.fileName && (
                        <div style={{ marginTop: '16px', display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: 'var(--success-50)', color: 'var(--success-700)', borderRadius: '100px', fontSize: '12px', fontWeight: 600 }}>
                          <CheckSquare size={14} /> {formData.fileName}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ marginTop: '20px' }}>
                  <label className="form-label">Material File</label>
                  <div 
                    className={`upload-dropzone animate-fadeIn ${dragActive ? 'drag-active' : ''}`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    style={{ padding: '40px 20px', border: '2px dashed var(--accent-300)', borderRadius: '12px', textAlign: 'center', background: dragActive ? 'var(--accent-50)' : 'var(--surface-bg)', transition: 'all 0.2s', cursor: 'pointer' }}
                  >
                    <input type="file" id="material-upload" hidden onChange={handleFileSelect} accept=".pdf,.doc,.docx,.ppt,.pptx" />
                    <label htmlFor="material-upload" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--accent-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-600)' }}>
                         <BookOpen size={24} />
                      </div>
                      <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>Click to browse or drag document here</h4>
                      <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-tertiary)' }}>PDF, PPTX, or DOC (Max 50MB)</p>
                    </label>
                    {formData.fileName && (
                      <div style={{ marginTop: '16px', display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: 'var(--success-50)', color: 'var(--success-700)', borderRadius: '100px', fontSize: '12px', fontWeight: 600 }}>
                        <CheckSquare size={14} /> {formData.fileName}
                      </div>
                    )}
                  </div>
                  
                  <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '16px' }}>
                    <input type="checkbox" id="isFormulaSheet" checked={formData.isFormula} onChange={e => setFormData({...formData, isFormula: e.target.checked})} />
                    <label htmlFor="isFormulaSheet" className="form-label" style={{ marginBottom: 0, fontWeight: 500 }}>Mark as Formula Reference Sheet</label>
                  </div>
                </div>
              )}

              <div className="form-group" style={{ marginTop: '20px' }}>
                <label className="form-label">Notes for Students</label>
                <textarea className="form-input" rows={2} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Additional context about this upload..." />
              </div>

              <button type="submit" className="btn btn-primary btn-lg w-100" style={{marginTop: '24px'}}>
                {uploadType === 'video' ? <><Video size={18} /> Publish Video Lesson</> : <><FileCheck size={18} /> Publish Material</>}
              </button>
            </form>
          </div>
        </div>
      )}

      {showScheduleModal && (
        <div className="modal-overlay" onClick={() => setShowScheduleModal(false)}>
           <div className="modal-content animate-scaleIn" onClick={e => e.stopPropagation()}>
             <div className="modal-header">
                <h2>Schedule Live Session</h2>
                <button className="btn-icon" onClick={() => setShowScheduleModal(false)}><X size={20}/></button>
             </div>
             <form onSubmit={handleScheduleLive} className="modal-body">
                <div className="form-group">
                   <label className="form-label">Class Topic</label>
                   <input required className="form-input" value={liveClassData.title} onChange={e => setLiveClassData({...liveClassData, title: e.target.value})} placeholder="e.g. Calculus Intensive" />
                </div>
                <div className="form-group">
                   <label className="form-label">Assigned Batch</label>
                   <select required className="form-select" value={liveClassData.courseId} onChange={e => setLiveClassData({...liveClassData, courseId: e.target.value})}>
                      <option value="">Select Batch...</option>
                      {data.courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                   </select>
                </div>
                <div className="form-grid">
                   <div className="form-group">
                      <label className="form-label">Start Time</label>
                      <input type="time" className="form-input" value={liveClassData.time} onChange={e => setLiveClassData({...liveClassData, time: e.target.value})} />
                   </div>
                   <div className="form-group">
                      <label className="form-label">Platform</label>
                      <select className="form-select" value={liveClassData.platform} onChange={e => setLiveClassData({...liveClassData, platform: e.target.value})}>
                         <option value="Zoom">Zoom</option>
                         <option value="Google Meet">Google Meet</option>
                         <option value="Microsoft Teams">MS Teams</option>
                      </select>
                   </div>
                </div>
                <div className="form-group">
                   <label className="form-label">Session Link</label>
                   <input required className="form-input" value={liveClassData.link} onChange={e => setLiveClassData({...liveClassData, link: e.target.value})} placeholder="Paste meeting URL here" />
                </div>
                <button type="submit" className="btn btn-primary btn-lg w-100" style={{ marginTop: '16px' }}>Confirm Schedule</button>
             </form>
           </div>
        </div>
      )}

      {showTestModal && (
        <div className="modal-overlay" onClick={() => setShowTestModal(false)}>
           <div className="modal-content animate-scaleIn" onClick={e => e.stopPropagation()} style={{ maxWidth: '800px' }}>
             <div className="modal-header">
                <h2>Design Academic Test</h2>
                <button className="btn-icon" onClick={() => setShowTestModal(false)}><X size={20}/></button>
             </div>
             
             <div className="test-builder-tabs">
                <button type="button" className={`builder-tab ${creationMode === 'manual' ? 'active' : ''}`} onClick={() => setCreationMode('manual')}>
                  <List size={16} /> Manual Entry
                </button>
                <button type="button" className={`builder-tab ${creationMode === 'upload' ? 'active' : ''}`} onClick={() => setCreationMode('upload')}>
                  <Upload size={16} /> Upload Document
                </button>
             </div>

             <form onSubmit={handlePublishTest} className="modal-body">
                <div className="form-group">
                   <label className="form-label">Test Title</label>
                   <input required className="form-input" value={testData.title} onChange={e => setTestData({...testData, title: e.target.value})} placeholder="e.g. Kinematics Weekly Mock" />
                </div>
                
                <div className="form-grid">
                   <div className="form-group">
                      <label className="form-label">Duration (Mins)</label>
                      <input type="number" required className="form-input" value={testData.duration} onChange={e => setTestData({...testData, duration: parseInt(e.target.value)})} />
                   </div>
                   <div className="form-group">
                      <label className="form-label">Difficulty Level</label>
                      <select className="form-select" value={testData.level} onChange={e => setTestData({...testData, level: e.target.value})}>
                         <option value="Low">Low (Basic)</option>
                         <option value="Medium">Medium (Intermediate)</option>
                         <option value="High">High (Advanced)</option>
                      </select>
                   </div>
                   <div className="form-group">
                      <label className="form-label">Marks / Correct</label>
                      <input type="number" className="form-input" value={testData.marksPerQuestion} onChange={e => setTestData({...testData, marksPerQuestion: parseInt(e.target.value)})} />
                   </div>
                   <div className="form-group">
                      <label className="form-label">Negative Marking</label>
                      <input type="number" className="form-input" value={testData.negativeMarking} onChange={e => setTestData({...testData, negativeMarking: parseInt(e.target.value)})} />
                   </div>
                </div>

                {creationMode === 'manual' ? (
                  <div className="manual-entry-area">
                    <div className="question-composer">
                      <label className="form-label">Question Text</label>
                      <textarea className="form-input" rows="2" value={manualQuestion.text} onChange={e => setManualQuestion({...manualQuestion, text: e.target.value})} placeholder="Type your question here..." />
                      
                      <div className="options-grid">
                        {manualQuestion.options.map((opt, idx) => (
                          <div key={idx} className="option-input-group">
                            <input type="radio" name="correct" checked={manualQuestion.answer === idx} onChange={() => setManualQuestion({...manualQuestion, answer: idx})} />
                            <input className="form-input" value={opt} onChange={e => {
                              const newOpts = [...manualQuestion.options];
                              newOpts[idx] = e.target.value;
                              setManualQuestion({...manualQuestion, options: newOpts});
                            }} placeholder={`Option ${['A', 'B', 'C', 'D'][idx]}`} />
                          </div>
                        ))}
                      </div>

                      {/* Live Question Preview Card */}
                      <div className="live-question-preview-card" style={{ marginTop: '16px', marginBottom: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '11px', color: 'var(--primary-400)', fontWeight: 600 }}>
                          <span>LIVE QUESTION PREVIEW (STUDENT VIEW)</span>
                          <span>+{testData.marksPerQuestion} / -{testData.negativeMarking}</span>
                        </div>
                        <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', color: 'var(--text-primary)', fontWeight: 600 }}>
                          {manualQuestion.text || <span style={{ color: 'var(--text-tertiary)', fontStyle: 'italic' }}>Your question text will appear here...</span>}
                        </h4>
                        <div className="preview-options-list" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {manualQuestion.options.map((opt, idx) => (
                            <div key={idx} className={`preview-option-item ${manualQuestion.answer === idx ? 'correct-preview' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', background: 'var(--gray-900)', border: manualQuestion.answer === idx ? '1px solid var(--primary)' : '1px solid var(--border-light)', borderRadius: '8px', fontSize: '13px' }}>
                              <div className="radio-circle" style={{ width: '16px', height: '16px', borderRadius: '50%', border: '2px solid', borderColor: manualQuestion.answer === idx ? 'var(--primary)' : 'var(--text-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {manualQuestion.answer === idx && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)' }} />}
                              </div>
                              <span style={{ fontWeight: 600 }}>{['A', 'B', 'C', 'D'][idx]}.</span>
                              <span>{opt || <span style={{ color: 'var(--text-tertiary)', fontStyle: 'italic' }}>Option placeholder...</span>}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <button type="button" className="btn btn-secondary w-100" style={{ marginTop: '16px' }} onClick={handleAddQuestion}>
                        <Plus size={16} /> Add Question to Test
                      </button>
                    </div>

                    <div className="questions-preview">
                      <h4>Questions in Test ({testData.questions.length})</h4>
                      <div className="questions-list">
                        {testData.questions.map((q, idx) => (
                          <div key={idx} className="q-preview-item">
                            <span>{idx + 1}. {q.questionText}</span>
                            <span className="ans-badge">Ans: {q.answer}</span>
                          </div>
                        ))}
                        {testData.questions.length === 0 && <p className="empty-msg">No questions added yet.</p>}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="upload-entry-area">
                    <div className={`drop-zone ${dragActive ? 'active' : ''}`} onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}>
                      <FileText size={32} />
                      <p>Drag & drop PDF/Word document here to extract questions</p>
                      <span>- or -</span>
                      <button type="button" className="btn btn-ghost" onClick={handleSimulateAI}>Browse & Extract</button>
                    </div>
                    {testData.questions.length > 0 && (
                      <div className="extract-success animate-fadeIn">
                        <CheckCircle2 size={16} color="var(--success)" />
                        <span>AI Extracted {testData.questions.length} questions successfully!</span>
                      </div>
                    )}
                  </div>
                )}

                <button type="submit" className="elite-btn-primary btn-lg w-100" style={{ marginTop: '24px' }}>
                  Publish Test Series
                </button>
             </form>
           </div>
        </div>
      )}

      {showAnnounceModal && (
        <div className="modal-overlay" onClick={() => setShowAnnounceModal(false)}>
           <div className="modal-content animate-scaleIn" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
             <div className="modal-header">
                <h2>Broadcast Notification</h2>
                <button className="btn-icon" onClick={() => setShowAnnounceModal(false)}><X size={20}/></button>
             </div>
             <form onSubmit={handleCreateAnnouncement} className="modal-body">
                <div className="form-group">
                   <label className="form-label">Title / Subject</label>
                   <input required className="form-input" value={newAnnouncement.title} onChange={e => setNewAnnouncement({...newAnnouncement, title: e.target.value})} placeholder="e.g. Tomorrow's class rescheduled" />
                </div>
                <div className="form-group">
                   <label className="form-label">Message Content</label>
                   <textarea required className="form-input" rows="4" value={newAnnouncement.content} onChange={e => setNewAnnouncement({...newAnnouncement, content: e.target.value})} placeholder="Detailed message for students..." />
                </div>
                <button type="submit" className="btn btn-primary w-100" style={{ marginTop: '16px' }}><Send size={18} /> Send Notification to Students</button>
             </form>
           </div>
        </div>
      )}
    </div>
    </>
  );
}
