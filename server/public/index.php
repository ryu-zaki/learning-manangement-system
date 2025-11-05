<?php
require __DIR__ . '/../vendor/autoload.php';

// ... (env loading and CORS headers are unchanged) ...
$envFile = __DIR__ . '/../.env';
if (file_exists($envFile)) {
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) continue;
        list($name, $value) = explode('=', $line, 2);
        $name = trim($name);
        $value = trim($value);
        if (!array_key_exists($name, $_SERVER) && !array_key_exists($name, $_ENV)) {
            putenv(sprintf('%s=%s', $name, $value));
            $_ENV[$name] = $value;
            $_SERVER[$name] = $value;
        }
    }
}
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(204);
    exit;
}

// --- Use Statements (Updated) ---
use Classify\Server\Controllers\AuthController;
use Classify\Server\Controllers\CourseController;
use Classify\Server\Controllers\LessonController;
use Classify\Server\Controllers\QuizController;
use Classify\Server\Controllers\ProgressController;
use Classify\Server\Middleware\Authenticate;
use Classify\Server\Helpers\Response;

// --- Routing (Updated) ---
$requestUri = $_SERVER['REQUEST_URI'];
$requestMethod = $_SERVER['REQUEST_METHOD'];
$uri = strtok($requestUri, '?');
$parts = explode('/', trim($uri, '/'));

if (empty($parts[0]) || $parts[0] !== 'api') {
    Response::error('API not found', 404);
}

$resource = $parts[1] ?? null;
$id = $parts[2] ?? null; // This is the resource ID OR a sub-resource name
$action = $parts[3] ?? null; // This is the ID
$sub_action = $parts[4] ?? null; // This is the action

$userId = null;

try {
    switch ($resource) {
        case 'auth':
            $controller = new AuthController();
            if ($requestMethod === 'POST' && $id === 'register') {
                $controller->register();
            } elseif ($requestMethod === 'POST' && $id === 'login') {
                $controller->login();
            } elseif ($requestMethod === 'GET' && $id === 'me') {
                $controller->getMe();
            } else {
                Response::error('Auth route not found', 404);
            }
            break;

        case 'courses':
            $controller = new CourseController();
            if ($requestMethod === 'GET' && $id === null) {
                $controller->getAllCourses();
            } elseif ($requestMethod === 'GET' && $id !== null && $action === null) {
                $controller->getCourseContent((int)$id);
            } elseif ($requestMethod === 'POST' && $id !== null && $action === 'enroll') {
                $userId = Authenticate::handle();
                $controller->enroll((int)$id, $userId);
            } else {
                Response::error('Course route not found', 404);
            }
            break;

        case 'lessons':
            $userId = Authenticate::handle();
            $controller = new LessonController();
            if ($requestMethod === 'GET' && $id !== null && $action === null) {
                $controller->getLesson((int)$id);
            } elseif ($requestMethod === 'POST' && $id !== null && $action === 'complete') {
                $controller->completeLesson((int)$id, $userId);
            } else {
                Response::error('Lesson route not found', 404);
            }
            break;

        case 'quizzes':
            // --- QUIZ ROUTING CHANGED ---
            // Matches client logic: fetches/submits by LESSON ID
            // e.g., /api/quizzes/lesson/5
            // e.g., /api/quizzes/lesson/5/submit
            $userId = Authenticate::handle();
            $controller = new QuizController();
            
            $lessonId = $action ?? null; // ID is now in the 'action' position
            $submitAction = $sub_action ?? null;

            if ($id === 'lesson' && $lessonId !== null) {
                if ($requestMethod === 'GET' && $submitAction === null) {
                    $controller->getQuizByLessonId((int)$lessonId);
                } elseif ($requestMethod === 'POST' && $submitAction === 'submit') {
                    $controller->submitQuizByLessonId((int)$lessonId, $userId);
                } else {
                    Response::error('Quiz action not found', 404);
                }
            } else {
                Response::error('Quiz route must be by lesson (e.g., /api/quizzes/lesson/1)', 404);
            }
            break;

        case 'progress':
            $userId = Authenticate::handle();
            $controller = new ProgressController();
            if ($requestMethod === 'GET' && $id === 'dashboard') {
                $controller->getDashboardStats($userId);
            } elseif ($requestMethod === 'GET' && $id === 'courses') {
                $controller->getCourseProgress($userId);
            } else {
                Response::error('Progress route not found', 404);
            }
            break;

        default:
            Response::error('API endpoint not found', 404);
            break;
    }
} catch (\Exception $e) {
    Response::error('An internal server error occurred: ' . $e->getMessage(), 500);
}