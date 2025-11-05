<?php
namespace Classify\Server\Helpers;

use Classify\Server\Config\Database;
use PDO;

class AuthHelper {
    /**
     * Extracts the Bearer token from the Authorization header.
     */
    public static function getBearerToken(): ?string {
        $headers = getallheaders();
        if (!isset($headers['Authorization'])) {
            return null;
        }

        $authHeader = $headers['Authorization'];
        if (preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
            return $matches[1];
        }
        
        return null;
    }

    /**
     * Creates a simple JWT.
     * NOTE: For a real app, use a library like firebase/php-jwt.
     * This is a simplified, insecure version for demonstration.
     */
    public static function createToken(int $userId): string {
        $secret = getenv('JWT_SECRET');
        // Header
        $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
        $base64UrlHeader = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));

        // Payload
        $payload = json_encode(['user_id' => $userId, 'exp' => time() + (60 * 60 * 24)]); // 1 day expiry
        $base64UrlPayload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($payload));

        // Signature
        $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, $secret, true);
        $base64UrlSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));

        return $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
    }

    /**
     * Validates the token and returns the user ID.
     * Returns null if invalid.
     */
    public static function getUserIdFromToken(string $token): ?int {
        $secret = getenv('JWT_SECRET');
        $tokenParts = explode('.', $token);
        
        if (count($tokenParts) !== 3) {
            return null;
        }

        $base64UrlHeader = $tokenParts[0];
        $base64UrlPayload = $tokenParts[1];
        $base64UrlSignature = $tokenParts[2];

        // Recalculate signature
        $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, $secret, true);
        $expectedSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));

        // Compare signatures
        if (!hash_equals($expectedSignature, $base64UrlSignature)) {
            return null; // Invalid signature
        }

        $payload = json_decode(base64_decode(str_replace(['-', '_'], ['+', '/'], $base64UrlPayload)), true);

        if ($payload['exp'] < time()) {
            return null; // Token expired
        }

        return $payload['user_id'] ?? null;
    }

    /**
     * Fetches the full user object from a token.
     */
    public static function getUserFromToken(): ?array {
        $token = self::getBearerToken();
        if (!$token) {
            return null;
        }

        $userId = self::getUserIdFromToken($token);
        if (!$userId) {
            return null;
        }

        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("SELECT id, first_name, last_name, email, role FROM users WHERE id = ?");
        $stmt->execute([$userId]);
        $user = $stmt->fetch();

        return $user ?: null;
    }
}