const githubApi = 'https://api.github.com';
const config = { owner: process.env.GITHUB_OWNER || 'moreonmars', repo: process.env.GITHUB_REPO || 'ira-site', branch: process.env.GITHUB_BRANCH || 'main', path: 'content.json' };
const headers = () => ({ Accept: 'application/vnd.github+json', Authorization: `Bearer ${process.env.GITHUB_TOKEN}`, 'X-GitHub-Api-Version': '2022-11-28' });
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!process.env.GITHUB_TOKEN) return res.status(503).json({ error: 'Publishing is not configured yet.' });
  try {
    const payload = JSON.stringify({ version: 1, updatedAt: new Date().toISOString(), works: req.body?.works || [] }, null, 2);
    const currentResponse = await fetch(`${githubApi}/repos/${config.owner}/${config.repo}/contents/${config.path}?ref=${config.branch}`, { headers: headers() });
    const current = currentResponse.ok ? await currentResponse.json() : {};
    const response = await fetch(`${githubApi}/repos/${config.owner}/${config.repo}/contents/${config.path}`, { method: 'PUT', headers: { ...headers(), 'Content-Type': 'application/json' }, body: JSON.stringify({ message: 'Update portfolio content from admin', content: Buffer.from(payload).toString('base64'), sha: current.sha, branch: config.branch }) });
    const result = await response.json();
    if (!response.ok) return res.status(response.status).json({ error: result.message || 'GitHub publish failed.' });
    return res.status(200).json({ ok: true, commit: result.commit?.sha || null });
  } catch (error) { return res.status(500).json({ error: error.message || 'Publish failed.' }); }
}
