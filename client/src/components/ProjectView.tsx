import { useState } from 'react';
import { courses } from '../data/courses';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { ArrowLeft, Clock, CheckCircle2, Code2 } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from './ui/alert';

interface ProjectViewProps {
  courseId: string;
  projectId: number;
  onNavigate: (page: string, courseId?: string) => void;
}

export const ProjectView = ({ courseId, projectId, onNavigate }: ProjectViewProps) => {
  const course = courses.find((c) => c.id === courseId);
  const project = course?.projects.find((p) => p.id === projectId);
  const { user, completeProject } = useAuth();
  
  const [checkedRequirements, setCheckedRequirements] = useState<boolean[]>(
    project?.requirements.map(() => false) || []
  );
  
  const isCompleted = user?.progress[courseId]?.projectsCompleted?.[projectId] || false;
  const allRequirementsChecked = checkedRequirements.every((checked) => checked);

  if (!course || !project) return <div>Project not found</div>;

  const handleRequirementToggle = (index: number) => {
    const newChecked = [...checkedRequirements];
    newChecked[index] = !newChecked[index];
    setCheckedRequirements(newChecked);
  };

  const handleCompleteProject = () => {
    completeProject(courseId, projectId);
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
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${course.color} flex items-center justify-center`}>
                  <Code2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle>{project.title}</CardTitle>
                  <CardDescription>{course.title}</CardDescription>
                </div>
              </div>
            </div>
            {isCompleted && (
              <div className="flex items-center gap-2 text-primary">
                <CheckCircle2 className="w-5 h-5" />
                <span className="text-sm">Completed</span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <Clock className="h-4 w-4" />
            <AlertTitle>Estimated Time</AlertTitle>
            <AlertDescription>{project.estimatedTime}</AlertDescription>
          </Alert>

          <div>
            <h3 className="mb-3">Project Description</h3>
            <p className="text-muted-foreground leading-relaxed">{project.description}</p>
          </div>

          <div>
            <h3 className="mb-4">Project Requirements</h3>
            <div className="space-y-3">
              {project.requirements.map((requirement, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                >
                  <Checkbox
                    id={`requirement-${index}`}
                    checked={checkedRequirements[index] || isCompleted}
                    onCheckedChange={() => handleRequirementToggle(index)}
                    disabled={isCompleted}
                  />
                  <label
                    htmlFor={`requirement-${index}`}
                    className="flex-1 cursor-pointer leading-relaxed"
                  >
                    {requirement}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t">
            <div className="bg-muted/50 p-6 rounded-lg space-y-3">
              <h4>💡 Tips for Success</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Break down the project into smaller, manageable tasks</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Review the course lessons if you need to refresh your knowledge</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Test your code frequently as you build</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Don't hesitate to experiment and add your own creative touches</span>
                </li>
              </ul>
            </div>
          </div>

          {!isCompleted && (
            <Button
              onClick={handleCompleteProject}
              disabled={!allRequirementsChecked}
              className="w-full"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              {allRequirementsChecked ? 'Mark Project as Complete' : 'Complete all requirements first'}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
