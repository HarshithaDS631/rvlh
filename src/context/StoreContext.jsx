/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react';

const StoreContext = createContext();

const defaultInitialState = {
  users: [
    {
      id: 'admin-1',
      name: 'Super Admin',
      email: 'admin@rvlh.edu',
      password: 'admin123',
      phone: '+91 98765 43210',
      role: 'admin',
      type: 'admin',
      status: 'active',
      createdAt: new Date().toISOString()
    },
    {
      id: 'teacher-1',
      name: 'Dr. Ramesh Babu',
      email: 'ramesh@rvlh.edu',
      password: 'teacher',
      phone: '+91 98765 11111',
      role: 'teacher',
      type: 'teacher',
      subject: 'Physics',
      status: 'active',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ramesh@rvlh.edu',
      createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'teacher-2',
      name: 'Prof. Sunita Sharma',
      email: 'sunita@rvlh.edu',
      password: 'teacher',
      phone: '+91 98765 22222',
      role: 'teacher',
      type: 'teacher',
      subject: 'Chemistry',
      status: 'active',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sunita@rvlh.edu',
      createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'teacher-3',
      name: 'Mr. Anil Kumar',
      email: 'anil@rvlh.edu',
      password: 'teacher',
      phone: '+91 98765 33333',
      role: 'teacher',
      type: 'teacher',
      subject: 'Mathematics',
      status: 'active',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=anil@rvlh.edu',
      createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'student-1',
      name: 'Rahul Kumar',
      email: 'rahul@student.com',
      password: 'student',
      phone: '+91 91234 56781',
      role: 'student',
      type: 'rvlh',
      course: 'jee-advanced',
      studentId: 'RVLH2025001',
      streak: 12,
      freeVideosLeft: 9999,
      freeQuizzesLeft: 9999,
      subscription: 'premium',
      status: 'active',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=rahul@student.com',
      createdAt: new Date(Date.now() - 80 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'student-2',
      name: 'Priya Singh',
      email: 'priya@student.com',
      password: 'student',
      phone: '+91 91234 56782',
      role: 'student',
      type: 'rvlh',
      course: 'neet-ug',
      studentId: 'RVLH2025002',
      streak: 8,
      freeVideosLeft: 9999,
      freeQuizzesLeft: 9999,
      subscription: 'premium',
      status: 'active',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=priya@student.com',
      createdAt: new Date(Date.now() - 70 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'student-3',
      name: 'Arjun Patel',
      email: 'arjun@student.com',
      password: 'student',
      phone: '+91 91234 56783',
      role: 'student',
      type: 'outside',
      course: 'kcet',
      studentId: null,
      streak: 3,
      freeVideosLeft: 0,
      freeQuizzesLeft: 1,
      subscription: 'free',
      status: 'active',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=arjun@student.com',
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'student-4',
      name: 'Sneha Reddy',
      email: 'sneha@student.com',
      password: 'student',
      phone: '+91 91234 56784',
      role: 'student',
      type: 'rvlh',
      course: 'commerce',
      studentId: 'RVLH2025004',
      streak: 20,
      freeVideosLeft: 9999,
      freeQuizzesLeft: 9999,
      subscription: 'premium',
      status: 'active',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sneha@student.com',
      createdAt: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'student-5',
      name: 'Vikram Joshi',
      email: 'vikram@student.com',
      password: 'student',
      phone: '+91 91234 56785',
      role: 'student',
      type: 'rvlh',
      course: 'jee-advanced',
      studentId: 'RVLH2025005',
      streak: 15,
      freeVideosLeft: 9999,
      freeQuizzesLeft: 9999,
      subscription: 'premium',
      status: 'active',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=vikram@student.com',
      createdAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString()
    }
  ],
  courses: [
    {
      id: 'jee-advanced',
      name: 'JEE (Advanced + Main)',
      shortName: 'JEE Adv',
      description: 'Comprehensive coaching for JEE Advanced and Main.',
      color: '#3385ff',
      gradient: 'linear-gradient(135deg, #3385ff, #8ab4f8)',
      subjects: ['math-1', 'phys-1', 'chem-1'],
      faculty: ['teacher-1', 'teacher-2', 'teacher-3'],
      prerequisites: [],
      status: 'published'
    },
    {
      id: 'jee-main-cet',
      name: 'JEE (Main + CET)',
      shortName: 'JEE Main',
      description: 'Comprehensive coaching for JEE Main and CET.',
      color: '#10b981',
      gradient: 'linear-gradient(135deg, #10b981, #6ee7b7)',
      subjects: [],
      faculty: [],
      prerequisites: [],
      status: 'draft'
    },
    {
      id: 'kcet',
      name: 'KCET Batch',
      shortName: 'KCET',
      description: 'Comprehensive coaching for KCET.',
      color: '#a855f7',
      gradient: 'linear-gradient(135deg, #a855f7, #c084fc)',
      subjects: []
    },
    {
      id: 'neet-ug',
      name: 'NEET UG',
      shortName: 'NEET',
      description: 'Comprehensive coaching for NEET UG.',
      color: '#f97316',
      gradient: 'linear-gradient(135deg, #f97316, #fdba74)',
      subjects: []
    },
    {
      id: 'commerce',
      name: 'Commerce Decoded',
      shortName: 'Commerce',
      description: 'Comprehensive coaching for Commerce.',
      color: '#06b6d4',
      gradient: 'linear-gradient(135deg, #06b6d4, #67e8f9)',
      subjects: []
    },
    {
      id: 'revise-cet',
      name: 'ReVise CET 2025',
      shortName: 'ReVise CET',
      description: 'Comprehensive revision for CET 2025.',
      color: '#ec4899',
      gradient: 'linear-gradient(135deg, #ec4899, #f472b6)',
      subjects: []
    }
  ],
  subjects: [
    { id: 'math-1', name: 'Mathematics', courseId: 'jee-advanced' },
    { id: 'phys-1', name: 'Physics', courseId: 'jee-advanced' },
    { id: 'chem-1', name: 'Chemistry', courseId: 'jee-advanced' }
  ],
  videos: [
    { id: 'vid-1', title: 'Laws of Motion — Full Chapter', teacherId: 'teacher-1', teacherName: 'Dr. Ramesh Babu', courseId: 'jee-advanced', subject: 'Physics', duration: '45:20', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', status: 'approved', createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 'vid-2', title: 'Organic Chemistry — IUPAC Naming', teacherId: 'teacher-2', teacherName: 'Prof. Sunita Sharma', courseId: 'jee-advanced', subject: 'Chemistry', duration: '38:15', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', status: 'approved', createdAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 'vid-3', title: 'Calculus — Integration by Parts', teacherId: 'teacher-3', teacherName: 'Mr. Anil Kumar', courseId: 'jee-advanced', subject: 'Mathematics', duration: '52:00', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', status: 'pending', createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 'vid-4', title: 'Thermodynamics — First Law Derivation', teacherId: 'teacher-1', teacherName: 'Dr. Ramesh Babu', courseId: 'jee-advanced', subject: 'Physics', duration: '41:30', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', status: 'pending', createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 'vid-5', title: 'Chemical Bonding — Hybridization', teacherId: 'teacher-2', teacherName: 'Prof. Sunita Sharma', courseId: 'neet-ug', subject: 'Chemistry', duration: '35:45', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', status: 'approved', createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 'vid-6', title: 'Trigonometry — All Identities Explained', teacherId: 'teacher-3', teacherName: 'Mr. Anil Kumar', courseId: 'kcet', subject: 'Mathematics', duration: '48:10', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', status: 'pending', createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 'vid-7', title: 'Vector Algebra — Dot Product Demo', teacherId: 'teacher-3', teacherName: 'Mr. Anil Kumar', courseId: 'jee-advanced', subject: 'Mathematics', duration: '25:10', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', status: 'pending', createdAt: new Date().toISOString() }
  ],
  materials: [
    { id: 'mat-1', title: 'Physics Formula Sheet — Complete', teacherId: 'teacher-1', teacherName: 'Dr. Ramesh Babu', courseId: 'jee-advanced', subject: 'Physics', fileType: 'PDF', url: '#', status: 'approved', createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 'mat-2', title: 'Organic Chemistry — Reaction Mechanisms', teacherId: 'teacher-2', teacherName: 'Prof. Sunita Sharma', courseId: 'jee-advanced', subject: 'Chemistry', fileType: 'PDF', url: '#', status: 'pending', createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 'mat-3', title: 'Calculus Practice Problems Set', teacherId: 'teacher-3', teacherName: 'Mr. Anil Kumar', courseId: 'jee-advanced', subject: 'Mathematics', fileType: 'PDF', url: '#', status: 'approved', createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 'mat-4', title: 'NEET Biology — Chapter Notes', teacherId: 'teacher-2', teacherName: 'Prof. Sunita Sharma', courseId: 'neet-ug', subject: 'Biology', fileType: 'PDF', url: '#', status: 'pending', createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() }
  ],
  liveClasses: [
    { id: 'lc-1', title: 'Calculus Intensive Revision', teacherId: 'teacher-3', courseId: 'jee-advanced', time: '14:00', date: new Date().toISOString(), platform: 'In-house Streaming', link: '#', status: 'ongoing' },
    { id: 'lc-2', title: 'Organic Chemistry Doubt Session', teacherId: 'teacher-1', courseId: 'jee-advanced', time: '18:00', date: new Date().toISOString(), platform: 'In-house Streaming', link: '#', status: 'upcoming' }
  ],
  doubts: [
    { id: 'd-1', studentId: 'student-1', studentName: 'Rahul Kumar', question: 'How to solve 2nd order differential equations?', category: 'Mathematics', teacherId: 'teacher-3', reply: '', status: 'pending', image: null, createdAt: new Date().toISOString() },
    { id: 'd-2', studentId: 'student-2', studentName: 'Priya Singh', question: 'Explain Le Chatelier principle with examples?', category: 'Chemistry', teacherId: 'teacher-2', reply: 'When a system is disturbed, it shifts to oppose the change...', status: 'resolved', image: null, createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() }
  ],
  attendance: [
    { id: 'att-1', studentId: 'student-1', date: new Date().toISOString(), status: 'present', classId: 'lc-1' },
    { id: 'att-2', studentId: 'student-5', date: new Date().toISOString(), status: 'present', classId: 'lc-1' }
  ],
  quizzes: [
    { id: 'quiz-1', title: 'Kinematics Mock 1', subject: 'Physics', totalQuestions: 10, duration: 20, type: 'MCQ', questions: [] },
    { id: 'quiz-2', title: 'Algebra Test 1', subject: 'Mathematics', totalQuestions: 15, duration: 30, type: 'MCQ', questions: [] },
    { id: 'quiz-3', title: 'Thermodynamics Quiz', subject: 'Physics', totalQuestions: 10, duration: 20, type: 'MCQ', questions: [] },
    { id: 'quiz-4', title: 'Coordinate Geometry Test', subject: 'Mathematics', totalQuestions: 12, duration: 25, type: 'MCQ', questions: [] },
    { id: 'quiz-5', title: 'Organic Chemistry Quiz', subject: 'Chemistry', totalQuestions: 10, duration: 20, type: 'MCQ', questions: [] }
  ],
  quizResults: [
    { id: 'qr-1', studentId: 'student-1', studentName: 'Rahul Kumar', quizId: 'quiz-1', score: 85, total: 100, subject: 'Physics', date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 'qr-2', studentId: 'student-1', studentName: 'Rahul Kumar', quizId: 'quiz-2', score: 92, total: 100, subject: 'Mathematics', date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 'qr-3', studentId: 'student-1', studentName: 'Rahul Kumar', quizId: 'quiz-3', score: 78, total: 100, subject: 'Physics', date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 'qr-4', studentId: 'student-1', studentName: 'Rahul Kumar', quizId: 'quiz-5', score: 88, total: 100, subject: 'Chemistry', date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 'qr-5', studentId: 'student-2', studentName: 'Priya Singh', quizId: 'quiz-1', score: 72, total: 100, subject: 'Physics', date: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 'qr-6', studentId: 'student-2', studentName: 'Priya Singh', quizId: 'quiz-5', score: 95, total: 100, subject: 'Chemistry', date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 'qr-7', studentId: 'student-3', studentName: 'Arjun Patel', quizId: 'quiz-2', score: 65, total: 100, subject: 'Mathematics', date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 'qr-8', studentId: 'student-3', studentName: 'Arjun Patel', quizId: 'quiz-3', score: 54, total: 100, subject: 'Physics', date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 'qr-9', studentId: 'student-4', studentName: 'Sneha Reddy', quizId: 'quiz-2', score: 91, total: 100, subject: 'Mathematics', date: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 'qr-10', studentId: 'student-4', studentName: 'Sneha Reddy', quizId: 'quiz-5', score: 82, total: 100, subject: 'Chemistry', date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 'qr-11', studentId: 'student-5', studentName: 'Vikram Joshi', quizId: 'quiz-1', score: 90, total: 100, subject: 'Physics', date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 'qr-12', studentId: 'student-5', studentName: 'Vikram Joshi', quizId: 'quiz-4', score: 88, total: 100, subject: 'Mathematics', date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 'qr-13', studentId: 'student-5', studentName: 'Vikram Joshi', quizId: 'quiz-5', score: 76, total: 100, subject: 'Chemistry', date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() }
  ],
  payments: [
    { id: 'pay-1', studentId: 'student-1', studentName: 'Rahul Kumar', amount: 50000, status: 'completed', plan: 'Premium JEE', method: 'UPI', course: 'jee-advanced', paymentType: 'full', date: new Date(Date.now() - 80 * 24 * 60 * 60 * 1000).toISOString(), expiryDate: new Date(Date.now() + 285 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 'pay-2', studentId: 'student-2', studentName: 'Priya Singh', amount: 10000, status: 'completed', plan: 'NEET EMI - Installment 1', method: 'Bank Transfer', course: 'neet-ug', paymentType: 'emi', date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), expiryDate: new Date(Date.now() + 335 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 'pay-3', studentId: 'student-2', studentName: 'Priya Singh', amount: 10000, status: 'completed', plan: 'NEET EMI - Installment 2', method: 'Bank Transfer', course: 'neet-ug', paymentType: 'emi', date: new Date(Date.now() - 0 * 24 * 60 * 60 * 1000).toISOString(), expiryDate: new Date(Date.now() + 335 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 'pay-4', studentId: 'student-3', studentName: 'Arjun Patel', amount: 5000, status: 'pending', plan: 'KCET Basic', method: 'UPI', course: 'kcet', paymentType: 'full', date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 'pay-5', studentId: 'student-4', studentName: 'Sneha Reddy', amount: 35000, status: 'completed', plan: 'Commerce Full', method: 'Credit Card', course: 'commerce', paymentType: 'full', date: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000).toISOString(), expiryDate: new Date(Date.now() + 315 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 'pay-6', studentId: 'student-5', studentName: 'Vikram Joshi', amount: 15000, status: 'completed', plan: 'JEE EMI - Installment 1', method: 'UPI', course: 'jee-advanced', paymentType: 'emi', date: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(), expiryDate: new Date(Date.now() + 325 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 'pay-7', studentId: 'student-5', studentName: 'Vikram Joshi', amount: 15000, status: 'pending', plan: 'JEE EMI - Installment 2', method: 'UPI', course: 'jee-advanced', paymentType: 'emi', date: new Date().toISOString() },
    { id: 'pay-8', studentId: 'student-3', studentName: 'Arjun Patel', amount: 2000, status: 'refunded', plan: 'KCET Trial', method: 'UPI', course: 'kcet', paymentType: 'full', date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString() }
  ],
  feeRecords: [
    { id: 'fee-1', studentId: 'student-1', studentName: 'Rahul Kumar', total: 50000, paid: 50000, pending: 0, status: 'Paid in Full', course: 'jee-advanced' },
    { id: 'fee-2', studentId: 'student-2', studentName: 'Priya Singh', total: 60000, paid: 20000, pending: 40000, status: 'EMI Active', course: 'neet-ug' },
    { id: 'fee-3', studentId: 'student-3', studentName: 'Arjun Patel', total: 25000, paid: 0, pending: 25000, status: 'Awaiting First Payment', course: 'kcet' },
    { id: 'fee-4', studentId: 'student-4', studentName: 'Sneha Reddy', total: 35000, paid: 35000, pending: 0, status: 'Paid in Full', course: 'commerce' },
    { id: 'fee-5', studentId: 'student-5', studentName: 'Vikram Joshi', total: 50000, paid: 15000, pending: 35000, status: 'EMI Active', course: 'jee-advanced' }
  ],
  announcements: [
    { id: 'ann-1', title: 'Welcome to the New Hub!', content: 'We have just launched the Digital Blackboard and AI Quizzes. Explore them now!', date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), type: 'info', audience: 'both' },
    { id: 'ann-2', title: 'Exam Schedule Released', content: 'The mid-term examination schedule for all JEE batches has been released. Check your respective course pages.', date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), type: 'warning', audience: 'student' },
    { id: 'ann-3', title: 'Faculty Meeting — Monday 10 AM', content: 'All faculty members are requested to attend the weekly review meeting. Agenda: Syllabus completion tracking.', date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), type: 'info', audience: 'faculty' }
  ],
  requests: [
    { id: 'req-1', studentId: 'student-1', studentName: 'Rahul Kumar', type: 'leave', startDate: new Date().toISOString(), endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), reason: 'Attending a family function', status: 'pending', createdAt: new Date().toISOString() },
    { id: 'req-2', studentId: 'student-1', studentName: 'Rahul Kumar', type: 'batch_change', targetBatch: 'jee-main-cet', reason: 'Want to focus on CET', status: 'approved', createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() }
  ],
  feedback: [
    { id: 'fb-1', studentId: 'student-1', studentName: 'Rahul Kumar', teacherId: 'teacher-1', teacherName: 'Dr. Ramesh Babu', rating: 5, comment: 'Great teaching style, very clear explanations.', date: new Date().toISOString() },
    { id: 'fb-2', studentId: 'student-4', studentName: 'Sneha Reddy', teacherId: 'teacher-3', teacherName: 'Mr. Anil Kumar', rating: 4, comment: 'Good examples, needs more practice problems.', date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() }
  ],
  enrollments: [
    { id: 'enr-1', studentId: 'student-1', courseId: 'jee-advanced', enrolledAt: new Date(Date.now() - 80 * 24 * 60 * 60 * 1000).toISOString(), status: 'active' },
    { id: 'enr-2', studentId: 'student-2', courseId: 'neet-ug', enrolledAt: new Date(Date.now() - 70 * 24 * 60 * 60 * 1000).toISOString(), status: 'active' },
    { id: 'enr-3', studentId: 'student-3', courseId: 'kcet', enrolledAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), status: 'active' },
    { id: 'enr-4', studentId: 'student-4', courseId: 'commerce', enrolledAt: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000).toISOString(), status: 'active' },
    { id: 'enr-5', studentId: 'student-5', courseId: 'jee-advanced', enrolledAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(), status: 'active' }
  ],
  notifications: [
    { id: 'notif-1', userId: 'admin-1', role: 'admin', title: 'New Video Upload', message: 'Dr. Ramesh Babu uploaded "Thermodynamics — First Law Derivation" for review.', category: 'today', fromTeacherId: 'teacher-1', createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), read: false },
    { id: 'notif-2', userId: 'admin-1', role: 'admin', title: 'Exam Date Scheduled', message: 'Mr. Anil Kumar scheduled JEE Mock Test on 25th April 2026, 10:00 AM.', category: 'today', fromTeacherId: 'teacher-3', type: 'exam_date', createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), read: false },
    { id: 'notif-3', userId: 'admin-1', role: 'admin', title: 'Material Upload', message: 'Prof. Sunita Sharma uploaded "Organic Chemistry — Reaction Mechanisms" for review.', category: 'today', fromTeacherId: 'teacher-2', createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), read: true },
    { id: 'notif-4', userId: 'admin-1', role: 'admin', title: 'Test Date Announced', message: 'Dr. Ramesh Babu announced Physics Unit Test on 20th April 2026.', category: 'earlier', fromTeacherId: 'teacher-1', type: 'test_date', createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), read: true },
    { id: 'notif-5', userId: 'admin-1', role: 'admin', title: 'New Student Enrolled', message: 'Arjun Patel enrolled in KCET Batch as an outside student.', category: 'earlier', createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), read: true },
    { id: 'notif-6', userId: 'admin-1', role: 'admin', title: 'Weekly Test Scheduled', message: 'Prof. Sunita Sharma scheduled Chemistry Weekly Test on 22nd April 2026.', category: 'today', fromTeacherId: 'teacher-2', type: 'test_date', createdAt: new Date().toISOString(), read: false }
  ],
  stats: {
    revenue: 4999,
    activeStudents: 150,
    facultyRatings: 4.8
  }
};

export function StoreProvider({ children }) {
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem('rvlh_store_v5');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse store data', e);
      }
    }
    return defaultInitialState;
  });

  useEffect(() => {
    localStorage.setItem('rvlh_store_v5', JSON.stringify(data));
  }, [data]);

  // Actions
  const addEntity = (entityType, entity) => {
    const newEntity = { id: crypto.randomUUID(), ...entity, createdAt: new Date().toISOString() };
    setData(prev => ({
      ...prev,
      [entityType]: [...(prev[entityType] || []), newEntity]
    }));
    return newEntity;
  };

  const updateEntity = (entityType, id, updates) => {
    setData(prev => ({
      ...prev,
      [entityType]: (prev[entityType] || []).map(e => e.id === id ? { ...e, ...updates, updatedAt: new Date().toISOString() } : e)
    }));
  };

  const deleteEntity = (entityType, id) => {
    setData(prev => ({
      ...prev,
      [entityType]: (prev[entityType] || []).filter(e => e.id !== id)
    }));
  };

  const executeData = {
    data,
    addEntity,
    updateEntity,
    deleteEntity,
    // Helpers
    getUsersByRole: (role) => (data.users || []).filter(u => u.role === role),
    getUserById: (id) => (data.users || []).find(u => u.id === id),
    getVideosByCourse: (courseId) => (data.videos || []).filter(v => v.courseId === courseId),
    getMaterialsByCourse: (courseId) => (data.materials || []).filter(m => m.courseId === courseId),
    getEnrollmentsByStudent: (studentId) => (data.enrollments || []).filter(e => e.studentId === studentId),
  };

  return (
    <StoreContext.Provider value={executeData}>
      {children}
    </StoreContext.Provider>
  );
}

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
