<?php
namespace Classify\Server\Middleware;

use Classify\Server\Helpers\AuthHelper;
use Classify\Server\Helpers\Response;

class Authenticate {
    /**
     * Checks for a valid auth token.
     * Returns the user's ID if successful, or exits with a 401 error.
     */
    public static function handle(): int {
        $token = AuthHelper::getBearerToken();
        if (!$token) {
            Response::error('Unauthorized: No token provided', 401);
        }

        $userId = AuthHelper::getUserIdFromToken($token);
        if (!$userId) {
            Response::error('Unauthorized: Invalid or expired token', 401);
        }

        return $userId;
    }
}