import { JiraTicket } from "src/jira/loader";
import { isJiraTicketDone } from "src/jira/status";
import { ComparisonState } from "../state";

export function generateReleaseNotes(comparison: ComparisonState): string {
  if (
    comparison.status !== "loaded" ||
    comparison.loaded.jiraTickets.status !== "loaded"
  ) {
    return "Loading...";
  }
  const tickets = Object.values(
    comparison.loaded.jiraTickets.loaded.jiraTickets
  );
  const ticketsByIssueType = tickets.reduce(
    (acc, ticket) => {
      if (!acc[ticket.issueType]) {
        acc[ticket.issueType] = [];
      }
      acc[ticket.issueType].push(ticket);
      return acc;
    },
    {} as {
      [issueType: string]: JiraTicket[];
    }
  );
  return Object.keys(ticketsByIssueType)
    .sort()
    .map(issueType => {
      return (
        `${issueType}:\n` +
        ticketsByIssueType[issueType]
          .filter(isJiraTicketDone)
          .sort((a, b) => (a.key < b.key ? -1 : +1))
          .map(jiraTicket => `${jiraTicket.key} - ${jiraTicket.summary}`)
          .join("\n")
      );
    })
    .join("\n\n");
}
