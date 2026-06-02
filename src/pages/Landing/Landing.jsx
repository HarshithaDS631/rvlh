import { Link } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import {
  ArrowRight, Play, BookOpen, Users, Award, Brain, Video,
  Star, ChevronRight, Sparkles, GraduationCap, Target,
  TrendingUp, Check, Zap
} from 'lucide-react';
import './Landing.css';

export default function Landing() {
  const { data } = useStore();
  const featuredCourses = (data?.courses || []).slice(0, 3); // Getting top 3 courses instead of mock data

  return (
    <div className="landing">
      {/* Hero Section */}
      <section className="hero" id="hero">
        <div className="hero-bg">
          <div className="hero-orb hero-orb-1" />
          <div className="hero-orb hero-orb-2" />
          <div className="hero-orb hero-orb-3" />
          <div className="digital-scanline" />
        </div>
        <div className="container hero-container">
          <div className="hero-content animate-fadeInUp">
            <div className="hero-badge">
              <Sparkles size={14} />
              <span>Powered by AI-driven learning</span>
            </div>
            <h1 className="hero-title">
              Unlock Your <span className="hero-highlight">Full Potential</span> with RVLH
            </h1>
            <p className="hero-subtitle">
              India's premier learning platform for PUC students. Access expert-led courses
              for JEE, NEET, KCET & Commerce with AI-powered quizzes and personalized learning paths.
            </p>
            <div className="hero-actions">
              <Link to="/register" className="btn btn-primary btn-lg" id="hero-cta">
                Start Learning Free <ArrowRight size={20} />
              </Link>
              <button className="btn btn-secondary btn-lg hero-play-btn" id="hero-play">
                <div className="hero-play-icon">
                  <Play size={16} fill="currentColor" />
                </div>
                Watch Demo
              </button>
            </div>
            <div className="hero-stats">
              <div className="hero-stat">
                <span className="terminal-readout">Students</span>
                <span className="hero-stat-number neon-text">8,900+</span>
                <span className="hero-stat-label">Active Learners</span>
              </div>
              <div className="hero-stat-divider" />
              <div className="hero-stat">
                <span className="terminal-readout">Lessons</span>
                <span className="hero-stat-number neon-text">1,500+</span>
                <span className="hero-stat-label">Video Lessons</span>
              </div>
              <div className="hero-stat-divider" />
              <div className="hero-stat">
                <span className="terminal-readout">Rating</span>
                <span className="hero-stat-number neon-text">4.8</span>
                <span className="hero-stat-label">Student Rating</span>
              </div>
            </div>
          </div>
          <div className="hero-visual animate-fadeInUp stagger-2">
            <div className="hero-card-stack">
              <div className="hero-preview-card hero-preview-1">
                <div className="hero-preview-header" style={{ background: 'linear-gradient(135deg, #3385ff, #1b64f5)' }}>
                  <BookOpen size={20} color="white" />
                  <span>JEE Advanced</span>
                </div>
                <div className="hero-preview-body">
                  <div className="hero-preview-progress">
                    <span>Progress</span>
                    <div className="progress-bar" style={{ height: '6px' }}>
                      <div className="progress-bar-fill" style={{ width: '72%' }} />
                    </div>
                    <span>72%</span>
                  </div>
                </div>
              </div>
              <div className="hero-preview-card hero-preview-2">
                <div className="hero-preview-header" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                  <Brain size={20} color="white" />
                  <span>AI Quiz</span>
                </div>
                <div className="hero-preview-body">
                  <div className="hero-quiz-score">
                    <div className="hero-score-circle">
                      <span>85%</span>
                    </div>
                    <div className="hero-score-detail">
                      <p>Physics Quiz</p>
                      <p className="hero-score-sub">17/20 correct</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="hero-preview-card hero-preview-3">
                <div className="hero-preview-header" style={{ background: 'linear-gradient(135deg, #a855f7, #7e22ce)' }}>
                  <TrendingUp size={20} color="white" />
                  <span>Analytics</span>
                </div>
                <div className="hero-preview-body">
                  <div className="hero-mini-chart">
                    {[40, 65, 45, 80, 55, 90, 72].map((h, i) => (
                      <div key={i} className="hero-chart-bar" style={{ height: `${h}%` }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <section className="section courses-section" id="courses">
        <div className="container">
          <div className="section-header animate-fadeInUp">
            <span className="section-badge">
              <GraduationCap size={14} /> Courses
            </span>
            <h2 className="section-title">Explore Our Programmes</h2>
            <p className="section-subtitle">
              Comprehensive coaching for JEE, NEET, KCET, and Commerce examinations
            </p>
          </div>
          <div className="courses-grid">
            {featuredCourses.map((course, index) => (
              <div key={course.id} className={`course-card animate-fadeInUp stagger-${index + 1}`}>
                <div className="course-card-image" style={{ background: course.gradient }}>
                  <div className="course-card-overlay">
                    <BookOpen size={48} color="rgba(255,255,255,0.3)" />
                  </div>
                  <div className="course-card-badges">
                    <span className="badge" style={{ background: 'rgba(255,255,255,0.2)', color: 'white', backdropFilter: 'blur(10px)' }}>
                      {course.duration || '9 Months'}
                    </span>
                    <span className="badge" style={{ background: 'rgba(255,255,255,0.2)', color: 'white', backdropFilter: 'blur(10px)' }}>
                      <Star size={12} fill="white" /> {course.rating || '4.8'}
                    </span>
                  </div>
                </div>
                <div className="course-card-body">
                  <h3 className="course-card-title">{course.name}</h3>
                  <p className="course-card-desc">{course.description}</p>
                  <div className="course-card-meta">
                    <span><Video size={14} /> {course.videos || 0} Videos</span>
                    <span><BookOpen size={14} /> {course.modules || 0} Modules</span>
                  </div>
                  <div className="course-card-footer">
                    <div className="course-card-students">
                      <Users size={14} />
                      <span>{(course?.students || 0).toLocaleString()} students</span>
                    </div>
                    <Link to="/register" className="btn btn-sm btn-primary" id={`explore-${course?.id}`}>
                      Explore <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="courses-more">
            <Link to="/register" className="btn btn-secondary btn-lg" id="view-all-courses">
              View All Courses <ChevronRight size={18} />
            </Link>
          </div>
        </div>
      </section>



      {/* Features Section */}
      <section className="section features-section" id="features">
        <div className="container">
          <div className="section-header animate-fadeInUp">
            <span className="section-badge">
              <Zap size={14} /> Features
            </span>
            <h2 className="section-title">Why Choose RVLH?</h2>
            <p className="section-subtitle">
              A modern learning experience designed for PUC students
            </p>
          </div>
          <div className="features-grid">
            {[
              {
                icon: <Video size={28} />,
                title: 'Expert Video Lessons',
                desc: 'High-quality recorded lectures by experienced faculty from top institutions.',
                color: '#3385ff',
              },
              {
                icon: <Brain size={28} />,
                title: 'AI-Powered Quizzes',
                desc: 'Automatically generated quizzes from video content to test your understanding.',
                color: '#10b981',
              },
              {
                icon: <TrendingUp size={28} />,
                title: 'Performance Analytics',
                desc: 'Detailed insights into your learning progress with improvement recommendations.',
                color: '#a855f7',
              },
              {
                icon: <BookOpen size={28} />,
                title: 'Comprehensive Materials',
                desc: 'PDFs, notes, formula sheets, and practice problems for each topic.',
                color: '#f97316',
              },
              {
                icon: <Target size={28} />,
                title: 'Goal-Oriented Learning',
                desc: 'Structured courses aligned with JEE, NEET, KCET, and Board exam syllabus.',
                color: '#06b6d4',
              },
              {
                icon: <Award size={28} />,
                title: 'Track Your Streak',
                desc: 'Stay motivated with daily learning streaks and achievement badges.',
                color: '#ec4899',
              },
            ].map((feature, index) => (
              <div key={index} className={`feature-card hud-card animate-fadeInUp stagger-${index + 1}`}>
                <div className="feature-icon" style={{ '--feature-color': feature.color }}>
                  {feature.icon}
                </div>
                <span className="terminal-readout" style={{ color: feature.color }}>{feature.title}</span>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-desc">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section cta-section" id="about">
        <div className="container">
          <div className="cta-card animate-fadeInUp">
            <div className="cta-content">
              <h2 className="cta-title">Ready to Start Your Journey?</h2>
              <p className="cta-desc">
                Join 8,900+ students already learning on RVLH Learning Hub.
                RVLH students get free unlimited access to all content!
              </p>
              <div className="cta-features">
                {['Free for RVLH students', 'AI-powered quizzes', 'Expert faculty', 'Track progress'].map((f) => (
                  <div key={f} className="cta-feature">
                    <Check size={16} />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
              <div className="cta-actions">
                <Link to="/register" className="btn btn-primary btn-lg" id="cta-signup">
                  Sign Up Now <ArrowRight size={20} />
                </Link>
                <Link to="/login" className="btn btn-secondary btn-lg" id="cta-login">
                  Already have an account?
                </Link>
              </div>
            </div>
            <div className="cta-visual">
              <div className="cta-floating-card cta-float-1 animate-float">
                <Sparkles size={20} color="#f59e0b" />
                <div>
                  <p style={{ fontWeight: 600, fontSize: '14px' }}>Daily Streak</p>
                  <p style={{ fontSize: '24px', fontWeight: 800, color: 'var(--primary-600)' }}>22 Days 🔥</p>
                </div>
              </div>
              <div className="cta-floating-card cta-float-2 animate-float" style={{ animationDelay: '1s' }}>
                <Award size={20} color="#10b981" />
                <div>
                  <p style={{ fontWeight: 600, fontSize: '14px' }}>Quiz Score</p>
                  <p style={{ fontSize: '24px', fontWeight: 800, color: 'var(--accent-600)' }}>92% ✨</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container footer-container">
          <div className="footer-brand">
            <div className="navbar-brand" style={{ marginBottom: '12px' }}>
              <div className="navbar-logo">
                <BookOpen size={24} />
              </div>
              <div className="navbar-brand-text">
                <span className="navbar-brand-name">RVLH</span>
                <span className="navbar-brand-tagline">Learning Hub</span>
              </div>
            </div>
            <p className="footer-desc">
              Premier Learning Management System for PUC students.
              Expert coaching for JEE, NEET, KCET & Commerce.
            </p>
          </div>
          <div className="footer-links">
            <div className="footer-column">
              <h4>Courses</h4>
              <a href="#">JEE Advanced</a>
              <a href="#">JEE Main + CET</a>
              <a href="#">KCET Batch</a>
              <a href="#">NEET UG</a>
              <a href="#">Commerce</a>
              <a href="#">ReVise CET</a>
            </div>
            <div className="footer-column">
              <h4>Platform</h4>
              <a href="#">About Us</a>
              <a href="#">Features</a>
              <a href="#">Pricing</a>
              <a href="#">Contact</a>
            </div>
            <div className="footer-column">
              <h4>Support</h4>
              <a href="#">Help Center</a>
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
              <a href="#">Refund Policy</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <div className="container">
            <p>© 2026 RV Learning Hub. All rights reserved. Designed by Department of Alumni Affairs & Communication.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
