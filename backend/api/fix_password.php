<?php
require_once 'config.php';

$new_password = 'admin123';
$hashed = password_hash($new_password, PASSWORD_DEFAULT);

$stmt = $pdo->prepare("UPDATE users SET password = ? WHERE username = 'admin'");
$stmt->execute([$hashed]);

if ($stmt->rowCount() > 0) {
    echo "✅ رمز عبور با موفقیت به‌روزرسانی شد.<br>";
    echo "نام کاربری: admin<br>";
    echo "رمز عبور: admin123";
} else {
    echo "❌ کاربری با نام admin یافت نشد!";
}
?>