<?php
namespace Classify\Server\Controllers;

use Classify\Server\Config\Database;
use Classify\Server\Helpers\Response;
use PDO;

class ProgressController {
    private PDO $pdo;

    public function __construct() {
        $this->pdo = Database::getConnection();
    }

    /**
     * Gets statistics for the dashboard.
     * REMOVED project logic.
     */
    public function getDashboardStats(int $userId): void {
        // 1. Total Lessons in enrolled courses
        $stmt = $this->pdo->prepare("
            SELECT COUNT(l.id) 
            FROM lessons l
            JOIN enrollments e ON l.course_id = e.course_id
            WHERE e.user_id = ?
        ");
        $stmt->execute([$userId]);
        $totalLessons = $stmt->fetchColumn();

        // 2. Completed Lessons
        $stmt = $this->pdo->prepare("
            SELECT COUNT(up.id) 
            FROM user_progress up
            JOIN lessons l ON up.content_id = l.id
            JOIN enrollments e ON l.course_id = e.course_id
            WHERE up.user_id = ? AND up.content_type = 'lesson' AND e.user_id = ?
        ");
        $stmt->execute([$userId, $userId]);
        $completedLessons = $stmt->fetchColumn();

        // 3. Quizzes Completed
        $stmt = $this->pdo->prepare("
            SELECT COUNT(DISTINCT qs.quiz_id) 
            FROM quiz_submissions qs
            JOIN quizzes q ON qs.quiz_id = q.id
            JOIN enrollments e ON q.course_id = e.course_id
            WHERE qs.user_id = ? AND e.user_id = ?
        ");
        $stmt->execute([$userId, $userId]);
        $quizzesCompleted = $stmt->fetchColumn();

        // 4. Courses Enrolled
        $stmt = $this->pdo->prepare("SELECT COUNT(user_id) FROM enrollments WHERE user_id = ?");
        $stmt->execute([$userId]);
        $coursesEnrolled = $stmt->fetchColumn();


        Response::json([
            'totalLessons' => (int)$totalLessons,
            'completedLessons' => (int)$completedLessons,
            'quizzesCompleted' => (int)$quizzesCompleted,
            'coursesEnrolled' => (int)$coursesEnrolled
        ]);
    }

    /**
     * Gets detailed progress for the achievements page.
     * REMOVED project logic.
     */
    public function getCourseProgress(int $userId): void {
        
        $stmt = $this->pdo->prepare("
            SELECT 
                c.id, 
                c.title, 
                c.level, 
                c.duration,
                (SELECT COUNT(*) FROM lessons l WHERE l.course_id = c.id) as totalLessons,
                (SELECT COUNT(*) FROM quizzes q WHERE q.course_id = c.id) as totalQuizzes,
                
                (SELECT COUNT(DISTINCT up.content_id) 
                 FROM user_progress up 
                 JOIN lessons l ON up.content_id = l.id
                 WHERE up.user_id = e.user_id AND up.content_type = 'lesson' AND l.course_id = c.id) as lessonsCompleted,
                 
                (SELECT COUNT(DISTINCT qs.quiz_id) 
                 FROM quiz_submissions qs
                 JOIN quizzes q ON qs.quiz_id = q.id
                 WHERE qs.user_id = e.user_id AND q.course_id = c.id) as quizzesCompleted,
                 
                (SELECT AVG(qs.score)
                 FROM quiz_submissions qs
                 JOIN quizzes q ON qs.quiz_id = q.id
                 WHERE qs.user_id = e.user_id AND q.course_id = c.id) as averageQuizScore
                 
            FROM courses c
            JOIN enrollments e ON c.id = e.course_id
            WHERE e.user_id = ?
        ");
        
        $stmt->execute([$userId]);
        $courseStats = $stmt->fetchAll();

        // Add 'totalProjects' and 'projectsCompleted' as 0 to prevent client errors
        foreach ($courseStats as $key => $stat) {
             $courseStats[$key]['totalProjects'] = 0;
             $courseStats[$key]['projectsCompleted'] = 0;
             $courseStats[$key]['averageQuizScore'] = $stat['averageQuizScore'] ? (float)$stat['averageQuizScore'] : 0;
        }

        Response::json($courseStats);
    }
}