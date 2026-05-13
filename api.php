<?php
// Enable CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS, DELETE, PUT');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// Database file
$dbFile = 'downloads.json';

// Initialize database if it doesn't exist
if (!file_exists($dbFile)) {
    file_put_contents($dbFile, json_encode(['downloads' => [], 'blocked' => []]));
}

$action = $_GET['action'] ?? '';

switch ($action) {
    case 'add':
        addDownload();
        break;
    case 'get':
        getDownloads();
        break;
    case 'delete':
        deleteDownload();
        break;
    case 'block':
        blockUser();
        break;
    case 'unblock':
        unblockUser();
        break;
    case 'clear':
        clearAll();
        break;
    default:
        echo json_encode(['error' => 'Invalid action']);
}

function addDownload() {
    global $dbFile;
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!$data || !isset($data['name'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing required fields']);
        return;
    }

    $db = json_decode(file_get_contents($dbFile), true);
    
    $record = array_merge($data, [
        'id' => time() . '-' . rand(1000, 9999),
        'timestamp' => date('c'),
        'status' => 'active'
    ]);
    
    $db['downloads'][] = $record;
    file_put_contents($dbFile, json_encode($db, JSON_PRETTY_PRINT));
    
    echo json_encode(['success' => true, 'record' => $record]);
}

function getDownloads() {
    global $dbFile;
    
    $db = json_decode(file_get_contents($dbFile), true);
    
    $downloads = [];
    foreach ($db['downloads'] as $record) {
        $record['isBlocked'] = in_array($record['id'], $db['blocked']);
        $downloads[] = $record;
    }
    
    echo json_encode([
        'success' => true,
        'downloads' => $downloads,
        'total' => count($downloads),
        'active' => count($downloads) - count($db['blocked']),
        'blocked' => count($db['blocked'])
    ]);
}

function deleteDownload() {
    global $dbFile;
    
    $data = json_decode(file_get_contents('php://input'), true);
    $id = $data['id'] ?? null;
    
    if (!$id) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing record ID']);
        return;
    }

    $db = json_decode(file_get_contents($dbFile), true);
    
    $db['downloads'] = array_filter($db['downloads'], fn($r) => $r['id'] !== $id);
    $db['blocked'] = array_filter($db['blocked'], fn($b) => $b !== $id);
    
    file_put_contents($dbFile, json_encode($db, JSON_PRETTY_PRINT));
    
    echo json_encode(['success' => true, 'message' => 'Record deleted']);
}

function blockUser() {
    global $dbFile;
    
    $data = json_decode(file_get_contents('php://input'), true);
    $id = $data['id'] ?? null;
    
    if (!$id) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing record ID']);
        return;
    }

    $db = json_decode(file_get_contents($dbFile), true);
    
    if (!in_array($id, $db['blocked'])) {
        $db['blocked'][] = $id;
        file_put_contents($dbFile, json_encode($db, JSON_PRETTY_PRINT));
    }
    
    echo json_encode(['success' => true, 'message' => 'User blocked']);
}

function unblockUser() {
    global $dbFile;
    
    $data = json_decode(file_get_contents('php://input'), true);
    $id = $data['id'] ?? null;
    
    if (!$id) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing record ID']);
        return;
    }

    $db = json_decode(file_get_contents($dbFile), true);
    
    $db['blocked'] = array_filter($db['blocked'], fn($b) => $b !== $id);
    file_put_contents($dbFile, json_encode($db, JSON_PRETTY_PRINT));
    
    echo json_encode(['success' => true, 'message' => 'User unblocked']);
}

function clearAll() {
    global $dbFile;
    file_put_contents($dbFile, json_encode(['downloads' => [], 'blocked' => []]));
    echo json_encode(['success' => true, 'message' => 'All data cleared']);
}
?>
