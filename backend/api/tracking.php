<?php
require_once 'config.php';

$code = $_GET['code'] ?? '';
$stmt = $pdo->prepare("SELECT * FROM requests WHERE tracking_code = ?");
$stmt->execute([$code]);
$request = $stmt->fetch();

if ($request) {
    echo json_encode($request);
} else {
    http_response_code(404);
    echo json_encode(['error' => 'Not found']);
}
?> 
