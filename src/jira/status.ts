import { JiraTicket, SPECIAL_DONE_STATUSES } from "./loader";

export function isJiraTicketDone(jiraTicket: JiraTicket) {
  return (
    jiraTicket.status.categoryKey === "done" ||
    SPECIAL_DONE_STATUSES.has(jiraTicket.status.name)
  );
}
