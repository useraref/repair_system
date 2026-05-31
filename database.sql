DROP DATABASE IF EXISTS repair_system;
CREATE DATABASE repair_system;
USE repair_system;

CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    role ENUM('admin', 'technician', 'reception') DEFAULT 'technician',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE customers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(15) NOT NULL,
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE devices (
    id INT PRIMARY KEY AUTO_INCREMENT,
    customer_id INT NOT NULL,
    brand VARCHAR(50) NOT NULL,
    model VARCHAR(50) NOT NULL,
    serial_number VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

CREATE TABLE requests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    tracking_code VARCHAR(20) UNIQUE NOT NULL,
    device_id INT NOT NULL,
    customer_name VARCHAR(100) NOT NULL,
    customer_phone VARCHAR(15) NOT NULL,
    customer_address TEXT NOT NULL,
    device_brand VARCHAR(50) NOT NULL,
    device_model VARCHAR(50) NOT NULL,
    device_issue TEXT NOT NULL,
    device_password VARCHAR(50),
    status ENUM('pending', 'checking', 'repaired', 'completed') DEFAULT 'pending',
    final_price INT DEFAULT 0,
    parts_used TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_read TINYINT DEFAULT 0,
    created_by INT,
    FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE parts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    repair_id INT NOT NULL,
    part_name VARCHAR(100) NOT NULL,
    quantity INT DEFAULT 1,
    unit_price INT NOT NULL,
    total INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (repair_id) REFERENCES requests(id) ON DELETE CASCADE
);

CREATE TABLE invoices (
    id INT PRIMARY KEY AUTO_INCREMENT,
    repair_id INT NOT NULL,
    total_amount INT NOT NULL,
    paid_amount INT DEFAULT 0,
    status ENUM('unpaid', 'partial', 'paid') DEFAULT 'unpaid',
    invoice_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (repair_id) REFERENCES requests(id) ON DELETE CASCADE
);

CREATE TABLE repair_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    repair_id INT NOT NULL,
    old_status VARCHAR(50),
    new_status VARCHAR(50),
    changed_by INT,
    changed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (repair_id) REFERENCES requests(id) ON DELETE CASCADE,
    FOREIGN KEY (changed_by) REFERENCES users(id)
);

DROP TRIGGER IF EXISTS generate_tracking_code;
DELIMITER $$
CREATE TRIGGER generate_tracking_code
BEFORE INSERT ON requests
FOR EACH ROW
BEGIN
    DECLARE next_id INT;
    SELECT IFNULL(MAX(id), 0) + 1 INTO next_id FROM requests;
    SET NEW.tracking_code = CONCAT('TRK', DATE_FORMAT(NOW(), '%y%m%d'), LPAD(next_id, 4, '0'));
END$$
DELIMITER ;

DROP TRIGGER IF EXISTS calculate_part_total;
DELIMITER $$
CREATE TRIGGER calculate_part_total
BEFORE INSERT ON parts
FOR EACH ROW
BEGIN
    SET NEW.total = NEW.quantity * NEW.unit_price;
END$$
DELIMITER ;

INSERT INTO users (username, password, name, role) VALUES 
('admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'مدیر سیستم', 'admin');

SELECT '✅ دیتابیس ساخته شد' AS message; 
