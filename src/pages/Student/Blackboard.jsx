import { useState, useRef, useEffect } from 'react';
import { BookOpen, Eraser, Download, Trash2, Undo, Type, Square, Circle, Minus } from 'lucide-react';
import './Blackboard.css';

export default function Blackboard() {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#ffffff');
  const [brushSize, setBrushSize] = useState(3);
  const [tool, setTool] = useState('pencil'); // pencil, eraser

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = window.innerWidth * 2;
    canvas.height = window.innerHeight * 2;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;

    const context = canvas.getContext('2d');
    context.scale(2, 2);
    context.lineCap = 'round';
    context.strokeStyle = color;
    context.lineWidth = brushSize;
    contextRef.current = context;

    // Set blackboard background
    context.fillStyle = '#1a1a1a';
    context.fillRect(0, 0, canvas.width, canvas.height);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (contextRef.current) {
      contextRef.current.strokeStyle = tool === 'eraser' ? '#1a1a1a' : color;
      contextRef.current.lineWidth = tool === 'eraser' ? brushSize * 5 : brushSize;
    }
  }, [color, brushSize, tool]);

  const startDrawing = ({ nativeEvent }) => {
    const { offsetX, offsetY } = nativeEvent;
    contextRef.current.beginPath();
    contextRef.current.moveTo(offsetX, offsetY);
    setIsDrawing(true);
  };

  const finishDrawing = () => {
    contextRef.current.closePath();
    setIsDrawing(false);
  };

  const draw = ({ nativeEvent }) => {
    if (!isDrawing) return;
    const { offsetX, offsetY } = nativeEvent;
    contextRef.current.lineTo(offsetX, offsetY);
    contextRef.current.stroke();
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    context.fillStyle = '#1a1a1a';
    context.fillRect(0, 0, canvas.width, canvas.height);
  };

  const downloadImage = () => {
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = 'rvlh-blackboard-notes.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className="blackboard-page">
      <div className="blackboard-toolbar">
        <div className="toolbar-group">
          <button 
            className={`tool-btn ${tool === 'pencil' ? 'active' : ''}`} 
            onClick={() => setTool('pencil')}
            title="Pencil"
          >
            <BookOpen size={20} />
          </button>
          <button 
            className={`tool-btn ${tool === 'eraser' ? 'active' : ''}`} 
            onClick={() => setTool('eraser')}
            title="Eraser"
          >
            <Eraser size={20} />
          </button>
        </div>

        <div className="toolbar-separator" />

        <div className="toolbar-group colors">
          {['#ffffff', '#ffeb3b', '#4caf50', '#2196f3', '#f44336', '#ff9800'].map(c => (
            <button
              key={c}
              className={`color-btn ${color === c ? 'active' : ''}`}
              style={{ backgroundColor: c }}
              onClick={() => {
                setColor(c);
                setTool('pencil');
              }}
            />
          ))}
        </div>

        <div className="toolbar-separator" />

        <div className="toolbar-group">
          <input 
            type="range" 
            min="1" 
            max="20" 
            value={brushSize} 
            onChange={(e) => setBrushSize(parseInt(e.target.value))}
            className="size-slider"
          />
        </div>

        <div className="toolbar-separator" />

        <div className="toolbar-group actions">
          <button className="tool-btn" onClick={clearCanvas} title="Clear Board">
            <Trash2 size={20} />
          </button>
          <button className="tool-btn download" onClick={downloadImage} title="Save Notes">
            <Download size={20} />
          </button>
        </div>
      </div>

      <canvas
        onMouseDown={startDrawing}
        onMouseUp={finishDrawing}
        onMouseMove={draw}
        ref={canvasRef}
        className="blackboard-canvas"
      />

      <div className="blackboard-watermark">
        <BookOpen size={16} /> RVLH Learning Hub - Digital Blackboard
      </div>
    </div>
  );
}
