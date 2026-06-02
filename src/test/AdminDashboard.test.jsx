import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AdminDashboard from '../pages/Admin/AdminDashboard';
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

const mockUser = { id: 'admin-1', name: 'Admin User', role: 'admin', avatar: 'https://i.pravatar.cc/150?u=admin' };
const mockData = { courses: [], notifications: [], users: [], payments: [], materials: [], videos: [], liveClasses: [], doubts: [], announcements: [], requests: [], feedback: [], enrollment: [], feeRecords: [], quizResults: [] };

describe('AdminDashboard - Course Builder', () => {
  it('renders the Course Builder tab when on the correct route', async () => {
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({ user: mockUser, logout: vi.fn() });
    vi.spyOn(StoreContext, 'useStore').mockReturnValue({ data: mockData, addEntity: vi.fn(), updateEntity: vi.fn(), deleteEntity: vi.fn() });

    render(
      <MemoryRouter initialEntries={['/admin/courses']}>
        <AdminDashboard />
      </MemoryRouter>
    );
    
    // Check if the "Assemble New Course" section is visible
    expect(screen.getByText(/Assemble New Course/i)).toBeInTheDocument();
    
    // Check for wizard steps
    expect(screen.getByText(/1. Info/i)).toBeInTheDocument();
  });
});


