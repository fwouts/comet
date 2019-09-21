import axios from "axios";
import { JiraConfig } from "./config";
import { JiraCommit, JiraLoader, JiraTicket } from "./interface";

export class JiraLoaderImpl implements JiraLoader {
  constructor(private readonly config: JiraConfig) {}

  async loadTickets(
    jiraKeys: string[]
  ): Promise<{ [jiraKey: string]: JiraTicket }> {
    // Note: We ignore errors to prevent one invalid key from failing the entire fetch.
    const allTickets = await Promise.all(
      jiraKeys.map(jiraKey =>
        this.loadTicket(jiraKey).catch(e => {
          console.warn(e);
          return null;
        })
      )
    );
    return allTickets.reduce<{
      [jiraKey: string]: JiraTicket;
    }>((acc, ticket, index) => {
      if (ticket) {
        acc[jiraKeys[index]] = ticket;
      }
      return acc;
    }, {});
  }

  private async loadTicket(jiraKey: string): Promise<JiraTicket> {
    const headers = {
      Authorization: `Basic ${btoa(
        `${this.config.email}:${this.config.apiToken}`
      )}`
    };
    const getIssueResponse = await axios.get(
      `/jira/rest/api/3/issue/${jiraKey}`,
      {
        headers
      }
    );
    const getIssueData = getIssueResponse.data as GetIssueResponse;
    const issueId = getIssueResponse.data.id;
    const getCommitsResponse = await axios.get(
      `/jira/rest/dev-status/1.0/issue/detail?issueId=${issueId}&applicationType=GitHub&dataType=repository`,
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
      id: issueId,
      key: jiraKey,
      issueType: {
        name: getIssueData.fields.issuetype.name,
        iconUrl: getIssueData.fields.issuetype.iconUrl
      },
      summary: getIssueData.fields.summary,
      status: {
        name: getIssueData.fields.status.name,
        categoryKey: getIssueData.fields.status.statusCategory.key,
        categoryColor: getIssueData.fields.status.statusCategory.colorName
      },
      commits
    };
  }
}

export interface GetIssueResponse {
  fields: {
    summary: string;
    issuetype: {
      name: string;
      iconUrl: string;
    };
    resolution: {
      name: string;
    };
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
