import { useState } from 'react';
import { courses } from '../data/courses';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { Progress } from './ui/progress';
import { CheckCircle2, XCircle, Trophy, ArrowLeft } from 'lucide-react';

interface QuizProps {
  courseId: string;
  lessonId: number;
  onNavigate: (page: string, courseId?: string) => void;
}

export const Quiz = ({ courseId, lessonId, onNavigate }: QuizProps) => {
  const course = courses.find((c) => c.id === courseId);
  const quiz = course?.quizzes.find((q) => q.lessonId === lessonId);
  const lesson = course?.lessons.find((l) => l.id === lessonId);
  const { updateProgress } = useAuth();

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);

  if (!course || !quiz || !lesson) return <div>Quiz not found</div>;

  const question = quiz.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;

  const handleNext = () => {
    if (selectedAnswer === null) return;

    const newAnswers = [...answers, selectedAnswer];
    setAnswers(newAnswers);

    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
    } else {
      // Calculate score
      const correctCount = newAnswers.reduce((acc, answer, index) => {
        return acc + (answer === quiz.questions[index].correctAnswer ? 1 : 0);
      }, 0);
      
      setScore(correctCount);
      setShowResult(true);
      updateProgress(courseId, lessonId, correctCount);
    }
  };

  const handleRetake = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setAnswers([]);
    setShowResult(false);
    setScore(0);
  };

  if (showResult) {
    const percentage = (score / quiz.questions.length) * 100;
    const passed = percentage >= 70;

    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Button
          variant="ghost"
          onClick={() => onNavigate('course', courseId)}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Course
        </Button>

        <Card className="text-center">
          <CardHeader className="space-y-4">
            <div className="flex justify-center">
              {passed ? (
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                  <Trophy className="w-10 h-10 text-primary" />
                </div>
              ) : (
                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center">
                  <XCircle className="w-10 h-10 text-muted-foreground" />
                </div>
              )}
            </div>
            <div>
              <CardTitle className="text-3xl">
                {passed ? 'Congratulations!' : 'Keep Learning!'}
              </CardTitle>
              <CardDescription className="mt-2">
                {passed 
                  ? 'You passed the quiz!' 
                  : 'You need 70% to pass. Review the lesson and try again.'}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Your Score</span>
                <span className="font-medium">{score} / {quiz.questions.length}</span>
              </div>
              <Progress value={percentage} className="h-3" />
              <p className="text-center text-muted-foreground">{Math.round(percentage)}%</p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <Button variant="outline" onClick={handleRetake}>
                Retake Quiz
              </Button>
              <Button onClick={() => onNavigate('course', courseId)}>
                Continue Learning
              </Button>
            </div>

            <div className="pt-4 border-t">
              <h3 className="mb-4">Review Answers</h3>
              <div className="space-y-3 text-left">
                {quiz.questions.map((q, index) => (
                  <div key={q.id} className="flex items-start gap-3">
                    {answers[index] === q.correctAnswer ? (
                      <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm">{q.question}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Correct: {q.options[q.correctAnswer]}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
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
          <CardTitle>{lesson.title} - Quiz</CardTitle>
          <CardDescription>
            Question {currentQuestion + 1} of {quiz.questions.length}
          </CardDescription>
          <Progress value={progress} className="h-2 mt-4" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="mb-6">{question.question}</h3>
            <RadioGroup
              value={selectedAnswer?.toString()}
              onValueChange={(value) => setSelectedAnswer(parseInt(value))}
            >
              <div className="space-y-3">
                {question.options.map((option, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                  >
                    <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                    <Label
                      htmlFor={`option-${index}`}
                      className="flex-1 cursor-pointer"
                    >
                      {option}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>

          <div className="flex justify-between items-center pt-4">
            <p className="text-sm text-muted-foreground">
              {selectedAnswer === null ? 'Select an answer to continue' : 'Answer selected'}
            </p>
            <Button
              onClick={handleNext}
              disabled={selectedAnswer === null}
            >
              {currentQuestion < quiz.questions.length - 1 ? 'Next Question' : 'Submit Quiz'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
