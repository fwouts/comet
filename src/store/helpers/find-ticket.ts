import assertNever from "assert-never";
import { Commit } from "../../github/loader";
import { jiraConfig } from "../../jira/config";
import { extractJiraKey } from "../../jira/key";
import { JiraTicket } from "../../jira/loader";
import {
  EMPTY_STATE,
  FAILED_STATE,
  Loadable,
  LOADING_STATE
} from "../../store/loadable";
import { JiraTicketsState } from "../comparison";

export function findJiraTicket(
  commit: Commit,
  jiraTicketsState: Loadable<JiraTicketsState>
): Loadable<JiraTicket, { key: string }> | null {
  const config = jiraConfig();
  if (!config) {
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
