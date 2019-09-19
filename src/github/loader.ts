import Octokit from "@octokit/rest";
import { Branch, Ref, Tag } from "../store/repo";
import { CompareRefsResult, GitHubLoader, Repo } from "./interface";

export class GitHubLoaderImpl implements GitHubLoader {
  constructor(private readonly octokit: Octokit) {}

  /**
   * Loads the list of suggested repos for the current user.
   */
  async loadSuggestedRepos(): Promise<Repo[]> {
    const repos: Repo[] = [];
    let reposResponse = await this.octokit.repos.getAll({
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
    while (this.octokit.hasNextPage(reposResponse as any)) {
      reposResponse = await this.octokit.getNextPage(reposResponse as any);
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

  /**
   * Loads the list of refs (branches and tags).
   */
  async loadRefs(owner: string, repo: string): Promise<Ref[]> {
    const refs: Ref[] = [];
    let branchesResponse = await this.octokit.repos.getBranches({
      owner,
      repo
    });
    refs.push(...extractBranches(branchesResponse.data));
    while (this.octokit.hasNextPage(branchesResponse as any)) {
      branchesResponse = await this.octokit.getNextPage(
        branchesResponse as any
      );
      refs.push(...extractBranches(branchesResponse.data));
    }
    let tagsResponse = await this.octokit.repos.getTags({
      owner,
      repo
    });
    refs.push(...extractTags(tagsResponse.data));
    while (this.octokit.hasNextPage(tagsResponse as any)) {
      tagsResponse = await this.octokit.getNextPage(tagsResponse as any);
      refs.push(...extractTags(tagsResponse.data));
    }
    return refs;
  }

  /**
   * Compares two refs.
   */
  async compareRefs(
    owner: string,
    repo: string,
    refName: string,
    compareToRefName: string
  ): Promise<CompareRefsResult> {
    const [comparisonOneWay, comparisonOtherWay] = await Promise.all([
      this.octokit.repos.compareCommits({
        owner,
        repo,
        base: refName,
        head: compareToRefName
      }),
      this.octokit.repos.compareCommits({
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
