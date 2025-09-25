import { Octokit } from "octokit";

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
const OWNER = "BackersPL";
const REPO = "back.cloud-pages.dev-downloads";
const FILE_PATH = "plugins/plugins.json";
const BRANCH = "main";

async function getFile() {
  const res = await octokit.rest.repos.getContent({ owner: OWNER, repo: REPO, path: FILE_PATH, ref: BRANCH });
  const content = Buffer.from(res.data.content, "base64").toString("utf8");
  return { content, sha: res.data.sha };
}

async function updateFile(newContent, sha) {
  const encoded = Buffer.from(newContent, "utf8").toString("base64");
  return await octokit.rest.repos.createOrUpdateFileContents({
    owner: OWNER,
    repo: REPO,
    path: FILE_PATH,
    message: "Update plugins.json via /version panel",
    content: encoded,
    sha,
    branch: BRANCH
  });
}

export default async function handler(req, res) {
  try {
    if (req.method === "POST") {
      const { content } = req.body;
      if (!content) return res.status(400).send("Brak content");
      const { sha } = await getFile();
      await updateFile(content, sha);
      return res.status(200).send("Zapisano plugins.json ✅");
    }
    res.status(405).send("Metoda nieobsługiwana");
  } catch (err) {
    console.error(err);
    res.status(500).send("Błąd: " + err.message);
  }
}
