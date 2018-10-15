import assertNever from "assert-never";
import { Commit } from "src/github/loader";
import { extractJiraKey } from "src/jira/key";
import { JiraTicket } from "src/jira/loader";
import { jiraConfig } from "../../jira/config";
import {
  EMPTY_STATE,
  FAILED_STATE,
  JiraTicketsState,
  Loadable,
  LOADING_STATE
} from "../state";

export function findJiraTicket(
  commit: Commit,
  jiraTicketsState: Loadable<JiraTicketsState>
): Loadable<JiraTicket, { key: string }> | null {
  if (!jiraConfig) {
    return null;
  }
  const key = extractJiraKey(commit.commit.message);
  if (!key) {
    return null;
  }
  switch (jiraTicketsState.status) {
    case "empty":
      return {
        ...EMPTY_STATE,
        key
      };
    case "loading":
      return {
        ...LOADING_STATE,
        key
      };
    case "failed":
      return {
        ...FAILED_STATE,
        key
      };
    case "loaded":
      const ticket = jiraTicketsState.loaded.jiraTickets[key];
      if (ticket) {
        return {
          status: "loaded",
          key,
          loaded: ticket
        };
      } else {
        return {
          ...FAILED_STATE,
          key
        };
      }
    default:
      throw assertNever;
  }
}
