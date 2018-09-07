import * as Octokit from "@octokit/rest";
import * as config from "../config";

const octokit = new Octokit();
octokit.authenticate({
  type: "token",
  token: config.GITHUB_TOKEN
});

/**
 * Loads the list of release branches.
 */
export async function loadReleaseBranchNames(): Promise<string[]> {
  const tags = await octokit.repos.getTags({
    owner: config.OWNER,
    repo: config.REPO
  });
  return tags.data.map(t => t.name);
}

/**
 * Compares two branches.
 */
export async function compareBranches(
  baseBranchName: string,
  headBranchName: string
): Promise<CompareBranchesResult> {
  const comparison = await octokit.repos.compareCommits({
    owner: config.OWNER,
    repo: config.REPO,
    base: baseBranchName,
    head: headBranchName
  });
  return comparison.data;
}

export interface CompareBranchesResult {
  ahead_by: number;
  behind_by: number;
  total_commits: number;
  commits: Commit[];
}

export interface Commit {
  sha: number;
  commit: {
    author: {
      name: string;
      email: string;
    };
    message: string;
  };
  html_url: string;
}
