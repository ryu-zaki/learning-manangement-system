import { useState } from 'react';
import { courses, Course } from '../data/courses';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { CheckCircle2, Circle, Clock, Trophy, Code } from 'lucide-react';

interface CourseDetailProps {
  courseId: string;
  onNavigate: (page: string, courseId?: string, lessonId?: number, projectId?: number) => void;
}

export const CourseDetail = ({ courseId, onNavigate }: CourseDetailProps) => {
  const course = courses.find((c) => c.id === courseId);
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('lessons');

  if (!course) return <div>Course not found</div>;

  const isLessonCompleted = (lessonId: number) => {
    return user?.progress[courseId]?.completedLessons.includes(lessonId) || false;
  };

  const isProjectCompleted = (projectId: number) => {
    return user?.progress[courseId]?.projectsCompleted?.[projectId] || false;
  };

  const getQuizScore = (lessonId: number) => {
    return user?.progress[courseId]?.quizScores[lessonId];
  };

  const completedLessons = user?.progress[courseId]?.completedLessons.length || 0;
  const totalLessons = course.lessons.length;
  const progressPercentage = (completedLessons / totalLessons) * 100;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1>{course.title}</h1>
            <Badge>{course.level}</Badge>
          </div>
          <p className="text-muted-foreground max-w-2xl">{course.description}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Course Progress</CardTitle>
            <span className="text-muted-foreground">
              {completedLessons} / {totalLessons} lessons completed
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={progressPercentage} className="h-3" />
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="lessons">Lessons</TabsTrigger>
          <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
        </TabsList>

        <TabsContent value="lessons" className="space-y-4 mt-6">
          {course.lessons.map((lesson, index) => {
            const completed = isLessonCompleted(lesson.id);
            
            return (
              <Card key={lesson.id} className={completed ? 'border-primary/50' : ''}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="mt-1">
                        {completed ? (
                          <CheckCircle2 className="w-5 h-5 text-primary" />
                        ) : (
                          <Circle className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <CardTitle>
                          {index + 1}. {lesson.title}
                        </CardTitle>
                        <CardDescription className="mt-2">{lesson.content}</CardDescription>
                        <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>{lesson.duration}</span>
                        </div>
                      </div>
                    </div>
                    <Button
                      onClick={() => onNavigate('lesson', courseId, lesson.id)}
                    >
                      {completed ? 'Review' : 'Start Lesson'}
                    </Button>
                  </div>
                </CardHeader>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="quizzes" className="space-y-4 mt-6">
          {course.quizzes.map((quiz, index) => {
            const lesson = course.lessons.find((l) => l.id === quiz.lessonId);
            const score = getQuizScore(quiz.lessonId);
            const completed = score !== undefined;
            
            return (
              <Card key={quiz.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>Quiz {index + 1}: {lesson?.title}</CardTitle>
                      <CardDescription className="mt-2">
                        {quiz.questions.length} questions
                      </CardDescription>
                      {completed && (
                        <div className="mt-3 flex items-center gap-2">
                          <Trophy className="w-5 h-5 text-primary" />
                          <span className="text-sm">
                            Score: {score}/{quiz.questions.length}
                          </span>
                        </div>
                      )}
                    </div>
                    <Button
                      onClick={() => onNavigate('quiz', courseId, quiz.lessonId)}
                    >
                      {completed ? 'Retake Quiz' : 'Take Quiz'}
                    </Button>
                  </div>
                </CardHeader>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="projects" className="space-y-4 mt-6">
          {course.projects.map((project, index) => {
            const completed = isProjectCompleted(project.id);
            
            return (
              <Card key={project.id} className={completed ? 'border-primary/50' : ''}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-3">
                        <CardTitle>{project.title}</CardTitle>
                        {completed && <Badge>Completed</Badge>}
                      </div>
                      <CardDescription className="mt-2">{project.description}</CardDescription>
                      <div className="mt-4 space-y-2">
                        <p className="text-sm">Requirements:</p>
                        <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                          {project.requirements.map((req, i) => (
                            <li key={i} className="list-disc">{req}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="flex items-center gap-2 mt-4 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>Estimated time: {project.estimatedTime}</span>
                      </div>
                    </div>
                    <Button
                      onClick={() => onNavigate('project', courseId, undefined, project.id)}
                    >
                      <Code className="w-4 h-4 mr-2" />
                      {completed ? 'View Project' : 'Start Project'}
                    </Button>
                  </div>
                </CardHeader>
              </Card>
            );
          })}
        </TabsContent>
      </Tabs>
    </div>
  );
};
