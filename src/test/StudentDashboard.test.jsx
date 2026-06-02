import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import StudentDashboard from '../pages/Student/StudentDashboard';
import { MemoryRouter } from 'react-router-dom';
import * as AuthContext from '../context/AuthContext';
import * as StoreContext from '../context/StoreContext';

vi.mock('lucide-react', () => {
  return new Proxy({}, {
    get: (target, name) => {
      return (props) => <span {...props}>{name}</span>;
    }
  });
});

const mockUser = { 
  id: 'student-1', 
  name: 'Student User', 
  role: 'student', 
  type: 'free',
  freeVideosLeft: 5,
  freeQuizzesLeft: 3,
  streak: 5
};
const mockData = { courses: [], notifications: [], users: [], payments: [], materials: [], videos: [], liveClasses: [], doubts: [], announcements: [], requests: [], feedback: [], enrollment: [], feeRecords: [], quizResults: [] };

describe('StudentDashboard - Requests', () => {
  it('allows students to open the request modal when on reports route', async () => {
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({ user: mockUser });
    vi.spyOn(StoreContext, 'useStore').mockReturnValue({ data: mockData, addEntity: vi.fn() });

    render(
      <MemoryRouter initialEntries={['/student/reports']}>
        <StudentDashboard />
      </MemoryRouter>
    );
    
    const requestBtn = screen.getByText(/Submit Request/i);
    expect(requestBtn).toBeInTheDocument();
    
    fireEvent.click(requestBtn);
    expect(screen.getByText(/Submit Official Request/i)).toBeInTheDocument();
  });
});


