import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
  progress: {
    [courseId: string]: {
      completedLessons: number[];
      quizScores: { [lessonId: string]: number };
      projectsCompleted: boolean[];
    };
  };
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateProgress: (courseId: string, lessonId: number, quizScore?: number) => void;
  completeProject: (courseId: string, projectId: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const API_URL = 'http://localhost/classify';

  useEffect(() => {
    const loadUserFromToken = async () => {
      const token = localStorage.getItem('lms_token');
      if (token) {
        await fetchUser(token);
      }
      setLoading(false);
    };
    loadUserFromToken();
  }, []);

  const fetchUser = async (token: string) => {
    try {
      const response = await fetch(`${API_URL}/auth/me.php`, {
        credentials: 'include', // Important for sending auth headers cross-origin
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
console.log(response.ok)
      if (response.ok) {
        const userData = await response.json();
        // Combine first and last name and ensure progress has projectsCompleted
        const formattedUser: User = {
          id: userData.id,
          name: `${userData.first_name} ${userData.last_name}`.trim(),
          email: userData.email,
          progress: userData.progress || {},
        };
        // Ensure projectsCompleted exists for each course in progress
        for (const courseId in formattedUser.progress) {
            if (!formattedUser.progress[courseId].projectsCompleted) {
                formattedUser.progress[courseId].projectsCompleted = [];
            }
        }
        setUser(formattedUser);
        return true;
      } else {
        // Token is invalid or expired
        logout();
        return false;
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
      logout();
      return false;
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}/auth/login.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      console.log(response);
      if (response.ok) {
        const { token } = await response.json();
        localStorage.setItem('lms_token', token);
        return await fetchUser(token); 
      }
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    
    try {
      const response = await fetch(`${API_URL}/auth/register.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      // console.log(response);
      if (response.ok || response.status === 201) {
        const { token } = await response.json();
        localStorage.setItem('lms_token', token);
        return await fetchUser(token);
      } 
       return true;

      
    } catch (error) {
      console.error('Signup failed:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('lms_token');
  };

  const updateProgress = (courseId: string, lessonId: number, quizScore?: number) => {
    if (!user) return;

    const updatedUser = { ...user };
    if (!updatedUser.progress[courseId]) {
      updatedUser.progress[courseId] = {
        completedLessons: [],
        quizScores: {},
        projectsCompleted: []
      };
    }

    if (!updatedUser.progress[courseId].completedLessons.includes(lessonId)) {
      updatedUser.progress[courseId].completedLessons.push(lessonId);
    }

    if (quizScore !== undefined) {
      updatedUser.progress[courseId].quizScores[lessonId] = quizScore;
    }

    setUser(updatedUser);
    // In a real app, you would also send this update to the backend.
  };

  const completeProject = (courseId: string, projectId: number) => {
    if (!user) return;

    const updatedUser = { ...user };
    if (!updatedUser.progress[courseId]) {
      updatedUser.progress[courseId] = {
        completedLessons: [],
        quizScores: {},
        projectsCompleted: []
      };
    }

    if (!updatedUser.progress[courseId].projectsCompleted[projectId]) {
      updatedUser.progress[courseId].projectsCompleted[projectId] = true;
    }

    setUser(updatedUser);
    // In a real app, you would also send this update to the backend.
  };

  if (loading) {
    return <div>Loading...</div>; // Or a spinner component
  }

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, updateProgress, completeProject }}>
      {children}
    </AuthContext.Provider>
  );
};