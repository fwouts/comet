import axios from "axios";
import { HELPFUL_JIRA_ERROR_MESSAGE, jiraConfig } from "./config";

// Jira status names that should be considered as "Done".
export const SPECIAL_DONE_STATUSES = new Set(["Ready for Deploy"]);

export interface JiraTicket {
  status: {
    name: string;
    categoryKey: string;
    categoryColor: string;
  };
  commits: JiraCommit[];
}

export async function loadTickets(
  jiraKeys: string[]
): Promise<{ [jiraKey: string]: JiraTicket }> {
  // Note: We ignore errors to prevent one invalid key from failing the entire fetch.
  const allTickets = await Promise.all(
    jiraKeys.map(jiraKey =>
      loadTicket(jiraKey).catch(e => {
        console.warn(e);
        return null;
      })
    )
  );
  return allTickets.reduce((acc, ticket, index) => {
    if (ticket) {
      acc[jiraKeys[index]] = ticket;
    }
    return acc;
  }, {});
}

export async function loadTicket(jiraKey: string): Promise<JiraTicket> {
  if (!jiraConfig) {
    throw new Error(HELPFUL_JIRA_ERROR_MESSAGE);
  }
  const headers = {
    Authorization: `Basic ${btoa(
      `${jiraConfig.JIRA_EMAIL}:${jiraConfig.JIRA_API_TOKEN}`
    )}`
  };
  const getIssueResponse = await axios.get(
    `${jiraConfig.JIRA_PROXIED_HOST}/rest/api/3/issue/${jiraKey}`,
    {
      headers
    }
  );
  const getIssueData = getIssueResponse.data as GetIssueResponse;
  const issueId = getIssueResponse.data.id;
  const getCommitsResponse = await axios.get(
    `${
      jiraConfig.JIRA_PROXIED_HOST
    }/rest/dev-status/1.0/issue/detail?issueId=${issueId}&applicationType=GitHub&dataType=repository`,
    {
      headers
    }
  );
  const getCommitsData = getCommitsResponse.data as GetCommitsResponse;
  const commits = getCommitsData.detail
    .map(d =>
      d.repositories
        .map(r => r.commits)
        .reduce((acc, curr) => acc.concat(curr), [])
    )
    .reduce((acc, curr) => acc.concat(curr), [])
    .sort((a, b) => {
      return (
        new Date(b.authorTimestamp).getTime() -
        new Date(a.authorTimestamp).getTime()
      );
    });
  return {
    status: {
      name: getIssueData.fields.status.name,
      categoryKey: getIssueData.fields.status.statusCategory.key,
      categoryColor: getIssueData.fields.status.statusCategory.colorName
    },
    commits
  };
}

export interface GetIssueResponse {
  fields: {
    status: {
      name: string;
      statusCategory: {
        key: string;
        name: string;
        colorName: string;
      };
    };
  };
  id: string;
  key: string;
}

export interface GetCommitsResponse {
  detail: Array<{
    repositories: Array<{
      commits: JiraCommit[];
    }>;
  }>;
}

export interface JiraCommit {
  id: string;
  authorTimestamp: string;
}
