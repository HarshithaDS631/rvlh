/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useStore } from './StoreContext';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const store = useStore();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Re-hydrate session on mount
  useEffect(() => {
    const savedUserId = localStorage.getItem('rvlh_session');
    if (savedUserId) {
      const foundUser = store.data.users.find(u => u.id === savedUserId);
      if (foundUser) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setUser(foundUser);
      } else {
        localStorage.removeItem('rvlh_session');
      }
    }
    setIsLoading(false);
  }, [store.data.users]);

  const login = useCallback(async (email, password, expectedRole) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const foundUser = store.data.users.find(
          u => u.email === email && u.password === password && (expectedRole ? u.role === expectedRole : true)
        );

        if (foundUser) {
          setUser(foundUser);
          localStorage.setItem('rvlh_session', foundUser.id);
          resolve(foundUser);
        } else {
          reject(new Error('Invalid email or password'));
        }
      }, 800);
    });
  }, [store]);

  const register = useCallback(async (selectedRole, userData) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Only students can self-register. Teachers are created by admin only.
        if (selectedRole === 'teacher') {
          return reject(new Error('Teacher accounts can only be created by the administrator.'));
        }

        const userExists = store.data.users.find(u => u.email === userData.email);
        if (userExists) {
          return reject(new Error('User already exists'));
        }

        const role = selectedRole || 'student';
        let newUserObj = {
          name: userData.name,
          email: userData.email,
          password: userData.password,
          phone: userData.phone,
          role: role,
          type: role,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.email}`,
          createdAt: new Date().toISOString()
        };

        if (role === 'student') {
          const newUserType = userData.studentId ? 'rvlh' : 'outside';
          newUserObj = {
            ...newUserObj,
            course: userData.course,
            studentId: userData.studentId || null,
            type: newUserType,
            streak: 0,
            freeVideosLeft: newUserType === 'outside' ? 1 : 9999,
            freeQuizzesLeft: newUserType === 'outside' ? 1 : 9999,
            subscription: newUserType === 'outside' ? 'free' : 'premium'
          };
        } else if (role === 'teacher') {
          newUserObj.subject = userData.course || 'General';
        }

        const createdUser = store.addEntity('users', newUserObj);
        
        setUser(createdUser);
        localStorage.setItem('rvlh_session', createdUser.id);
        resolve(createdUser);
      }, 1000);
    });
  }, [store]);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('rvlh_session');
  }, []);

  const value = {
    user,
    isLoading,
    login,
    logout,
    register
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
