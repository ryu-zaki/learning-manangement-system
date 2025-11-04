import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  progress: {
    [courseId: string]: {
      completedLessons: number[];
      quizScores: { [lessonId: number]: number };
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

  useEffect(() => {
    // Check for saved user in localStorage
    const savedUser = localStorage.getItem('lms_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Mock login - in real app, this would call an API
    const users = JSON.parse(localStorage.getItem('lms_users') || '[]');
    const foundUser = users.find((u: any) => u.email === email && u.password === password);
    
    if (foundUser) {
      const { password, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      localStorage.setItem('lms_user', JSON.stringify(userWithoutPassword));
      return true;
    }
    return false;
  };

  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    // Mock signup
    const users = JSON.parse(localStorage.getItem('lms_users') || '[]');
    
    if (users.find((u: any) => u.email === email)) {
      return false; // User already exists
    }

    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      password,
      progress: {}
    };

    users.push(newUser);
    localStorage.setItem('lms_users', JSON.stringify(users));

    const { password: _, ...userWithoutPassword } = newUser;
    setUser(userWithoutPassword);
    localStorage.setItem('lms_user', JSON.stringify(userWithoutPassword));
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('lms_user');
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
    localStorage.setItem('lms_user', JSON.stringify(updatedUser));
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
    localStorage.setItem('lms_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, updateProgress, completeProject }}>
      {children}
    </AuthContext.Provider>
  );
};
