import { useState } from 'react';
import { courses } from '../data/courses';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { ArrowLeft, ArrowRight, CheckCircle2, BookOpen } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert-dialog';

interface LessonViewProps {
  courseId: string;
  lessonId: number;
  onNavigate: (page: string, courseId?: string, lessonId?: number) => void;
}

export const LessonView = ({ courseId, lessonId, onNavigate }: LessonViewProps) => {
  const course = courses.find((c) => c.id === courseId);
  const lesson = course?.lessons.find((l) => l.id === lessonId);
  const { user, updateProgress } = useAuth();
  const [completed, setCompleted] = useState(
    user?.progress[courseId]?.completedLessons.includes(lessonId) || false
  );

  if (!course || !lesson) return <div>Lesson not found</div>;

  const currentIndex = course.lessons.findIndex((l) => l.id === lessonId);
  const previousLesson = currentIndex > 0 ? course.lessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < course.lessons.length - 1 ? course.lessons[currentIndex + 1] : null;
  const hasQuiz = course.quizzes.some((q) => q.lessonId === lessonId);

  const handleComplete = () => {
    updateProgress(courseId, lessonId);
    setCompleted(true);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Button
        variant="ghost"
        onClick={() => onNavigate('course', courseId)}
        className="gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Course
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-3">
                <BookOpen className="w-6 h-6 text-primary" />
                <CardTitle>{lesson.title}</CardTitle>
              </div>
              <CardDescription>
                Lesson {currentIndex + 1} of {course.lessons.length} • {lesson.duration}
              </CardDescription>
            </div>
            {completed && (
              <div className="flex items-center gap-2 text-primary">
                <CheckCircle2 className="w-5 h-5" />
                <span className="text-sm">Completed</span>
              </div>
            )}
          </div>
          <Progress 
            value={((currentIndex + 1) / course.lessons.length) * 100} 
            className="h-2 mt-4" 
          />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="prose prose-slate dark:prose-invert max-w-none">
            <div className="p-6 bg-muted/50 rounded-lg">
              <p className="leading-relaxed">{lesson.content}</p>
            </div>
          </div>

          {hasQuiz && (
            <Alert>
              <BookOpen className="h-4 w-4" />
              <AlertTitle>Quiz Available</AlertTitle>
              <AlertDescription>
                Test your knowledge by taking the quiz for this lesson.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
            {!completed && (
              <Button onClick={handleComplete} className="flex-1">
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Mark as Complete
              </Button>
            )}
            {hasQuiz && (
              <Button
                variant={completed ? "default" : "outline"}
                onClick={() => onNavigate('quiz', courseId, lessonId)}
                className="flex-1"
              >
                {completed ? 'Take Quiz' : 'Complete Lesson First'}
              </Button>
            )}
          </div>

          <div className="flex justify-between gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => previousLesson && onNavigate('lesson', courseId, previousLesson.id)}
              disabled={!previousLesson}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous Lesson
            </Button>
            <Button
              variant="outline"
              onClick={() => nextLesson && onNavigate('lesson', courseId, nextLesson.id)}
              disabled={!nextLesson}
            >
              Next Lesson
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
