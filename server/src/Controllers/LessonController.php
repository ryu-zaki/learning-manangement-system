<?php

namespace Classify\Server\Controllers;

use Classify\Server\Config\Database;
use Classify\Server\Helpers\Response;
use PDO;

class LessonController
{
    private PDO $pdo;

    public function __construct()
    {
        $this->pdo = Database::getConnection();
    }

    /**
     * Gets a single lesson.
     * GET /api/lessons/{id}
     */
    public function getLesson(int $id): void
    {
        $stmt = $this->pdo->prepare("SELECT * FROM lessons WHERE id = ?");
        $stmt->execute([$id]);
        $lesson = $stmt->fetch();

        if (!$lesson) {
            Response::error('Lesson not found', 404);
            return;
        }
        Response::json($lesson);
    }

    /**
     * Marks a lesson as complete for the current user.
     * POST /api/lessons/{id}/complete
     */
    public function completeLesson(int $id, int $userId): void
    {
        // We use INSERT ... ON DUPLICATE KEY UPDATE to avoid errors
        // if the user re-completes a lesson.
        $stmt = $this->pdo->prepare("
            INSERT INTO user_progress (user_id, content_id, content_type, completed_at)
            VALUES (?, ?, 'lesson', CURRENT_TIMESTAMP)
            ON DUPLICATE KEY UPDATE completed_at = CURRENT_TIMESTAMP
        ");

        $stmt->execute([$userId, $id]);

        if ($stmt->rowCount() > 0) {
            Response::json(['message' => 'Lesson marked as complete']);
        } else {
            Response::json(['message' => 'Lesson was already complete']);
        }
    }
}
