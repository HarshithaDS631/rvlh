import { useEffect, useRef } from 'react';
import { ChevronRight } from 'lucide-react';
import './LMSArchitecture.css';

/* ─────────── DATA ─────────── */

const studentDashboard = ['My Courses', 'Live Classes', 'Test Series', 'Study Material', 'Doubt Support', 'Progress & Reports'];
const facultyDashboard = ['My Batches', 'Upload Content', 'Schedule Classes', 'Create Tests', 'Student Tracker', 'Analytics'];
const adminDashboard = ['User Management', 'Course Builder', 'Fee & Billing', 'Reports & Analytics', 'Notifications', 'System Settings'];

const coreModules = [
  { name: 'Video Streaming', color: '#38b2ac' },
  { name: 'Test Engine', color: '#38b2ac' },
  { name: 'Doubt Forum', color: '#38b2ac' },
  { name: 'Notifications', color: '#38b2ac' },
  { name: 'Payment Gateway', color: '#6366f1' },
  { name: 'AI Analytics', color: '#805ad5' },
  { name: 'Mobile App', color: '#805ad5' },
  { name: 'Cloud Storage', color: '#805ad5' },
];

const studentFlow = {
  onboarding: [
    { title: 'Student Registers', sub: 'Name, Phone, Email, Course' },
    { title: 'OTP Verification', sub: 'Mobile / Email' },
    { title: 'Profile Setup', sub: 'Target Exam, Batch, Photo' },
    { title: 'Fee Payment', sub: 'Online / Offline / EMI' },
    { title: 'Course Enrollment', sub: 'JEE / NEET / Commerce' },
    { title: 'Student Dashboard', sub: 'Home Screen' },
  ],
  dailyLearning: [
    { title: 'View Schedule', sub: 'Live / Recorded Classes' },
    { title: 'Join Live Class', sub: 'Zoom / In-house Streaming' },
    { title: 'Watch Recorded Lecture', sub: '480p / 720p / 1080p' },
    { title: 'Download Notes / PDF', sub: 'Chapter-wise Material' },
    { title: 'Mark Topic Complete', sub: 'Progress Tracking' },
    { title: 'Ask Doubt', sub: 'Forum / Live Chat / Call' },
  ],
  tests: [
    { title: 'Access Test Series', sub: 'Chapter / Full Syllabus / Mock' },
    { title: 'Attempt Test', sub: 'MCQ, Integer, Numerical' },
    { title: 'Submit Test', sub: 'Auto-evaluated' },
    { title: 'View Solutions', sub: 'Step-by-step Explanation' },
    { title: 'Check Rank', sub: 'Batch / All-India Rank' },
    { title: 'Analyse Performance', sub: 'Topic-wise Accuracy & Speed' },
    { title: 'Weak Area Suggestions', sub: 'AI Recommendations' },
  ],
  progress: [
    { title: 'Attendance Tracker', sub: 'Class-wise & Overall %' },
    { title: 'Performance Report', sub: 'Monthly / Weekly' },
    { title: 'Leaderboard', sub: 'Batch / Centre Rankings' },
    { title: 'Fee Status', sub: 'Paid / Pending / Receipt' },
    { title: 'Request Leave / Transfer', sub: 'Batch Change, ID Card' },
    { title: 'Feedback to Faculty', sub: 'Ratings & Comments' },
  ],
};

const doubtFlow = ['Student Posts Doubt', 'Assigned to Faculty', 'Faculty Replies', 'Student Notified', 'Mark Resolved ✓'];

const facultyFlow = {
  content: [
    { title: 'Faculty Login', sub: 'Credentials / OTP' },
    { title: 'View Assigned Batches', sub: 'JEE Adv / NEET / Commerce' },
    { title: 'Upload Video Lecture', sub: 'MP4 / Recorded Class' },
    { title: 'Add Chapter Notes', sub: 'PDF / PPT / Images' },
    { title: 'Tag Content', sub: 'Subject > Chapter > Topic' },
    { title: 'Set Visibility', sub: 'All / Specific Batch' },
    { title: 'Publish / Schedule', sub: 'Immediate or Date-based' },
  ],
  liveClass: [
    { title: 'Schedule Class', sub: 'Date, Time, Subject, Topic' },
    { title: 'Set Platform', sub: 'In-app / Zoom / Google Meet' },
    { title: 'Notify Students', sub: 'Push + SMS + Email' },
    { title: 'Start Live Session', sub: '1-click from Dashboard' },
    { title: 'Conduct Class', sub: 'Whiteboard, Screen Share, Chat' },
    { title: 'Take Live Attendance', sub: 'Auto via Login' },
    { title: 'End & Auto-save Recording', sub: 'Available in 30 mins' },
  ],
  testCreation: [
    { title: 'Open Test Builder', sub: 'Wizard-based Interface' },
    { title: 'Set Test Type', sub: 'Chapter / Mock / DPP / Weekly' },
    { title: 'Add Questions', sub: 'From Bank or Manual Entry' },
    { title: 'Set Marking Scheme', sub: '+4/-1 or Custom' },
    { title: 'Set Duration & Window', sub: 'Time Limit & Dates' },
    { title: 'Assign to Batches', sub: 'Select Recipients' },
    { title: 'Publish Test', sub: 'Students Notified' },
  ],
  monitoring: [
    { title: 'View Class Analytics', sub: 'Attendance, Engagement' },
    { title: 'Check Test Results', sub: 'Batch-wise Score Report' },
    { title: 'Identify Weak Students', sub: 'Below Threshold Alert' },
    { title: 'Send Personal Feedback', sub: 'In-app Message' },
    { title: 'Resolve Doubts', sub: 'Forum / Direct Reply' },
    { title: 'Monthly Faculty Report', sub: 'Classes, Tests, Ratings' },
  ],
};

const adminFlow = {
  userMgmt: [
    { title: 'Admin Login', sub: '2FA Secured' },
    { title: 'Add / Edit Students', sub: 'Bulk Upload via CSV' },
    { title: 'Add / Edit Faculty', sub: 'Assign Subjects & Batches' },
    { title: 'Create Batches', sub: 'JEE / NEET / XI / XII' },
    { title: 'Assign Students to Batch', sub: 'Manual or Auto by Rank' },
    { title: 'Manage Roles & Permissions', sub: 'Sub-admin, Counsellor' },
    { title: 'Deactivate / Archive Users', sub: 'Pass-out / Dropout' },
  ],
  feeMgmt: [
    { title: 'Set Course Fee Structure', sub: 'Yearly / Monthly / One-time' },
    { title: 'Student Fee Records', sub: 'Paid / Due / Overdue' },
    { title: 'Generate Fee Receipts', sub: 'PDF / Email / WhatsApp' },
    { title: 'Send Payment Reminders', sub: 'Auto SMS / Email' },
    { title: 'Approve Scholarships', sub: 'Merit / Need-based' },
    { title: 'Financial Reports', sub: 'Monthly / Quarterly Revenue' },
  ],
  communication: [
    { title: 'Send Announcements', sub: 'All / Batch / Individual' },
    { title: 'WhatsApp Broadcasts', sub: 'Integrated API' },
    { title: 'Email Campaigns', sub: 'Results, Admissions, Events' },
    { title: 'Push Notifications', sub: 'Mobile App Alerts' },
    { title: 'SMS Gateway', sub: 'Attendance, Fee, Schedule' },
    { title: 'Parent Portal Alerts', sub: 'Attendance & Performance' },
  ],
  reports: [
    { title: 'Enrollment Dashboard', sub: 'Total, Active, Dropout' },
    { title: 'Attendance Overview', sub: 'Centre & Batch-wise' },
    { title: 'Academic Performance', sub: 'Test Averages & Trends' },
    { title: 'Faculty Performance', sub: 'Ratings, Coverage, Tests' },
    { title: 'Revenue Analytics', sub: 'Collection vs Target' },
    { title: 'Export to Excel / PDF', sub: 'Any Report, Any Period' },
  ],
};

const courseBuilderFlow = ['Create Course', 'Add Subjects', 'Add Chapters', 'Link Content', 'Set Prerequisites', 'Assign Faculty', 'Publish Course', 'Students Enrolled'];

const techArch = {
  frontend: [
    { name: 'Web App (React)', sub: 'Student / Faculty / Admin', color: 'blue' },
    { name: 'Mobile App (Flutter)', sub: 'iOS + Android', color: 'green' },
    { name: 'Admin Panel', sub: 'Internal Tools', color: 'red' },
  ],
  microservices: [
    { name: 'Auth Service', sub: 'JWT / OAuth2 / OTP', color: 'blue' },
    { name: 'Course Service', sub: 'Content & Scheduling', color: 'green' },
    { name: 'Test Engine', sub: 'MCQ / Evaluation', color: 'blue' },
    { name: 'Notification Service', sub: 'Push/SMS/Email', color: 'green' },
    { name: 'Analytics Engine', sub: 'Reports & AI', color: 'purple' },
  ],
  dataLayer: [
    { name: 'PostgreSQL DB', sub: 'Users, Courses, Tests' },
    { name: 'AWS S3 / CDN', sub: 'Videos, PDFs, Images' },
    { name: 'Redis Cache', sub: 'Sessions, Rankings' },
    { name: 'Elasticsearch', sub: 'Search & Doubt Index' },
  ],
};

const integrations = [
  { name: 'Razorpay / PayU', sub: 'Fee Collection', color: 'blue' },
  { name: 'Zoom / Agora', sub: 'Live Classes', color: 'blue' },
  { name: 'WhatsApp API', sub: 'Parent Alerts', color: 'green' },
  { name: 'Twilio / MSG91', sub: 'SMS Gateway', color: 'green' },
  { name: 'Firebase', sub: 'Push Notifications', color: 'teal' },
  { name: 'YouTube Private', sub: 'Video Hosting', color: 'purple' },
  { name: 'Google Analytics', sub: 'Usage Tracking', color: 'purple' },
  { name: 'DigiLocker', sub: 'Certificate Issue', color: 'purple' },
];

const security = [
  'Role-Based Access', 'DRM Video Protection', 'Anti-Screenshot/Record',
  '2FA Authentication', 'Device Binding', 'Data Encryption (AES)',
  'Audit Logs', 'GDPR / IT Act Compliant',
];

/* ─────────── HELPERS ─────────── */

function FadeIn({ children, className = '' }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('lms-arch__fade-in--visible');
          obs.unobserve(el);
        }
      },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} className={`lms-arch__fade-in ${className}`}>
      {children}
    </div>
  );
}

function Connector({ label }) {
  return (
    <div className="lms-arch__connector">
      <div className="lms-arch__connector-line" />
      {label && <span className="lms-arch__connector-label">{label}</span>}
      <div className="lms-arch__connector-arrow">▼</div>
    </div>
  );
}

function FlowColumn({ headerClass, headerLabel, items, itemClass, borderClass }) {
  return (
    <div className={`lms-arch__flow-column ${borderClass}`}>
      <div className={`lms-arch__flow-header ${headerClass}`}>{headerLabel}</div>
      <div className="lms-arch__flow-items">
        {items.map((item, i) => (
          <div key={i} className={`lms-arch__flow-item ${itemClass}`}>
            <h5>{item.title}</h5>
            <p>{item.sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function HorizontalFlow({ steps, stepClass, highlightLast }) {
  return (
    <div className="lms-arch__h-flow-steps">
      {steps.map((step, i) => (
        <span key={i} style={{ display: 'contents' }}>
          <div
            className={`lms-arch__h-flow-step ${
              highlightLast && i === steps.length - 1 ? 'lms-arch__h-flow-step--highlight' : stepClass
            }`}
          >
            {step}
          </div>
          {i < steps.length - 1 && (
            <div className="lms-arch__h-flow-arrow">
              <ChevronRight size={18} />
            </div>
          )}
        </span>
      ))}
    </div>
  );
}

/* ─────────── MAIN COMPONENT ─────────── */

export default function LMSArchitecture() {
  return (
    <div className="lms-arch">
      {/* ── Banner ── */}
      <div className="lms-arch__banner">RV LEARNING HUB • LMS ARCHITECTURE</div>

      {/* ── Hero ── */}
      <div className="lms-arch__hero">
        <h1>Learning Management System</h1>
        <p>Complete Flowchart — JEE • NEET • Commerce</p>
        <div className="lms-arch__legend">
          <span className="lms-arch__legend-item">
            <span className="lms-arch__legend-dot lms-arch__legend-dot--student" />Student
          </span>
          <span className="lms-arch__legend-item">
            <span className="lms-arch__legend-dot lms-arch__legend-dot--faculty" />Faculty
          </span>
          <span className="lms-arch__legend-item">
            <span className="lms-arch__legend-dot lms-arch__legend-dot--admin" />Admin
          </span>
          <span className="lms-arch__legend-item">
            <span className="lms-arch__legend-dot lms-arch__legend-dot--system" />System
          </span>
        </div>
      </div>

      <div className="lms-arch__divider" />

      <div className="lms-arch__container">
        {/* ================================================================
            SECTION 1 — OVERVIEW
           ================================================================ */}
        <FadeIn>
          <section className="lms-arch__section" id="overview">
            <h2 className="lms-arch__section-title lms-arch__section-title--student">1. OVERVIEW</h2>

            <div className="lms-arch__overview-layout">
              {/* Auth Flow (left) */}
              <div className="lms-arch__auth-flow">
                <div className="lms-arch__auth-card">
                  <h4>RV Learning Hub LMS</h4>
                  <p>www.rvlearninghub.com</p>
                </div>
                <div className="lms-arch__auth-connector" />
                <div className="lms-arch__auth-card">
                  <h4>Authentication Check</h4>
                  <p>OTP / Password Verification</p>
                </div>
                <div className="lms-arch__auth-connector" />
                <div className="lms-arch__auth-card">
                  <h4>Role-Based Access Granted</h4>
                  <p>Student / Faculty / Admin</p>
                </div>
              </div>

              {/* Dashboard Columns */}
              <div className="lms-arch__dashboards">
                <div className="lms-arch__dashboard lms-arch__dashboard--student">
                  <div className="lms-arch__dashboard-header lms-arch__dashboard-header--student">Student Dashboard</div>
                  <div className="lms-arch__dashboard-list">
                    {studentDashboard.map((item, i) => (
                      <div key={i} className="lms-arch__dashboard-item">{item}</div>
                    ))}
                  </div>
                </div>

                <div className="lms-arch__dashboard lms-arch__dashboard--faculty">
                  <div className="lms-arch__dashboard-header lms-arch__dashboard-header--faculty">Faculty Dashboard</div>
                  <div className="lms-arch__dashboard-list">
                    {facultyDashboard.map((item, i) => (
                      <div key={i} className="lms-arch__dashboard-item">{item}</div>
                    ))}
                  </div>
                </div>

                <div className="lms-arch__dashboard lms-arch__dashboard--admin">
                  <div className="lms-arch__dashboard-header lms-arch__dashboard-header--admin">Admin Dashboard</div>
                  <div className="lms-arch__dashboard-list">
                    {adminDashboard.map((item, i) => (
                      <div key={i} className="lms-arch__dashboard-item">{item}</div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Core LMS Modules */}
            <div className="lms-arch__core-modules">
              <h3>Core LMS Modules (Shared Infrastructure)</h3>
              <div className="lms-arch__modules-grid">
                {coreModules.map((m, i) => (
                  <div key={i} className="lms-arch__module-chip">
                    <span className="chip-dot" style={{ background: m.color }} />
                    {m.name}
                  </div>
                ))}
              </div>
            </div>
          </section>
        </FadeIn>

        <div className="lms-arch__divider" />

        {/* ================================================================
            SECTION 2 — STUDENT FLOW
           ================================================================ */}
        <FadeIn>
          <section className="lms-arch__section" id="student-flow">
            <h2 className="lms-arch__section-title lms-arch__section-title--student">2. STUDENT FLOW</h2>
            <p className="lms-arch__section-subtitle">Student Complete Journey</p>

            <div className="lms-arch__flow-grid">
              <FlowColumn
                headerClass="lms-arch__flow-header--teal"
                headerLabel="Onboarding"
                items={studentFlow.onboarding}
                itemClass="lms-arch__flow-item--teal"
                borderClass="lms-arch__flow-column--student"
              />
              <FlowColumn
                headerClass="lms-arch__flow-header--teal"
                headerLabel="Daily Learning"
                items={studentFlow.dailyLearning}
                itemClass="lms-arch__flow-item--teal"
                borderClass="lms-arch__flow-column--student"
              />
              <FlowColumn
                headerClass="lms-arch__flow-header--teal"
                headerLabel="Tests & Results"
                items={studentFlow.tests}
                itemClass="lms-arch__flow-item--teal"
                borderClass="lms-arch__flow-column--student"
              />
              <FlowColumn
                headerClass="lms-arch__flow-header--teal"
                headerLabel="Progress & Profile"
                items={studentFlow.progress}
                itemClass="lms-arch__flow-item--teal"
                borderClass="lms-arch__flow-column--student"
              />
            </div>

            {/* Doubt Resolution Flow */}
            <div className="lms-arch__h-flow">
              <h3 className="lms-arch__h-flow-title">
                <span className="dot" style={{ background: '#38b2ac' }} />
                Doubt Resolution Flow
              </h3>
              <HorizontalFlow steps={doubtFlow} stepClass="lms-arch__h-flow-step--teal" highlightLast />
            </div>
          </section>
        </FadeIn>

        <div className="lms-arch__divider" />

        {/* ================================================================
            SECTION 3 — FACULTY FLOW
           ================================================================ */}
        <FadeIn>
          <section className="lms-arch__section" id="faculty-flow">
            <h2 className="lms-arch__section-title lms-arch__section-title--faculty">3. FACULTY FLOW</h2>
            <p className="lms-arch__section-subtitle">Faculty Complete Workflow</p>

            <div className="lms-arch__flow-grid">
              <FlowColumn
                headerClass="lms-arch__flow-header--teal"
                headerLabel="Content Management"
                items={facultyFlow.content}
                itemClass="lms-arch__flow-item--teal"
                borderClass="lms-arch__flow-column--faculty"
              />
              <FlowColumn
                headerClass="lms-arch__flow-header--teal"
                headerLabel="Live Class Flow"
                items={facultyFlow.liveClass}
                itemClass="lms-arch__flow-item--teal"
                borderClass="lms-arch__flow-column--faculty"
              />
              <FlowColumn
                headerClass="lms-arch__flow-header--teal"
                headerLabel="Test Creation"
                items={facultyFlow.testCreation}
                itemClass="lms-arch__flow-item--teal"
                borderClass="lms-arch__flow-column--faculty"
              />
              <FlowColumn
                headerClass="lms-arch__flow-header--purple"
                headerLabel="Monitoring"
                items={facultyFlow.monitoring}
                itemClass="lms-arch__flow-item--purple"
                borderClass="lms-arch__flow-column--admin-purple"
              />
            </div>
          </section>
        </FadeIn>

        <div className="lms-arch__divider" />

        {/* ================================================================
            SECTION 4 — ADMIN FLOW
           ================================================================ */}
        <FadeIn>
          <section className="lms-arch__section" id="admin-flow">
            <h2 className="lms-arch__section-title lms-arch__section-title--admin">4. ADMIN FLOW</h2>
            <p className="lms-arch__section-subtitle">Admin Control Panel</p>

            <div className="lms-arch__flow-grid">
              <FlowColumn
                headerClass="lms-arch__flow-header--red"
                headerLabel="User Management"
                items={adminFlow.userMgmt}
                itemClass="lms-arch__flow-item--red"
                borderClass="lms-arch__flow-column--admin-red"
              />
              <FlowColumn
                headerClass="lms-arch__flow-header--green"
                headerLabel="Fee Management"
                items={adminFlow.feeMgmt}
                itemClass="lms-arch__flow-item--green"
                borderClass="lms-arch__flow-column--admin-green"
              />
              <FlowColumn
                headerClass="lms-arch__flow-header--green"
                headerLabel="Communication"
                items={adminFlow.communication}
                itemClass="lms-arch__flow-item--green"
                borderClass="lms-arch__flow-column--admin-green"
              />
              <FlowColumn
                headerClass="lms-arch__flow-header--red"
                headerLabel="Reports & Analytics"
                items={adminFlow.reports}
                itemClass="lms-arch__flow-item--red"
                borderClass="lms-arch__flow-column--admin-red"
              />
            </div>

            {/* Course Builder Flow */}
            <div className="lms-arch__h-flow">
              <h3 className="lms-arch__h-flow-title">
                <span className="dot" style={{ background: '#805ad5' }} />
                <span className="dot" style={{ background: '#805ad5' }} />
                Course Builder Flow (Admin)
              </h3>
              <HorizontalFlow steps={courseBuilderFlow} stepClass="lms-arch__h-flow-step--green" highlightLast />
            </div>
          </section>
        </FadeIn>

        <div className="lms-arch__divider" />

        {/* ================================================================
            SECTION 5 — SYSTEM ARCHITECTURE
           ================================================================ */}
        <FadeIn>
          <section className="lms-arch__section" id="system-architecture">
            <h2 className="lms-arch__section-title lms-arch__section-title--system">5. SYSTEM ARCHITECTURE</h2>

            {/* Technical Architecture */}
            <h3 className="lms-arch__sub-title">
              <span className="dot" style={{ background: '#805ad5' }} />
              <span className="dot" style={{ background: '#6366f1' }} />
              Technical Architecture
            </h3>

            {/* Frontend Layer */}
            <div className="lms-arch__frontend-row">
              {techArch.frontend.map((item, i) => (
                <div key={i} className={`lms-arch__tech-box lms-arch__tech-box--${item.color}`}>
                  <h4>{item.name}</h4>
                  <p>{item.sub}</p>
                </div>
              ))}
            </div>

            <Connector label="API Requests" />

            {/* API Gateway */}
            <div className="lms-arch__gateway">
              API Gateway / Load Balancer
            </div>

            <Connector label="Microservices" />

            {/* Microservices */}
            <div className="lms-arch__services-row">
              {techArch.microservices.map((svc, i) => (
                <div key={i} className={`lms-arch__tech-box lms-arch__tech-box--${svc.color}`}>
                  <h4>{svc.name}</h4>
                  <p>{svc.sub}</p>
                </div>
              ))}
            </div>

            <Connector label="Data Layer" />

            {/* Data Layer */}
            <div className="lms-arch__data-row">
              {techArch.dataLayer.map((d, i) => (
                <div key={i} className="lms-arch__data-box">
                  <h4>{d.name}</h4>
                  <p>{d.sub}</p>
                </div>
              ))}
            </div>

            {/* Key Integrations */}
            <h3 className="lms-arch__sub-title" style={{ color: '#38b2ac' }}>
              <span className="dot" style={{ background: '#38b2ac' }} />
              Key Integrations
            </h3>
            <div className="lms-arch__integrations-grid">
              {integrations.map((intg, i) => (
                <div key={i} className={`lms-arch__integration-chip lms-arch__integration-chip--${intg.color}`}>
                  <h5>{intg.name}</h5>
                  <p>{intg.sub}</p>
                </div>
              ))}
            </div>

            {/* Security & Compliance */}
            <h3 className="lms-arch__sub-title" style={{ color: '#e53e3e', marginTop: '32px' }}>
              <span className="dot" style={{ background: '#e53e3e' }} />
              Security & Compliance
            </h3>
            <div className="lms-arch__security-grid">
              {security.map((s, i) => (
                <div key={i} className="lms-arch__security-chip">{s}</div>
              ))}
            </div>
          </section>
        </FadeIn>
      </div>

      {/* ── Footer ── */}
      <div className="lms-arch__footer">
        RV Learning Hub LMS Flowchart • All 3 Roles Covered: Student | Faculty | Admin • Built for JEE • NEET • Commerce
      </div>
    </div>
  );
}
