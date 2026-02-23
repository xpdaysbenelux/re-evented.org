<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);
$email = isset($input['email']) ? trim($input['email']) : '';

// Validate email
if (empty($email)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'An email address is required.']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Please enter a valid email address.']);
    exit;
}

// Check if email already exists
$subscribers_file = 'subscribers.txt';
$subscribers = [];

if (file_exists($subscribers_file)) {
    $subscribers = array_filter(array_map('trim', file($subscribers_file)));
}

if (in_array($email, $subscribers)) {
    http_response_code(409);
    echo json_encode(['success' => false, 'message' => 'This email address is already subscribed.']);
    exit;
}

// Add new subscriber
$subscribers[] = $email;

// Write to file
if (file_put_contents($subscribers_file, implode("\n", $subscribers) . "\n") !== false) {
    echo json_encode(['success' => true, 'message' => 'You have successfully subscribed to our newsletter!']);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to save your subscription. Please try again.']);
}
?> 