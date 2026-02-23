import { execSync } from "child_process";
import { fileURLToPath } from "url";
import { dirname } from "path";
import fs from "fs";
import os from "os";

const __dirname = dirname(fileURLToPath(import.meta.url));

const host = process.env.SITEGROUND_HOST;
const user = process.env.SITEGROUND_USER;
const remotePath = process.env.SITEGROUND_REMOTE_PATH || "public_html";
const sshKey = process.env.SITEGROUND_SSH_KEY;
const localDist = __dirname + "/dist/";

if (!host || !user || !sshKey) {
  console.error("Missing required env vars: SITEGROUND_HOST, SITEGROUND_USER, SITEGROUND_SSH_KEY");
  process.exit(1);
}

// Write SSH key to temp file
const keyPath = `${os.tmpdir()}/deploy_key`;
fs.writeFileSync(keyPath, sshKey + "\n", { mode: 0o600 });

try {
  console.log(`Deploying to ${user}@${host}:${remotePath} ...`);
  execSync(
    `rsync -avz --delete \
      -e "ssh -i ${keyPath} -o StrictHostKeyChecking=no -p 22" \
      ${localDist} \
      ${user}@${host}:${remotePath}`,
    { stdio: "inherit" }
  );
  console.log("Deploy finished.");
} catch (err) {
  console.error("Deploy failed:", err.message);
  process.exit(1);
} finally {
  fs.unlinkSync(keyPath);
}
