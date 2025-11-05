<?php
namespace Classify\Server\Controllers;

use Classify\Server\Config\Database;
use Classify\Server\Helpers\Response;
use PDO;

class QuizController {
    private PDO $pdo;

    public function __construct() {
        $this->pdo = Database::getConnection();
    }

    /**
     * Gets a quiz by its LESSON ID.
     * This matches the client-side navigation.
     * GET /api/quizzes/lesson/{lessonId}
     */
    public function getQuizByLessonId(int $lessonId): void {
        // 1. Get Quiz by lesson_id
        $stmt = $this->pdo->prepare("SELECT id, course_id, lesson_id, title FROM quizzes WHERE lesson_id = ?");
        $stmt->execute([$lessonId]);
        $quiz = $stmt->fetch();

        if (!$quiz) {
            Response::error('Quiz not found for this lesson', 404);
            return;
        }

        // 2. Get Questions
        $stmt = $this->pdo->prepare("SELECT id, question_text, question_type FROM questions WHERE quiz_id = ?");
        $stmt->execute([$quiz['id']]);
        $questions = $stmt->fetchAll();

        // 3. Get Options for each question (but not the 'is_correct' flag)
        $questionIds = array_column($questions, 'id');
        if (count($questionIds) > 0) {
            $in = str_repeat('?,', count($questionIds) - 1) . '?';
            $stmt_options = $this->pdo->prepare("SELECT id, question_id, option_text FROM question_options WHERE question_id IN ($in)");
            $stmt_options->execute($questionIds);
            
            // Group options by their question_id
            $options = $stmt_options->fetchAll(PDO::FETCH_GROUP | PDO::FETCH_ASSOC);

            foreach ($questions as $key => $question) {
                // Ensure 'options' is always an array, even if no options exist
                $questions[$key]['options'] = $options[$question['id']] ?? [];
            }
        }
        
        $quiz['questions'] = $questions;
        Response::json($quiz);
    }

    /**
     * Grades a quiz submission, identified by LESSON ID.
     * POST /api/quizzes/lesson/{lessonId}/submit
     */
    public function submitQuizByLessonId(int $lessonId, int $userId): void {
        $data = json_decode(file_get_contents('php://input'), true);
        // The client sends answers as a flat array of numbers: [1, 0, 2]
        // My previous code expected an array of objects. I will fix this.
        // Re-checking client...
        // `Quiz.tsx` builds `const newAnswers = [...answers, selectedAnswer];`
        // `answers` is `number[]`. This is an array of the *chosen option indices*.
        
        $userAnswers = $data['answers'] ?? []; // Expects an array like: [0, 2, 1] (index of option chosen)
        
        if (empty($userAnswers)) {
            Response::error('No answers provided');
            return;
        }

        // 1. Get the Quiz ID from the Lesson ID
        $stmt = $this->pdo->prepare("SELECT id FROM quizzes WHERE lesson_id = ?");
        $stmt->execute([$lessonId]);
        $quiz = $stmt->fetch();

        if (!$quiz) {
            Response::error('Quiz not found', 404);
            return;
        }
        $quizId = $quiz['id'];

        // 2. Get all questions and their correct *option index*
        // This is tricky. We must get questions AND options in the *correct order*.
        $stmt_questions = $this->pdo->prepare("SELECT id FROM questions WHERE quiz_id = ?");
        $stmt_questions->execute([$quizId]);
        $questions = $stmt_questions->fetchAll();

        if (count($questions) !== count($userAnswers)) {
            Response::error('Answer count mismatch with question count', 400);
            return;
        }

        $score = 0;
        $submissionResults = [];

        // 3. Grade the submission
        $this->pdo->beginTransaction();
        try {
            // Loop through each question to find its correct answer
            foreach ($questions as $index => $question) {
                $questionId = $question['id'];
                $userAnswerIndex = $userAnswers[$index]; // e.g., 0

                // Find all options for this question
                $stmt_options = $this->pdo->prepare("SELECT id, is_correct FROM question_options WHERE question_id = ?");
                $stmt_options->execute([$questionId]);
                $options = $stmt_options->fetchAll();

                $correctAnswerIndex = -1;
                $chosenOptionId = null;

                foreach ($options as $optionIndex => $option) {
                    if ($option['is_correct']) {
                        $correctAnswerIndex = $optionIndex;
                    }
                    if ($optionIndex === $userAnswerIndex) {
                        $chosenOptionId = $option['id'];
                    }
                }
                
                $isCorrect = ($userAnswerIndex === $correctAnswerIndex);
                if ($isCorrect) {
                    $score++;
                }

                $submissionResults[] = [
                    'question_id' => $questionId,
                    'chosen_option_id' => $chosenOptionId,
                    'answer_text' => null, // Not handling short_answer per client code
                    'is_correct' => $isCorrect
                ];
            }

            // 4. Insert submission header
            $stmt = $this->pdo->prepare("INSERT INTO quiz_submissions (quiz_id, user_id, score) VALUES (?, ?, ?)");
            $stmt->execute([$quizId, $userId, $score]);
            $submissionId = $this->pdo->lastInsertId();

            // 5. Insert detailed answers
            $stmt_answer = $this->pdo->prepare("
                INSERT INTO user_quiz_answers (submission_id, question_id, chosen_option_id, answer_text, is_correct)
                VALUES (?, ?, ?, ?, ?)
            ");
            foreach ($submissionResults as $result) {
                $stmt_answer->execute([
                    $submissionId,
                    $result['question_id'],
                    $result['chosen_option_id'],
                    $result['answer_text'],
                    $result['is_correct']
                ]);
            }

            // 6. Commit transaction
            $this->pdo->commit();

            Response::json([
                'message' => 'Quiz submitted successfully',
                'score' => $score,
                'totalQuestions' => count($questions),
                'results' => $submissionResults // Send results back for review screen
            ], 201);

        } catch (\Exception $e) {
            $this->pdo->rollBack();
            Response::error('Failed to submit quiz: ' . $e->getMessage(), 500);
        }
    }
}