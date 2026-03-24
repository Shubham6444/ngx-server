require("dotenv").config();
const express = require("express");
const fs = require("fs");
const path = require("path");
const multer = require("multer");

const app = express();
const PORT = process.env.PORT || 3000;
const REPO_DIR = path.join(__dirname, "repos");

if (!fs.existsSync(REPO_DIR)) fs.mkdirSync(REPO_DIR, { recursive: true });
app.use(express.json());

// Upload repo (push)
const upload = multer({ dest: "tmp/" });

app.post("/push/:username/:repoName", upload.single("file"), (req, res) => {
  const { username, repoName } = req.params;
  const userPath = path.join(REPO_DIR, username);
  const repoPath = path.join(userPath, repoName);

  if (!fs.existsSync(userPath)) fs.mkdirSync(userPath, { recursive: true });
  if (!fs.existsSync(repoPath)) fs.mkdirSync(repoPath, { recursive: true });

  const tmpFile = req.file.path;
  const destFile = path.join(repoPath, "latest.zip");

  fs.copyFileSync(tmpFile, destFile);
  fs.unlinkSync(tmpFile);

  res.json({
    status: "success",
    message: `Repo ${username}/${repoName} updated`,
  });
});

// Download repo (clone)
app.get("/clone/:username/:repoName", (req, res) => {
  const { username, repoName } = req.params;
  const repoPath = path.join(REPO_DIR, username, repoName, "latest.zip");

  if (!fs.existsSync(repoPath))
    return res.status(404).json({ error: "Repo not found" });

  res.download(repoPath, `${repoName}.zip`);
});

app.listen(PORT, () => console.log(`NGX server running on port ${PORT}`));
