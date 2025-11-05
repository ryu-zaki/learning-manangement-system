<?php
namespace Classify\Server\Helpers;

class Response {
    /**
     * Sends a JSON response.
     *
     * @param mixed $data The data to encode as JSON.
     * @param int $statusCode The HTTP status code.
     */
    public static function json(mixed $data, int $statusCode = 200): void {
        http_response_code($statusCode);
        header('Content-Type: application/json');
        echo json_encode($data);
        exit;
    }

    /**
     * Sends a JSON error response.
     *
     * @param string $message The error message.
     * @param int $statusCode The HTTP status code.
     */
    public static function error(string $message, int $statusCode = 400): void {
        self::json(['error' => $message], $statusCode);
    }
}