import { useState, useEffect } from 'react';
import { 
  X, Users, Clock, MessageCircle, Maximize2, 
  Circle, Play, Info
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import DigitalBoard from '../../components/LiveRoom/DigitalBoard';
import LiveChat from '../../components/LiveRoom/LiveChat';
import './StudentLiveRoom.css';

export default function StudentLiveRoom({ session, onLeave }) {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [viewerCount, setViewerCount] = useState(128);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime(prev => prev + 1);
      setViewerCount(v => v + (Math.floor(Math.random() * 5) - 2));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="student-live-overlay animate-fadeIn">
      {/* Top Bar */}
      <div className="studio-header">
        <div className="session-info">
          <div className="live-pill">LIVE</div>
          <div className="session-meta">
            <h3>{session?.title || "Advanced Calculus Session"}</h3>
            <span className="batch-name">{session?.teacherName || "Dr. Ramesh Babu"} • Mathematics</span>
          </div>
        </div>

        <div className="studio-stats">
          <div className="stat-pill">
            <Users size={14} /> {viewerCount}
          </div>
          <div className="stat-pill">
            <Clock size={14} /> {formatTime(elapsedTime)}
          </div>
        </div>

        <button className="leave-session-btn" onClick={onLeave}>
          Exit Room
        </button>
      </div>

      <div className="student-workspace">
        <div className="primary-view">
          <div className="live-video-sim">
             <div className="teacher-video-placeholder">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${session?.teacherId || 'teacher-1'}`} alt="Teacher" />
             </div>
             <div className="live-indicator-overlay">
                <Circle size={8} fill="#ef4444" color="#ef4444" /> Live from Classroom
             </div>
          </div>
          <div className="integrated-board">
            <div className="board-header-label">
                <Info size={14} /> Teacher's Digital Board (Real-time Sync)
            </div>
            <DigitalBoard isReadOnly={true} />
          </div>
        </div>

        <div className="sidebar-view">
           <LiveChat />
        </div>
      </div>
    </div>
  );
}
