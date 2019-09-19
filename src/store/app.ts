import { action, observable } from "mobx";
import { GitHubLoader, Repo } from "../github/interface";
import { EMPTY_STATE, FAILED_STATE, Loadable, LOADING_STATE } from "./loadable";
import { RepoState } from "./repo";

export class AppState {
  @observable suggestedRepositories: Loadable<Repo[]> = EMPTY_STATE;
  @observable currentRepo: RepoState | null = null;

  constructor(private readonly githubLoader: GitHubLoader) {}

  async fetchRepos() {
    this.updateSuggestedRepositories(LOADING_STATE);
    try {
      const suggested = await this.githubLoader.loadSuggestedRepos();
      this.updateSuggestedRepositories({
        status: "loaded",
        loaded: suggested
      });
    } catch (e) {
      this.updateSuggestedRepositories(FAILED_STATE);
    }
  }

  @action
  private updateSuggestedRepositories(suggested: Loadable<Repo[]>) {
    this.suggestedRepositories = suggested;
  }

  @action
  async selectRepo(owner: string, repo: string) {
    if (
      this.currentRepo &&
      this.currentRepo.owner === owner &&
      this.currentRepo.repo === repo
    ) {
      return this.currentRepo;
    }
    this.currentRepo = new RepoState(this.githubLoader, this, owner, repo);
    await this.currentRepo.fetchRefs();
    return this.currentRepo;
  }
}
