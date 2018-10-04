import * as Octokit from "@octokit/rest";
import * as config from "../config";
import { Branch, Ref, Tag } from "../store/state";

const octokit = new Octokit();
octokit.authenticate({
  type: "token",
  token: config.GITHUB_TOKEN
});

/**
 * Loads the list of suggested repos for the current user.
 */
export async function loadSuggestedRepos(): Promise<Repo[]> {
  const repos: Repo[] = [];
  let reposResponse = await octokit.repos.getAll({
    per_page: 100,
    sort: "pushed"
  });
  repos.push(
    ...reposResponse.data.map(
      (repo: any): Repo => ({
        owner: repo.owner.login,
        repo: repo.name
      })
    )
  );
  while (octokit.hasNextPage(reposResponse as any)) {
    reposResponse = await octokit.getNextPage(reposResponse as any);
    repos.push(
      ...reposResponse.data.map(
        (repo: any): Repo => ({
          owner: repo.owner.login,
          repo: repo.name
        })
      )
    );
  }
  return repos;
}

export interface Repo {
  owner: string;
  repo: string;
}

/**
 * Loads the list of refs (branches and tags).
 */
export async function loadRefs(owner: string, repo: string): Promise<Ref[]> {
  const refs: Ref[] = [];
  let branchesResponse = await octokit.repos.getBranches({
    owner,
    repo
  });
  refs.push(...extractBranches(branchesResponse.data));
  while (octokit.hasNextPage(branchesResponse as any)) {
    branchesResponse = await octokit.getNextPage(branchesResponse as any);
    refs.push(...extractBranches(branchesResponse.data));
  }
  let tagsResponse = await octokit.repos.getTags({
    owner,
    repo
  });
  refs.push(...extractTags(tagsResponse.data));
  while (octokit.hasNextPage(tagsResponse as any)) {
    tagsResponse = await octokit.getNextPage(tagsResponse as any);
    refs.push(...extractTags(tagsResponse.data));
  }
  return refs;
}

function extractTags(tagsResponse: Octokit.GetTagsResponse): Tag[] {
  return tagsResponse.map(
    (t): Tag => ({
      kind: "tag",
      name: t.name
    })
  );
}

function extractBranches(
  branchesResponse: Octokit.GetBranchesResponse
): Branch[] {
  return branchesResponse.map(
    (b): Branch => ({
      kind: "branch",
      name: b.name
    })
  );
}

/**
 * Compares two refs.
 */
export async function compareRefs(
  owner: string,
  repo: string,
  refName: string,
  compareToRefName: string
): Promise<CompareRefsResult> {
  const [comparisonOneWay, comparisonOtherWay] = await Promise.all([
    octokit.repos.compareCommits({
      owner,
      repo,
      base: refName,
      head: compareToRefName
    }),
    octokit.repos.compareCommits({
      owner,
      repo,
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
  author: {
    login: string;
    avatar_url: string;
  };
  html_url: string;
}
