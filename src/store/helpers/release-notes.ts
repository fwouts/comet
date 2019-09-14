import { JiraTicket } from "../../jira/loader";
import { isJiraTicketDone } from "../../jira/status";
import { ComparisonState } from "../comparison";

export function generateReleaseNotes(comparison: ComparisonState): string {
  if (comparison.jiraTickets.status !== "loaded") {
    return "Loading...";
  }
  const tickets = Object.values(comparison.jiraTickets.loaded.jiraTickets);
  const ticketsByIssueType = tickets.reduce(
    (acc, ticket) => {
      if (!acc[ticket.issueType.name]) {
        acc[ticket.issueType.name] = [];
      }
      acc[ticket.issueType.name].push(ticket);
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
