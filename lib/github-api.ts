const GITHUB_API = "https://api.github.com"

function getHeaders() {
  const token = process.env.GITHUB_TOKEN
  if (!token) throw new Error("GITHUB_TOKEN not configured")
  return {
    Authorization: `token ${token}`,
    Accept: "application/vnd.github.v3+json",
    "Content-Type": "application/json",
  }
}

function getRepo(): { owner: string; repo: string } {
  const owner = process.env.GITHUB_OWNER || "activecapital"
  const repo = process.env.GITHUB_REPO || "active_vc"
  return { owner, repo }
}

export async function readFileFromGitHub(
  filepath: string,
  branch: string = "main"
): Promise<{ content: string; sha: string }> {
  const { owner, repo } = getRepo()
  const url = `${GITHUB_API}/repos/${owner}/${repo}/contents/${filepath}?ref=${branch}`

  const response = await fetch(url, { headers: getHeaders() })

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`File not found: ${filepath}`)
    }
    throw new Error(`GitHub API error: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()
  const content = Buffer.from(data.content, "base64").toString("utf-8")
  return { content, sha: data.sha }
}

export async function writeFileToGitHub(
  filepath: string,
  content: string,
  commitMessage: string,
  branch: string = "staging"
): Promise<{ success: boolean; commitSha: string }> {
  const { owner, repo } = getRepo()
  const url = `${GITHUB_API}/repos/${owner}/${repo}/contents/${filepath}`

  // Get current file SHA if it exists (required for updates)
  let sha: string | undefined
  try {
    const existing = await readFileFromGitHub(filepath, branch)
    sha = existing.sha
  } catch (error) {
    // File doesn't exist yet, that's fine for creation
  }

  const body: any = {
    message: commitMessage,
    content: Buffer.from(content).toString("base64"),
    branch,
  }

  if (sha) {
    body.sha = sha
  }

  const response = await fetch(url, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`GitHub write failed: ${error.message || response.statusText}`)
  }

  const data = await response.json()
  return { success: true, commitSha: data.commit.sha }
}

export async function writeMultipleFiles(
  files: { filepath: string; content: string }[],
  commitMessage: string,
  branch: string = "staging"
): Promise<{ success: boolean; commitSha: string }> {
  const { owner, repo } = getRepo()

  // Get the latest commit SHA on the branch
  const refResponse = await fetch(
    `${GITHUB_API}/repos/${owner}/${repo}/git/ref/heads/${branch}`,
    { headers: getHeaders() }
  )

  if (!refResponse.ok) {
    throw new Error(`Could not get branch ref: ${refResponse.statusText}`)
  }

  const refData = await refResponse.json()
  const latestCommitSha = refData.object.sha

  // Get the tree of the latest commit
  const commitResponse = await fetch(
    `${GITHUB_API}/repos/${owner}/${repo}/git/commits/${latestCommitSha}`,
    { headers: getHeaders() }
  )
  const commitData = await commitResponse.json()
  const baseTreeSha = commitData.tree.sha

  // Create blobs for each file
  const treeItems = await Promise.all(
    files.map(async (file) => {
      const blobResponse = await fetch(
        `${GITHUB_API}/repos/${owner}/${repo}/git/blobs`,
        {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify({
            content: file.content,
            encoding: "utf-8",
          }),
        }
      )
      const blobData = await blobResponse.json()
      return {
        path: file.filepath,
        mode: "100644" as const,
        type: "blob" as const,
        sha: blobData.sha,
      }
    })
  )

  // Create a new tree
  const treeResponse = await fetch(
    `${GITHUB_API}/repos/${owner}/${repo}/git/trees`,
    {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        base_tree: baseTreeSha,
        tree: treeItems,
      }),
    }
  )
  const treeData = await treeResponse.json()

  // Create a new commit
  const newCommitResponse = await fetch(
    `${GITHUB_API}/repos/${owner}/${repo}/git/commits`,
    {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        message: commitMessage,
        tree: treeData.sha,
        parents: [latestCommitSha],
      }),
    }
  )
  const newCommitData = await newCommitResponse.json()

  // Update the branch reference
  const updateRefResponse = await fetch(
    `${GITHUB_API}/repos/${owner}/${repo}/git/refs/heads/${branch}`,
    {
      method: "PATCH",
      headers: getHeaders(),
      body: JSON.stringify({
        sha: newCommitData.sha,
      }),
    }
  )

  if (!updateRefResponse.ok) {
    throw new Error(`Failed to update branch: ${updateRefResponse.statusText}`)
  }

  return { success: true, commitSha: newCommitData.sha }
}

export async function mergeBranches(
  from: string,
  to: string
): Promise<{ success: boolean; message: string }> {
  const { owner, repo } = getRepo()
  const url = `${GITHUB_API}/repos/${owner}/${repo}/merges`

  const response = await fetch(url, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      base: to,
      head: from,
      commit_message: `Merge ${from} into ${to} via admin panel`,
    }),
  })

  if (!response.ok) {
    if (response.status === 409) {
      throw new Error("Merge conflict. Please resolve manually.")
    }
    const error = await response.json()
    throw new Error(`Merge failed: ${error.message || response.statusText}`)
  }

  return { success: true, message: `Merged ${from} into ${to}` }
}

export async function ensureBranchExists(branch: string): Promise<void> {
  const { owner, repo } = getRepo()

  // Check if branch exists
  const checkResponse = await fetch(
    `${GITHUB_API}/repos/${owner}/${repo}/git/ref/heads/${branch}`,
    { headers: getHeaders() }
  )

  if (checkResponse.ok) return // Branch exists

  // Get main branch SHA to create from
  const mainResponse = await fetch(
    `${GITHUB_API}/repos/${owner}/${repo}/git/ref/heads/main`,
    { headers: getHeaders() }
  )

  if (!mainResponse.ok) {
    throw new Error("Could not find main branch")
  }

  const mainData = await mainResponse.json()

  // Create the branch
  const createResponse = await fetch(
    `${GITHUB_API}/repos/${owner}/${repo}/git/refs`,
    {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        ref: `refs/heads/${branch}`,
        sha: mainData.object.sha,
      }),
    }
  )

  if (!createResponse.ok) {
    throw new Error(`Failed to create branch: ${branch}`)
  }
}
