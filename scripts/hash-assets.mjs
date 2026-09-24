#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { createHash } from 'crypto';

const args = process.argv.slice(2);
let distDir = 'dist';
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--dist' && i + 1 < args.length) {
    distDir = args[i + 1];
    i++; // Skip next argument
  }
}

const assets = ['styles.css', 'tailwind.css', 'fonts.css', 'script.js'];

for (const asset of assets) {
  const assetPath = path.join(distDir, asset);
  if (!fs.existsSync(assetPath)) {
    console.error(`Error: Asset file ${assetPath} does not exist.`);
    process.exit(1);
  }
}

const assetHashes = {};
for (const asset of assets) {
  const assetPath = path.join(distDir, asset);
  const fileContent = fs.readFileSync(assetPath);
  const hash = createHash('sha256');
  hash.update(fileContent);
  assetHashes[asset] = hash.digest('hex').substring(0, 10);
}

function findHtmlFiles(dir) {
  const htmlFiles = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      htmlFiles.push(...findHtmlFiles(fullPath));
    } else if (path.extname(item) === '.html') {
      htmlFiles.push(fullPath);
    }
  }
  
  return htmlFiles;
}

const htmlFiles = findHtmlFiles(distDir);

const assetRegex = new RegExp(
  `(href|src)=(["'])(\\.?/)?(${assets.map(a => a.replace('.', '\\.')).join('|')})(\\?v=[^"']*)?([\\/"']|$)`,
  'gi'
);

for (const htmlFile of htmlFiles) {
  let content = fs.readFileSync(htmlFile, 'utf8');
  
  content = content.replace(assetRegex, (match, attr, quote, slashPrefix, fileName, oldQuery, endChar) => {
    const newHash = assetHashes[fileName];
    if (newHash) {
      return `${attr}=${quote}${slashPrefix || ''}${fileName}?v=${newHash}${endChar}`;
    }
    return match; // Return unchanged if not one of our target assets
  });
  
  fs.writeFileSync(htmlFile, content);
}

console.log('Asset hashing completed successfully.');