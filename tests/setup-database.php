<?php
// This script resets only the dedicated, disposable integration test database.
if (getenv('DB_NAME') !== 'colors_ci_test') {
    fwrite(STDERR, "DB_NAME must be colors_ci_test; refusing to reset any other database.\n");
    exit(1);
}

mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
$connection = new mysqli(
    getenv('DB_HOST') ?: '127.0.0.1',
    getenv('DB_USER'),
    getenv('DB_PASSWORD'),
    getenv('DB_NAME')
);
$connection->set_charset('utf8mb4');
$connection->query('DROP TABLE IF EXISTS Colors');
$connection->query('DROP TABLE IF EXISTS Users');
$connection->multi_query(file_get_contents(__DIR__ . '/../database/schema.sql'));
do {
    if ($result = $connection->store_result()) {
        $result->free();
    }
} while ($connection->more_results() && $connection->next_result());
$connection->query("INSERT INTO Users (ID, FirstName, LastName, Login, Password) VALUES
    (1, 'Test', 'User', 'ci-user', 'ci-test-only'),
    (2, 'Other', 'User', 'ci-other', 'ci-test-only')");
$connection->close();
echo "Disposable test database initialized.\n";
