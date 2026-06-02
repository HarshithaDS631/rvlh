import { useState, useEffect, useRef } from 'react';
import { 
  X, Mic, MicOff, Video, VideoOff, Monitor, Settings, 
  Users, Clock, Play, Square, ExternalLink, ChevronRight,
  Maximize2, Minimize2, Layout, Activity, Signal, Wifi, Zap
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import DigitalBoard from '../../components/LiveRoom/DigitalBoard';
import LiveChat from '../../components/LiveRoom/LiveChat';
import './LiveClassroom.css';

export default function LiveClassroom({ session, onEnd }) {
  const { updateEntity } = useStore();
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [layout, setLayout] = useState('split'); // split, whiteboard-focus, camera-focus
  const [elapsedTime, setElapsedTime] = useState(0);
  const videoRef = useRef(null);

  // Stats
  const [viewerCount, setViewerCount] = useState(128);

  useEffect(() => {
    // Start webcam
    if (!isVideoOff) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then(stream => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch(err => {
          console.log("Webcam access denied, using simulated feed", err);
        });
    }

    const timer = setInterval(() => {
      setElapsedTime(prev => prev + 1);
      // Randomly fluctuate viewer count
      setViewerCount(v => v + (Math.floor(Math.random() * 5) - 2));
    }, 1000);

    return () => clearInterval(timer);
  }, [isVideoOff]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndSession = () => {
    if (window.confirm("Are you sure you want to end this live session for all students?")) {
      updateEntity('liveClasses', session.id, { status: 'completed' });
      onEnd();
    }
  };

  return (
    <div className="live-studio-overlay animate-fadeIn">
      {/* Top Bar */}
      <div className="studio-header">
        <div className="session-info">
          <div className="live-pill">LIVE</div>
          <div className="session-meta">
            <h3>{session?.title || "Advanced Calculus Session"}</h3>
            <span className="batch-name">JEE Advanced • Batch A-1</span>
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

        <button className="end-session-btn" onClick={handleEndSession}>
          <Square size={16} fill="currentColor" /> End Session
        </button>
      </div>

      {/* Main Workspace */}
      <div className={`studio-workspace layout-${layout}`}>
        <div className="primary-view">
          <DigitalBoard />
        </div>

        <div className="secondary-view">
          <div className="camera-feed-container">
            {isVideoOff ? (
              <div className="camera-placeholder">
                <VideoOff size={48} />
                <p>Camera is Muted</p>
              </div>
            ) : (
              <video 
                ref={videoRef} 
                autoPlay 
                muted 
                playsInline 
                className="webcam-feed"
              />
            )}
            <div className="feed-overlay">
               <div className="telemetry-node top-left">
                  <span className="label">SIGNAL.STABLE</span>
                  <div className="signal-bars">
                    <div className="bar active"></div><div className="bar active"></div><div className="bar active"></div><div className="bar"></div>
                  </div>
               </div>
               <div className="telemetry-node top-right">
                  <span className="label">DATA_RATE</span>
                  <span className="value">4.2 Mbps</span>
               </div>
               <div className="telemetry-node bottom-left">
                  <span className="label">FACULTY</span>
                  <span className="value">DR. RAMESH BABU</span>
               </div>
               <div className="telemetry-node bottom-right">
                  <span className="label">LATENCY</span>
                  <span className="value">24ms</span>
               </div>
            </div>
            
            <div className="feed-controls glass-morphism">
              <button 
                className={`control-circle ${isMuted ? 'active' : ''}`} 
                onClick={() => setIsMuted(!isMuted)}
              >
                {isMuted ? <MicOff size={18} /> : <Mic size={18} />}
              </button>
              <button 
                className={`control-circle ${isVideoOff ? 'active' : ''}`} 
                onClick={() => setIsVideoOff(!isVideoOff)}
              >
                {isVideoOff ? <VideoOff size={18} /> : <Video size={18} />}
              </button>
              <button 
                className={`control-circle ${isScreenSharing ? 'active' : ''}`} 
                onClick={() => setIsScreenSharing(!isScreenSharing)}
              >
                <Monitor size={18} />
              </button>
              <button 
                className="control-circle"
                onClick={() => setLayout(l => l === 'split' ? 'full' : 'split')}
              >
                <Layout size={18} />
              </button>
            </div>
          </div>

          <div className="chat-area">
            <LiveChat />
          </div>
        </div>
      </div>
    </div>
  );
}
