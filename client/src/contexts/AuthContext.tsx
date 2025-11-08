import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
  createdAt: string;
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
  console.log(user);

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
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      console.log(response.ok)

      if (response.ok) {
        const userData = await response.json();

        const progressData = (userData.progress && typeof userData.progress === 'object' && !Array.isArray(userData.progress))
          ? userData.progress
          : {};

        const formattedUser: User = {
          id: userData.id,
          name: `${userData.first_name} ${userData.last_name}`.trim(),
          email: userData.email,
          createdAt: userData.created_at,
          progress: progressData,
        };

        for (const courseId in formattedUser.progress) {
          if (!formattedUser.progress[courseId].projectsCompleted) {
            formattedUser.progress[courseId].projectsCompleted = [];
          }
        }
        setUser(formattedUser);
        console.log("User Info: " + formattedUser);
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

    const updatedUser = JSON.parse(JSON.stringify(user));
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
    updateProgressOnBackend(updatedUser.progress);


  };

  const updateProgressOnBackend = async (progress: User['progress']) => {
    const token = localStorage.getItem('lms_token');
    if (!token) return;

    // has contents - [ html: { completedLessons: [1], projectCompleted : [], quizScores: {} } ]

    console.log(JSON.stringify({ progress }));
    try {
      await fetch(`${API_URL}/auth/update.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ progress }), // generates = " { "newProgress": [] } "
      });
      // You might want to add response handling here
    } catch (error) {
      console.error('Failed to update progress on backend:', error);
      // Optionally, handle the error, e.g., by showing a notification
      // or reverting the local state change.
    }
  };

  const completeProject = (courseId: string, projectId: number) => {
    if (!user) return;

    const updatedUser = JSON.parse(JSON.stringify(user));
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
    updateProgressOnBackend(updatedUser.progress);
    console.log(updatedUser.progress);
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