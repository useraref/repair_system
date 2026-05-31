<?php
require_once 'config.php';

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit();
}

$total = $pdo->query("SELECT COUNT(*) FROM requests")->fetchColumn();
$pending = $pdo->query("SELECT COUNT(*) FROM requests WHERE status = 'pending'")->fetchColumn();
$completed = $pdo->query("SELECT COUNT(*) FROM requests WHERE status = 'completed'")->fetchColumn();
$income = $pdo->query("SELECT SUM(final_price) FROM requests")->fetchColumn();

echo json_encode([
    'total' => (int)$total,
    'pending' => (int)$pending,
    'completed' => (int)$completed,
    'income' => (int)$income
]);
?> 
