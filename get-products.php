<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

require_once 'config.php';

$servername = DB_HOST;
$username = DB_USER;
$password = DB_PASS;
$dbname = DB_NAME;

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die(json_encode(["success" => false, "error" => "Connection failed"]));
}

$result = $conn->query("SELECT * FROM products");
$products = [];

while($row = $result->fetch_assoc()) {
    $products[] = $row;
}

echo json_encode($products);
$conn->close();
?>