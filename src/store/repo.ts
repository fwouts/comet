import { action, observable } from "mobx";
import { GitHubLoader } from "../github/interface";
import { JiraLoader } from "../jira/interface";
import { ComparisonState } from "./comparison";
import { EMPTY_STATE, FAILED_STATE, Loadable, LOADING_STATE } from "./loadable";

export class RepoState {
  @observable refs: Loadable<Ref[]> = EMPTY_STATE;
  @observable selectedRefName: string | null = null;
  @observable comparison: ComparisonState | null = null;

  constructor(
    private readonly githubLoader: GitHubLoader,
    private readonly jiraLoader: JiraLoader | null,
    readonly owner: string,
    readonly repo: string
  ) {}

  async fetchRefs() {
    try {
      this.updateRefs(LOADING_STATE);
      const refs = await this.githubLoader.loadRefs(this.owner, this.repo);
      this.updateRefs({
        status: "loaded",
        loaded: refs
      });
    } catch (e) {
      this.updateRefs(FAILED_STATE);
    }
  }

  @action
  private updateRefs(refs: Loadable<Ref[]>) {
    this.refs = refs;
  }

  @action
  selectRef(refName: string) {
    this.selectedRefName = refName;
    this.comparison = null;
  }

  @action
  async compareToAnotherRef(refName: string) {
    if (!this.selectedRefName) {
      return;
    }
    this.comparison = new ComparisonState(
      this.githubLoader,
      this.jiraLoader,
      this.owner,
      this.repo,
      this.selectedRefName,
      refName
    );
    await this.comparison.fetchResult();
  }
}

export type Ref = Branch | Tag;

export interface Branch {
  readonly kind: "branch";
  readonly name: string;
}

export interface Tag {
  readonly kind: "tag";
  readonly name: string;
}
