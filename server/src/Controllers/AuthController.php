<?php

namespace Classify\Server\Controllers;

use Classify\Server\Config\Database;
use Classify\Server\Helpers\Response;
use Classify\Server\Helpers\AuthHelper;
use PDO;

class AuthController
{
    private PDO $pdo;

    public function __construct()
    {
        $this->pdo = Database::getConnection();
    }

    /**
     * Handles user registration.
     * POST /api/auth/register
     */
    public function register(): void
    {
        $data = json_decode(file_get_contents('php://input'), true);

        if (empty($data['first_name']) || empty($data['last_name']) || empty($data['email']) || empty($data['password'])) {
            Response::error('All fields are required.');
            return;
        }

        // Check if user already exists
        $stmt = $this->pdo->prepare("SELECT id FROM users WHERE email = ?");
        $stmt->execute([$data['email']]);
        if ($stmt->fetch()) {
            Response::error('Email already in use.', 409); // 409 Conflict
            return;
        }

        // Hash password
        $passwordHash = password_hash($data['password'], PASSWORD_DEFAULT);

        // Insert new user
        $stmt = $this->pdo->prepare("INSERT INTO users (first_name, last_name, email, password_hash, role) VALUES (?, ?, ?, ?, 'student')");
        $stmt->execute([$data['first_name'], $data['last_name'], $data['email'], $passwordHash]);

        $userId = (int)$this->pdo->lastInsertId();
        $token = AuthHelper::createToken($userId);

        Response::json([
            'token' => $token,
            'user' => [
                'id' => $userId,
                'first_name' => $data['first_name'],
                'last_name' => $data['last_name'],
                'email' => $data['email'],
                'role' => 'student'
            ]
        ], 201);
    }

    /**
     * Handles user login.
     * POST /api/auth/login
     */
    public function login(): void
    {
        $data = json_decode(file_get_contents('php://input'), true);

        if (empty($data['email']) || empty($data['password'])) {
            Response::error('Email and password are required.');
            return;
        }

        // Find user by email
        $stmt = $this->pdo->prepare("SELECT id, first_name, last_name, email, role, password_hash FROM users WHERE email = ?");
        $stmt->execute([$data['email']]);
        $user = $stmt->fetch();

        // Verify user and password
        if (!$user || !password_verify($data['password'], $user['password_hash'])) {
            Response::error('Invalid email or password.', 401); // 401 Unauthorized
            return;
        }

        $token = AuthHelper::createToken($user['id']);

        // Don't send password hash to client
        unset($user['password_hash']);

        Response::json([
            'token' => $token,
            'user' => $user
        ]);
    }

    /**
     * Gets the currently authenticated user's data.
     * GET /api/auth/me
     */
    public function getMe(): void
    {
        $user = AuthHelper::getUserFromToken();
        if (!$user) {
            Response::error('Unauthorized', 401);
        }

        // 1. Get completed lessons
        $stmt_lessons = $this->pdo->prepare("
            SELECT l.course_id, up.content_id as lesson_id
            FROM user_progress up
            JOIN lessons l ON up.content_id = l.id
            WHERE up.user_id = ? AND up.content_type = 'lesson'
        ");
        $stmt_lessons->execute([$user['id']]);
        $lessons = $stmt_lessons->fetchAll();

        // 2. Get quiz scores
        $stmt_quizzes = $this->pdo->prepare("
            SELECT q.course_id, q.lesson_id, qs.score
            FROM quiz_submissions qs
            JOIN quizzes q ON qs.quiz_id = q.id
            WHERE qs.user_id = ?
        ");
        $stmt_quizzes->execute([$user['id']]);
        $quizzes = $stmt_quizzes->fetchAll();

        // 3. Build the progress map for the client
        $progressMap = [];

        foreach ($lessons as $lesson) {
            $courseId = $lesson['course_id'];
            if (!isset($progressMap[$courseId])) {
                // Initialize *without* projectsCompleted
                $progressMap[$courseId] = ['completedLessons' => [], 'quizScores' => []];
            }
            $progressMap[$courseId]['completedLessons'][] = $lesson['lesson_id'];
        }

        foreach ($quizzes as $quiz) {
            $courseId = $quiz['course_id'];
            if (!isset($progressMap[$courseId])) {
                $progressMap[$courseId] = ['completedLessons' => [], 'quizScores' => []];
            }
            // Use lesson_id as the key, per client/src/contexts/AuthContext.tsx
            $progressMap[$courseId]['quizScores'][$quiz['lesson_id']] = (float)$quiz['score'];
        }

        $user['progress'] = $progressMap;

        Response::json($user);
    }
}
