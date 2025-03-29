<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

// Load configuration
require_once 'config.php';

// Database configuration
$servername = DB_HOST;
$username = DB_USER;
$password = DB_PASS;
$dbname = DB_NAME;

// Verify request method
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    die(json_encode(["success" => false, "error" => "Method not allowed"]));
}

// Verify content type
if ($_SERVER['CONTENT_TYPE'] !== 'application/json') {
    http_response_code(400);
    die(json_encode(["success" => false, "error" => "Invalid content type"]));
}

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die(json_encode(["success" => false, "error" => "Connection failed: " . $conn->connect_error]));
}

// Handle product addition
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    $stmt = $conn->prepare("INSERT INTO products (name, price, sellhub_id) VALUES (?, ?, ?)");
    $stmt->bind_param("sds", $data['name'], $data['price'], $data['sellhubId']);
    
    if ($stmt->execute()) {
        echo json_encode(["success" => true, "product" => $data]);
    } else {
        echo json_encode(["success" => false, "error" => $stmt->error]);
    }
    
    $stmt->close();
}

$conn->close();
?>