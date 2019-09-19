import { Ref } from "../store/repo";

export interface GitHubLoader {
  loadSuggestedRepos(): Promise<Repo[]>;
  loadRefs(owner: string, repo: string): Promise<Ref[]>;
  compareRefs(
    owner: string,
    repo: string,
    refName: string,
    compareToRefName: string
  ): Promise<CompareRefsResult>;
}

export interface Repo {
  owner: string;
  repo: string;
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
  } | null;
  html_url: string;
}
