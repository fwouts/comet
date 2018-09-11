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
  const githubLimit = 250;
  return {
    aheadBy: comparisonOneWay.data.ahead_by,
    behindBy: comparisonOneWay.data.behind_by,
    addedCommits: comparisonOneWay.data.commits,
    removedCommits: comparisonOtherWay.data.commits,
    // GitHub will only return a maximum number of {githubLimit} commits.
    // See https://developer.github.com/v3/repos/commits/#working-with-large-comparisons.
    hadToOmitCommits:
      comparisonOneWay.data.ahead_by > githubLimit ||
      comparisonOneWay.data.behind_by > githubLimit
  };
}

export interface CompareRefsResult {
  aheadBy: number;
  behindBy: number;
  addedCommits: Commit[];
  removedCommits: Commit[];
  hadToOmitCommits: boolean;
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
