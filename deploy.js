import FtpDeploy from "ftp-deploy";

const ftpDeploy = new FtpDeploy();

const config = {
  user: process.env.SITEGROUND_USER,
  password: process.env.SITEGROUND_PASSWORD,
  host: process.env.SITEGROUND_HOST,
  port: parseInt(process.env.SITEGROUND_PORT) || 21,
  localRoot: __dirname + "/dist",
  remoteRoot: "/" + (process.env.SITEGROUND_REMOTE_PATH || "public_html"),
  include: ["*", "**/*"],
  deleteRemote: false,
  forcePasv: true,
};

ftpDeploy
  .deploy(config)
  .then((res) => {
    console.log("Deploy finished:", res);
  })
  .catch((err) => {
    console.error("Deploy failed:", err);
    process.exit(1);
  });

ftpDeploy.on("uploading", (data) => {
  console.log(`Uploading ${data.filename} (${data.transferredFileCount}/${data.totalFilesCount})`);
});
