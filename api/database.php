<?php
// Configure these variables in the PHP process environment, never in tracked files.
function connectDatabase()
{
    mysqli_report(MYSQLI_REPORT_OFF);
    $host = getenv('DB_HOST');
    $name = getenv('DB_NAME');
    $user = getenv('DB_USER');
    $password = getenv('DB_PASSWORD');
    if (!$host || !$name || !$user || $password === false) {
        header('Content-Type: application/json');
        echo json_encode(['id' => 0, 'error' => 'Database environment is not configured.']);
        exit;
    }
    $connection = new mysqli($host, $user, $password, $name);
    if ($connection->connect_error) {
        header('Content-Type: application/json');
        echo json_encode(['id' => 0, 'error' => 'Database connection failed.']);
        exit;
    }
    $connection->set_charset('utf8mb4');
    return $connection;
}
