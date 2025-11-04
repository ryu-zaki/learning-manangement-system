import { useAuth } from '../contexts/AuthContext';
import { courses } from '../data/courses';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { User, Mail, Calendar, Trophy, BookOpen, Target } from 'lucide-react';

export const Profile = () => {
  const { user } = useAuth();

  if (!user) return null;

  const totalLessons = courses.reduce((acc, course) => acc + course.lessons.length, 0);
  const completedLessons = Object.values(user.progress).reduce(
    (acc, prog) => acc + prog.completedLessons.length,
    0
  );
  const totalQuizzes = courses.reduce((acc, course) => acc + course.quizzes.length, 0);
  const completedQuizzes = Object.values(user.progress).reduce(
    (acc, prog) => acc + Object.keys(prog.quizScores).length,
    0
  );
  const totalProjects = courses.reduce((acc, course) => acc + course.projects.length, 0);
  const completedProjects = Object.values(user.progress).reduce(
    (acc, prog) => acc + prog.projectsCompleted.filter(Boolean).length,
    0
  );

  const achievements = [
    {
      id: 1,
      title: 'First Steps',
      description: 'Complete your first lesson',
      earned: completedLessons > 0,
      icon: BookOpen,
    },
    {
      id: 2,
      title: 'Quiz Master',
      description: 'Pass your first quiz',
      earned: completedQuizzes > 0,
      icon: Trophy,
    },
    {
      id: 3,
      title: 'Project Pioneer',
      description: 'Complete your first project',
      earned: completedProjects > 0,
      icon: Target,
    },
    {
      id: 4,
      title: 'Dedicated Learner',
      description: 'Complete 10 lessons',
      earned: completedLessons >= 10,
      icon: BookOpen,
    },
    {
      id: 5,
      title: 'Course Finisher',
      description: 'Complete all lessons in a course',
      earned: Object.entries(user.progress).some(([courseId, prog]) => {
        const course = courses.find((c) => c.id === courseId);
        return course && prog.completedLessons.length === course.lessons.length;
      }),
      icon: Trophy,
    },
  ];

  const earnedAchievements = achievements.filter((a) => a.earned);

  return (
    <div className="space-y-8">
      <div>
        <h1>Profile</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account and track your progress
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Account Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-center">
              <Avatar className="w-24 h-24">
                <AvatarFallback className="text-2xl">
                  {user.name.split(' ').map((n) => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <User className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground">Name</p>
                  <p>{user.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground">Email</p>
                  <p>{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground">Member Since</p>
                  <p>October 2025</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Learning Statistics</CardTitle>
            <CardDescription>Your progress across all courses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <BookOpen className="w-4 h-4" />
                  <span className="text-sm">Lessons</span>
                </div>
                <div>
                  <p className="text-3xl">{completedLessons}</p>
                  <p className="text-sm text-muted-foreground">of {totalLessons} completed</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Trophy className="w-4 h-4" />
                  <span className="text-sm">Quizzes</span>
                </div>
                <div>
                  <p className="text-3xl">{completedQuizzes}</p>
                  <p className="text-sm text-muted-foreground">of {totalQuizzes} completed</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Target className="w-4 h-4" />
                  <span className="text-sm">Projects</span>
                </div>
                <div>
                  <p className="text-3xl">{completedProjects}</p>
                  <p className="text-sm text-muted-foreground">of {totalProjects} completed</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Achievements</CardTitle>
          <CardDescription>
            {earnedAchievements.length} of {achievements.length} earned
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.map((achievement) => {
              const Icon = achievement.icon;
              return (
                <div
                  key={achievement.id}
                  className={`p-4 rounded-lg border ${
                    achievement.earned
                      ? 'border-primary/50 bg-primary/5'
                      : 'border-border bg-muted/30 opacity-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      achievement.earned ? 'bg-primary' : 'bg-muted'
                    }`}>
                      <Icon className={`w-5 h-5 ${
                        achievement.earned ? 'text-primary-foreground' : 'text-muted-foreground'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4>{achievement.title}</h4>
                        {achievement.earned && (
                          <Badge variant="secondary" className="text-xs">Earned</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {achievement.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
