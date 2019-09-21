import { action, observable } from "mobx";
import { Commit, CompareRefsResult, GitHubLoader } from "../github/interface";
import { JiraLoader, JiraTicket, JiraTicketsByKey } from "../jira/interface";
import { extractJiraKey } from "../jira/key";
import { EMPTY_STATE, FAILED_STATE, Loadable, LOADING_STATE } from "./loadable";

export class ComparisonState {
  @observable result: Loadable<CompareRefsResult> = EMPTY_STATE;
  @observable jiraTickets: Loadable<JiraTicketsByKey> = EMPTY_STATE;
  @observable showReleaseNotes = false;

  constructor(
    private readonly githubLoader: GitHubLoader,
    private readonly jiraLoader: JiraLoader | null,
    private owner: string,
    private repo: string,
    readonly refName: string,
    readonly compareToRefName: string
  ) {}

  @action
  toggleReleaseNotes() {
    this.showReleaseNotes = !this.showReleaseNotes;
  }

  async fetchResult() {
    try {
      this.updateResult(LOADING_STATE);
      const result = await this.githubLoader.compareRefs(
        this.owner,
        this.repo,
        this.compareToRefName,
        this.refName
      );
      this.updateResult({
        status: "loaded",
        loaded: result
      });
      this.updateJiraTickets(EMPTY_STATE);
      await this.fetchJiraTickets(result.addedCommits);
    } catch (e) {
      this.updateResult(FAILED_STATE);
    }
  }

  @action
  private updateResult(result: Loadable<CompareRefsResult>) {
    this.result = result;
  }

  private async fetchJiraTickets(addedCommits: Commit[]) {
    if (!this.jiraLoader) {
      return;
    }
    try {
      this.updateJiraTickets(LOADING_STATE);
      const jiraTickets = await loadJiraTickets(this.jiraLoader, addedCommits);
      this.updateJiraTickets({
        status: "loaded",
        loaded: jiraTickets
      });
    } catch (e) {
      this.updateJiraTickets(FAILED_STATE);
    }
  }

  @action
  private updateJiraTickets(jiraTickets: Loadable<JiraTicketsByKey>) {
    this.jiraTickets = jiraTickets;
  }
}

async function loadJiraTickets(
  jiraLoader: JiraLoader,
  commits: Commit[]
): Promise<{ [jiraKey: string]: JiraTicket }> {
  const jiraKeys = commits.map(commit => extractJiraKey(commit.commit.message));
  const uniqueJiraKeys = new Set(jiraKeys.filter(k => k !== null)) as Set<
    string
  >;
  return jiraLoader.loadTickets(Array.from(uniqueJiraKeys));
}
