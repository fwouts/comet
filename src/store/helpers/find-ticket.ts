import assertNever from "assert-never";
import { Commit } from "../../github/interface";
import { JiraTicket, JiraTicketsByKey } from "../../jira/interface";
import { extractJiraKey } from "../../jira/key";
import {
  EMPTY_STATE,
  FAILED_STATE,
  Loadable,
  LOADING_STATE
} from "../../store/loadable";

export function findJiraTicket(
  commit: Commit,
  jiraTicketsState: Loadable<JiraTicketsByKey>
): Loadable<JiraTicket, { key: string }> | null {
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
      const ticket = jiraTicketsState.loaded[key];
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
