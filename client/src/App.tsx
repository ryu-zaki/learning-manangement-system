import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
import { CourseDetail } from './components/CourseDetail';
import { LessonView } from './components/LessonView';
import { Quiz } from './components/Quiz';
import { ProjectView } from './components/ProjectView';
import { Profile } from './components/Profile';
import { Achievements } from './components/Achievements';
import { Sidebar } from './components/SideBar';

interface AppState {
  page: string;
  courseId?: string;
  lessonId?: number;
  projectId?: number;
}

const MainApp = () => {
  const { user } = useAuth();
  const [appState, setAppState] = useState<AppState>({ page: 'courses' });

  const handleNavigate = (page: string, courseId?: string, lessonId?: number, projectId?: number) => {
    setAppState({ page, courseId, lessonId, projectId });
  };

  if (!user) {
    return <Login />;
  }

  const renderContent = () => {
    switch (appState.page) {
      case 'courses':
        return <Dashboard onNavigate={handleNavigate} />;
      case 'course':
        return appState.courseId ? (
          <CourseDetail courseId={appState.courseId} onNavigate={handleNavigate} />
        ) : (
          <Dashboard onNavigate={handleNavigate} />
        );
      case 'lesson':
        return appState.courseId && appState.lessonId ? (
          <LessonView
            courseId={appState.courseId}
            lessonId={appState.lessonId}
            onNavigate={handleNavigate}
          />
        ) : (
          <Dashboard onNavigate={handleNavigate} />
        );
      case 'quiz':
        return appState.courseId && appState.lessonId ? (
          <Quiz
            courseId={appState.courseId}
            lessonId={appState.lessonId}
            onNavigate={handleNavigate}
          />
        ) : (
          <Dashboard onNavigate={handleNavigate} />
        );
      case 'project':
        return appState.courseId && appState.projectId ? (
          <ProjectView
            courseId={appState.courseId}
            projectId={appState.projectId}
            onNavigate={handleNavigate}
          />
        ) : (
          <Dashboard onNavigate={handleNavigate} />
        );
      case 'achievements':
        return <Achievements onNavigate={handleNavigate} />;
      case 'profile':
        return <Profile />;
      default:
        return <Dashboard onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar currentPage={appState.page} onNavigate={handleNavigate} />
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto p-8">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </ThemeProvider>
  );
}
