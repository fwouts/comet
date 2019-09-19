import { Commit } from "../github/interface";
import { JiraCommit, JiraTicket, SPECIAL_DONE_STATUSES } from "./loader";

export function isJiraTicketDone(jiraTicket: JiraTicket) {
  return (
    jiraTicket.status.categoryKey === "done" ||
    SPECIAL_DONE_STATUSES.has(jiraTicket.status.name)
  );
}

export function jiraTicketHasFurtherCommits(
  jiraTicket: JiraTicket,
  allCommits: Commit[]
) {
  let hasFurtherCommits = false;
  if (jiraTicket.commits.length > 0) {
    const lastCommits: JiraCommit[] = [];
    for (const jiraCommit of jiraTicket.commits) {
      if (lastCommits.length === 0) {
        lastCommits.push(jiraCommit);
      } else if (lastCommits[0].message === jiraCommit.message) {
        // This is probably a bunch of cherry-picks.
        lastCommits.push(jiraCommit);
      } else {
        break;
      }
    }
    const lastCommitShas = new Set(lastCommits.map(c => c.id));
    // The ticket is only done in this particular branch if the last commit is included in this comparison.
    // This means that if we can't find one of the last commits in this branch, then there are further commits.
    hasFurtherCommits =
      allCommits.findIndex(c => lastCommitShas.has(c.sha)) === -1;
  }
  return hasFurtherCommits;
}
