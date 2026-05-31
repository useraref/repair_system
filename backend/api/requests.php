<?php
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

// ============================================================
// GET: دریافت لیست تمام درخواست‌ها (فقط برای مدیران)
// ============================================================
if ($method === 'GET') {
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized']);
        exit();
    }
    
    $stmt = $pdo->query("SELECT * FROM requests ORDER BY created_at DESC");
    $requests = $stmt->fetchAll();
    
    // تبدیل NULL به 0 برای final_price (جلوگیری از خطا در فرانت‌اند)
    foreach ($requests as &$req) {
        if ($req['final_price'] === null) $req['final_price'] = 0;
    }
    
    echo json_encode($requests);
    exit();
}

// ============================================================
// POST: ثبت درخواست جدید (از طرف مشتری)
// ============================================================
if ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    // اعتبارسنجی ساده
    if (empty($data['customer_name']) || empty($data['customer_phone'])) {
        http_response_code(400);
        echo json_encode(['error' => 'نام و تلفن مشتری الزامی است']);
        exit();
    }
    
    // device_id = 1 به صورت موقت (در پروژه واقعی باید از جدول devices گرفته شود)
    // برای جلوگیری از خطای foreign key، اطمینان حاصل کنید که device_id 1 وجود دارد.
    $device_id = 1;
    
    $stmt = $pdo->prepare("
        INSERT INTO requests 
        (device_id, customer_name, customer_phone, customer_address, device_brand, device_model, device_issue, device_password) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ");
    
    try {
        $stmt->execute([
            $device_id,
            $data['customer_name'],
            $data['customer_phone'],
            $data['customer_address'],
            $data['device_brand'],
            $data['device_model'],
            $data['device_issue'],
            $data['device_password'] ?? null
        ]);
        
        $id = $pdo->lastInsertId();
        $tracking = $pdo->query("SELECT tracking_code FROM requests WHERE id = $id")->fetch()['tracking_code'];
        
        echo json_encode(['success' => true, 'tracking_code' => $tracking]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'خطا در ثبت درخواست: ' . $e->getMessage()]);
    }
    exit();
}

// ============================================================
// PUT: به‌روزرسانی وضعیت، هزینه و قطعات (فقط مدیر)
// ============================================================
if ($method === 'PUT') {
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized']);
        exit();
    }
    
    $data = json_decode(file_get_contents('php://input'), true);
    if (!$data || !isset($data['id'])) {
        http_response_code(400);
        echo json_encode(['error' => 'شناسه درخواست الزامی است']);
        exit();
    }
    
    $id = (int)$data['id'];
    $status = $data['status'] ?? null;
    $final_price = isset($data['final_price']) ? (int)$data['final_price'] : null;
    $parts_used = $data['parts_used'] ?? null;
    
    // ساخت کوئری داینامیک بر اساس فیلدهای ارسالی
    $fields = [];
    $params = [];
    
    if ($status !== null) {
        $fields[] = "status = ?";
        $params[] = $status;
    }
    if ($final_price !== null) {
        $fields[] = "final_price = ?";
        $params[] = $final_price;
    }
    if ($parts_used !== null) {
        $fields[] = "parts_used = ?";
        $params[] = $parts_used;
    }
    
    if (empty($fields)) {
        http_response_code(400);
        echo json_encode(['error' => 'هیچ فیلدی برای به‌روزرسانی ارسال نشده است']);
        exit();
    }
    
    $sql = "UPDATE requests SET " . implode(', ', $fields) . " WHERE id = ?";
    $params[] = $id;
    
    $stmt = $pdo->prepare($sql);
    
    try {
        $stmt->execute($params);
        echo json_encode(['success' => true]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'خطا در به‌روزرسانی: ' . $e->getMessage()]);
    }
    exit();
}

// ============================================================
// DELETE: حذف درخواست (اختیاری)
// ============================================================
if ($method === 'DELETE') {
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized']);
        exit();
    }
    
    $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
    if (!$id) {
        http_response_code(400);
        echo json_encode(['error' => 'شناسه درخواست الزامی است']);
        exit();
    }
    
    $stmt = $pdo->prepare("DELETE FROM requests WHERE id = ?");
    $stmt->execute([$id]);
    
    echo json_encode(['success' => true]);
    exit();
}

// اگر متد نامعتبر بود
http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
?>