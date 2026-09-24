import fs from 'fs';
import path from 'path';
import { tmpdir } from 'os';
import { spawnSync } from 'child_process';
import { mkdtempSync } from 'fs';
import { strict as assert } from 'node:assert';

// Helper to calculate SHA256 hash
async function calculateSha256(filePath) {
  const crypto = await import('crypto');
  const hash = crypto.createHash('sha256');
  const fileBuffer = fs.readFileSync(filePath);
  hash.update(fileBuffer);
  return hash.digest('hex').substring(0, 10);
}

// Create a temporary directory for testing
const testDir = mkdtempSync(path.join(tmpdir(), 'hash-assets-test-'));

try {
  // Set up test fixtures
  const distDir = path.join(testDir, 'dist');
  const htmlDir = path.join(testDir, 'dist');
  fs.mkdirSync(distDir, { recursive: true });
  
  // Create sample assets
  const stylesContent = 'body { margin: 0; }';
  const scriptContent = 'console.log("hello");';
  const fontsContent = '@font-face { font-family: "Test"; }';
  const tailwindContent = '.container { max-width: 100%; }';
  
  fs.writeFileSync(path.join(distDir, 'styles.css'), stylesContent);
  fs.writeFileSync(path.join(distDir, 'script.js'), scriptContent);
  fs.writeFileSync(path.join(distDir, 'fonts.css'), fontsContent);
  fs.writeFileSync(path.join(distDir, 'tailwind.css'), tailwindContent);
  
  // Create an HTML file with various references
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="styles.css?v=20260924b">
  <link rel="stylesheet" href="tailwind.css?v=20260924">
  <link rel="stylesheet" href="fonts.css?v=20260924">
  <link rel="preload" href="./styles.css?v=20260924b" as="style">
  <link rel="stylesheet" href="https://example.com/styles.css?v=1">
</head>
<body>
  <script src="script.js?v=20260924b"></script>
  <img src="img/x.png">
</body>
</html>
`;
  
  fs.writeFileSync(path.join(htmlDir, 'index.html'), htmlContent);
  
  console.log('Running hash-assets script...');
  
  // Run the hash-assets script
  const result = spawnSync('node', [path.resolve('scripts/hash-assets.mjs'), '--dist', distDir], {
    stdio: 'inherit',
    env: process.env
  });
  
  if (result.status !== 0) {
    console.log(`Script failed with exit code ${result.status}`);
    console.log('stdout:', result.stdout?.toString());
    console.log('stderr:', result.stderr?.toString());
    process.exit(result.status);
  }
  
  // Read the modified HTML file
  const modifiedHtml = fs.readFileSync(path.join(htmlDir, 'index.html'), 'utf8');
  
  // Calculate expected hashes
  const stylesHash = await calculateSha256(path.join(distDir, 'styles.css'));
  const scriptHash = await calculateSha256(path.join(distDir, 'script.js'));
  const fontsHash = await calculateSha256(path.join(distDir, 'fonts.css'));
  const tailwindHash = await calculateSha256(path.join(distDir, 'tailwind.css'));
  
  // Check that hashes are correctly applied
  assert.ok(modifiedHtml.includes(`href="styles.css?v=${stylesHash}"`), `Should include styles.css with hash ${stylesHash}`);
  assert.ok(modifiedHtml.includes(`href="tailwind.css?v=${tailwindHash}"`), `Should include tailwind.css with hash ${tailwindHash}`);
  assert.ok(modifiedHtml.includes(`href="fonts.css?v=${fontsHash}"`), `Should include fonts.css with hash ${fontsHash}`);
  assert.ok(modifiedHtml.includes(`src="script.js?v=${scriptHash}"`), `Should include script.js with hash ${scriptHash}`);
  assert.ok(modifiedHtml.includes(`href="./styles.css?v=${stylesHash}"`), `Should include preload link with hash`);
  
  // Check that external URLs and unrelated files are unchanged
  assert.ok(modifiedHtml.includes(`href="https://example.com/styles.css?v=1"`), 'External URL should remain unchanged');
  assert.ok(modifiedHtml.includes('img/x.png'), 'Unrelated file should remain unchanged');
  
  console.log('✓ Basic functionality test passed');
  
  // Test with missing asset
  const testMissingDir = mkdtempSync(path.join(tmpdir(), 'hash-assets-missing-test-'));
  const distMissingDir = path.join(testMissingDir, 'dist');
  fs.mkdirSync(distMissingDir, { recursive: true });
  
  fs.writeFileSync(path.join(distMissingDir, 'existing.css'), 'body {}');
  
  const htmlWithMissingRef = `
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="missing.css">
</head>
</html>
`;
  
  fs.writeFileSync(path.join(distMissingDir, 'index.html'), htmlWithMissingRef);
  
  const missingResult = spawnSync('node', [path.resolve('scripts/hash-assets.mjs'), '--dist', distMissingDir], {
    stdio: 'pipe',
    env: process.env
  });
  
  assert.notEqual(missingResult.status, 0, 'Should exit with non-zero code when asset is missing');
  console.log('✓ Missing asset test passed');
  
  // Test that changing file content changes the hash
  const testChangeDir = mkdtempSync(path.join(tmpdir(), 'hash-assets-change-test-'));
  const distChangeDir = path.join(testChangeDir, 'dist');
  fs.mkdirSync(distChangeDir, { recursive: true });
  
  // Create all required asset files
  fs.writeFileSync(path.join(distChangeDir, 'styles.css'), 'body { color: red; }');
  fs.writeFileSync(path.join(distChangeDir, 'tailwind.css'), '.container { max-width: 100%; }');
  fs.writeFileSync(path.join(distChangeDir, 'fonts.css'), '@font-face { font-family: "Test"; }');
  fs.writeFileSync(path.join(distChangeDir, 'script.js'), 'console.log("hello");');
  
  const originalHtml = '<link rel="stylesheet" href="styles.css">';
  fs.writeFileSync(path.join(distChangeDir, 'index.html'), originalHtml);
  
  // Run script with original file
  spawnSync('node', [path.resolve('scripts/hash-assets.mjs'), '--dist', distChangeDir], {
    stdio: 'pipe',
    env: process.env
  });
  
  const originalModifiedHtml = fs.readFileSync(path.join(distChangeDir, 'index.html'), 'utf8');
  const match1 = originalModifiedHtml.match(/styles\.css\?v=([a-f0-9]{10})/);
  assert.ok(match1, 'Should find hash in original HTML');
  const originalHash = match1[1];
  
  // Change the file content
  fs.writeFileSync(path.join(distChangeDir, 'styles.css'), 'body { color: blue; }');
  
  // Run script again with changed file
  spawnSync('node', [path.resolve('scripts/hash-assets.mjs'), '--dist', distChangeDir], {
    stdio: 'pipe',
    env: process.env
  });
  
  const changedModifiedHtml = fs.readFileSync(path.join(distChangeDir, 'index.html'), 'utf8');
  const match2 = changedModifiedHtml.match(/styles\.css\?v=([a-f0-9]{10})/);
  assert.ok(match2, 'Should find hash in changed HTML');
  const changedHash = match2[1];
  
  assert.notEqual(originalHash, changedHash, `Hash should change when file content changes. Original: ${originalHash}, Changed: ${changedHash}`);
  console.log('✓ Hash change test passed');

} catch (error) {
  console.error('Test failed:', error.message);
  process.exit(1);
} finally {
  // Clean up
  try {
    fs.rmSync(testDir, { recursive: true, force: true });
  } catch (cleanupError) {
    console.warn('Could not clean up test directory:', cleanupError.message);
  }
}