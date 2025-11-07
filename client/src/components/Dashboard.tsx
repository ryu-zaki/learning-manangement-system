import { courses } from '../data/courses';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Code2, Server, Layers, Clock, Award } from 'lucide-react';
import { Button } from './ui/button';

interface DashboardProps {
  onNavigate: (page: string, courseId?: string) => void;
}

export const Dashboard = ({ onNavigate }: DashboardProps) => {
  const { user } = useAuth();

  const getIcon = (iconName: string) => {
    const icons: any = { Code2, Server, Layers };
    return icons[iconName] || Code2;
  };

  const getCourseProgress = (courseId: string) => {
    const course = courses.find((c) => c.id === courseId);
    if (!course || !user?.progress[courseId]) return 0;
    
    const completed = user.progress[courseId].completedLessons.length;
    const total = course.lessons.length;
    return (completed / total) * 100;
  };

  const getTotalProgress = () => {
    if (!user) return 0;
    let totalCompleted = 0;
    let totalLessons = 0;
    
    courses.forEach((course) => {
      totalLessons += course.lessons.length;
      if (user.progress[course.id]) {
        totalCompleted += user.progress[course.id].completedLessons.length;
      }
    });
    
    return totalLessons > 0 ? (totalCompleted / totalLessons) * 100 : 0;
  };

  return (
    <div className="space-y-8 w-full">
      <div>
        <h1>Welcome back, {user?.name}! 👋</h1>
        <p className="text-muted-foreground mt-1">
          Continue your learning journey and master web development
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Progress</CardDescription>
            <CardTitle>{Math.round(getTotalProgress())}%</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={getTotalProgress()} className="h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Courses Enrolled</CardDescription>
            <CardTitle>{courses.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              HTML, PHP & Laravel
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Quizzes Completed</CardDescription>
            <CardTitle>
              {user ? Object.values(user.progress).reduce((acc, prog) => acc + Object.keys(prog.quizScores).length, 0) : 0}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Award className="w-4 h-4" />
              <span>Keep going!</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="mb-6">Your Courses</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {courses.map((course) => {
            const Icon = getIcon(course.icon);
            const progress = getCourseProgress(course.id);
            
            return (
              <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className={`h-2 bg-gradient-to-r ${course.color}`} />
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${course.color} flex items-center justify-center`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <Badge variant="secondary">{course.level}</Badge>
                  </div>
                  <CardTitle className="mt-4">{course.title}</CardTitle>
                  <CardDescription>{course.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>{course.duration}</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                  <Button 
                    className="w-full" 
                    onClick={() => onNavigate('course', course.id)}
                  >
                    {progress > 0 ? 'Continue Learning' : 'Start Course'}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};
