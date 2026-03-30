#!/usr/bin/env node

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const https = require("https");

const REPO = "nasimstg/xenvsync";
const BIN_DIR = path.join(__dirname, "bin");
const VERSION = require("./package.json").version;

const PLATFORM_MAP = {
  darwin: "darwin",
  linux: "linux",
  win32: "windows",
};

const ARCH_MAP = {
  x64: "amd64",
  arm64: "arm64",
};

function getPlatform() {
  const platform = PLATFORM_MAP[process.platform];
  const arch = ARCH_MAP[process.arch];

  if (!platform) {
    throw new Error(`Unsupported platform: ${process.platform}`);
  }
  if (!arch) {
    throw new Error(`Unsupported architecture: ${process.arch}`);
  }

  return { platform, arch };
}

function getDownloadUrl(platform, arch) {
  const ext = platform === "windows" ? "zip" : "tar.gz";
  const name = `xenvsync_${VERSION}_${platform}_${arch}.${ext}`;
  return `https://github.com/${REPO}/releases/download/v${VERSION}/${name}`;
}

function follow(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { "User-Agent": "xenvsync-npm" } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        follow(res.headers.location).then(resolve, reject);
        return;
      }
      if (res.statusCode !== 200) {
        reject(new Error(`Download failed: HTTP ${res.statusCode} from ${url}`));
        return;
      }
      resolve(res);
    }).on("error", reject);
  });
}

async function extractTarGz(stream, destDir) {
  const tmpFile = path.join(destDir, "tmp.tar.gz");
  const ws = fs.createWriteStream(tmpFile);

  await new Promise((resolve, reject) => {
    stream.pipe(ws);
    ws.on("finish", resolve);
    ws.on("error", reject);
  });

  try {
    execSync(`tar xzf "${tmpFile}" -C "${destDir}"`, {
      stdio: "ignore",
    });
  } finally {
    fs.unlinkSync(tmpFile);
  }
}

async function extractZip(stream, destDir, platform) {
  const tmpFile = path.join(destDir, "tmp.zip");
  const ws = fs.createWriteStream(tmpFile);

  await new Promise((resolve, reject) => {
    stream.pipe(ws);
    ws.on("finish", resolve);
    ws.on("error", reject);
  });

  try {
    if (platform === "win32") {
      execSync(
        `powershell -Command "Expand-Archive -Path '${tmpFile}' -DestinationPath '${destDir}' -Force"`,
        { stdio: "ignore" }
      );
    } else {
      execSync(`unzip -o "${tmpFile}" -d "${destDir}"`, { stdio: "ignore" });
    }
  } finally {
    fs.unlinkSync(tmpFile);
  }
}

async function install() {
  const { platform, arch } = getPlatform();
  const url = getDownloadUrl(platform, arch);
  const isWindows = platform === "windows";
  const binaryName = isWindows ? "xenvsync.exe" : "xenvsync";

  fs.mkdirSync(BIN_DIR, { recursive: true });

  console.log(`Downloading xenvsync v${VERSION} for ${platform}/${arch}...`);

  const stream = await follow(url);

  if (isWindows) {
    await extractZip(stream, BIN_DIR, process.platform);
  } else {
    await extractTarGz(stream, BIN_DIR);
  }

  const binaryPath = path.join(BIN_DIR, binaryName);
  if (!fs.existsSync(binaryPath)) {
    // Binary might be in a subdirectory after extraction
    const files = fs.readdirSync(BIN_DIR, { recursive: true });
    const found = files.find((f) => path.basename(f.toString()) === binaryName);
    if (found) {
      const src = path.join(BIN_DIR, found.toString());
      fs.renameSync(src, binaryPath);
    }
  }

  if (!isWindows) {
    fs.chmodSync(binaryPath, 0o755);
  }

  console.log(`Installed xenvsync v${VERSION} to ${binaryPath}`);
}

install().catch((err) => {
  console.error(`Failed to install xenvsync: ${err.message}`);
  console.error("You can install manually from: https://github.com/nasimstg/xenvsync/releases");
  process.exit(1);
});
