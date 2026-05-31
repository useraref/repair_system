<?php
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $username = $data['username'] ?? '';
    $password = $data['password'] ?? '';
    
    $stmt = $pdo->prepare("SELECT * FROM users WHERE username = ?");
    $stmt->execute([$username]);
    $user = $stmt->fetch();
    
    if ($user && password_verify($password, $user['password'])) {
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['user_name'] = $user['name'];
        echo json_encode(['success' => true, 'user' => ['id' => $user['id'], 'name' => $user['name']]]);
    } else {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid credentials']);
    }
} elseif ($method === 'GET') {
    if (isset($_SESSION['user_id'])) {
        echo json_encode(['isLoggedIn' => true, 'user' => ['name' => $_SESSION['user_name']]]);
    } else {
        echo json_encode(['isLoggedIn' => false]);
    }
} elseif ($method === 'DELETE') {
    session_destroy();
    echo json_encode(['success' => true]);
}
?> 
