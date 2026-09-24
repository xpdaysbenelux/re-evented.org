<?php
header('Content-Type: application/json');

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

// Validate that input is a JSON object with email as a string
if (!is_array($input) || !isset($input['email']) || !is_string($input['email'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid request format']);
    exit;
}

$email = trim($input['email']);

// Validate email length
if ($email === '') {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'An email address is required.']);
    exit;
}

if (strlen($email) > 254) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Please enter a valid email address.']);
    exit;
}

// Check for control characters or double quotes
if (preg_match('/[\x00-\x1F\x7F"]/', $email)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Please enter a valid email address.']);
    exit;
}

// Validate email format
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Please enter a valid email address.']);
    exit;
}

// Convert to lowercase
$email = strtolower($email);

// Determine subscribers file location with migration support
$preferred_file = dirname(__DIR__) . '/subscribers.txt';
$legacy_file = __DIR__ . '/subscribers.txt';

if (is_writable(dirname($preferred_file))) {
    if (!file_exists($preferred_file) && file_exists($legacy_file) && !@rename($legacy_file, $preferred_file)) {
        $preferred_file = $legacy_file;
    }
    $subscribers_file = $preferred_file;
} else {
    $subscribers_file = $legacy_file;
}

// Read existing subscribers under exclusive lock
$handle = @fopen($subscribers_file, 'c+');
if (!$handle) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to access subscription list.']);
    exit;
}

if (!flock($handle, LOCK_EX)) {
    fclose($handle);
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to access subscription list.']);
    exit;
}

// Read all lines
$subscribers = [];
rewind($handle);
while (($line = fgets($handle)) !== false) {
    $subscriber = trim($line);
    if ($subscriber !== '') {
        $subscribers[] = $subscriber;
    }
}

// Check for duplicate (case-insensitive)
$email_exists = false;
foreach ($subscribers as $subscriber) {
    if (strtolower($subscriber) === $email) {
        $email_exists = true;
        break;
    }
}

if ($email_exists) {
    // Release lock and close file
    flock($handle, LOCK_UN);
    fclose($handle);
    
    // Return success without revealing duplication
    echo json_encode(['success' => true, 'message' => 'You have successfully subscribed to our newsletter!']);
    exit;
}

// Append new subscriber
fseek($handle, 0, SEEK_END);
fwrite($handle, $email . PHP_EOL);

// Release lock and close file
flock($handle, LOCK_UN);
fclose($handle);

// Return success
echo json_encode(['success' => true, 'message' => 'You have successfully subscribed to our newsletter!']);