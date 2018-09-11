import * as Octokit from "@octokit/rest";
import * as config from "../config";
import { Branch, Ref, Tag } from "../store/state";

const octokit = new Octokit();
octokit.authenticate({
  type: "token",
  token: config.GITHUB_TOKEN
});

/**
 * Loads the list of refs (branches and tags).
 */
export async function loadRefs(): Promise<Ref[]> {
  const tagsResponse = await octokit.repos.getTags({
    owner: config.OWNER,
    repo: config.REPO
  });
  const tags = tagsResponse.data.map(
    (b): Tag => ({
      kind: "tag",
      name: b.name
    })
  );
  const branchesResponse = await octokit.repos.getBranches({
    owner: config.OWNER,
    repo: config.REPO
  });
  const branches = branchesResponse.data.map(
    (b): Branch => ({
      kind: "branch",
      name: b.name
    })
  );
  return [...branches, ...tags];
}

/**
 * Compares two refs.
 */
export async function compareRefs(
  refName: string,
  compareToRefName: string
): Promise<CompareRefsResult> {
  const [comparisonOneWay, comparisonOtherWay] = await Promise.all([
    octokit.repos.compareCommits({
      owner: config.OWNER,
      repo: config.REPO,
      base: refName,
      head: compareToRefName
    }),
    octokit.repos.compareCommits({
      owner: config.OWNER,
      repo: config.REPO,
      base: compareToRefName,
      head: refName
    })
  ]);
  return {
    ahead_by: comparisonOneWay.data.ahead_by,
    behind_by: comparisonOneWay.data.behind_by,
    total_commits: comparisonOneWay.data.total_commits,
    added_commits: comparisonOneWay.data.commits,
    removed_commits: comparisonOtherWay.data.commits
  };
}

export interface CompareRefsResult {
  ahead_by: number;
  behind_by: number;
  total_commits: number;
  added_commits: Commit[];
  removed_commits: Commit[];
}

export interface Commit {
  sha: string;
  commit: {
    author: {
      name: string;
      email: string;
    };
    message: string;
  };
  html_url: string;
}
