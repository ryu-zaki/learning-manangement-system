<?php

namespace Classify\Server\Config;

use PDO;
use PDOException;

class Database
{
    private static $instance = null;

    public static function getConnection(): PDO
    {
        if (self::$instance == null) {
            $db_host = getenv('DB_HOST');
            $db_port = getenv('DB_PORT');
            $db_database = getenv('DB_DATABASE');
            $db_username = getenv('DB_USERNAME');
            $db_password = getenv('DB_PASSWORD');

            $dsn = "mysql:host=$db_host;port=$db_port;dbname=$db_database;charset=utf8mb4";

            try {
                self::$instance = new PDO($dsn, $db_username, $db_password);
                // Set PDO to throw exceptions on error
                self::$instance->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
                // Fetch results as associative arrays
                self::$instance->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
            } catch (PDOException $e) {
                // In a real app, you'd log this error, not just echo it.
                http_response_code(500);
                echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
                exit;
            }
        }
        return self::$instance;
    }
}
