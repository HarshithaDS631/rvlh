import { useState, useEffect, useRef } from 'react';
import { Send, User, MessageCircle } from 'lucide-react';
import './LiveChat.css';

const MOCK_MESSAGES = [
  "Dr. Ramesh, can you please repeat the last derivation?",
  "The integrated form is much clearer now, thank you!",
  "Will these notes be available in the materials section?",
  "Prof, is this applicable to JEE Advanced only or Main too?",
  "Calculus is finally making sense!",
  "Can we solve one more example on integration by parts?",
  "The explanation for the logarithmic part was genius.",
  "Which book should we refer for these complex problems?",
  "Sir, I have a doubt in the third step.",
  "Great session! Very interactive.",
  "Wait, I didn't get how that constant disappeared.",
  "Is there a shortcut for this 2nd order equation?",
  "The screen is crystal clear today.",
  "Thanks for the session!",
  "Amazing explanation of the core concept."
];

const STUDENT_NAMES = [
  "Rahul K.", "Priya S.", "Arjun P.", "Sneha R.", "Vikram J.", "Anjali M.", "Siddharth B.", "Megha G."
];

export default function LiveChat() {
  const [messages, setMessages] = useState([
    { id: 1, user: 'System', text: 'Live session started. Please maintain decorum in chat.', time: 'Now', isSystem: true }
  ]);
  const [inputText, setInputText] = useState('');
  const chatEndRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.6) {
        const randomUser = STUDENT_NAMES[Math.floor(Math.random() * STUDENT_NAMES.length)];
        const randomText = MOCK_MESSAGES[Math.floor(Math.random() * MOCK_MESSAGES.length)];
        
        setMessages(prev => [
          ...prev, 
          { 
            id: Date.now(), 
            user: randomUser, 
            text: randomText, 
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
          }
        ]);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    setMessages(prev => [
      ...prev,
      {
        id: Date.now(),
        user: 'You (Teacher)',
        text: inputText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isTeacher: true
      }
    ]);
    setInputText('');
  };

  return (
    <div className="live-chat-container">
      <div className="chat-header">
        <MessageCircle size={18} />
        <h4>Live Interaction</h4>
        <span className="live-count">128+ Watching</span>
      </div>

      <div className="chat-messages">
        {messages.map((msg) => (
          <div key={msg.id} className={`chat-log-line ${msg.isSystem ? 'system' : ''} ${msg.isTeacher ? 'teacher' : ''}`}>
            <span className="log-timestamp">[{msg.time}]</span>
            {!msg.isSystem && (
              <span className="log-user">[{msg.user.toUpperCase()}]: </span>
            )}
            <span className="log-text">{msg.text}</span>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      <form className="chat-input-area" onSubmit={handleSendMessage}>
        <input 
          type="text" 
          placeholder="Type a message or answer a doubt..." 
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        />
        <button type="submit" className="send-btn">
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
