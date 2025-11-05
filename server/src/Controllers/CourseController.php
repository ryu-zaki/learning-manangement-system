<?php

namespace Classify\Server\Controllers;

use Classify\Server\Config\Database;
use Classify\Server\Helpers\Response;
use PDO;

class CourseController
{
    private PDO $pdo;

    public function __construct()
    {
        $this->pdo = Database::getConnection();
    }

    /**
     * Gets all courses.
     * GET /api/courses
     */
    public function getAllCourses(): void
    {
        $stmt = $this->pdo->query("
            SELECT c.*, CONCAT(u.first_name, ' ', u.last_name) as instructor_name 
            FROM courses c
            LEFT JOIN users u ON c.instructor_id = u.id
        ");
        $courses = $stmt->fetchAll();
        Response::json($courses);
    }

    /**
     * Gets a single course and all its content (lessons, quizzes, projects).
     * GET /api/courses/{id}
     */
    public function getCourseContent(int $id): void
    {
        // 1. Get Course Details
        $stmt = $this->pdo->prepare("SELECT * FROM courses WHERE id = ?");
        $stmt->execute([$id]);
        $course = $stmt->fetch();

        if (!$course) {
            Response::error('Course not found', 404);
            return;
        }

        // 2. Get Lessons
        $stmt = $this->pdo->prepare("SELECT * FROM lessons WHERE course_id = ? ORDER BY display_order");
        $stmt->execute([$id]);
        $course['lessons'] = $stmt->fetchAll();

        // 3. Get Quizzes (now with lesson_id)
        $stmt = $this->pdo->prepare("SELECT id, course_id, lesson_id, title FROM quizzes WHERE course_id = ?");
        $stmt->execute([$id]);
        $course['quizzes'] = $stmt->fetchAll();

        // 4. Set projects to empty array
        // This stops the client from breaking when it tries to map course.projects
        $course['projects'] = [];

        Response::json($course);
    }

    /**
     * Enrolls the current user in a course.
     * POST /api/courses/{id}/enroll
     */
    public function enroll(int $id, int $userId): void
    {
        try {
            $stmt = $this->pdo->prepare("INSERT INTO enrollments (user_id, course_id) VALUES (?, ?)");
            $stmt->execute([$userId, $id]);
            Response::json(['message' => 'Enrolled successfully'], 201);
        } catch (\PDOException $e) {
            if ($e->getCode() == 23000) {
                Response::json(['message' => 'Already enrolled'], 200);
            } else {
                Response::error('Failed to enroll', 500);
            }
        }
    }
}
