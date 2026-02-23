import { execSync } from "child_process";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

const host = process.env.SITEGROUND_HOST;
const user = process.env.SITEGROUND_USER;
const password = process.env.SITEGROUND_PASSWORD;
const port = process.env.SITEGROUND_PORT || "18765";
const remotePath = process.env.SITEGROUND_REMOTE_PATH || "public_html";
const localDist = __dirname + "/dist/";

if (!host || !user || !password) {
  console.error("Missing required env vars: SITEGROUND_HOST, SITEGROUND_USER, SITEGROUND_PASSWORD");
  process.exit(1);
}

try {
  console.log(`Deploying to ${user}@${host}:${remotePath} (port ${port}) ...`);
  execSync(
    `sshpass -p "${password}" rsync -avz --delete \
      -e "ssh -o StrictHostKeyChecking=no -p ${port}" \
      ${localDist} \
      ${user}@${host}:${remotePath}`,
    { stdio: "inherit" }
  );
  console.log("Deploy finished.");
} catch (err) {
  console.error("Deploy failed:", err.message);
  process.exit(1);
}
