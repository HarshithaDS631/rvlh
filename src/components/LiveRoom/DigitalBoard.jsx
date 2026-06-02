import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Eraser, Trash2, Download, BookOpen } from 'lucide-react';
import './DigitalBoard.css';

const DigitalBoard = forwardRef((props, ref) => {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#ffffff');
  const [brushSize, setBrushSize] = useState(3);
  const [tool, setTool] = useState('pencil'); // pencil, eraser

  useImperativeHandle(ref, () => ({
    clearCanvas: () => clearCanvas(),
    downloadImage: () => downloadImage(),
    setTool: (t) => setTool(t),
    setColor: (c) => setColor(c),
    setBrushSize: (s) => setBrushSize(s)
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    // Set internal resolution higher for better quality
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    
    const context = canvas.getContext('2d');
    context.scale(dpr, dpr);
    context.lineCap = 'round';
    context.strokeStyle = color;
    context.lineWidth = brushSize;
    contextRef.current = context;

    // Background
    context.fillStyle = '#020617'; // Deep obsidian to match theme
    context.fillRect(0, 0, rect.width, rect.height);
    
    // Grid lines (subtle blueprint grid)
    context.strokeStyle = 'rgba(34, 211, 238, 0.08)';
    context.lineWidth = 0.5;
    for (let x = 0; x <= rect.width; x += 30) {
      context.beginPath();
      context.moveTo(x, 0);
      context.lineTo(x, rect.height);
      context.stroke();
    }
    for (let y = 0; y <= rect.height; y += 30) {
      context.beginPath();
      context.moveTo(0, y);
      context.lineTo(rect.width, y);
      context.stroke();
    }
  }, []);

  useEffect(() => {
    if (contextRef.current) {
      contextRef.current.strokeStyle = tool === 'eraser' ? '#020617' : color;
      contextRef.current.lineWidth = tool === 'eraser' ? brushSize * 10 : brushSize;
    }
  }, [color, brushSize, tool]);

  const startDrawing = ({ nativeEvent }) => {
    const { offsetX, offsetY } = nativeEvent;
    contextRef.current.beginPath();
    contextRef.current.moveTo(offsetX, offsetY);
    setIsDrawing(true);
  };

  const finishDrawing = () => {
    if (!isDrawing) return;
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
    const rect = canvas.getBoundingClientRect();
    const context = canvas.getContext('2d');
    context.fillStyle = '#020617';
    context.fillRect(0, 0, rect.width * 2, rect.height * 2);

    // Re-draw grid (blueprint style)
    context.strokeStyle = 'rgba(34, 211, 238, 0.08)';
    context.lineWidth = 0.5;
    for (let x = 0; x <= rect.width; x += 30) {
      context.beginPath();
      context.moveTo(x, 0);
      context.lineTo(x, rect.height);
      context.stroke();
    }
    for (let y = 0; y <= rect.height; y += 30) {
      context.beginPath();
      context.moveTo(0, y);
      context.lineTo(rect.width, y);
      context.stroke();
    }
  };

  const downloadImage = () => {
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = 'rvlh-lecture-notes.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className="digital-board-container">
      <div className="board-toolbar glass-morphism">
        <div className="toolbar-segment">
          <button className={`tool-btn ${tool === 'pencil' ? 'active' : ''}`} onClick={() => setTool('pencil')}><BookOpen size={18} /></button>
          <button className={`tool-btn ${tool === 'eraser' ? 'active' : ''}`} onClick={() => setTool('eraser')}><Eraser size={18} /></button>
        </div>
        <div className="divider" />
        <div className="toolbar-segment colors">
          {['#ffffff', '#ffeb3b', '#4caf50', '#2196f3', '#f44336', '#ff9800'].map(c => (
            <button key={c} className={`color-dot ${color === c ? 'active' : ''}`} style={{ backgroundColor: c }} onClick={() => { setColor(c); setTool('pencil'); }} />
          ))}
        </div>
        <div className="divider" />
        <div className="toolbar-segment">
          <input type="range" min="1" max="15" value={brushSize} onChange={(e) => setBrushSize(parseInt(e.target.value))} className="size-slider" />
        </div>
        <div className="divider" />
        <div className="toolbar-segment">
          <button className="tool-btn" onClick={clearCanvas}><Trash2 size={18} /></button>
          <button className="tool-btn highlight" onClick={downloadImage}><Download size={18} /></button>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseUp={finishDrawing}
        onMouseOut={finishDrawing}
        onMouseMove={draw}
        className="board-canvas"
      />
    </div>
  );
});

DigitalBoard.displayName = 'DigitalBoard';

export default DigitalBoard;
