import simpleGit, { SimpleGit } from "simple-git"
import path from "path"

const git: SimpleGit = simpleGit(process.cwd())

export interface GitConfig {
  name: string
  email: string
}

export async function configureGit(config: GitConfig) {
  await git.addConfig("user.name", config.name)
  await git.addConfig("user.email", config.email)
}

export async function getCurrentBranch(): Promise<string> {
  const status = await git.status()
  return status.current || "main"
}

export async function createAndCheckoutBranch(branchName: string): Promise<void> {
  const branches = await git.branch()
  if (branches.all.includes(branchName)) {
    await git.checkout(branchName)
  } else {
    await git.checkoutLocalBranch(branchName)
  }
}

export async function commitChanges(message: string, files: string[]): Promise<void> {
  await git.add(files)
  await git.commit(message)
}

export async function pushToRemote(branch: string, force: boolean = false): Promise<void> {
  const token = process.env.GITHUB_TOKEN
  if (!token) {
    throw new Error("GITHUB_TOKEN not configured")
  }

  const remote = await git.getRemotes(true)
  const origin = remote.find((r) => r.name === "origin")

  if (!origin) {
    throw new Error("No origin remote found")
  }

  if (force) {
    await git.push("origin", branch, ["--force"])
  } else {
    await git.push("origin", branch)
  }
}

export async function mergeBranches(from: string, to: string): Promise<void> {
  await git.checkout(to)
  await git.merge([from])
}

export async function getLatestCommit(): Promise<string> {
  const log = await git.log({ maxCount: 1 })
  return log.latest?.hash || ""
}

export async function hasUncommittedChanges(): Promise<boolean> {
  const status = await git.status()
  return status.files.length > 0
}

export async function stashChanges(): Promise<void> {
  await git.stash()
}

export async function popStash(): Promise<void> {
  await git.stash(["pop"])
}
