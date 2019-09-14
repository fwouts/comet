import { action, observable } from "mobx";
import { Commit, compareRefs, CompareRefsResult } from "../github/loader";
import { extractJiraKey } from "../jira/key";
import { JiraTicket, loadTickets } from "../jira/loader";
import { EMPTY_STATE, FAILED_STATE, Loadable, LOADING_STATE } from "./loadable";
import { RepoState } from "./repo";

export class ComparisonState {
  @observable result: Loadable<CompareRefsResult> = EMPTY_STATE;
  @observable jiraTickets: Loadable<JiraTicketsState> = EMPTY_STATE;
  @observable showReleaseNotes = false;

  constructor(
    readonly repo: RepoState,
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
      const result = await compareRefs(
        this.repo.owner,
        this.repo.repo,
        this.compareToRefName,
        this.refName
      );
      this.updateResult({
        status: "loaded",
        loaded: result
      });
      this.updateJiraTickets(EMPTY_STATE);

      // Note: We don't await here, because this may fail if Jira isn't configured.
      this.fetchJiraTickets();
      // TODO: Fetch Jira tickets.
    } catch (e) {
      this.updateResult(FAILED_STATE);
    }
  }

  @action
  private updateResult(result: Loadable<CompareRefsResult>) {
    this.result = result;
  }

  async fetchJiraTickets() {
    if (this.result.status !== "loaded") {
      return;
    }
    try {
      this.updateJiraTickets(LOADING_STATE);
      const jiraTickets = await loadJiraTickets(
        this.result.loaded.addedCommits
      );
      this.updateJiraTickets({
        status: "loaded",
        loaded: { jiraTickets }
      });
    } catch (e) {
      this.updateJiraTickets(FAILED_STATE);
    }
  }

  @action
  private updateJiraTickets(jiraTickets: Loadable<JiraTicketsState>) {
    this.jiraTickets = jiraTickets;
  }
}

async function loadJiraTickets(
  commits: Commit[]
): Promise<{ [jiraKey: string]: JiraTicket }> {
  const jiraKeys = commits.map(commit => extractJiraKey(commit.commit.message));
  const uniqueJiraKeys = new Set(jiraKeys.filter(k => k !== null)) as Set<
    string
  >;
  return loadTickets(Array.from(uniqueJiraKeys));
}

export interface JiraTicketsState {
  jiraTickets: {
    [jiraKey: string]: JiraTicket;
  };
}
