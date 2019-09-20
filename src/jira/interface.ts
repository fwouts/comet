export interface JiraLoader {
  loadTickets(jiraKeys: string[]): Promise<{ [jiraKey: string]: JiraTicket }>;
  loadTicket(jiraKey: string): Promise<JiraTicket>;
}

export interface JiraTicket {
  id: string;
  key: string;
  summary: string;
  issueType: {
    name: string;
    iconUrl: string;
  };
  status: {
    name: string;
    categoryKey: string;
    categoryColor: string;
  };
  commits: JiraCommit[];
}

export interface JiraCommit {
  id: string;
  authorTimestamp: string;
  message: string;
}
