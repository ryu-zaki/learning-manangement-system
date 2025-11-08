import { useAuth } from '../contexts/AuthContext';
import { courses } from '../data/courses';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { CheckCircle2, Circle, Trophy, BookOpen, Code, Target } from 'lucide-react';

interface AchievementsProps {
  onNavigate: (page: string, courseId?: string) => void;
}

export const Achievements = ({ onNavigate }: AchievementsProps) => {
  const { user } = useAuth();

  if (!user) return null;

  const courseStats = courses.map((course) => {
    const progress = user.progress[course.id] || {
      completedLessons: [],
      quizScores: {},
      projectsCompleted: [],
    };

    const lessonsCompleted = progress.completedLessons.length;
    const totalLessons = course.lessons.length;
    const quizzesCompleted = Object.keys(progress.quizScores).length;
    const totalQuizzes = course.quizzes.length;
    const projectsCompleted = progress.projectsCompleted.filter(Boolean).length;
    const totalProjects = course.projects.length;

    const averageQuizScore =
      quizzesCompleted > 0
        ? Object.values(progress.quizScores).reduce((acc, score) => acc + score, 0) /
          quizzesCompleted
        : 0;

    const completionPercentage = (lessonsCompleted / totalLessons) * 100;

    return {
      course,
      lessonsCompleted,
      totalLessons,
      quizzesCompleted,
      totalQuizzes,
      projectsCompleted,
      totalProjects,
      averageQuizScore,
      completionPercentage,
    };
  });

  const totalLessons = courses.reduce((acc, course) => acc + course.lessons.length, 0);
  const completedLessons = Object.values(user.progress).reduce(
    (acc, prog) => acc + prog.completedLessons.length,
    0
  );
  const overallProgress = (completedLessons / totalLessons) * 100;

  return (
    <div className="space-y-8">
      <div>
        <h1>Learning Progress</h1>
        <p className="text-muted-foreground mt-1">
          Track your achievements and course progress
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Overall Progress</CardTitle>
          <CardDescription>
            {completedLessons} of {totalLessons} lessons completed
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Completion</span>
              <span>{Math.round(overallProgress)}%</span>
            </div>
            <Progress value={overallProgress} className="h-3" />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2>Course Progress</h2>
        <div className="grid grid-cols-1 gap-6">
          {courseStats.map(({ course, ...stats }) => {
            const Icon = course.icon === 'Code2' ? Code : course.icon === 'Server' ? BookOpen : Trophy;
            
            return (
              <Card key={course.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-lg bg-linear-to-br ${course.color} flex items-center justify-center`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <CardTitle>{course.title}</CardTitle>
                        <CardDescription className="mt-1">
                          {course.level} • {course.duration}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant="secondary">
                      {Math.round(stats.completionPercentage)}% Complete
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Course Progress</span>
                      <span>{stats.lessonsCompleted} / {stats.totalLessons} lessons</span>
                    </div>
                    <Progress value={stats.completionPercentage} className="h-2" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <BookOpen className="w-4 h-4" />
                        <span>Lessons</span>
                      </div>
                      <p className="text-xl">
                        {stats.lessonsCompleted}/{stats.totalLessons}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Trophy className="w-4 h-4" />
                        <span>Quizzes</span>
                      </div>
                      <p className="text-xl">
                        {stats.quizzesCompleted}/{stats.totalQuizzes}
                      </p>
                      {stats.quizzesCompleted > 0 && (
                        <p className="text-xs text-muted-foreground">
                          Avg: {stats.averageQuizScore.toFixed(1)}/{stats.totalQuizzes > 0 ? course.quizzes[0].questions.length : 0}
                        </p>
                      )}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Target className="w-4 h-4" />
                        <span>Projects</span>
                      </div>
                      <p className="text-xl">
                        {stats.projectsCompleted}/{stats.totalProjects}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="space-y-2">
                      <h4 className="text-sm">Recent Activity</h4>
                      <div className="space-y-2">
                        {course.lessons.slice(0, 3).map((lesson) => {
                          const completed = stats.lessonsCompleted > 0 && 
                            user.progress[course.id]?.completedLessons.includes(lesson.id);
                          
                          return (
                            <div
                              key={lesson.id}
                              className="flex items-center gap-3 text-sm p-2 rounded hover:bg-accent/50"
                            >
                              {completed ? (
                                <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                              ) : (
                                <Circle className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                              )}
                              <span className="flex-1">{lesson.title}</span>
                              <span className="text-muted-foreground">{lesson.duration}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};
