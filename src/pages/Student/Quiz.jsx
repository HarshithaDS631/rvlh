import { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import {
  Brain, CheckCircle, XCircle, ArrowRight, RotateCcw,
  Sparkles, Target, Zap, Heart, Shield, Award, Lock, Crown
} from 'lucide-react';
import './Quiz.css';

export default function Quiz() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode'); // 'teacher' = teacher quiz, null = AI quiz
  const { user, } = useAuth();
  const { data, addEntity, updateEntity } = useStore();
  const navigate = useNavigate();

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [quizComplete, setQuizComplete] = useState(false);
  const [isGenerating, setIsGenerating] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [savedScore, setSavedScore] = useState(false);

  // Gamification state
  const [health, setHealth] = useState(3);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [multiplier, setMultiplier] = useState(1);
  const [gameOver, setGameOver] = useState(false);

  const isRVLH = user?.type === 'rvlh';
  const canTakeQuiz = isRVLH || user?.subscription === 'premium' || (user?.freeQuizzesLeft || 0) > 0;

  // Resolve context: is this a teacher quiz or an AI quiz?
  const targetVideo = mode !== 'teacher' ? (data?.videos || []).find(v => String(v.id) === String(id)) : null;
  const teacherQuiz = mode === 'teacher' ? (data?.quizzes || []).find(q => String(q.id) === String(id)) : null;
  const videoSubject = targetVideo?.subject || teacherQuiz?.subject || 'General';
  const videoTitle = targetVideo?.title || teacherQuiz?.title || 'this lecture module';

  useEffect(() => {
    if (!canTakeQuiz) return;

    // If teacher quiz loaded, use its questions (shuffled for each student)
    if (mode === 'teacher' && teacherQuiz?.questions?.length) {
      const shuffled = [...teacherQuiz.questions].sort(() => Math.random() - 0.5);
      setQuestions(shuffled);
      setIsGenerating(false);
      return;
    }

    // AI-generated questions based on the video
    setTimeout(() => {
      setQuestions([
        {
          id: 'q1',
          question: `What is the primary concept covered in "${videoTitle}"?`,
          options: [
            `The fundamental rules and core concepts related to ${videoTitle}`,
            `Historical background only`,
            `Completely unrelated university-level theory`,
            `Just memorising a few random equations`,
          ],
          correct: 0,
          explanation: `The video focuses on building a strong foundational understanding of ${videoTitle}.`,
        },
        {
          id: 'q2',
          question: `Which subject area does "${videoTitle}" primarily belong to?`,
          options: [
            videoSubject,
            'Unrelated Domain',
            'Physical Education',
            'Art & Design',
          ],
          correct: 0,
          explanation: `This content is part of the ${videoSubject} curriculum.`,
        },
        {
          id: 'q3',
          question: `What is the best approach to mastering the material in this lesson?`,
          options: [
            'Skip revision and guess answers',
            'Watch at 3x speed without pausing',
            'Take notes and actively attempt practice problems after watching',
            'Only read the summary',
          ],
          correct: 2,
          explanation: `Active learning — note-taking and practice problems — ensures full retention of ${videoTitle}.`,
        },
        {
          id: 'q4',
          question: `Which of the following best describes a key takeaway from this module?`,
          options: [
            'Memorising formulas alone is enough',
            'Practice and conceptual understanding are equally critical',
            'Skip this topic for exams',
            'The topic is too advanced — skip it',
          ],
          correct: 1,
          explanation: `Applying concepts practically was heavily emphasised in this lesson.`,
        },
        {
          id: 'q5',
          question: `After completing this video, what should be your next step?`,
          options: [
            'Move on immediately to the next topic',
            'Re-watch at 2x speed',
            'Attempt the AI quiz and review mistakes thoroughly',
            'Take a break and forget the content',
          ],
          correct: 2,
          explanation: `Taking the quiz and reviewing mistakes consolidates learning and improves retention.`,
        },
      ]);
      setIsGenerating(false);
    }, 2500);
  }, [canTakeQuiz, mode, teacherQuiz, videoTitle, videoSubject]);

  const handleAnswer = (optionIndex) => {
    if (showResult || gameOver) return;
    setSelectedAnswer(optionIndex);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return;
    const isCorrect = selectedAnswer === questions[currentQuestion].correct;

    if (isCorrect) {
      setScore(prev => prev + 100 * multiplier);
      const newCombo = combo + 1;
      setCombo(newCombo);
      if (newCombo >= 2) setMultiplier(2);
      if (newCombo >= 4) setMultiplier(3);
    } else {
      const newHealth = health - 1;
      setHealth(newHealth);
      setCombo(0);
      setMultiplier(1);
      if (newHealth <= 0) setGameOver(true);
    }

    setAnswers(prev => [...prev, { questionIndex: currentQuestion, selected: selectedAnswer, correct: isCorrect }]);
    setShowResult(true);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1 && !gameOver) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setQuizComplete(true);
    }
  };

  const handleRetry = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setAnswers([]);
    setHealth(3);
    setScore(0);
    setCombo(0);
    setMultiplier(1);
    setGameOver(false);
    setQuizComplete(false);
    setSavedScore(false);
  };

  // Save score when quiz completes
  useEffect(() => {
    if ((quizComplete || gameOver) && !savedScore && answers.length > 0) {
      const accuracy = Math.round((answers.filter(a => a.correct).length / questions.length) * 100);

      // Save to quizResults
      addEntity('quizResults', {
        studentId: user.id,
        quizId: mode === 'teacher' ? id : null,
        videoId: mode !== 'teacher' ? id : null,
        subject: videoSubject,
        score: accuracy,
        createdAt: new Date().toISOString(),
      });

      // Deduct free quiz for outside students
      if (!isRVLH && user?.subscription !== 'premium' && (user?.freeQuizzesLeft || 0) > 0) {
        updateEntity('users', user.id, {
          freeQuizzesLeft: Math.max(0, (user.freeQuizzesLeft || 1) - 1),
        });
      }
      setSavedScore(true);
    }
  }, [quizComplete, gameOver, savedScore, answers, questions.length, addEntity, updateEntity, id, isRVLH, mode, user, videoSubject]);

  // ─── LOCKED SCREEN ───
  if (!canTakeQuiz) {
    return (
      <div className="quiz-page">
        <div className="quiz-locked animate-fadeInUp">
          <div className="quiz-locked-icon"><Lock size={48} /></div>
          <h2>Quiz Locked 🔒</h2>
          <p>You've used your free quiz. Upgrade to Premium for unlimited AI quizzes and teacher quizzes.</p>
          <div className="quiz-locked-info"><Crown size={20} /><span>Unlock unlimited access with Premium</span></div>
          <Link to="/student/subscription" state={{ showPayment: true }} className="btn btn-primary btn-lg">
            Upgrade Now <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    );
  }

  // ─── LOADING SCREEN ───
  if (isGenerating) {
    return (
      <div className="quiz-page" style={{ alignItems: 'center' }}>
        <div className="quiz-generating animate-fadeIn">
          <div className="quiz-gen-animation">
            <Brain size={64} color="#f59e0b" style={{ animation: 'bounce 1s infinite alternate' }} />
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, marginTop: '16px' }}>
            {mode === 'teacher' ? 'Loading Quiz...' : 'Generating AI Quiz...'}
          </h2>
          <p style={{ color: '#64748b' }}>
            {mode === 'teacher' ? `Preparing questions for ${videoTitle}` : `Analysing "${videoTitle}" — crafting your personalised challenge`}
          </p>
          <div className="quiz-gen-progress">
            <div className="quiz-gen-bar"><div className="quiz-gen-fill" /></div>
          </div>
        </div>
      </div>
    );
  }

  // ─── RESULTS SCREEN ───
  if (quizComplete || gameOver) {
    const accuracy = Math.round((answers.filter(a => a.correct).length / questions.length) * 100);
    const grade = accuracy >= 90 ? 'A+' : accuracy >= 80 ? 'A' : accuracy >= 70 ? 'B' : accuracy >= 60 ? 'C' : 'D';

    return (
      <div className="quiz-page" style={{ alignItems: 'center' }}>
        <div className="quiz-results animate-scaleIn">
          <div className={`quiz-results-header ${gameOver ? 'game-over-header' : 'victory-header'}`}>
            <h1 style={{ fontSize: '40px', margin: 0 }}>{gameOver ? 'GAME OVER 💀' : 'COMPLETE 🏆'}</h1>
            <p style={{ fontSize: '18px', fontWeight: 700, margin: '8px 0 0 0' }}>
              {mode === 'teacher' ? teacherQuiz?.title : `AI Quiz — ${videoTitle}`}
            </p>
          </div>

          {/* Grade Card */}
          <div className="quiz-grade-display">
            <div className={`quiz-grade-badge grade-${grade.replace('+', 'plus')}`}>{grade}</div>
            <div className="quiz-grade-info">
              <span className="quiz-accuracy">{accuracy}%</span>
              <span style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>Accuracy · Saved to Grading</span>
            </div>
          </div>

          <div className="quiz-stats-gaming">
            <div className="gaming-statbox">
              <Heart size={24} color="#ef4444" fill="#ef4444" />
              <span>Hearts Left: {health}/3</span>
            </div>
            <div className="gaming-statbox">
              <Zap size={24} color="#eab308" fill="#eab308" />
              <span>Score: {score}</span>
            </div>
            <div className="gaming-statbox">
              <Target size={24} color="#3b82f6" />
              <span>Accuracy: {accuracy}%</span>
            </div>
          </div>

          <div className="quiz-results-actions">
            <button onClick={handleRetry} className="btn-gaming">
              <RotateCcw size={18} /> Retry
            </button>
            <Link to="/student" className="btn-gaming-secondary">
              My Dashboard <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ─── ACTIVE QUIZ ───
  const question = questions[currentQuestion];

  return (
    <div className="quiz-page">
      {/* Subject + Quiz Type badge */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', justifyContent: 'center' }}>
        {videoSubject && <span className="subject-pill">{videoSubject}</span>}
        <span className="subject-pill" style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>
          {mode === 'teacher' ? '📋 Teacher Quiz' : '✨ AI Generated'}
        </span>
        {mode === 'teacher' && teacherQuiz?.level && (
          <span className={`subject-pill ${teacherQuiz.level === 'High' ? 'level-high' : teacherQuiz.level === 'Low' ? 'level-low' : 'level-medium'}`}>
            🔥 {teacherQuiz.level} Level
          </span>
        )}
      </div>

      <div className="quiz-container animate-scaleIn" style={{ maxWidth: '800px', width: '100%' }}>
        {/* HUD */}
        <div className="gaming-hud">
          <div className="hud-left">
            <div className="health-bar">
              {[...Array(3)].map((_, i) => (
                <Heart key={i} size={28} color={i < health ? '#ef4444' : '#475569'} fill={i < health ? '#ef4444' : 'none'} />
              ))}
            </div>
            <div className="shield-status"><Shield size={20} color="#3b82f6" /> Challenger</div>
          </div>
          <div className="hud-center">
            <span className="hud-level">STAGE {currentQuestion + 1} / {questions.length}</span>
            <div className="hud-progress">
              <div className="hud-progress-fill" style={{ width: `${(currentQuestion / questions.length) * 100}%` }} />
            </div>
          </div>
          <div className="hud-right">
            <div className="score-display">SCORE: {score}</div>
            <div className="combo-display" style={{ opacity: combo > 1 ? 1 : 0.4 }}>
              <Zap size={18} color="#eab308" fill="#eab308" /> {combo}x ({multiplier}x)
            </div>
          </div>
        </div>

        {/* Question */}
        <div className="game-board">
          <h2 className="game-question-text">{question.question}</h2>
          <div className="game-options-grid">
            {question.options.map((option, idx) => (
              <button
                key={idx}
                className={`game-option
                  ${selectedAnswer === idx ? 'selected' : ''}
                  ${showResult ? (idx === question.correct ? 'correct' : selectedAnswer === idx ? 'incorrect' : 'disabled') : ''}`}
                onClick={() => handleAnswer(idx)}
                disabled={showResult}
              >
                <div className="option-border" />
                <span className="option-letter">{String.fromCharCode(65 + idx)}</span>
                <span className="option-text">{option}</span>
                {showResult && idx === question.correct && <CheckCircle className="option-icon correct-icon" />}
                {showResult && selectedAnswer === idx && idx !== question.correct && <XCircle className="option-icon incorrect-icon" />}
              </button>
            ))}
          </div>

          {showResult && (
            <div className={`game-feedback animate-fadeInUp ${selectedAnswer === question.correct ? 'feedback-success' : 'feedback-error'}`}>
              <div className="feedback-icon-box">
                {selectedAnswer === question.correct ? <Award size={32} /> : <Shield size={32} />}
              </div>
              <div className="feedback-content">
                <h3>{selectedAnswer === question.correct ? 'CORRECT!' : 'INCORRECT!'}</h3>
                <p>{question.explanation}</p>
              </div>
            </div>
          )}

          <div className="game-actions">
            {!showResult ? (
              <button className="btn-gaming main-action" onClick={handleSubmitAnswer} disabled={selectedAnswer === null}>
                LOCK IN ANSWER <Target size={18} />
              </button>
            ) : (
              <button className="btn-gaming main-action" onClick={handleNext}>
                {currentQuestion < questions.length - 1 ? 'NEXT STAGE' : 'FINISH'} <ArrowRight size={18} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
